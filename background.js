const ext = globalThis.browser ?? globalThis.chrome;

function buildDownloadPayload(forceFolderMode) {
  return {
    type: "downloadAllSubmissions",
    forceFolderMode: forceFolderMode !== false
  };
}

function sendToContentScript(tabId, payload, callback) {
  ext.tabs.sendMessage(tabId, payload, (response) => {
    const err = ext.runtime.lastError;
    callback(err, response);
  });
}

function injectContentScript(tabId, callback) {
  if (typeof ext.tabs.executeScript !== "function") {
    callback(new Error("No se puede inyectar script en este navegador."));
    return;
  }
  ext.tabs.executeScript(tabId, { file: "/contentScript.js", runAt: "document_idle" }, () => {
    const err = ext.runtime.lastError;
    callback(err || null);
  });
}

function triggerDownload(tabId, forceFolderMode, sendResponse) {
  const payload = buildDownloadPayload(forceFolderMode);

  sendToContentScript(tabId, payload, (err, response) => {
    if (!err) {
      sendResponse(response ?? { ok: false, error: "Sin respuesta del script de pagina." });
      return;
    }

    injectContentScript(tabId, (injectErr) => {
      if (injectErr) {
        sendResponse({
          ok: false,
          error:
            "No se pudo contactar con la pagina de Moodle. Recarga la pagina de la tarea y vuelve a intentarlo."
        });
        return;
      }

      sendToContentScript(tabId, payload, (err2, response2) => {
        if (err2) {
          sendResponse({
            ok: false,
            error:
              "No se pudo contactar con la pagina de Moodle tras inyectar el script. Recarga e intentalo de nuevo."
          });
          return;
        }
        sendResponse(response2 ?? { ok: false, error: "Sin respuesta del script de pagina." });
      });
    });
  });
}

ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  if (message.type === "openAnalyzer") {
    ext.tabs.create({ url: ext.runtime.getURL("analyzer/analyzer.html") });
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "downloadFromCurrentTab") {
    const tabId = message.tabId ?? sender?.tab?.id;
    if (!tabId) {
      sendResponse({ ok: false, error: "No se pudo resolver la pestana activa." });
      return false;
    }
    triggerDownload(tabId, message.forceFolderMode, sendResponse);
    return true;
  }

  return false;
});
