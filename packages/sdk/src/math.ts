/**
 * Safe Math & Conversions for Value Curator
 * Handles token unit scaling, integer ratio basis points, and rounding.
 */

import { BPS_DENOMINATOR } from "./types.js";

/**
 * Calculates basis points (1 bp = 0.01% = 1/10000)
 */
export function calculateBps(numerator: bigint, denominator: bigint): number {
  if (denominator <= 0n) return 0;
  return Number((numerator * BPS_DENOMINATOR) / denominator);
}

/**
 * Calculates relative price deviation in basis points between reference price and executable price
 */
export function calculateDeviationBps(referencePrice: bigint, executablePrice: bigint): number {
  if (referencePrice <= 0n) return 10_000;
  const delta = executablePrice >= referencePrice
    ? executablePrice - referencePrice
    : referencePrice - executablePrice;
  return calculateBps(delta, referencePrice);
}

/**
 * Calculates infrastructure retention split (e.g. 15% / 85%)
 */
export function splitYield(amount: bigint, feeBps: number): { infrastructure: bigint; vaulted: bigint } {
  if (feeBps < 0 || feeBps > 10_000) throw new Error("Fee BPS must be between 0 and 10000");
  const infrastructure = (amount * BigInt(feeBps)) / BPS_DENOMINATOR;
  const vaulted = amount - infrastructure;
  return { infrastructure, vaulted };
}

/**
 * Formats micros ($10^-6$) into human-readable USD string
 */
export function formatMicros(micros: bigint): string {
  const isNegative = micros < 0n;
  const absolute = isNegative ? -micros : micros;
  const whole = absolute / 1_000_000n;
  const fraction = (absolute % 1_000_000n).toString().padStart(6, "0");
  return `${isNegative ? "-" : ""}$${whole}.${fraction}`;
}
