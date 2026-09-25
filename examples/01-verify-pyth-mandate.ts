/**
 * Example 01: Verify Pyth Oracle Evidence Against a Mandate
 *
 * Demonstrates:
 * 1. Building an investor mandate with maxPriceAge and maxConfidenceBps.
 * 2. Simulating or receiving Pyth price feed data (e.g. AAPLx / US Equity).
 * 3. Checking freshness, confidence bounds, and fail-closed behavior.
 */

import {
  calculateBps,
  createMandate,
  formatMicros,
  type OracleEvidence,
} from "../packages/sdk/src/index.js";

const AAPLX_MINT = "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp";

async function main() {
  console.log("=== Value Curator: Example 01 - Verify Pyth Mandate ===\n");

  // 1. Define investor mandate
  const mandate = createMandate({
    id: "mandate-treasury-conservative",
    allowedAssets: [AAPLX_MINT],
    maxTradeUsdc: 100,
    maxDailyUsdc: 500,
    maxPriceAgeSeconds: 30, // Max 30 seconds age
    maxConfidenceBps: 100, // Max 1.00% confidence interval
  });

  console.log(`[Mandate] ID: ${mandate.id}`);
  console.log(`[Mandate] Max Price Age: ${mandate.maxPriceAgeMs / 1000}s`);
  console.log(`[Mandate] Max Confidence Interval: ${mandate.maxConfidenceBps} bps\n`);

  const now = Date.now();

  // 2. Scenario A: Fresh Pyth Evidence
  const freshEvidence: OracleEvidence = {
    feedId: "922",
    symbol: "AAPLx",
    priceMicros: 227_500_000n, // $227.50
    confidenceMicros: 45_000n, // ±$0.045
    publishTimeMs: now - 8_000, // 8 seconds ago
  };

  const freshAge = now - freshEvidence.publishTimeMs;
  const freshConfidenceBps = calculateBps(
    freshEvidence.confidenceMicros,
    freshEvidence.priceMicros,
  );

  console.log("--- Scenario A: Fresh Pyth Evidence ---");
  console.log(`Price: ${formatMicros(freshEvidence.priceMicros)}`);
  console.log(`Age: ${freshAge / 1000}s (Limit: ${mandate.maxPriceAgeMs / 1000}s)`);
  console.log(`Confidence: ${freshConfidenceBps} bps (Limit: ${mandate.maxConfidenceBps} bps)`);

  const isFreshAllowed =
    freshAge <= mandate.maxPriceAgeMs && freshConfidenceBps <= mandate.maxConfidenceBps;
  console.log(`Result: ${isFreshAllowed ? "🟢 APPROVED" : "🔴 BLOCKED"}\n`);

  // 3. Scenario B: Stale Pyth Evidence (e.g. Market closed or network delay)
  const staleEvidence: OracleEvidence = {
    feedId: "922",
    symbol: "AAPLx",
    priceMicros: 227_500_000n,
    confidenceMicros: 45_000n,
    publishTimeMs: now - 65_000, // 65 seconds ago (> 30s)
  };

  const staleAge = now - staleEvidence.publishTimeMs;
  const staleConfidenceBps = calculateBps(
    staleEvidence.confidenceMicros,
    staleEvidence.priceMicros,
  );

  console.log("--- Scenario B: Stale Pyth Evidence ---");
  console.log(`Price: ${formatMicros(staleEvidence.priceMicros)}`);
  console.log(`Age: ${staleAge / 1000}s (Limit: ${mandate.maxPriceAgeMs / 1000}s)`);
  console.log(`Confidence: ${staleConfidenceBps} bps (Limit: ${mandate.maxConfidenceBps} bps)`);

  const isStaleAllowed =
    staleAge <= mandate.maxPriceAgeMs && staleConfidenceBps <= mandate.maxConfidenceBps;
  console.log(`Result: ${isStaleAllowed ? "🟢 APPROVED" : "🔴 BLOCKED (Fail-Closed: Stale Data)"}\n`);
}

main().catch(console.error);
