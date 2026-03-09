const addPageButton = document.getElementById("addPage");
const exportButton = document.getElementById("exportList");
const resetButton = document.getElementById("resetList");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const previewEl = document.getElementById("preview");

init();

async function init() {
  addPageButton.addEventListener("click", addCurrentPage);
  exportButton.addEventListener("click", exportList);
  resetButton.addEventListener("click", resetList);

  await refreshPreview();
}

async function addCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setStatus("No active tab found.");
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: "ADD_CURRENT_PAGE" }, async (response) => {
    if (chrome.runtime.lastError) {
      setStatus("Open a normal website page first (chrome:// pages are blocked).");
      return;
    }

    setStatus(response?.ok ? "Page text added." : "Failed to add this page.");
    await refreshPreview();
  });
}

async function exportList() {
  const response = await chrome.runtime.sendMessage({ type: "EXPORT_PAGES" });
  setStatus(response?.ok ? `Exported ${response.count} pages.` : "Export failed.");
}

async function resetList() {
  await chrome.runtime.sendMessage({ type: "RESET_PAGES" });
  setStatus("Saved pages reset.");
  await refreshPreview();
}

async function refreshPreview() {
  const { pages = [] } = await chrome.runtime.sendMessage({ type: "GET_PAGES" });
  countEl.textContent = `Stored pages: ${pages.length}`;
  previewEl.innerHTML = "";
  pages.slice(0, 10).forEach((page) => {
    const li = document.createElement("li");
    li.textContent = `${page.title || page.url} (${page.textLength || 0} chars)`;
    previewEl.appendChild(li);
  });
}

function setStatus(message) {
  statusEl.textContent = message;
}
