function createItem({ text, source }) {
  const cleaned = (text || "").replace(/\s+\n/g, "\n").trim();
  if (!cleaned) return null;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: location.href,
    title: document.title || location.href,
    text: cleaned,
    textLength: cleaned.length,
    source,
    capturedAt: new Date().toISOString()
  };
}

function captureCurrentPageText() {
  const rawText = document.body?.innerText || "";
  return createItem({ text: rawText, source: "page" });
}

async function collectAndStore() {
  const item = captureCurrentPageText();
  if (!item) return;

  chrome.runtime.sendMessage({ type: "ADD_PAGE", pages: [item] }, (result) => {
    console.info("Page text saved", result);
  });
}

async function isPasteCaptureEnabled() {
  const response = await chrome.runtime.sendMessage({ type: "GET_PASTE_CAPTURE" });
  return Boolean(response?.enabled);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ADD_CURRENT_PAGE") {
    collectAndStore().then(() => sendResponse({ ok: true }));
    return true;
  }
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isEditable =
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (!isEditable && event.key.toLowerCase() === "i") {
    collectAndStore();
  }
});

document.addEventListener("paste", async (event) => {
  if (!(event instanceof ClipboardEvent)) return;

  const enabled = await isPasteCaptureEnabled();
  if (!enabled) return;

  const pastedText = event.clipboardData?.getData("text/plain") || "";
  const item = createItem({ text: pastedText, source: "clipboard" });
  if (!item) return;

  chrome.runtime.sendMessage({ type: "ADD_PAGE", pages: [item] }, (result) => {
    console.info("Clipboard text saved", result);
  });
});
