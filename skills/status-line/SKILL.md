---
name: status-line
description: Configure, customize, or reset the Antigravity CLI Status Line displaying 5H Reset, Week Reset bars, and the Session Token / Context usage box.
---

# Status Line

Manages the Antigravity CLI (`agy`) status bar displaying **5H Reset**, **Week Reset** quota bars, and the **Session Token / Context (`⟦TOKENS ... │ CTX ...⟧`)** box.

## Script Path
`~/.gemini/config/plugins/status-line/scripts/statusline.mjs`

## Activation
Run in the Antigravity CLI chat input:
```text
/statusline node ~/.gemini/config/plugins/status-line/scripts/statusline.mjs
```
*(On Windows, replace `~` with your user home path, e.g. `C:/Users/<username>/.gemini/config/plugins/status-line/scripts/statusline.mjs`)*

## Customization
When the user requests changes to bar widths, color thresholds, or displayed metrics, update `~/.gemini/config/plugins/status-line/scripts/statusline.mjs`.
