# IEEE Finder Exporter (Chrome Extension)

A lightweight Google Chrome extension for IEEE Xplore pages that:

- Reads article links/content from the current IEEE search/results page.
- Lets you add the current page via button **or by pressing `i`**.
- Accumulates captured results across pages.
- Exports the accumulated list as JSON.
- Resets the list when needed.
- Optionally enriches metadata with GPT (requires your OpenAI API key).

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder (`IEEE_Finder`).

## Usage

1. Open an IEEE Xplore results page (`ieeexplore.ieee.org`).
2. Open the extension popup.
3. Optionally set:
   - **API key**
   - **Mode**:
     - `Basic parse` (local parsing only)
     - `GPT enrichment` (calls OpenAI Responses API)
4. Click **Add this page content (i)** or press `i` on the page.
5. Repeat on more pages to accumulate.
6. Click **Export articles list** to download JSON.
7. Click **Reset** to clear stored articles.

## Notes

- Deduplication is based on article URL.
- GPT mode falls back to local data if enrichment fails.
