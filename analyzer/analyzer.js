const moodleZipInput = document.getElementById("moodleZipInput");
const submissionsInput = document.getElementById("submissionsInput");
const statementInput = document.getElementById("statementInput");
const thresholdInput = document.getElementById("thresholdInput");
const commonLinePctInput = document.getElementById("commonLinePctInput");
const analyzeButton = document.getElementById("analyzeButton");
const statusNode = document.getElementById("status");
const summaryNode = document.getElementById("summary");
const resultsBody = document.getElementById("resultsBody");

const ext = globalThis.browser ?? globalThis.chrome;
const DEFAULT_LANG = "es";
const STORAGE_LANG_KEY = "moodleGuardianLanguage";
const TRANSLATIONS = {
  ca: {
    analyzerTitle: "Analitzador de similitud",
    analyzerHeading: "Analitzador de similitud de trameses",
    analyzerIntro:
      "Pots carregar la carpeta descomprimida o el ZIP descarregat des de Moodle. Tambe es processen ZIP interns de cada tramesa.",
    moodleZipLabel: "ZIP principal de Moodle (opcional)",
    moodleZipHint:
      "Fes servir aquest camp si tens el ZIP descarregat per Moodle. Si uses aquest ZIP, no cal seleccionar la carpeta de trameses descomprimida.",
    submissionsFolderLabel: "Carpeta de trameses",
    submissionsFolderHint:
      "Fes servir aquest camp nomes si ja has descomprimit el ZIP principal i vols seleccionar la carpeta que conte les carpetes dels alumnes.",
    commonBaseLabel: "Part comuna en totes les trameses (opcional, diversos fitxers o ZIP/RAR/7z)",
    commonBaseHint:
      "Selecciona aqui l'enunciat, plantilla o ZIP base comu. Es treura de la comparativa per mesurar nomes el treball propi de cada alumne.",
    thresholdLabel: "Llindar de sospita (0.00-1.00)",
    thresholdHint: "Nomes es mostren com a sospitoses les parelles amb una similitud igual o superior a aquest valor.",
    commonLinesLabel: "Linia comuna si apareix en >= X% de trameses",
    commonLinesHint:
      "Les linies que apareixen en moltes trameses s'eliminen automaticament per reduir falsos positius per plantilla compartida.",
    archiveNote:
      "Nota: s'intenten descomprimir ZIP/RAR/7z; si algun comprimit no es pot llegir, es llistara com a no analitzat.",
    analyzeButton: "Analitza similitud",
    resultsHeading: "Resultats",
    studentAHeader: "Alumne A",
    studentBHeader: "Alumne B",
    similarityHeader: "Similitud",
    sharedShinglesHeader: "Shingles compartits (mostra)",
    thresholdInvalid: "El llindar ha d'estar entre 0 i 1.",
    commonPctInvalid: "El percentatge de linia comuna ha d'estar entre 0 i 100.",
    readingSubmissions: "Llegint trameses i descomprimint ZIP...",
    noEnoughText: "No hi ha prou text analitzable. Calen com a minim 2 trameses amb contingut.",
    removingCommon: "Eliminant contingut comu i part comuna base...",
    lowSignal:
      "Despres de treure text comu i part comuna base queda poc senyal. Baixa el % de linies comunes o revisa els fitxers.",
    calculating: "Calculant similitud entre parelles...",
    completed: "Analisi completada. Trameses valides: {docs}. Fitxers de text: {textFiles}. Ignorats: {ignoredFiles}.",
    unexpectedAnalysis: "Error inesperat durant l'analisi.",
    selectSubmissions: "Selecciona carpeta de trameses o el ZIP principal de Moodle.",
    commonBaseEmpty:
      "La part comuna no conte text analitzable. Usa txt/md/html o comprimits ZIP/RAR/7z amb aquests fitxers.",
    autoLoading: "Carregant automaticament el ZIP principal de Moodle...",
    moodleStatus: "Moodle ha respost {status}",
    emptyZip: "El ZIP descarregat des de Moodle esta buit.",
    invalidZip: "Moodle no ha retornat un ZIP valid.",
    autoLoaded: "ZIP principal carregat automaticament: {name}.",
    unknownError: "error desconegut",
    autoLoadFailed:
      "No s'ha pogut carregar automaticament el ZIP principal. Selecciona'l manualment. Detall: {detail}",
    noResults: "No hi ha resultats: falta text suficient per comparar.",
    summary:
      "Trameses analitzades: {docs}. Linies comunes eliminades: {common}. Linies de la part comuna eliminades: {statement}. Parelles per sobre del llindar: {pairs}. Comprimits interns processats: {archives}. ",
    unsupportedArchives: "Comprimits no analitzats: {count}.",
    examples: " Exemples: {items}.",
    zipWarnings: " Avisos ZIP: {items}.",
    high: "Alta",
    medium: "Mitjana",
    low: "Baixa"
  },
  es: {
    analyzerTitle: "Analizador de similitud",
    analyzerHeading: "Analizador de similitud de entregas",
    analyzerIntro:
      "Puedes cargar la carpeta descomprimida o el ZIP descargado desde Moodle. Tambien se procesan ZIP internos de cada entrega.",
    moodleZipLabel: "ZIP principal de Moodle (opcional)",
    moodleZipHint:
      "Usa este campo si tienes el ZIP descargado por Moodle. Si usas este ZIP, no hace falta seleccionar la carpeta de entregas descomprimida.",
    submissionsFolderLabel: "Carpeta de entregas",
    submissionsFolderHint:
      "Usa este campo solo si ya has descomprimido el ZIP principal y quieres seleccionar la carpeta que contiene las carpetas de alumnos.",
    commonBaseLabel: "Parte comun en todas las entregas (opcional, varios archivos o ZIP/RAR/7z)",
    commonBaseHint:
      "Selecciona aqui el enunciado, plantilla o ZIP base comun. Se quitara de la comparativa para medir solo el trabajo propio de cada alumno.",
    thresholdLabel: "Umbral de sospecha (0.00-1.00)",
    thresholdHint: "Solo se muestran como sospechosos los pares con una similitud igual o superior a este valor.",
    commonLinesLabel: "Linea comun si aparece en >= X% de entregas",
    commonLinesHint:
      "Las lineas que aparecen en muchas entregas se eliminan automaticamente para reducir falsos positivos por plantilla compartida.",
    archiveNote:
      "Nota: se intentan descomprimir ZIP/RAR/7z; si algun comprimido no puede leerse, se listara como no analizado.",
    analyzeButton: "Analizar similitud",
    resultsHeading: "Resultados",
    studentAHeader: "Alumno A",
    studentBHeader: "Alumno B",
    similarityHeader: "Similitud",
    sharedShinglesHeader: "Shingles compartidos (muestra)",
    thresholdInvalid: "El umbral debe estar entre 0 y 1.",
    commonPctInvalid: "El porcentaje de linea comun debe estar entre 0 y 100.",
    readingSubmissions: "Leyendo entregas y descomprimiendo ZIP...",
    noEnoughText: "No hay suficiente texto analizable. Se necesitan al menos 2 entregas con contenido.",
    removingCommon: "Eliminando contenido comun y parte comun base...",
    lowSignal:
      "Tras quitar texto comun y parte comun base queda poca senal. Baja el % de lineas comunes o revisa archivos.",
    calculating: "Calculando similitud entre parejas...",
    completed: "Analisis completado. Entregas validas: {docs}. Archivos de texto: {textFiles}. Ignorados: {ignoredFiles}.",
    unexpectedAnalysis: "Error inesperado durante el analisis.",
    selectSubmissions: "Selecciona carpeta de entregas o el ZIP principal de Moodle.",
    commonBaseEmpty:
      "La parte comun no contiene texto analizable. Usa txt/md/html o comprimidos ZIP/RAR/7z con esos archivos.",
    autoLoading: "Cargando automaticamente el ZIP principal de Moodle...",
    moodleStatus: "Moodle respondio {status}",
    emptyZip: "El ZIP descargado desde Moodle esta vacio.",
    invalidZip: "Moodle no devolvio un ZIP valido.",
    autoLoaded: "ZIP principal cargado automaticamente: {name}.",
    unknownError: "error desconocido",
    autoLoadFailed:
      "No se pudo cargar automaticamente el ZIP principal. Seleccionalo manualmente. Detalle: {detail}",
    noResults: "No hay resultados: falta texto suficiente para comparar.",
    summary:
      "Entregas analizadas: {docs}. Lineas comunes eliminadas: {common}. Lineas de la parte comun eliminadas: {statement}. Pares por encima del umbral: {pairs}. Comprimidos internos procesados: {archives}. ",
    unsupportedArchives: "Comprimidos no analizados: {count}.",
    examples: " Ejemplos: {items}.",
    zipWarnings: " Avisos ZIP: {items}.",
    high: "Alta",
    medium: "Media",
    low: "Baja"
  },
  en: {
    analyzerTitle: "Similarity analyzer",
    analyzerHeading: "Submission similarity analyzer",
    analyzerIntro:
      "You can load the extracted folder or the ZIP downloaded from Moodle. Internal ZIP files inside each submission are processed too.",
    moodleZipLabel: "Main Moodle ZIP (optional)",
    moodleZipHint:
      "Use this field if you have the ZIP downloaded by Moodle. If you use this ZIP, you do not need to select the extracted submissions folder.",
    submissionsFolderLabel: "Submissions folder",
    submissionsFolderHint:
      "Use this field only if you already extracted the main ZIP and want to select the folder that contains the student folders.",
    commonBaseLabel: "Common part in all submissions (optional, multiple files or ZIP/RAR/7z)",
    commonBaseHint:
      "Select the statement, starter template, or common base ZIP here. It will be removed from the comparison so only each student's own work is measured.",
    thresholdLabel: "Suspicion threshold (0.00-1.00)",
    thresholdHint: "Only pairs with similarity equal to or above this value are shown as suspicious.",
    commonLinesLabel: "Common line if it appears in >= X% of submissions",
    commonLinesHint:
      "Lines appearing in many submissions are removed automatically to reduce false positives from a shared template.",
    archiveNote:
      "Note: ZIP/RAR/7z archives are decompressed when possible; unreadable archives will be listed as not analyzed.",
    analyzeButton: "Analyze similarity",
    resultsHeading: "Results",
    studentAHeader: "Student A",
    studentBHeader: "Student B",
    similarityHeader: "Similarity",
    sharedShinglesHeader: "Shared shingles (sample)",
    thresholdInvalid: "The threshold must be between 0 and 1.",
    commonPctInvalid: "The common-line percentage must be between 0 and 100.",
    readingSubmissions: "Reading submissions and decompressing ZIP files...",
    noEnoughText: "There is not enough analyzable text. At least 2 submissions with content are required.",
    removingCommon: "Removing common content and base common part...",
    lowSignal:
      "After removing common text and the base common part, too little signal remains. Lower the common-line percentage or check the files.",
    calculating: "Calculating pairwise similarity...",
    completed: "Analysis completed. Valid submissions: {docs}. Text files: {textFiles}. Ignored: {ignoredFiles}.",
    unexpectedAnalysis: "Unexpected error during analysis.",
    selectSubmissions: "Select a submissions folder or the main Moodle ZIP.",
    commonBaseEmpty:
      "The common part does not contain analyzable text. Use txt/md/html or ZIP/RAR/7z archives containing those files.",
    autoLoading: "Automatically loading the main Moodle ZIP...",
    moodleStatus: "Moodle responded with {status}",
    emptyZip: "The ZIP downloaded from Moodle is empty.",
    invalidZip: "Moodle did not return a valid ZIP.",
    autoLoaded: "Main ZIP loaded automatically: {name}.",
    unknownError: "unknown error",
    autoLoadFailed: "Could not automatically load the main ZIP. Select it manually. Detail: {detail}",
    noResults: "No results: not enough text to compare.",
    summary:
      "Submissions analyzed: {docs}. Common lines removed: {common}. Common-base lines removed: {statement}. Pairs above threshold: {pairs}. Internal archives processed: {archives}. ",
    unsupportedArchives: "Archives not analyzed: {count}.",
    examples: " Examples: {items}.",
    zipWarnings: " ZIP warnings: {items}.",
    high: "High",
    medium: "Medium",
    low: "Low"
  }
};
let currentLang = DEFAULT_LANG;

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
let autoMoodleZipFile = null;

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.classList.toggle("error", Boolean(isError));
}

function clearResults() {
  summaryNode.textContent = "";
  resultsBody.innerHTML = "";
}

function t(key, values = {}) {
  const template = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS[DEFAULT_LANG][key] || key;
  return template.replace(/\{(\w+)\}/g, (_match, name) => values[name] ?? "");
}

function storageGet(key) {
  return new Promise((resolve) => {
    if (!ext?.storage?.local) {
      resolve(DEFAULT_LANG);
      return;
    }
    ext.storage.local.get({ [key]: DEFAULT_LANG }, (items) => resolve(items[key]));
  });
}

function storageSet(values) {
  return new Promise((resolve) => {
    if (!ext?.storage?.local) {
      resolve();
      return;
    }
    ext.storage.local.set(values, resolve);
  });
}

function applyLanguage(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : DEFAULT_LANG;
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.title = t("analyzerTitle");
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
}

async function setLanguage(lang) {
  applyLanguage(lang);
  await storageSet({ [STORAGE_LANG_KEY]: currentLang });
}

async function initLanguage() {
  const lang = await storageGet(STORAGE_LANG_KEY);
  applyLanguage(lang);
  document.querySelectorAll(".lang-button").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
  ext?.storage?.onChanged?.addListener((changes, areaName) => {
    if (areaName === "local" && changes[STORAGE_LANG_KEY]) {
      applyLanguage(changes[STORAGE_LANG_KEY].newValue);
    }
  });
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function stripExtension(path) {
  return String(path || "").replace(/\.[^/.]+$/, "");
}

function ensureZipFilename(name) {
  const cleaned = String(name || "entregas-moodle").replace(/[\\/:*?"<>|]+/g, " ").trim();
  return /\.zip$/i.test(cleaned) ? cleaned : `${cleaned || "entregas-moodle"}.zip`;
}

function removeSelectedDirectoryRoot(path) {
  const parts = normalizePath(path).split("/").filter(Boolean);
  if (parts.length <= 1) {
    return normalizePath(path);
  }
  return parts.slice(1).join("/");
}

function cleanSubmissionLabel(value) {
  const decoded = decodeURIComponent(String(value || "").replace(/\+/g, " "));
  return decoded
    .replace(/[_-]?\d+[_-]?assignsubmission[_-].*$/i, "")
    .replace(/[_-]?assignsubmission[_-].*$/i, "")
    .replace(/[_-]?\d+[_-]?assignfeedback[_-].*$/i, "")
    .replace(/[_-]?assignfeedback[_-].*$/i, "")
    .replace(/[_-]+$/g, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  for (const part of parts.slice(0, -1)) {
    if (/assignsubmission|assignfeedback/i.test(part)) {
      return cleanSubmissionLabel(part) || part;
    }
  }
  if (parts.length >= 2) {
    return cleanSubmissionLabel(parts[0]) || parts[0];
  }
  if (parts.length === 1) {
    return cleanSubmissionLabel(stripExtension(parts[0])) || stripExtension(parts[0]);
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
  const filePath = file.webkitRelativePath
    ? removeSelectedDirectoryRoot(file.webkitRelativePath)
    : normalizePath(file.name);
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

  const moodleZipFile = moodleZipInput.files?.[0] || autoMoodleZipFile;
  if (moodleZipFile) {
    const bytes = new Uint8Array(await moodleZipFile.arrayBuffer());
    await ingestBytes(moodleZipFile.name, bytes, submissionMap, stats, 0);
  } else {
    const files = Array.from(submissionsInput.files || []);
    if (files.length === 0) {
      throw new Error(t("selectSubmissions"));
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

async function tryLoadAutomaticMoodleZip() {
  const params = new URLSearchParams(window.location.search);
  const downloadUrl = params.get("downloadUrl");
  if (!downloadUrl) {
    return;
  }

  try {
    setStatus(t("autoLoading"));
    const response = await fetch(downloadUrl, { credentials: "include" });
    if (!response.ok) {
      throw new Error(t("moodleStatus", { status: response.status }));
    }

    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    if (bytes.byteLength === 0) {
      throw new Error(t("emptyZip"));
    }
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      throw new Error(t("invalidZip"));
    }

    const downloadName = ensureZipFilename(params.get("downloadName"));
    autoMoodleZipFile = new File([arrayBuffer], downloadName, { type: "application/zip" });
    setStatus(t("autoLoaded", { name: autoMoodleZipFile.name }));
  } catch (error) {
    autoMoodleZipFile = null;
    setStatus(t("autoLoadFailed", { detail: error?.message || t("unknownError") }), true);
  }
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
    targetSet.add(line);
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
    throw new Error(t("commonBaseEmpty"));
  }

  return commonBaseSet;
}

function tokenize(lines) {
  const joined = lines.join(" ");
  const tokens = joined.match(/[a-z0-9_]{2,}/g);
  return tokens ? tokens : [];
}

function buildNgrams(tokens, size = 5) {
  if (tokens.length < size) {
    return tokens;
  }
  const grams = [];
  for (let i = 0; i <= tokens.length - size; i += 1) {
    grams.push(tokens.slice(i, i + size).join(" "));
  }
  return grams;
}

function buildShingleVectors(filteredDocs) {
  return filteredDocs.map((doc) => {
    const tokens = tokenize(doc.filteredLines);
    const grams = buildNgrams(tokens, 5);
    return {
      id: doc.id,
      shingles: new Set(grams)
    };
  });
}

function jaccardSimilarity(vecA, vecB) {
  if (vecA.shingles.size === 0 || vecB.shingles.size === 0) {
    return 0;
  }
  const [small, large] =
    vecA.shingles.size <= vecB.shingles.size ? [vecA.shingles, vecB.shingles] : [vecB.shingles, vecA.shingles];

  let intersection = 0;
  for (const term of small) {
    if (large.has(term)) {
      intersection += 1;
    }
  }
  const union = vecA.shingles.size + vecB.shingles.size - intersection;
  return union > 0 ? intersection / union : 0;
}

function sampleSharedTerms(vecA, vecB, maxTerms = 5) {
  const shared = [];
  const [small, large] =
    vecA.shingles.size <= vecB.shingles.size ? [vecA.shingles, vecB.shingles] : [vecB.shingles, vecA.shingles];

  for (const term of small) {
    if (large.has(term)) {
      shared.push(term);
    }
  }

  return shared
    .sort((a, b) => b.length - a.length || a.localeCompare(b))
    .slice(0, maxTerms)
    .join(", ");
}

function classifyScore(score) {
  if (score >= 0.85) {
    return { label: t("high"), className: "high" };
  }
  if (score >= 0.72) {
    return { label: t("medium"), className: "medium" };
  }
  return { label: t("low"), className: "low" };
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
        score: jaccardSimilarity(a, b),
        sharedTerms: sampleSharedTerms(a, b)
      });
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}

function renderResults(pairs, threshold, docsCount, commonLinesCount, statementLinesCount, stats) {
  clearResults();

  const suspicious = pairs.filter((item) => item.score >= threshold);
  let summaryText = t("summary", {
    docs: docsCount,
    common: commonLinesCount,
    statement: statementLinesCount,
    pairs: suspicious.length,
    archives: stats.nestedZipCount
  });

  summaryText += t("unsupportedArchives", { count: stats.unsupportedArchives });
  if (stats.unsupportedArchiveSamples.length > 0) {
    summaryText += t("examples", { items: stats.unsupportedArchiveSamples.join(" | ") });
  }
  if (stats.zipWarnings.length > 0) {
    summaryText += t("zipWarnings", { items: stats.zipWarnings.join(" | ") });
  }
  summaryNode.textContent = summaryText;

  const rows = suspicious.length > 0 ? suspicious : pairs.slice(0, 30);
  if (rows.length === 0) {
    resultsBody.innerHTML = `<tr><td colspan="5">${escapeHtml(t("noResults"))}</td></tr>`;
    return;
  }

  resultsBody.innerHTML = rows
    .map((row, idx) => {
      const scoreLabel = classifyScore(row.score);
      const percent = `${(row.score * 100).toFixed(1)}%`;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(row.a)}</td>
          <td>${escapeHtml(row.b)}</td>
          <td>
            <strong>${percent}</strong>
            <span class="badge ${scoreLabel.className}">${scoreLabel.label}</span>
          </td>
          <td>${escapeHtml(row.sharedTerms || "-")}</td>
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
    setStatus(t("thresholdInvalid"), true);
    return;
  }
  if (Number.isNaN(commonPct) || commonPct < 0 || commonPct > 100) {
    setStatus(t("commonPctInvalid"), true);
    return;
  }

  try {
    setStatus(t("readingSubmissions"));
    const { docs, stats } = await loadSubmissionDocuments();
    const nonEmptyDocs = docs.filter((doc) => doc.lines.length > 0);
    if (nonEmptyDocs.length < 2) {
      setStatus(t("noEnoughText"), true);
      return;
    }

    setStatus(t("removingCommon"));
    const statementLines = await readStatementLines(statementInput.files);
    const commonLines = buildCommonLineSet(nonEmptyDocs, commonPct);

    const filteredDocs = nonEmptyDocs.map((doc) => ({
      id: doc.id,
      filteredLines: doc.lines.filter((line) => !commonLines.has(line) && !statementLines.has(line))
    }));

    const docsWithSignal = filteredDocs.filter((doc) => doc.filteredLines.length >= 12);
    if (docsWithSignal.length < 2) {
      setStatus(t("lowSignal"), true);
      return;
    }

    setStatus(t("calculating"));
    const vectors = buildShingleVectors(docsWithSignal);
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
      t("completed", {
        docs: docsWithSignal.length,
        textFiles: stats.textFiles,
        ignoredFiles: stats.ignoredFiles
      })
    );
  } catch (error) {
    setStatus(error?.message || t("unexpectedAnalysis"), true);
  }
});

initLanguage().then(tryLoadAutomaticMoodleZip);
