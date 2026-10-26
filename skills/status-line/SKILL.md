---
name: status-line
description: Configure, customize, or reset the Status Line displaying 5H Reset, Week Reset bars, and the Session Token / Cost / Context usage box for Antigravity CLI and Claude Code.
---

# Status Line

Manages the status bar displaying **5H Reset**, **Week Reset** quota bars, and the **Session Token / Cost / Context (`⟦TOKENS ... │ CTX ...⟧`)** box across **Antigravity CLI (`agy`)** and **Claude Code (`claude`)**.

## Script Path
`~/.gemini/config/plugins/status-line/scripts/statusline.mjs`

## Activation (Antigravity CLI)
Run in the Antigravity CLI chat input:
```text
/statusline node ~/.gemini/config/plugins/status-line/scripts/statusline.mjs
```
*(On Windows: `/statusline node C:/Users/<username>/.gemini/config/plugins/status-line/scripts/statusline.mjs`)*

## Activation (Claude Code)
Add to `~/.claude/settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node C:/Users/<username>/.gemini/config/plugins/status-line/scripts/statusline.mjs"
  }
}
```

## Customization
When the user requests changes to bar widths, color thresholds, or displayed metrics, update `~/.gemini/config/plugins/status-line/scripts/statusline.mjs`.
