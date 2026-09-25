/**
 * Deterministic Policy Evaluation Engine
 * Pure function gate: Fails closed on any inconsistency, latency or divergence.
 */

import { calculateBps, calculateDeviationBps } from "./math.js";
import type {
  ExecutableQuote,
  InvestmentMandate,
  OracleEvidence,
  PolicyEvaluation,
} from "./types.js";

export function evaluatePolicy(options: {
  mandate: InvestmentMandate;
  oracle: OracleEvidence;
  quote: ExecutableQuote;
  nowMs?: number;
}): PolicyEvaluation {
  const { mandate, oracle, quote } = options;
  const now = options.nowMs ?? Date.now();
  const reasons: string[] = [];
  const passedChecks: string[] = [];

  // 1. Mandate active check
  if (now > mandate.validUntilMs) {
    reasons.push(`Mandate expired at ${new Date(mandate.validUntilMs).toISOString()}`);
  } else {
    passedChecks.push("Mandate validity window active");
  }

  // 2. Asset allowlist check
  if (!mandate.allowedAssets.includes(quote.outputMint)) {
    reasons.push(`Asset ${quote.outputMint} is not in mandate allowlist`);
  } else {
    passedChecks.push(`Asset ${oracle.symbol} allowlisted`);
  }

  // 3. Trade size limit check
  if (quote.inputAmount > mandate.maxTradeValueUsdcMicros) {
    reasons.push(
      `Trade size ${quote.inputAmount} exceeds mandate limit of ${mandate.maxTradeValueUsdcMicros}`,
    );
  } else {
    passedChecks.push("Trade size within single-order cap");
  }

  // 4. Oracle price freshness check
  const priceAgeMs = now - oracle.publishTimeMs;
  if (priceAgeMs > mandate.maxPriceAgeMs) {
    reasons.push(
      `Oracle price is stale: age ${priceAgeMs}ms exceeds max permitted ${mandate.maxPriceAgeMs}ms`,
    );
  } else if (priceAgeMs < -5000) {
    reasons.push(`Oracle publish timestamp is in the future (${priceAgeMs}ms)`);
  } else {
    passedChecks.push(`Oracle price fresh (${priceAgeMs}ms)`);
  }

  // 5. Oracle confidence interval check
  const confidenceBps = calculateBps(oracle.confidenceMicros, oracle.priceMicros);
  if (confidenceBps > mandate.maxConfidenceBps) {
    reasons.push(
      `Oracle confidence interval too wide: ${confidenceBps} bps exceeds max ${mandate.maxConfidenceBps} bps`,
    );
  } else {
    passedChecks.push(`Oracle confidence bounded (${confidenceBps} bps)`);
  }

  // 6. Divergence check (Pyth reference vs. Jupiter executable quote)
  const deviationBps = calculateDeviationBps(oracle.priceMicros, quote.executablePriceMicros);
  if (deviationBps > mandate.maxPriceDeviationBps) {
    reasons.push(
      `Executable price deviation too high: ${deviationBps} bps exceeds max ${mandate.maxPriceDeviationBps} bps`,
    );
  } else {
    passedChecks.push(`Executable price within reference tolerance (${deviationBps} bps)`);
  }

  // 7. Slippage check
  const expectedOutput = quote.expectedOutputAmount;
  const minOutput = quote.minimumOutputAmount;
  if (minOutput > expectedOutput || minOutput <= 0n) {
    reasons.push("Invalid executable quote slippage parameters");
  } else {
    const slippageBps = calculateBps(expectedOutput - minOutput, expectedOutput);
    if (slippageBps > mandate.maxSlippageBps) {
      reasons.push(
        `Route slippage ${slippageBps} bps exceeds mandate threshold ${mandate.maxSlippageBps} bps`,
      );
    } else {
      passedChecks.push(`Slippage bounded (${slippageBps} bps)`);
    }
  }

  const allowed = reasons.length === 0;
  return {
    allowed,
    decision: allowed ? "APPROVED" : "BLOCKED",
    priceAgeMs,
    confidenceBps,
    deviationBps,
    reasons,
    passedChecks,
  };
}
