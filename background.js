const STORAGE_KEYS = {
  SETTINGS: "settings",
  ARTICLES: "articles"
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "ADD_ARTICLES") {
    addArticles(message.articles || []).then((result) => sendResponse(result));
    return true;
  }

  if (message?.type === "GET_ARTICLES") {
    chrome.storage.local.get([STORAGE_KEYS.ARTICLES], (data) => {
      sendResponse({ articles: data[STORAGE_KEYS.ARTICLES] || [] });
    });
    return true;
  }

  if (message?.type === "RESET_ARTICLES") {
    chrome.storage.local.set({ [STORAGE_KEYS.ARTICLES]: [] }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message?.type === "EXPORT_ARTICLES") {
    exportArticles().then(sendResponse);
    return true;
  }
});

async function addArticles(newArticles) {
  const data = await chrome.storage.local.get([STORAGE_KEYS.ARTICLES]);
  const current = data[STORAGE_KEYS.ARTICLES] || [];

  const byUrl = new Map(current.map((item) => [item.url, item]));
  for (const article of newArticles) {
    if (!article?.url) continue;
    byUrl.set(article.url, {
      ...byUrl.get(article.url),
      ...article,
      capturedAt: article.capturedAt || new Date().toISOString()
    });
  }

  const merged = Array.from(byUrl.values());
  await chrome.storage.local.set({ [STORAGE_KEYS.ARTICLES]: merged });
  return { ok: true, added: newArticles.length, total: merged.length };
}

async function exportArticles() {
  const data = await chrome.storage.local.get([STORAGE_KEYS.ARTICLES]);
  const articles = data[STORAGE_KEYS.ARTICLES] || [];
  const blob = new Blob([JSON.stringify(articles, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const filename = `ieee-articles-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

  await chrome.downloads.download({
    url,
    filename,
    saveAs: true
  });

  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { ok: true, count: articles.length };
}
