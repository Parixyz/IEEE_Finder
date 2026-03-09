# Website Text Saver (Chrome Extension)

A lightweight Chrome extension that focuses on 3 actions:

- **Activate** clipboard capture for `Ctrl+V` / `Cmd+V`.
- **Export** saved items as JSON.
- **Reset** saved items.

When capture is active and you paste text on a webpage, the extension:

- stores the pasted text,
- appends it to the end of the page,
- and scrolls to the page end.

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder (`IEEE_Finder`).

## Usage

1. Open any normal website page.
2. Open the extension popup.
3. Click **Activate**.
4. Press `Ctrl+V` (`Cmd+V` on macOS).
5. Use **Export** to download JSON or **Reset** to clear saved items.

## Notes

- Works on most websites.
- Browser-internal pages like `chrome://` cannot be accessed by extensions.
