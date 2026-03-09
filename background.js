const STORAGE_KEY = "accumulatedText";
const LAST_EVENT_KEY = "lastEvent";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ [STORAGE_KEY]: "", [LAST_EVENT_KEY]: "Ready" });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "APPEND_TEXT") {
    appendText(message.text || "").then(sendResponse);
    return true;
  }

  if (message?.type === "PASTE_SHORTCUT_DETECTED") {
    chrome.storage.local.set({ [LAST_EVENT_KEY]: "Ctrl/Cmd+V detected. Waiting for pasted text..." });
    sendResponse({ ok: true });
    return;
  }

  if (message?.type === "GET_STATE") {
    chrome.storage.local.get([STORAGE_KEY, LAST_EVENT_KEY], (data) => {
      const text = data[STORAGE_KEY] || "";
      sendResponse({
        text,
        length: text.length,
        lastEvent: data[LAST_EVENT_KEY] || "Ready"
      });
    });
    return true;
  }

  if (message?.type === "RESET_TEXT") {
    chrome.storage.local.set(
      { [STORAGE_KEY]: "", [LAST_EVENT_KEY]: "Reset complete. Accumulated text cleared." },
      () => sendResponse({ ok: true })
    );
    return true;
  }

  if (message?.type === "EXPORT_TEXT") {
    exportText().then(sendResponse);
    return true;
  }
});

async function appendText(newText) {
  const cleaned = (newText || "").trim();
  if (!cleaned) return { ok: false };

  const data = await chrome.storage.local.get([STORAGE_KEY]);
  const current = data[STORAGE_KEY] || "";
  const updated = current ? `${current}\n${cleaned}` : cleaned;

  await chrome.storage.local.set({
    [STORAGE_KEY]: updated,
    [LAST_EVENT_KEY]: `Ctrl/Cmd+V detected. Appended ${cleaned.length} chars.`
  });

  return { ok: true, length: updated.length };
}

async function exportText() {
  const data = await chrome.storage.local.get([STORAGE_KEY]);
  const text = data[STORAGE_KEY] || "";

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  await chrome.downloads.download({
    url,
    filename: `accumulated-paste-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`,
    saveAs: true
  });

  setTimeout(() => URL.revokeObjectURL(url), 2000);

  await chrome.storage.local.set({
    [LAST_EVENT_KEY]: `Exported ${text.length} characters.`
  });

  return { ok: true, length: text.length };
}
