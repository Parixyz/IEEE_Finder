const STORAGE_KEY = "pages";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ADD_PAGE") {
    addPages(message.pages || []).then((result) => sendResponse(result));
    return true;
  }

  if (message?.type === "GET_PAGES") {
    chrome.storage.local.get([STORAGE_KEY], (data) => {
      sendResponse({ pages: data[STORAGE_KEY] || [] });
    });
    return true;
  }

  if (message?.type === "RESET_PAGES") {
    chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message?.type === "EXPORT_PAGES") {
    exportPages().then(sendResponse);
    return true;
  }
});

async function addPages(newPages) {
  const data = await chrome.storage.local.get([STORAGE_KEY]);
  const current = data[STORAGE_KEY] || [];

  const byUrl = new Map(current.map((item) => [item.url, item]));
  for (const page of newPages) {
    if (!page?.url) continue;
    byUrl.set(page.url, {
      ...byUrl.get(page.url),
      ...page,
      capturedAt: page.capturedAt || new Date().toISOString()
    });
  }

  const merged = Array.from(byUrl.values());
  await chrome.storage.local.set({ [STORAGE_KEY]: merged });
  return { ok: true, added: newPages.length, total: merged.length };
}

async function exportPages() {
  const data = await chrome.storage.local.get([STORAGE_KEY]);
  const pages = data[STORAGE_KEY] || [];
  const blob = new Blob([JSON.stringify(pages, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const filename = `ieee-pages-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

  await chrome.downloads.download({
    url,
    filename,
    saveAs: true
  });

  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { ok: true, count: pages.length };
}
