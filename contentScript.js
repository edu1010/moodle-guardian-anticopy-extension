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
    (label.getAttribute("for")
      ? document.getElementById(label.getAttribute("for"))
      : null);

  if (!input || input.type !== "checkbox") {
    return false;
  }

  return clickIfNeeded(input, true);
}

function openActionsMenu() {
  const actionButtonPatterns = ["accions", "acciones", "actions"];
  const allButtons = Array.from(
    document.querySelectorAll("button, a[role='button'], .dropdown-toggle")
  );
  const actionButton = findByText(allButtons, actionButtonPatterns);
  if (!actionButton) {
    return false;
  }
  actionButton.click();
  return true;
}

function findDownloadMenuItem() {
  const itemPatterns = [
    "descarrega totes les trameses",
    "descarga totes les trameses",
    "download all submissions",
    "descargar todas las entregas"
  ];
  const items = Array.from(
    document.querySelectorAll(
      "a, button, [role='menuitem'], .dropdown-item, .action-menu a"
    )
  );
  return findByText(items, itemPatterns);
}

async function triggerMoodleDownload(forceFolderMode) {
  if (forceFolderMode) {
    enableFolderModeIfPresent();
  }

  const opened = openActionsMenu();
  if (!opened) {
    return {
      ok: false,
      error:
        "No encontré el botón de acciones. Debes estar en la vista de calificación de una tarea (mod/assign)."
    };
  }

  await new Promise((resolve) => window.setTimeout(resolve, 160));
  const downloadItem = findDownloadMenuItem();
  if (!downloadItem) {
    return {
      ok: false,
      error:
        "No encontré la opción 'Descargar todas las entregas'. Revisa permisos del rol o idioma de la plataforma."
    };
  }

  downloadItem.click();
  return { ok: true };
}

const ext = globalThis.browser ?? globalThis.chrome;
ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "downloadAllSubmissions") {
    return false;
  }

  triggerMoodleDownload(Boolean(message.forceFolderMode))
    .then((result) => sendResponse(result))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error?.message || "Error inesperado al lanzar la descarga."
      })
    );

  return true;
});
