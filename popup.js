const apiKeyInput = document.getElementById("apiKey");
const modeInput = document.getElementById("mode");
const addPageButton = document.getElementById("addPage");
const exportButton = document.getElementById("exportList");
const resetButton = document.getElementById("resetList");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const previewEl = document.getElementById("preview");

init();

async function init() {
  const { settings = {} } = await chrome.storage.local.get(["settings"]);
  apiKeyInput.value = settings.apiKey || "";
  modeInput.value = settings.mode || "basic";

  apiKeyInput.addEventListener("change", saveSettings);
  modeInput.addEventListener("change", saveSettings);

  addPageButton.addEventListener("click", addCurrentPage);
  exportButton.addEventListener("click", exportList);
  resetButton.addEventListener("click", resetList);

  await refreshPreview();
}

async function saveSettings() {
  const settings = {
    apiKey: apiKeyInput.value.trim(),
    mode: modeInput.value
  };
  await chrome.storage.local.set({ settings });
  setStatus("Settings saved.");
}

async function addCurrentPage() {
  await saveSettings();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus("No active tab found.");
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: "ADD_CURRENT_PAGE" }, async (response) => {
    if (chrome.runtime.lastError) {
      setStatus("Open an IEEE Xplore page first.");
      return;
    }

    setStatus(response?.ok ? "Page content added." : "Failed to add this page.");
    await refreshPreview();
  });
}

async function exportList() {
  const response = await chrome.runtime.sendMessage({ type: "EXPORT_ARTICLES" });
  setStatus(response?.ok ? `Exported ${response.count} articles.` : "Export failed.");
}

async function resetList() {
  await chrome.runtime.sendMessage({ type: "RESET_ARTICLES" });
  setStatus("List reset.");
  await refreshPreview();
}

async function refreshPreview() {
  const { articles = [] } = await chrome.runtime.sendMessage({ type: "GET_ARTICLES" });
  countEl.textContent = `Stored articles: ${articles.length}`;
  previewEl.innerHTML = "";
  articles.slice(0, 10).forEach((article) => {
    const li = document.createElement("li");
    li.textContent = article.title || article.url;
    previewEl.appendChild(li);
  });
}

function setStatus(message) {
  statusEl.textContent = message;
}
