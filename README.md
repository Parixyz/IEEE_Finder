# Website Text Saver (Chrome Extension)

A lightweight Google Chrome extension that:

- Saves full visible page text (`document.body.innerText`) from the current website.
- Optionally captures pasted clipboard text (`Ctrl+V`) when toggle is enabled.
- Lets you add the current page via button **or by pressing `i`**.
- Accumulates saved items across your browsing session.
- Exports saved items as JSON.
- Resets saved items when needed.

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder (`IEEE_Finder`).

## Usage

1. Open any normal website page.
2. Open the extension popup.
3. (Optional) Enable **Capture clipboard text on Ctrl+V**.
4. Press `Ctrl+V` on page to save pasted text, or click **Add this page content (i)** to save full page text.
5. Repeat on more pages to accumulate.
6. Click **Export saved pages** to download JSON.
7. Click **Reset** to clear stored items.

## Export format

Each saved item includes:

- `id`
- `url`
- `title`
- `text`
- `textLength`
- `source` (`page` or `clipboard`)
- `capturedAt`

## Notes

- Works on most websites.
- Browser-internal pages like `chrome://` cannot be scraped by extensions.
- No API key is required.
- No GPT/API calls are made.
