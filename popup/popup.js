const ext = globalThis.browser ?? globalThis.chrome;

const statusNode = document.getElementById("status");
const downloadButton = document.getElementById("downloadButton");
const analyzerButton = document.getElementById("analyzerButton");
const folderMode = document.getElementById("folderMode");

function setStatus(message, isError = false) {
  statusNode.textContent = message;
  statusNode.classList.toggle("error", Boolean(isError));
}

async function getActiveTab() {
  const tabs = await ext.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

downloadButton.addEventListener("click", async () => {
  setStatus("Buscando página de Moodle...");

  try {
    const tab = await getActiveTab();
    if (!tab?.id || !tab.url || !tab.url.includes("/mod/assign/")) {
      setStatus("Abre antes una página de tarea en Moodle (mod/assign).", true);
      return;
    }

    const response = await ext.runtime.sendMessage({
      type: "downloadFromCurrentTab",
      tabId: tab.id,
      forceFolderMode: folderMode.checked
    });

    if (!response?.ok) {
      setStatus(response?.error || "No se pudo iniciar la descarga.", true);
      return;
    }

    setStatus("Descarga lanzada. Revisa las descargas del navegador.");
  } catch (error) {
    setStatus(error?.message || "Error inesperado.", true);
  }
});

analyzerButton.addEventListener("click", async () => {
  await ext.runtime.sendMessage({ type: "openAnalyzer" });
  window.close();
});
