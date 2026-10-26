# Status Line

Real-time quota and token telemetry bar for **Antigravity CLI (`agy`)** and **Claude Code (`claude`)**.

```text
5H ███████░ 85% (↻ 1h 30m) │ WEEK █████░░░ 62% (↻ 4d 12h) │ ⟦TOKENS 149.3k (In:88.2k Out:61.1k) $0.42 │ CTX █░░░░░ 14.2%⟧
```

## Overview

**Status Line** adds a compact, zero-latency status bar right below the chat input in both **Antigravity CLI** and **Claude Code**. It automatically detects the active CLI's JSON payload schema and renders live rate limits, session token consumption, USD cost, and context window saturation.

## Features

- **Dual CLI Compatibility:** Native schema support for both **Antigravity CLI** (`quota.gemini-5h` / `quota.gemini-weekly`) and **Claude Code** (`rate_limits.five_hour` / `rate_limits.seven_day`).
- **5H & Weekly Quota Bars:** Visual progress bars for 5-hour and weekly rate limits with dynamic color thresholds (green, yellow, red) and live reset countdowns (`↻`).
- **Session Token & Cost Box (`⟦TOKENS⟧`):** Displays total session tokens, `In` / `Out` breakdown, and session USD cost (`$0.42` when reported by Claude Code).
- **Context Window Gauge (`CTX`):** Tracks active context window usage as a percentage bar.
- **85%+ Checkpoint Alert:** Automatically displays `[⚠ CHECKPOINT %85+]` when context usage reaches 85% or higher so you can save state or compact context in time.
- **Lightweight & Zero Dependencies:** Built with native Node.js ESM and 256-color ANSI sequences for instant rendering.

## Installation

### 1. Antigravity CLI (`agy`)

Install via the Antigravity CLI plugin manager:

```bash
agy plugin install https://github.com/Striga7z/status-line
```

Or clone manually into your global plugins directory:

```bash
git clone https://github.com/Striga7z/status-line ~/.gemini/config/plugins/status-line
```

Activate in the Antigravity CLI chat input:

```text
/statusline node ~/.gemini/config/plugins/status-line/scripts/statusline.mjs
```

On Windows, use your full user path without quotes:

```text
/statusline node C:/Users/<username>/.gemini/config/plugins/status-line/scripts/statusline.mjs
```

To revert to the default status line:

```text
/statusline reset
```

---

### 2. Claude Code (`claude`)

Clone the plugin into `~/.claude/plugins/status-line` (or reuse `~/.gemini/config/plugins/status-line`):

```bash
git clone https://github.com/Striga7z/status-line ~/.claude/plugins/status-line
```

Add the `statusLine` block to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/plugins/status-line/scripts/statusline.mjs"
  }
}
```

On Windows (`%USERPROFILE%\.claude\settings.json`):

```json
{
  "statusLine": {
    "type": "command",
    "command": "node C:/Users/<username>/.claude/plugins/status-line/scripts/statusline.mjs"
  }
}
```
