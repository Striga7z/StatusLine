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
  emerald: `${ESC}[38;5;120m`,
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

function resolveRemainingSeconds(bucket) {
  if (!bucket || typeof bucket !== 'object') return null;

  if (typeof bucket.reset_in_seconds === 'number' && !Number.isNaN(bucket.reset_in_seconds)) {
    return Math.max(0, Math.floor(bucket.reset_in_seconds));
  }

  const target = bucket.resets_at ?? bucket.reset_time ?? null;
  if (typeof target === 'number' && !Number.isNaN(target)) {
    const epochMs = target > 1e12 ? target : target * 1000;
    return Math.max(0, Math.floor((epochMs - Date.now()) / 1000));
  }

  if (typeof target === 'string' && target.trim()) {
    const asNum = Number(target);
    if (!Number.isNaN(asNum)) {
      const epochMs = asNum > 1e12 ? asNum : asNum * 1000;
      return Math.max(0, Math.floor((epochMs - Date.now()) / 1000));
    }
    const parsed = new Date(target).getTime();
    if (!Number.isNaN(parsed)) {
      return Math.max(0, Math.floor((parsed - Date.now()) / 1000));
    }
  }

  return null;
}

function formatDuration(sec) {
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

function formatCost(usd) {
  const num = Number(usd);
  if (Number.isNaN(num) || num <= 0) return '';
  const formatted = num < 0.01 ? num.toFixed(4) : num.toFixed(2);
  return ` ${FG.emerald}$${formatted}${RESET}`;
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

function resolveRemainingPct(bucket) {
  if (typeof bucket.remaining_fraction === 'number') {
    return Math.round(bucket.remaining_fraction * 100);
  }
  if (typeof bucket.remaining_percentage === 'number') {
    return Math.round(bucket.remaining_percentage);
  }
  if (typeof bucket.used_percentage === 'number') {
    return Math.round(Math.max(0, Math.min(100, 100 - bucket.used_percentage)));
  }
  if (typeof bucket.used_fraction === 'number') {
    return Math.round(Math.max(0, Math.min(100, (1 - bucket.used_fraction) * 100)));
  }
  return 100;
}

function renderQuotaSegment(label, bucket) {
  if (!bucket || bucket.disabled) {
    return `${FG.gray}${label}:${RESET} ${DIM}--${RESET}`;
  }
  const remPct = Math.max(0, Math.min(100, resolveRemainingPct(bucket)));
  const color = colorByRemaining(remPct);
  const bar = makeBar(remPct, 8, color);
  const resetStr = formatDuration(resolveRemainingSeconds(bucket));

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
const rateLimits = data.rate_limits || {};

const bucket5h =
  quota['gemini-5h'] ||
  findQuotaBucket(quota, ['5h', 'five_hour', '5-hour']) ||
  rateLimits.five_hour ||
  findQuotaBucket(rateLimits, ['5h', 'five_hour', '5-hour']) ||
  null;

const bucketWeek =
  quota['gemini-weekly'] ||
  findQuotaBucket(quota, ['week', '7d', 'seven_day']) ||
  rateLimits.seven_day ||
  findQuotaBucket(rateLimits, ['week', '7d', 'seven_day']) ||
  null;

const cw = data.context_window || {};
const currentUsage = cw.current_usage || {};

const inTokens =
  Number(cw.total_input_tokens) ||
  Number(currentUsage.input_tokens) ||
  0;
const outTokens =
  Number(cw.total_output_tokens) ||
  Number(currentUsage.output_tokens) ||
  0;
const totalTokens = inTokens + outTokens;

const usedPct =
  typeof cw.used_percentage === 'number'
    ? Number(cw.used_percentage.toFixed(1))
    : cw.context_window_size
      ? Number(((totalTokens / cw.context_window_size) * 100).toFixed(1))
      : 0;

const costStr = formatCost(data.cost?.total_cost_usd);
const ctxColor = colorByContextUsed(usedPct);
const checkpointWarn = usedPct >= 85 ? ` ${FG.red}${BOLD}[⚠ CHECKPOINT %85+]${RESET}` : '';

const seg5h = renderQuotaSegment('5H', bucket5h);
const segWeek = renderQuotaSegment('WEEK', bucketWeek);

const tokenBox =
  `${FG.border}⟦${RESET}` +
  `${BOLD}${FG.purple}TOKENS${RESET} ` +
  `${FG.white}${BOLD}${formatTokens(totalTokens)}${RESET} ` +
  `${FG.gray}(In:${formatTokens(inTokens)} Out:${formatTokens(outTokens)})${RESET}` +
  `${costStr} ` +
  `${FG.border}│${RESET} ` +
  `${BOLD}CTX${RESET} ${makeBar(usedPct, 6, ctxColor)} ${ctxColor}${BOLD}${usedPct}%${RESET}` +
  `${checkpointWarn}` +
  `${FG.border}⟧${RESET}`;

const sep = ` ${FG.border}│${RESET} `;
process.stdout.write(`${seg5h}${sep}${segWeek}${sep}${tokenBox}\n`);
