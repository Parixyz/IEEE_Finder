function captureCurrentPageText() {
  const rawText = document.body?.innerText || "";
  const text = rawText.replace(/\s+\n/g, "\n").trim();

  return {
    url: location.href,
    title: document.title || location.href,
    text,
    textLength: text.length,
    capturedAt: new Date().toISOString()
  };
}

async function collectAndStore() {
  const page = captureCurrentPageText();
  chrome.runtime.sendMessage({ type: "ADD_PAGE", pages: [page] }, (result) => {
    console.info("IEEE page saved", result);
  });
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
