# Status Line

Custom status bar plugin for Antigravity CLI (`agy`).

```text
5H ███████░ 85% (↻ 1h 30m) │ WEEK █████░░░ 62% (↻ 4d 12h) │ ⟦TOKENS 149.3k (In:88.2k Out:61.1k) │ CTX █░░░░░ 14.2%⟧
```

## Features
- **5H Reset Bar:** 5-hour quota percentage, color-coded progress bar, and reset countdown (`↻`).
- **WEEK Reset Bar:** Weekly quota percentage, color-coded progress bar, and reset countdown (`↻`).
- **TOKENS & CTX Box:** Session token usage (`In` / `Out` breakdown), context window usage percentage, and 85%+ checkpoint alert.

## Installation

```bash
agy plugin install https://github.com/<owner>/status-line
```

## Usage

Activate in Antigravity CLI:
```text
/statusline node ~/.gemini/config/plugins/status-line/scripts/statusline.mjs
```
*(Windows: `/statusline node C:/Users/<username>/.gemini/config/plugins/status-line/scripts/statusline.mjs`)*
