#!/usr/bin/env node

import fs from 'node:fs';

const ESC = '\x1b';
const RESET = `${ESC}[0m`;
const BOLD = `${ESC}[1m`;
const DIM = `${ESC}[2m`;

const FG = {
  cyan: `${ESC}[38;5;81m`,
  green: `${ESC}[38;5;114m`,
  yellow: `${ESC}[38;5;221m`,
  red: `${ESC}[38;5;203m`,
  purple: `${ESC}[38;5;141m`,
  gray: `${ESC}[38;5;245m`,
  white: `${ESC}[38;5;255m`,
  border: `${ESC}[38;5;240m`,
};

function colorByRemaining(remPct) {
  if (remPct <= 15) return FG.red;
  if (remPct <= 35) return FG.yellow;
  return FG.green;
}

function colorByContextUsed(usedPct) {
  if (usedPct >= 85) return FG.red;
  if (usedPct >= 65) return FG.yellow;
  return FG.cyan;
}

function makeBar(pct, width = 10, color = FG.green) {
  const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
  const filled = Math.round((clamped / 100) * width);
  const empty = Math.max(0, width - filled);
  return `${color}${'█'.repeat(filled)}${FG.border}${'░'.repeat(empty)}${RESET}`;
}

function formatDuration(seconds, resetTimeIso) {
  let sec = typeof seconds === 'number' ? seconds : null;
  if ((sec === null || Number.isNaN(sec)) && resetTimeIso) {
    const diff = Math.floor((new Date(resetTimeIso).getTime() - Date.now()) / 1000);
    if (!Number.isNaN(diff)) sec = Math.max(0, diff);
  }
  if (sec === null || sec <= 0) return 'now';

  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTokens(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return `${num}`;
}

function findQuotaBucket(quotaObj, patterns) {
  if (!quotaObj || typeof quotaObj !== 'object') return null;
  for (const key of Object.keys(quotaObj)) {
    const lower = key.toLowerCase();
    if (patterns.some((p) => lower.includes(p))) {
      return quotaObj[key];
    }
  }
  return null;
}

function renderQuotaSegment(label, bucket) {
  if (!bucket || bucket.disabled) {
    return `${FG.gray}${label}:${RESET} ${DIM}--${RESET}`;
  }
  const remFraction =
    typeof bucket.remaining_fraction === 'number'
      ? bucket.remaining_fraction
      : typeof bucket.remaining_percentage === 'number'
        ? bucket.remaining_percentage / 100
        : null;

  const remPct = remFraction !== null ? Math.round(remFraction * 100) : 100;
  const color = colorByRemaining(remPct);
  const bar = makeBar(remPct, 8, color);
  const resetStr = formatDuration(bucket.reset_in_seconds, bucket.reset_time);

  return `${BOLD}${FG.white}${label}${RESET} ${bar} ${color}${BOLD}${remPct}%${RESET} ${FG.gray}(↻ ${resetStr})${RESET}`;
}

let raw = '';
try {
  raw = fs.readFileSync(0, 'utf8');
} catch {
  raw = '';
}

let data = {};
try {
  data = raw ? JSON.parse(raw) : {};
} catch {
  data = {};
}

const quota = data.quota || {};
const bucket5h =
  quota['gemini-5h'] ||
  findQuotaBucket(quota, ['5h', 'five_hour', '5-hour']) ||
  data.rate_limits?.five_hour ||
  null;

const bucketWeek =
  quota['gemini-weekly'] ||
  findQuotaBucket(quota, ['week', '7d', 'seven_day']) ||
  data.rate_limits?.seven_day ||
  null;

const cw = data.context_window || {};
const inTokens = Number(cw.total_input_tokens) || 0;
const outTokens = Number(cw.total_output_tokens) || 0;
const totalTokens = inTokens + outTokens;
const usedPct =
  typeof cw.used_percentage === 'number'
    ? Number(cw.used_percentage.toFixed(1))
    : cw.context_window_size
      ? Number(((totalTokens / cw.context_window_size) * 100).toFixed(1))
      : 0;

const ctxColor = colorByContextUsed(usedPct);
const checkpointWarn = usedPct >= 85 ? ` ${FG.red}${BOLD}[⚠ CHECKPOINT %85+]${RESET}` : '';

const seg5h = renderQuotaSegment('5H', bucket5h);
const segWeek = renderQuotaSegment('WEEK', bucketWeek);

const tokenBox =
  `${FG.border}⟦${RESET}` +
  `${BOLD}${FG.purple}TOKENS${RESET} ` +
  `${FG.white}${BOLD}${formatTokens(totalTokens)}${RESET} ` +
  `${FG.gray}(In:${formatTokens(inTokens)} Out:${formatTokens(outTokens)})${RESET} ` +
  `${FG.border}│${RESET} ` +
  `${BOLD}CTX${RESET} ${makeBar(usedPct, 6, ctxColor)} ${ctxColor}${BOLD}${usedPct}%${RESET}` +
  `${checkpointWarn}` +
  `${FG.border}⟧${RESET}`;

const sep = ` ${FG.border}│${RESET} `;
process.stdout.write(`${seg5h}${sep}${segWeek}${sep}${tokenBox}\n`);
