import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class-merging helper. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "1.2K", "3.4M", "8.1B" — for KPI tiles and chart axes. */
export function formatNumber(n: number, opts: { precision?: number } = {}): string {
  const p = opts.precision ?? 1;
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(p)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(p)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(p)}K`;
  return n.toString();
}

/** Signed percent (with leading +/-). For deltas. */
export function formatPercent(n: number, decimals = 1): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(decimals)}%`;
}

/** Plain percent — for KPIs like "92.4%". */
export function formatPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

/** Currency (USD by default — used for FOIA cost recovery, parking citations, etc.). */
export function formatCurrency(n: number, opts: { precision?: number } = {}): string {
  const p = opts.precision ?? 0;
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(p > 0 ? p : 1)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(p > 0 ? p : 1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(p > 0 ? p : 1)}K`;
  return `$${n.toFixed(p)}`;
}

/** Response-time / case-age duration formatting. */
export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  const days = Math.floor(h / 24);
  const remH = Math.round(h - days * 24);
  return remH > 0 ? `${days}d ${remH}h` : `${days}d`;
}

/** Minutes formatting — for response-time and 24-hour-rule clocks. */
export function formatMinutes(m: number): string {
  if (m < 60) return `${Math.round(m)}m`;
  const h = Math.floor(m / 60);
  const rem = Math.round(m - h * 60);
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

/** Distance formatting in feet/miles — used for geofence / camera-radius copy. */
export function formatDistance(meters: number): string {
  if (meters < 30) return `${Math.round(meters * 3.28084)} ft`;
  const miles = meters / 1609.34;
  if (miles < 0.5) return `${Math.round(meters * 3.28084)} ft`;
  return `${miles.toFixed(2)} mi`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Relative-time rendering — always references ANCHOR for fixture data. */
export function formatRelativeTime(d: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - d.getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);
  const min = Math.floor(abs / 60_000);
  if (min < 1) return future ? 'in a moment' : 'just now';
  if (min < 60) return future ? `in ${min}m` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return future ? `in ${hr}h` : `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return future ? `in ${day}d` : `${day}d ago`;
  const mo = Math.floor(day / 30);
  return future ? `in ${mo}mo` : `${mo}mo ago`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
