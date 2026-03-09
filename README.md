# IEEE Page Text Saver (Chrome Extension)

A lightweight Google Chrome extension for IEEE Xplore pages that:

- Saves full visible page text (`document.body.innerText`) from the current IEEE page.
- Lets you add the current page via button **or by pressing `i`**.
- Accumulates saved pages across your browsing session.
- Exports saved pages as JSON.
- Resets saved pages when needed.

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder (`IEEE_Finder`).

## Usage

1. Open any IEEE Xplore page (`ieeexplore.ieee.org`).
2. Open the extension popup.
3. Click **Add this page content (i)** or press `i` on the page.
4. Repeat on more pages to accumulate.
5. Click **Export saved pages** to download JSON.
6. Click **Reset** to clear stored pages.

## Export format

Each saved item includes:

- `url`
- `title`
- `text`
- `textLength`
- `capturedAt`

## Notes

- No API key is required.
- No GPT/API calls are made.
- Deduplication is by page URL (new capture updates existing URL entry).
