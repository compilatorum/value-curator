/**
 * Investment Mandate Definitions & Builder
 */

import type { InvestmentMandate } from "./types.js";

export function createMandate(params: {
  id: string;
  version?: number;
  validDurationMs?: number;
  allowedAssets: string[];
  maxTradeUsdc: number;
  maxDailyUsdc: number;
  maxPriceAgeSeconds?: number;
  maxConfidenceBps?: number;
  maxPriceDeviationBps?: number;
  maxSlippageBps?: number;
  advisorMode?: "off" | "shadow" | "enforce";
}): InvestmentMandate {
  const now = Date.now();
  const validDurationMs = params.validDurationMs ?? 7 * 86_400_000; // 7 days default
  const maxPriceAgeSeconds = params.maxPriceAgeSeconds ?? 30;
  const maxConfidenceBps = params.maxConfidenceBps ?? 100; // 1.00%
  const maxPriceDeviationBps = params.maxPriceDeviationBps ?? 200; // 2.00%
  const maxSlippageBps = params.maxSlippageBps ?? 100; // 1.00%

  const mandate: InvestmentMandate = {
    id: params.id,
    version: params.version ?? 1,
    validFromMs: now,
    validUntilMs: now + validDurationMs,
    allowedAssets: params.allowedAssets,
    maxTradeValueUsdcMicros: BigInt(Math.round(params.maxTradeUsdc * 1_000_000)),
    maxDailyVolumeUsdcMicros: BigInt(Math.round(params.maxDailyUsdc * 1_000_000)),
    maxPriceAgeMs: maxPriceAgeSeconds * 1000,
    maxConfidenceBps,
    maxPriceDeviationBps,
    maxSlippageBps,
    advisorMode: params.advisorMode ?? "shadow",
  };

  validateMandate(mandate);
  return mandate;
}

export function validateMandate(mandate: InvestmentMandate, nowMs = Date.now()): void {
  if (!mandate.id.trim()) throw new Error("Mandate ID is required");
  if (mandate.version < 1) throw new Error("Mandate version must be positive");
  if (mandate.validUntilMs <= nowMs) throw new Error("Mandate has expired");
  if (mandate.maxTradeValueUsdcMicros <= 0n) throw new Error("Max trade value must be positive");
  if (mandate.maxDailyVolumeUsdcMicros < mandate.maxTradeValueUsdcMicros) {
    throw new Error("Max daily volume cannot be smaller than single trade value");
  }
  if (mandate.maxPriceAgeMs < 1000) throw new Error("Max price age must be at least 1000ms");
  if (mandate.allowedAssets.length === 0) throw new Error("At least one allowed asset must be configured");
}
