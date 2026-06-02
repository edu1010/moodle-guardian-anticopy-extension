(function () {
  const CONTENT_SCRIPT_VERSION = "lang-ui-20260602";
  if (globalThis.__moodleGuardianContentScriptVersion === CONTENT_SCRIPT_VERSION) {
    return;
  }
  globalThis.__moodleGuardianContentScriptVersion = CONTENT_SCRIPT_VERSION;

  const ANALYZE_BUTTON_ID = "moodle-guardian-analyze-submissions";
  const DEFAULT_LANG = "es";
  const STORAGE_LANG_KEY = "moodleGuardianLanguage";
  const ext = globalThis.browser ?? globalThis.chrome;

  const TRANSLATIONS = {
    ca: {
      analyzeSubmissions: "Analitza trameses",
      analyzeTitle: "Descarrega totes les trameses en carpetes i obre l'analitzador",
      downloading: "Descarregant...",
      openingAnalyzer: "Obrint analitzador...",
      downloadFailed: "No s'ha pogut iniciar la descarrega.",
      unexpectedPrepare: "Error inesperat en preparar l'analisi.",
      actionsNotFound:
        "No he trobat el boto d'accions. Has d'estar a la vista de qualificacio d'una tasca (mod/assign).",
      downloadOptionNotFound:
        "No he trobat l'opcio 'Descarrega totes les trameses'. Revisa permisos del rol o idioma de la plataforma.",
      unexpectedLaunch: "Error inesperat en iniciar la descarrega."
    },
    es: {
      analyzeSubmissions: "Analizar entregas",
      analyzeTitle: "Descargar todas las entregas en carpetas y abrir el analizador",
      downloading: "Descargando...",
      openingAnalyzer: "Abriendo analizador...",
      downloadFailed: "No se pudo iniciar la descarga.",
      unexpectedPrepare: "Error inesperado al preparar el analisis.",
      actionsNotFound:
        "No encontre el boton de acciones. Debes estar en la vista de calificacion de una tarea (mod/assign).",
      downloadOptionNotFound:
        "No encontre la opcion 'Descargar todas las entregas'. Revisa permisos del rol o idioma de la plataforma.",
      unexpectedLaunch: "Error inesperado al lanzar la descarga."
    },
    en: {
      analyzeSubmissions: "Analyze submissions",
      analyzeTitle: "Download all submissions in folders and open the analyzer",
      downloading: "Downloading...",
      openingAnalyzer: "Opening analyzer...",
      downloadFailed: "Could not start the download.",
      unexpectedPrepare: "Unexpected error while preparing the analysis.",
      actionsNotFound: "Could not find the actions button. Open an assignment grading page first (mod/assign).",
      downloadOptionNotFound:
        "Could not find the 'Download all submissions' option. Check role permissions or the platform language.",
      unexpectedLaunch: "Unexpected error while starting the download."
    }
  };

  let currentLang = DEFAULT_LANG;

  function t(key) {
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS[DEFAULT_LANG][key] || key;
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

  async function initLanguage() {
    const lang = await storageGet(STORAGE_LANG_KEY);
    currentLang = TRANSLATIONS[lang] ? lang : DEFAULT_LANG;
    updateInjectedButtonLanguage();
    ext?.storage?.onChanged?.addListener((changes, areaName) => {
      if (areaName === "local" && changes[STORAGE_LANG_KEY]) {
        const nextLang = changes[STORAGE_LANG_KEY].newValue;
        currentLang = TRANSLATIONS[nextLang] ? nextLang : DEFAULT_LANG;
        updateInjectedButtonLanguage();
      }
    });
  }

  function updateInjectedButtonLanguage() {
    const button = document.getElementById(ANALYZE_BUTTON_ID);
    if (!button || button.disabled) {
      return;
    }
    button.textContent = t("analyzeSubmissions");
    button.title = t("analyzeTitle");
  }

  function normalizeUiText(value) {
    return (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  function isVisible(el) {
    if (!el) {
      return false;
    }
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findByText(candidates, patterns) {
    const normalizedPatterns = patterns.map(normalizeUiText);
    for (const element of candidates) {
      if (!isVisible(element)) {
        continue;
      }
      const normalizedText = normalizeUiText(element.textContent);
      if (!normalizedText) {
        continue;
      }
      if (normalizedPatterns.some((pattern) => normalizedText.includes(pattern))) {
        return element;
      }
    }
    return null;
  }

  function clickIfNeeded(input, targetChecked) {
    if (!input || input.checked === targetChecked) {
      return false;
    }
    input.click();
    return true;
  }

  function enableFolderModeIfPresent() {
    const labelPatterns = [
      "descarrega les trameses en carpetes",
      "descarga les trameses en carpetes",
      "download submissions in folders",
      "descargar entregas en carpetas"
    ];
    const labels = Array.from(document.querySelectorAll("label"));
    const label = findByText(labels, labelPatterns);
    if (!label) {
      return false;
    }

    const input =
      label.querySelector("input[type='checkbox']") ||
      (label.getAttribute("for") ? document.getElementById(label.getAttribute("for")) : null);

    if (!input || input.type !== "checkbox") {
      return false;
    }

    return clickIfNeeded(input, true);
  }

  function openActionsMenu() {
    const actionButtonPatterns = ["accions", "acciones", "actions"];
    const allButtons = Array.from(document.querySelectorAll("button, a[role='button'], .dropdown-toggle"));
    const actionButton = findByText(allButtons, actionButtonPatterns);
    if (!actionButton) {
      return false;
    }
    actionButton.click();
    return true;
  }

  function findDownloadMenuItem() {
    const directDownloadLink = document.querySelector("a[href*='action=downloadall'], a[href*='downloadall']");
    if (directDownloadLink) {
      return directDownloadLink;
    }

    const itemPatterns = [
      "descarrega totes les trameses",
      "descarga totes les trameses",
      "download all submissions",
      "descargar todas las entregas"
    ];
    const items = Array.from(
      document.querySelectorAll("a, button, [role='menuitem'], .dropdown-item, .action-menu a")
    );
    return findByText(items, itemPatterns);
  }

  async function triggerMoodleDownload(forceFolderMode) {
    if (forceFolderMode) {
      enableFolderModeIfPresent();
    }

    const directDownloadItem = findDownloadMenuItem();
    if (directDownloadItem) {
      const downloadUrl = directDownloadItem.href || directDownloadItem.getAttribute("href") || "";
      directDownloadItem.click();
      return { ok: true, downloadUrl };
    }

    const opened = openActionsMenu();
    if (!opened) {
      return { ok: false, error: t("actionsNotFound") };
    }

    await new Promise((resolve) => window.setTimeout(resolve, 160));
    const downloadItem = findDownloadMenuItem();
    if (!downloadItem) {
      return { ok: false, error: t("downloadOptionNotFound") };
    }

    const downloadUrl = downloadItem.href || downloadItem.getAttribute("href") || "";
    downloadItem.click();
    return { ok: true, downloadUrl };
  }

  function sendRuntimeMessage(payload) {
    return new Promise((resolve, reject) => {
      ext.runtime.sendMessage(payload, (response) => {
        const err = ext.runtime.lastError;
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve(response);
      });
    });
  }

  async function handleAnalyzeSubmissionsClick(button) {
    const originalText = t("analyzeSubmissions");
    button.disabled = true;
    button.textContent = t("downloading");

    try {
      const result = await triggerMoodleDownload(true);
      if (!result?.ok) {
        throw new Error(result?.error || t("downloadFailed"));
      }

      button.textContent = t("openingAnalyzer");
      await sendRuntimeMessage({
        type: "openAnalyzer",
        downloadUrl: result.downloadUrl || "",
        downloadName: document.title || "entregas-moodle.zip"
      });
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = originalText;
      }, 1200);
    } catch (error) {
      button.disabled = false;
      button.textContent = originalText;
      window.alert(error?.message || t("unexpectedPrepare"));
    }
  }

  function findTopGradeButton() {
    const links = Array.from(document.querySelectorAll("a.btn[href*='action=grader']"));
    return findByText(links, ["qualificar", "grade"]);
  }

  function injectAnalyzeButton() {
    if (document.getElementById(ANALYZE_BUTTON_ID)) {
      updateInjectedButtonLanguage();
      return true;
    }

    const gradeButton = findTopGradeButton();
    if (!gradeButton) {
      return false;
    }

    const gradeContainer = gradeButton.closest(".navitem") || gradeButton.parentElement;
    if (!gradeContainer?.parentElement) {
      return false;
    }

    const container = document.createElement("div");
    container.className = "navitem align-self-center";
    container.style.marginLeft = "0.5rem";

    const button = document.createElement("button");
    button.id = ANALYZE_BUTTON_ID;
    button.type = "button";
    button.className = "btn btn-outline-primary";
    button.textContent = t("analyzeSubmissions");
    button.title = t("analyzeTitle");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      handleAnalyzeSubmissionsClick(button);
    });

    container.appendChild(button);
    gradeContainer.parentElement.insertBefore(container, gradeContainer.nextSibling);
    return true;
  }

  function scheduleButtonInjection() {
    let attempts = 0;
    const maxAttempts = 20;
    const retryMs = 500;

    const tryInject = () => {
      attempts += 1;
      if (injectAnalyzeButton() || attempts >= maxAttempts) {
        return;
      }
      window.setTimeout(tryInject, retryMs);
    };

    tryInject();
  }

  scheduleButtonInjection();
  initLanguage();

  ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "downloadAllSubmissions") {
      return false;
    }

    triggerMoodleDownload(Boolean(message.forceFolderMode))
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error?.message || t("unexpectedLaunch")
        })
      );

    return true;
  });
})();
