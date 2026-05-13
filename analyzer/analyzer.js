const moodleZipInput = document.getElementById("moodleZipInput");
const submissionsInput = document.getElementById("submissionsInput");
const statementInput = document.getElementById("statementInput");
const thresholdInput = document.getElementById("thresholdInput");
const commonLinePctInput = document.getElementById("commonLinePctInput");
const analyzeButton = document.getElementById("analyzeButton");
const statusNode = document.getElementById("status");
const summaryNode = document.getElementById("summary");
const resultsBody = document.getElementById("resultsBody");

const SUPPORTED_TEXT_EXTENSIONS = new Set([
  "txt",
  "md",
  "html",
  "htm",
  "csv",
  "json",
  "xml",
  "yml",
  "yaml",
  "js",
  "mjs",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "py",
  "java",
  "c",
  "cc",
  "cpp",
  "h",
  "hpp",
  "cs",
  "php",
  "rb",
  "go",
  "rs",
  "swift",
  "kt",
  "sql",
  "css",
  "scss",
  "less",
  "sh",
  "bash",
  "bat",
  "ps1"
]);

const ZIP_EXTENSION = "zip";
const RAR_EXTENSION = "rar";
const SEVEN_Z_EXTENSION = "7z";
const SUPPORTED_ARCHIVE_EXTENSIONS = new Set([ZIP_EXTENSION, RAR_EXTENSION, SEVEN_Z_EXTENSION]);
const UNSUPPORTED_ARCHIVE_EXTENSIONS = new Set();
const MAX_ARCHIVE_DEPTH = 5;
const MAX_UNCOMPRESSED_ENTRY_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED_BYTES = Number.POSITIVE_INFINITY;
const LIBARCHIVE_MODULE_PATH = "./vendor/libarchive/libarchive.js";
let libArchivePromise = null;

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.classList.toggle("error", Boolean(isError));
}

function clearResults() {
  summaryNode.textContent = "";
  resultsBody.innerHTML = "";
}

function getExtension(filename) {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === filename.length - 1) {
    return "";
  }
  return filename.slice(idx + 1).toLowerCase();
}

function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/");
}

function dirname(path) {
  const normalized = normalizePath(path);
  const idx = normalized.lastIndexOf("/");
  if (idx === -1) {
    return "";
  }
  return normalized.slice(0, idx);
}

function joinPath(base, name) {
  if (!base) {
    return normalizePath(name);
  }
  if (!name) {
    return normalizePath(base);
  }
  return normalizePath(`${base}/${name}`);
}

function htmlToText(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body?.textContent || "";
}

function normalizeLine(line) {
  return line
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9_ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitToNormalizedLines(text) {
  return text
    .replace(/\uFEFF/g, "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter((line) => line.length >= 3);
}

function getSubmissionKey(relativePath) {
  const parts = normalizePath(relativePath).split("/").filter(Boolean);
  if (parts.length >= 3) {
    return parts[1];
  }
  if (parts.length >= 2) {
    return parts[0];
  }
  if (parts.length === 1) {
    return parts[0].replace(/\.[^.]+$/, "");
  }
  return "sin_carpeta";
}

function createStats() {
  return {
    textFiles: 0,
    ignoredFiles: 0,
    nestedZipCount: 0,
    unsupportedArchives: 0,
    unsupportedArchiveSamples: [],
    unsupportedCompression: 0,
    encryptedEntries: 0,
    zipWarnings: [],
    totalUncompressedBytes: 0
  };
}

function pushSample(list, value, max = 8) {
  if (list.length >= max) {
    return;
  }
  if (!list.includes(value)) {
    list.push(value);
  }
}

function addLinesToSubmission(submissionMap, filePath, lines) {
  if (lines.length === 0) {
    return;
  }
  const key = getSubmissionKey(filePath);
  if (!submissionMap.has(key)) {
    submissionMap.set(key, { id: key, lines: [], textFiles: 0 });
  }
  const doc = submissionMap.get(key);
  doc.lines.push(...lines);
  doc.textFiles += 1;
}

function canReadTextByExtension(path) {
  const ext = getExtension(path);
  return SUPPORTED_TEXT_EXTENSIONS.has(ext);
}

function canReadArchiveByExtension(path) {
  const ext = getExtension(path);
  return SUPPORTED_ARCHIVE_EXTENSIONS.has(ext);
}

async function getLibArchive() {
  if (!libArchivePromise) {
    libArchivePromise = import(LIBARCHIVE_MODULE_PATH).then((mod) => mod.Archive);
  }
  return libArchivePromise;
}

function decodeTextBytes(bytes) {
  const utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const badCharCount = (utf8Text.match(/\uFFFD/g) || []).length;
  if (badCharCount === 0) {
    return utf8Text;
  }
  const ratio = badCharCount / Math.max(1, utf8Text.length);
  if (ratio <= 0.02) {
    return utf8Text;
  }
  try {
    return new TextDecoder("windows-1252", { fatal: false }).decode(bytes);
  } catch {
    return utf8Text;
  }
}

function decodeZipName(nameBytes, utf8Flag) {
  if (utf8Flag) {
    return new TextDecoder("utf-8", { fatal: false }).decode(nameBytes);
  }
  try {
    return new TextDecoder("windows-1252", { fatal: false }).decode(nameBytes);
  } catch {
    return new TextDecoder("utf-8", { fatal: false }).decode(nameBytes);
  }
}

function readU16(view, offset) {
  return view.getUint16(offset, true);
}

function readU32(view, offset) {
  return view.getUint32(offset, true);
}

function findEocdOffset(view) {
  const minEocdSize = 22;
  const maxComment = 65535;
  const searchStart = Math.max(0, view.byteLength - (minEocdSize + maxComment));
  for (let offset = view.byteLength - minEocdSize; offset >= searchStart; offset -= 1) {
    if (readU32(view, offset) === 0x06054b50) {
      return offset;
    }
  }
  return -1;
}

function toArrayBuffer(bytes) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function inflateRaw(compressedBytes) {
  if (typeof DecompressionStream !== "function") {
    throw new Error("Tu navegador no soporta descompresion ZIP en esta extension.");
  }
  const stream = new Blob([compressedBytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const output = await new Response(stream).arrayBuffer();
  return new Uint8Array(output);
}

async function readZipEntries(arrayBuffer, archiveLabel, stats) {
  const view = new DataView(arrayBuffer);
  const allBytes = new Uint8Array(arrayBuffer);
  const eocdOffset = findEocdOffset(view);
  if (eocdOffset < 0) {
    throw new Error(`No se pudo leer el ZIP: ${archiveLabel}`);
  }

  const totalEntries = readU16(view, eocdOffset + 10);
  const centralSize = readU32(view, eocdOffset + 12);
  const centralOffset = readU32(view, eocdOffset + 16);
  if (totalEntries === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
    pushSample(stats.zipWarnings, `ZIP64 no soportado: ${archiveLabel}`);
    return [];
  }

  let ptr = centralOffset;
  const extractedEntries = [];
  for (let i = 0; i < totalEntries; i += 1) {
    if (ptr + 46 > view.byteLength || readU32(view, ptr) !== 0x02014b50) {
      pushSample(stats.zipWarnings, `Directorio central corrupto: ${archiveLabel}`);
      break;
    }

    const flags = readU16(view, ptr + 8);
    const method = readU16(view, ptr + 10);
    const compressedSize = readU32(view, ptr + 20);
    const uncompressedSize = readU32(view, ptr + 24);
    const fileNameLen = readU16(view, ptr + 28);
    const extraLen = readU16(view, ptr + 30);
    const commentLen = readU16(view, ptr + 32);
    const localHeaderOffset = readU32(view, ptr + 42);

    const nameStart = ptr + 46;
    const nameEnd = nameStart + fileNameLen;
    if (nameEnd > view.byteLength) {
      pushSample(stats.zipWarnings, `Nombre de entrada invalido en: ${archiveLabel}`);
      break;
    }

    const nameBytes = allBytes.subarray(nameStart, nameEnd);
    const entryName = normalizePath(decodeZipName(nameBytes, Boolean(flags & 0x0800)));
    ptr = nameEnd + extraLen + commentLen;

    if (!entryName || entryName.endsWith("/")) {
      continue;
    }

    if (flags & 0x0001) {
      stats.encryptedEntries += 1;
      continue;
    }

    if (method !== 0 && method !== 8) {
      stats.unsupportedCompression += 1;
      continue;
    }

    if (uncompressedSize > MAX_UNCOMPRESSED_ENTRY_BYTES) {
      pushSample(stats.zipWarnings, `Archivo muy grande omitido: ${entryName}`);
      continue;
    }

    if (localHeaderOffset + 30 > view.byteLength || readU32(view, localHeaderOffset) !== 0x04034b50) {
      pushSample(stats.zipWarnings, `Cabecera local invalida: ${entryName}`);
      continue;
    }

    const localNameLen = readU16(view, localHeaderOffset + 26);
    const localExtraLen = readU16(view, localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > allBytes.byteLength) {
      pushSample(stats.zipWarnings, `Datos truncados: ${entryName}`);
      continue;
    }

    const compressedBytes = allBytes.subarray(dataStart, dataEnd);
    let decompressed;
    if (method === 0) {
      decompressed = compressedBytes.slice();
    } else {
      try {
        decompressed = await inflateRaw(compressedBytes);
      } catch {
        pushSample(stats.zipWarnings, `No se pudo descomprimir: ${entryName}`);
        continue;
      }
    }

    stats.totalUncompressedBytes += decompressed.byteLength;
    if (stats.totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
      throw new Error("Se alcanzo el limite de descompresion de seguridad.");
    }

    extractedEntries.push({
      path: entryName,
      bytes: decompressed
    });
  }

  return extractedEntries;
}

async function readArchiveEntries(path, bytes, stats) {
  const ext = getExtension(path);
  if (ext === ZIP_EXTENSION) {
    return readZipEntries(toArrayBuffer(bytes), path, stats);
  }

  const fileName = normalizePath(path).split("/").filter(Boolean).pop() || `archive.${ext || "bin"}`;
  const archiveFile = new File([bytes], fileName, { type: "application/octet-stream" });
  let archive = null;

  try {
    const Archive = await getLibArchive();
    archive = await Archive.open(archiveFile);

    const extracted = [];
    await archive.extractFiles((entry) => {
      if (entry?.file && typeof entry.file.arrayBuffer === "function") {
        extracted.push(entry);
      }
    });

    const extractedEntries = [];
    for (const entry of extracted) {
      const fileName = normalizePath(entry.file.name || "");
      const entryPath =
        fileName.includes("/") ? fileName : normalizePath(joinPath(entry.path || "", fileName));
      if (!entryPath || entryPath.endsWith("/")) {
        continue;
      }

      const entryBytes = new Uint8Array(await entry.file.arrayBuffer());
      if (entryBytes.byteLength > MAX_UNCOMPRESSED_ENTRY_BYTES) {
        pushSample(stats.zipWarnings, `Archivo muy grande omitido: ${entryPath}`);
        continue;
      }

      stats.totalUncompressedBytes += entryBytes.byteLength;
      if (stats.totalUncompressedBytes > MAX_TOTAL_UNCOMPRESSED_BYTES) {
        throw new Error("Se alcanzo el limite de descompresion de seguridad.");
      }

      extractedEntries.push({
        path: entryPath,
        bytes: entryBytes
      });
    }
    return extractedEntries;
  } catch (error) {
    stats.unsupportedArchives += 1;
    pushSample(stats.unsupportedArchiveSamples, path);
    pushSample(stats.zipWarnings, `No se pudo descomprimir: ${path}`);
    return [];
  } finally {
    if (archive && typeof archive.close === "function") {
      try {
        await archive.close();
      } catch {
        // No-op: cierre defensivo del worker interno.
      }
    }
  }
}

function extractTextLines(path, text) {
  const ext = getExtension(path);
  const normalizedText = ext === "html" || ext === "htm" ? htmlToText(text) : text;
  return splitToNormalizedLines(normalizedText);
}

async function ingestBytes(path, bytes, submissionMap, stats, depth) {
  if (depth > MAX_ARCHIVE_DEPTH) {
    pushSample(stats.zipWarnings, `Profundidad maxima alcanzada en: ${path}`);
    return;
  }

  const ext = getExtension(path);
  if (SUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
    stats.nestedZipCount += 1;
    const innerBase = dirname(path);
    const archiveEntries = await readArchiveEntries(path, bytes, stats);
    for (const entry of archiveEntries) {
      const joinedPath = joinPath(innerBase, entry.path);
      await ingestBytes(joinedPath, entry.bytes, submissionMap, stats, depth + 1);
    }
    return;
  }

  if (UNSUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
    stats.unsupportedArchives += 1;
    pushSample(stats.unsupportedArchiveSamples, path);
    return;
  }

  if (!canReadTextByExtension(path)) {
    stats.ignoredFiles += 1;
    return;
  }

  const text = decodeTextBytes(bytes);
  const lines = extractTextLines(path, text);
  addLinesToSubmission(submissionMap, path, lines);
  stats.textFiles += 1;
}

async function ingestFileObject(file, submissionMap, stats) {
  const filePath = normalizePath(file.webkitRelativePath || file.name);
  const ext = getExtension(filePath);

  if (SUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    await ingestBytes(filePath, bytes, submissionMap, stats, 0);
    return;
  }

  if (UNSUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
    stats.unsupportedArchives += 1;
    pushSample(stats.unsupportedArchiveSamples, filePath);
    return;
  }

  if (canReadTextByExtension(filePath) || (file.type || "").startsWith("text/")) {
    const text = await file.text();
    const lines = extractTextLines(filePath, text);
    addLinesToSubmission(submissionMap, filePath, lines);
    stats.textFiles += 1;
    return;
  }

  stats.ignoredFiles += 1;
}

async function loadSubmissionDocuments() {
  const submissionMap = new Map();
  const stats = createStats();

  const moodleZipFile = moodleZipInput.files?.[0];
  if (moodleZipFile) {
    const bytes = new Uint8Array(await moodleZipFile.arrayBuffer());
    await ingestBytes(moodleZipFile.name, bytes, submissionMap, stats, 0);
  } else {
    const files = Array.from(submissionsInput.files || []);
    if (files.length === 0) {
      throw new Error("Selecciona carpeta de entregas o el ZIP principal de Moodle.");
    }

    for (const file of files) {
      await ingestFileObject(file, submissionMap, stats);
    }
  }

  const docs = Array.from(submissionMap.values())
    .map((doc) => ({ ...doc, lines: doc.lines.filter((line) => line.length > 0) }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return { docs, stats };
}

function buildLineFrequencyMap(documents, minLength = 18) {
  const freq = new Map();
  for (const doc of documents) {
    const uniqueLines = new Set(doc.lines.filter((line) => line.length >= minLength));
    for (const line of uniqueLines) {
      freq.set(line, (freq.get(line) || 0) + 1);
    }
  }
  return freq;
}

function buildCommonLineSet(documents, commonPercentage) {
  if (documents.length < 2) {
    return new Set();
  }
  const threshold = Math.max(2, Math.ceil((commonPercentage / 100) * documents.length));
  const lineFreq = buildLineFrequencyMap(documents);
  const common = new Set();
  for (const [line, count] of lineFreq.entries()) {
    if (count >= threshold) {
      common.add(line);
    }
  }
  return common;
}

function addCommonBaseLines(targetSet, lines) {
  for (const line of lines) {
    if (line.length >= 10) {
      targetSet.add(line);
    }
  }
}

async function ingestCommonBaseBytes(path, bytes, commonBaseSet, stats, depth) {
  if (depth > MAX_ARCHIVE_DEPTH) {
    pushSample(stats.zipWarnings, `Profundidad maxima alcanzada en parte comun: ${path}`);
    return;
  }

  const ext = getExtension(path);
  if (SUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
    const innerBase = dirname(path);
    const archiveEntries = await readArchiveEntries(path, bytes, stats);
    for (const entry of archiveEntries) {
      const joinedPath = joinPath(innerBase, entry.path);
      await ingestCommonBaseBytes(joinedPath, entry.bytes, commonBaseSet, stats, depth + 1);
    }
    return;
  }

  if (UNSUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
    stats.unsupportedArchives += 1;
    pushSample(stats.unsupportedArchiveSamples, path);
    return;
  }

  if (!canReadTextByExtension(path)) {
    return;
  }

  const text = decodeTextBytes(bytes);
  addCommonBaseLines(commonBaseSet, extractTextLines(path, text));
}

async function readStatementLines(filesLike) {
  const files = Array.from(filesLike || []).filter(Boolean);
  if (files.length === 0) {
    return new Set();
  }

  const commonBaseSet = new Set();
  const stats = createStats();

  for (const file of files) {
    const filePath = normalizePath(file.webkitRelativePath || file.name);
    const ext = getExtension(filePath);

    if (SUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      await ingestCommonBaseBytes(filePath, bytes, commonBaseSet, stats, 0);
      continue;
    }

    if (UNSUPPORTED_ARCHIVE_EXTENSIONS.has(ext)) {
      stats.unsupportedArchives += 1;
      pushSample(stats.unsupportedArchiveSamples, filePath);
      continue;
    }

    if (!canReadTextByExtension(filePath) && !(file.type || "").startsWith("text/")) {
      continue;
    }

    let text = await file.text();
    if (ext === "html" || ext === "htm") {
      text = htmlToText(text);
    }
    addCommonBaseLines(commonBaseSet, splitToNormalizedLines(text));
  }

  if (commonBaseSet.size === 0) {
    throw new Error(
      "La parte comun no contiene texto analizable. Usa txt/md/html o comprimidos ZIP/RAR/7z con esos archivos."
    );
  }

  return commonBaseSet;
}

function tokenize(lines) {
  const joined = lines.join(" ");
  const tokens = joined.match(/[a-z0-9_]{2,}/g);
  return tokens ? tokens : [];
}

function buildNgrams(tokens, size = 3) {
  if (tokens.length < size) {
    return tokens;
  }
  const grams = [];
  for (let i = 0; i <= tokens.length - size; i += 1) {
    grams.push(tokens.slice(i, i + size).join(" "));
  }
  return grams;
}

function countTerms(terms) {
  const tf = new Map();
  for (const term of terms) {
    tf.set(term, (tf.get(term) || 0) + 1);
  }
  return tf;
}

function buildTfIdfVectors(filteredDocs) {
  const termFrequencies = filteredDocs.map((doc) => {
    const tokens = tokenize(doc.filteredLines);
    const grams = buildNgrams(tokens, 3);
    return {
      id: doc.id,
      tf: countTerms(grams)
    };
  });

  const docFreq = new Map();
  for (const doc of termFrequencies) {
    for (const term of doc.tf.keys()) {
      docFreq.set(term, (docFreq.get(term) || 0) + 1);
    }
  }

  const totalDocs = filteredDocs.length;
  return termFrequencies.map((doc) => {
    const weights = new Map();
    let normSquared = 0;
    let totalTerms = 0;
    for (const count of doc.tf.values()) {
      totalTerms += count;
    }

    for (const [term, count] of doc.tf.entries()) {
      const tf = count / Math.max(1, totalTerms);
      const df = docFreq.get(term) || 0;
      const idf = Math.log((1 + totalDocs) / (1 + df)) + 1;
      const weight = tf * idf;
      weights.set(term, weight);
      normSquared += weight * weight;
    }

    return {
      id: doc.id,
      weights,
      norm: Math.sqrt(normSquared)
    };
  });
}

function cosineSimilaritySparse(vecA, vecB) {
  if (vecA.norm === 0 || vecB.norm === 0) {
    return 0;
  }
  const [small, large] =
    vecA.weights.size <= vecB.weights.size ? [vecA.weights, vecB.weights] : [vecB.weights, vecA.weights];

  let dot = 0;
  for (const [term, w1] of small.entries()) {
    const w2 = large.get(term);
    if (w2) {
      dot += w1 * w2;
    }
  }
  return dot / (vecA.norm * vecB.norm);
}

function sampleSharedTerms(vecA, vecB, maxTerms = 5) {
  const shared = [];
  const [small, large] =
    vecA.weights.size <= vecB.weights.size ? [vecA.weights, vecB.weights] : [vecB.weights, vecA.weights];

  for (const [term, w1] of small.entries()) {
    const w2 = large.get(term);
    if (w2) {
      shared.push({ term, score: w1 + w2 });
    }
  }

  return shared
    .sort((a, b) => b.score - a.score)
    .slice(0, maxTerms)
    .map((item) => item.term)
    .join(", ");
}

function classifyScore(score) {
  if (score >= 0.85) {
    return { label: "Alta", className: "high" };
  }
  if (score >= 0.72) {
    return { label: "Media", className: "medium" };
  }
  return { label: "Baja", className: "low" };
}

function compareAllPairs(vectors) {
  const pairs = [];
  for (let i = 0; i < vectors.length; i += 1) {
    for (let j = i + 1; j < vectors.length; j += 1) {
      const a = vectors[i];
      const b = vectors[j];
      pairs.push({
        a: a.id,
        b: b.id,
        score: cosineSimilaritySparse(a, b),
        sharedTerms: sampleSharedTerms(a, b)
      });
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

function renderResults(pairs, threshold, docsCount, commonLinesCount, statementLinesCount, stats) {
  clearResults();

  const suspicious = pairs.filter((item) => item.score >= threshold);
  let summaryText =
    `Entregas analizadas: ${docsCount}. ` +
    `Lineas comunes eliminadas: ${commonLinesCount}. ` +
    `Lineas de la parte comun eliminadas: ${statementLinesCount}. ` +
    `Pares por encima del umbral: ${suspicious.length}. ` +
    `Comprimidos internos procesados: ${stats.nestedZipCount}. `;

  summaryText += `Comprimidos no analizados: ${stats.unsupportedArchives}.`;
  if (stats.unsupportedArchiveSamples.length > 0) {
    summaryText += ` Ejemplos: ${stats.unsupportedArchiveSamples.join(" | ")}.`;
  }
  if (stats.zipWarnings.length > 0) {
    summaryText += ` Avisos ZIP: ${stats.zipWarnings.join(" | ")}.`;
  }
  summaryNode.textContent = summaryText;

  const rows = suspicious.length > 0 ? suspicious : pairs.slice(0, 30);
  if (rows.length === 0) {
    resultsBody.innerHTML =
      '<tr><td colspan="5">No hay resultados: falta texto suficiente para comparar.</td></tr>';
    return;
  }

  resultsBody.innerHTML = rows
    .map((row, idx) => {
      const scoreLabel = classifyScore(row.score);
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${row.a}</td>
          <td>${row.b}</td>
          <td>
            <strong>${row.score.toFixed(3)}</strong>
            <span class="badge ${scoreLabel.className}">${scoreLabel.label}</span>
          </td>
          <td>${row.sharedTerms || "-"}</td>
        </tr>
      `;
    })
    .join("");
}

analyzeButton.addEventListener("click", async () => {
  clearResults();

  const threshold = Number(thresholdInput.value);
  const commonPct = Number(commonLinePctInput.value);
  if (Number.isNaN(threshold) || threshold < 0 || threshold > 1) {
    setStatus("El umbral debe estar entre 0 y 1.", true);
    return;
  }
  if (Number.isNaN(commonPct) || commonPct < 0 || commonPct > 100) {
    setStatus("El porcentaje de linea comun debe estar entre 0 y 100.", true);
    return;
  }

  try {
    setStatus("Leyendo entregas y descomprimiendo ZIP...");
    const { docs, stats } = await loadSubmissionDocuments();
    const nonEmptyDocs = docs.filter((doc) => doc.lines.length > 0);
    if (nonEmptyDocs.length < 2) {
      setStatus(
        "No hay suficiente texto analizable. Se necesitan al menos 2 entregas con contenido.",
        true
      );
      return;
    }

    setStatus("Eliminando contenido comun y parte comun base...");
    const statementLines = await readStatementLines(statementInput.files);
    const commonLines = buildCommonLineSet(nonEmptyDocs, commonPct);

    const filteredDocs = nonEmptyDocs.map((doc) => ({
      id: doc.id,
      filteredLines: doc.lines.filter((line) => !commonLines.has(line) && !statementLines.has(line))
    }));

    const docsWithSignal = filteredDocs.filter((doc) => doc.filteredLines.length >= 12);
    if (docsWithSignal.length < 2) {
      setStatus(
        "Tras quitar texto comun y parte comun base queda poca senal. Baja el % de lineas comunes o revisa archivos.",
        true
      );
      return;
    }

    setStatus("Calculando similitud entre parejas...");
    const vectors = buildTfIdfVectors(docsWithSignal);
    const pairs = compareAllPairs(vectors);
    renderResults(
      pairs,
      threshold,
      docsWithSignal.length,
      commonLines.size,
      statementLines.size,
      stats
    );

    setStatus(
      `Analisis completado. Entregas validas: ${docsWithSignal.length}. ` +
        `Archivos de texto: ${stats.textFiles}. Ignorados: ${stats.ignoredFiles}.`
    );
  } catch (error) {
    setStatus(error?.message || "Error inesperado durante el analisis.", true);
  }
});
