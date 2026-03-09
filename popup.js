const activateButton = document.getElementById("activateCapture");
const exportButton = document.getElementById("exportList");
const resetButton = document.getElementById("resetList");
const statusEl = document.getElementById("status");

init();

async function init() {
  activateButton.addEventListener("click", togglePasteCapture);
  exportButton.addEventListener("click", exportList);
  resetButton.addEventListener("click", resetList);

  await refreshActivateButton();
}

async function refreshActivateButton() {
  const response = await chrome.runtime.sendMessage({ type: "GET_PASTE_CAPTURE" });
  const enabled = Boolean(response?.enabled);
  activateButton.textContent = enabled ? "Deactivate" : "Activate";
  setStatus(enabled ? "Clipboard capture is ON." : "Clipboard capture is OFF.");
}

async function togglePasteCapture() {
  const response = await chrome.runtime.sendMessage({ type: "GET_PASTE_CAPTURE" });
  const enabled = !Boolean(response?.enabled);
  await chrome.runtime.sendMessage({ type: "SET_PASTE_CAPTURE", enabled });
  await refreshActivateButton();
}

async function exportList() {
  const response = await chrome.runtime.sendMessage({ type: "EXPORT_PAGES" });
  setStatus(response?.ok ? `Exported ${response.count} items.` : "Export failed.");
}

async function resetList() {
  await chrome.runtime.sendMessage({ type: "RESET_PAGES" });
  setStatus("Saved items reset.");
}

function setStatus(message) {
  statusEl.textContent = message;
}
