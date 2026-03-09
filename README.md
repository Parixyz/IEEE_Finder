# Paste Accumulator (Chrome Extension)

This extension now does only the core workflow:

- Detect `Ctrl+V` / `Cmd+V`.
- Append pasted text to one accumulated value.
- Show status in the popup.
- Export accumulated text.
- Reset accumulated text.

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder (`IEEE_Finder`).

## Usage

1. Open any normal website page.
2. Paste text with `Ctrl+V` (`Cmd+V` on macOS).
3. Open the extension popup to see status + accumulated preview.
4. Click **Export** to download all accumulated text.
5. Click **Reset** to clear everything.

## Notes

- Accumulation is automatic (no activate/deactivate toggle).
- The page also gets an on-page appended output block for pasted text.
- Browser-internal pages like `chrome://` cannot be accessed by extensions.
