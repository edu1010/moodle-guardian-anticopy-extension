const ext = globalThis.browser ?? globalThis.chrome;

const DEFAULT_LANG = "es";
const STORAGE_LANG_KEY = "moodleGuardianLanguage";

const TRANSLATIONS = {
  ca: {
    popupTitle: "Moodle Guardian (Descàrregues + Anticòpia)",
    downloadAll: "Descarrega totes les trameses",
    forceFolderMode: 'Força "descarregar en carpetes"',
    openAnalyzer: "Obre l'analitzador de similitud",
    findingMoodle: "Buscant la pàgina de Moodle...",
    openAssignPage: "Obre abans una pàgina de tasca a Moodle (mod/assign).",
    downloadFailed: "No s'ha pogut iniciar la descàrrega.",
    downloadStarted: "Descàrrega iniciada. Revisa les descàrregues del navegador.",
    unexpectedError: "Error inesperat."
  },
  es: {
    popupTitle: "Moodle Guardian (Descargas + Anticopia)",
    downloadAll: "Descargar todas las entregas",
    forceFolderMode: 'Forzar "descargar en carpetas"',
    openAnalyzer: "Abrir analizador de similitud",
    findingMoodle: "Buscando página de Moodle...",
    openAssignPage: "Abre antes una página de tarea en Moodle (mod/assign).",
    downloadFailed: "No se pudo iniciar la descarga.",
    downloadStarted: "Descarga lanzada. Revisa las descargas del navegador.",
    unexpectedError: "Error inesperado."
  },
  en: {
    popupTitle: "Moodle Guardian (Downloads + Anti-copy)",
    downloadAll: "Download all submissions",
    forceFolderMode: 'Force "download in folders"',
    openAnalyzer: "Open similarity analyzer",
    findingMoodle: "Looking for the Moodle page...",
    openAssignPage: "Open a Moodle assignment page first (mod/assign).",
    downloadFailed: "Could not start the download.",
    downloadStarted: "Download started. Check your browser downloads.",
    unexpectedError: "Unexpected error."
  }
};

let currentLang = DEFAULT_LANG;

const statusNode = document.getElementById("status");
const downloadButton = document.getElementById("downloadButton");
const analyzerButton = document.getElementById("analyzerButton");
const folderMode = document.getElementById("folderMode");
const langButtons = Array.from(document.querySelectorAll(".lang-button"));

function t(key) {
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS[DEFAULT_LANG][key] || key;
}

function storageGet(key) {
  return new Promise((resolve) => {
    ext.storage.local.get({ [key]: DEFAULT_LANG }, (items) => resolve(items[key]));
  });
}

function storageSet(values) {
  return new Promise((resolve) => ext.storage.local.set(values, resolve));
}

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.classList.toggle("error", Boolean(isError));
}

function applyLanguage(lang) {
  currentLang = TRANSLATIONS[lang] ? lang : DEFAULT_LANG;
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.title = t("popupTitle");
  langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLang);
  });
}

async function setLanguage(lang) {
  applyLanguage(lang);
  await storageSet({ [STORAGE_LANG_KEY]: currentLang });
}

async function getActiveTab() {
  const tabs = await ext.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

ext.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes[STORAGE_LANG_KEY]) {
    applyLanguage(changes[STORAGE_LANG_KEY].newValue);
  }
});

downloadButton.addEventListener("click", async () => {
  setStatus(t("findingMoodle"));

  try {
    const tab = await getActiveTab();
    if (!tab?.id || !tab.url || !tab.url.includes("/mod/assign/")) {
      setStatus(t("openAssignPage"), true);
      return;
    }

    const response = await ext.runtime.sendMessage({
      type: "downloadFromCurrentTab",
      tabId: tab.id,
      forceFolderMode: folderMode.checked
    });

    if (!response?.ok) {
      setStatus(response?.error || t("downloadFailed"), true);
      return;
    }

    setStatus(t("downloadStarted"));
  } catch (error) {
    setStatus(error?.message || t("unexpectedError"), true);
  }
});

analyzerButton.addEventListener("click", async () => {
  await ext.runtime.sendMessage({ type: "openAnalyzer" });
  window.close();
});

storageGet(STORAGE_LANG_KEY).then(applyLanguage);
