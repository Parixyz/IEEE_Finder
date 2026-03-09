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

function appendTextToPageEnd(text) {
  if (!document.body || !text) return;

  const containerId = "website-text-saver-paste-output";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("section");
    container.id = containerId;
    container.style.margin = "24px 0";
    container.style.padding = "16px";
    container.style.borderTop = "2px dashed #8a8a8a";
    container.style.background = "#f7f7f7";

    const heading = document.createElement("h2");
    heading.textContent = "Pasted text (Website Text Saver)";
    heading.style.fontSize = "16px";
    heading.style.margin = "0 0 12px";
    container.appendChild(heading);

    const list = document.createElement("div");
    list.id = `${containerId}-list`;
    container.appendChild(list);

    document.body.appendChild(container);
  }

  const list = document.getElementById(`${containerId}-list`);
  if (!list) return;

  const entry = document.createElement("pre");
  entry.textContent = text;
  entry.style.whiteSpace = "pre-wrap";
  entry.style.wordBreak = "break-word";
  entry.style.padding = "10px";
  entry.style.margin = "0 0 8px";
  entry.style.background = "#fff";
  entry.style.border = "1px solid #ddd";
  list.appendChild(entry);

  container.scrollIntoView({ behavior: "smooth", block: "end" });
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
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

async function storePastedText(rawText) {
  const item = createItem({ text: rawText, source: "clipboard" });
  if (!item) return;

  appendTextToPageEnd(item.text);

  chrome.runtime.sendMessage({ type: "ADD_PAGE", pages: [item] }, (result) => {
    console.info("Clipboard text saved", result);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ADD_CURRENT_PAGE") {
    collectAndStore().then(() => sendResponse({ ok: true }));
    return true;
  }
});

document.addEventListener("keydown", async (event) => {
  const target = event.target;
  const isEditable =
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (!isEditable && event.key.toLowerCase() === "i") {
    collectAndStore();
  }

  const isPasteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v";
  if (!isPasteShortcut) return;

  const enabled = await isPasteCaptureEnabled();
  if (!enabled) return;

  if (isEditable) return;

  try {
    const clipboardText = await navigator.clipboard.readText();
    await storePastedText(clipboardText);
  } catch (_error) {
    // Fallback to paste event handler when clipboard read is restricted.
  }
});

document.addEventListener("paste", async (event) => {
  if (!(event instanceof ClipboardEvent)) return;

  const enabled = await isPasteCaptureEnabled();
  if (!enabled) return;

  const pastedText = event.clipboardData?.getData("text/plain") || "";
  await storePastedText(pastedText);
});
