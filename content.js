function appendTextToPage(text) {
  if (!text || !document.body) return;

  const containerId = "ieee-finder-paste-log";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("section");
    container.id = containerId;
    container.style.margin = "24px 0";
    container.style.padding = "12px";
    container.style.borderTop = "2px dashed #888";
    container.style.background = "#f7f7f7";

    const title = document.createElement("h2");
    title.textContent = "Accumulated pasted text";
    title.style.margin = "0 0 8px";
    title.style.fontSize = "16px";
    container.appendChild(title);

    const output = document.createElement("pre");
    output.id = `${containerId}-output`;
    output.style.whiteSpace = "pre-wrap";
    output.style.wordBreak = "break-word";
    output.style.background = "#fff";
    output.style.padding = "10px";
    output.style.border = "1px solid #ddd";
    output.style.margin = "0";
    container.appendChild(output);

    document.body.appendChild(container);
  }

  const output = document.getElementById(`${containerId}-output`);
  if (!output) return;
  output.textContent = output.textContent ? `${output.textContent}\n${text}` : text;

  container.scrollIntoView({ behavior: "smooth", block: "end" });
}

async function storePaste(text) {
  const cleaned = (text || "").trim();
  if (!cleaned) return;

  appendTextToPage(cleaned);
  chrome.runtime.sendMessage({ type: "APPEND_TEXT", text: cleaned });
}

document.addEventListener(
  "keydown",
  (event) => {
    const isPasteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v";
    if (!isPasteShortcut) return;

    chrome.runtime.sendMessage({ type: "PASTE_SHORTCUT_DETECTED" });
  },
  true
);

document.addEventListener(
  "paste",
  async (event) => {
    if (!(event instanceof ClipboardEvent)) return;
    const text = event.clipboardData?.getData("text/plain") || "";
    await storePaste(text);
  },
  true
);
