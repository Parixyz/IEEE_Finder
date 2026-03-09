const exportButton = document.getElementById("exportText");
const resetButton = document.getElementById("resetText");
const statusEl = document.getElementById("status");
const previewEl = document.getElementById("preview");

init();

async function init() {
  exportButton.addEventListener("click", exportText);
  resetButton.addEventListener("click", resetText);
  await refreshState();
}

async function refreshState() {
  const state = await chrome.runtime.sendMessage({ type: "GET_STATE" });
  const text = state?.text || "";
  const preview = text.slice(-600);

  previewEl.textContent = preview || "Nothing accumulated yet.";
  statusEl.textContent = `${state?.lastEvent || "Ready"} Total chars: ${state?.length || 0}`;
}

async function exportText() {
  await chrome.runtime.sendMessage({ type: "EXPORT_TEXT" });
  await refreshState();
}

async function resetText() {
  await chrome.runtime.sendMessage({ type: "RESET_TEXT" });
  await refreshState();
}
