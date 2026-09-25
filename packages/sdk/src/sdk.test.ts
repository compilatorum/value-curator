import { describe, expect, test } from "bun:test";
import {
  calculateBps,
  calculateDeviationBps,
  createMandate,
  evaluatePolicy,
  buildExecutionProposal,
  withValueCuratorGuard,
  type MarketEvidenceProvider,
} from "./index.js";

describe("Value Curator SDK", () => {
  const AAPLX_MINT = "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp";
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  test("calculates math basis points and deviation accurately", () => {
    expect(calculateBps(100n, 10_000n)).toBe(100); // 1.00%
    expect(calculateDeviationBps(200_000_000n, 201_000_000n)).toBe(50); // 0.50%
    expect(calculateDeviationBps(200_000_000n, 206_000_000n)).toBe(300); // 3.00%
  });

  test("validates and creates investment mandate", () => {
    const mandate = createMandate({
      id: "mandate-treasury-01",
      allowedAssets: [AAPLX_MINT],
      maxTradeUsdc: 100,
      maxDailyUsdc: 500,
      maxPriceAgeSeconds: 30,
      maxConfidenceBps: 100,
      maxPriceDeviationBps: 200,
    });

    expect(mandate.id).toBe("mandate-treasury-01");
    expect(mandate.maxTradeValueUsdcMicros).toBe(100_000_000n);
  });

  test("evaluates policy: APPROVED on fresh and matching evidence", () => {
    const mandate = createMandate({
      id: "mandate-safe",
      allowedAssets: [AAPLX_MINT],
      maxTradeUsdc: 100,
      maxDailyUsdc: 500,
      maxPriceAgeSeconds: 30,
      maxPriceDeviationBps: 200,
    });

    const now = Date.now();
    const evaluation = evaluatePolicy({
      mandate,
      nowMs: now,
      oracle: {
        feedId: "922",
        symbol: "AAPLx",
        priceMicros: 227_500_000n, // $227.50
        confidenceMicros: 45_000n,
        publishTimeMs: now - 5_000, // 5s ago
      },
      quote: {
        inputMint: USDC_MINT,
        outputMint: AAPLX_MINT,
        inputAmount: 100_000_000n,
        expectedOutputAmount: 439_560n,
        minimumOutputAmount: 435_164n,
        executablePriceMicros: 227_800_000n, // $227.80 (13 bps deviation)
        priceImpactBps: 12,
        routeHops: 1,
      },
    });

    expect(evaluation.allowed).toBe(true);
    expect(evaluation.decision).toBe("APPROVED");
    expect(evaluation.reasons.length).toBe(0);
  });

  test("evaluates policy: BLOCKED on stale oracle price", () => {
    const mandate = createMandate({
      id: "mandate-stale-check",
      allowedAssets: [AAPLX_MINT],
      maxTradeUsdc: 100,
      maxDailyUsdc: 500,
      maxPriceAgeSeconds: 30,
    });

    const now = Date.now();
    const evaluation = evaluatePolicy({
      mandate,
      nowMs: now,
      oracle: {
        feedId: "922",
        symbol: "AAPLx",
        priceMicros: 227_500_000n,
        confidenceMicros: 45_000n,
        publishTimeMs: now - 45_000, // 45s ago (stale > 30s)
      },
      quote: {
        inputMint: USDC_MINT,
        outputMint: AAPLX_MINT,
        inputAmount: 100_000_000n,
        expectedOutputAmount: 439_560n,
        minimumOutputAmount: 435_164n,
        executablePriceMicros: 227_800_000n,
        priceImpactBps: 12,
        routeHops: 1,
      },
    });

    expect(evaluation.allowed).toBe(false);
    expect(evaluation.decision).toBe("BLOCKED");
    expect(evaluation.reasons.some((r) => r.includes("Oracle price is stale"))).toBe(true);
  });

  test("evaluates policy: BLOCKED on excessive price divergence", () => {
    const mandate = createMandate({
      id: "mandate-divergence-check",
      allowedAssets: [AAPLX_MINT],
      maxTradeUsdc: 100,
      maxDailyUsdc: 500,
      maxPriceDeviationBps: 200, // 2% max
    });

    const now = Date.now();
    const evaluation = evaluatePolicy({
      mandate,
      nowMs: now,
      oracle: {
        feedId: "922",
        symbol: "AAPLx",
        priceMicros: 227_500_000n,
        confidenceMicros: 45_000n,
        publishTimeMs: now - 5_000,
      },
      quote: {
        inputMint: USDC_MINT,
        outputMint: AAPLX_MINT,
        inputAmount: 100_000_000n,
        expectedOutputAmount: 410_000n,
        minimumOutputAmount: 405_000n,
        executablePriceMicros: 243_900_000n, // $243.90 (~720 bps deviation > 200 bps)
        priceImpactBps: 45,
        routeHops: 2,
      },
    });

    expect(evaluation.allowed).toBe(false);
    expect(evaluation.decision).toBe("BLOCKED");
    expect(evaluation.reasons.some((r) => r.includes("Executable price deviation too high"))).toBe(true);
  });

  test("wraps an agent action using withValueCuratorGuard", async () => {
    const mandate = createMandate({
      id: "mandate-agent-wrapper",
      allowedAssets: [AAPLX_MINT],
      maxTradeUsdc: 100,
      maxDailyUsdc: 500,
      maxPriceDeviationBps: 200,
    });

    const mockProvider: MarketEvidenceProvider = {
      async getOraclePrice() {
        return {
          feedId: "922",
          symbol: "AAPLx",
          priceMicros: 227_500_000n,
          confidenceMicros: 40_000n,
          publishTimeMs: Date.now() - 2_000,
        };
      },
      async getExecutableQuote() {
        return {
          inputMint: USDC_MINT,
          outputMint: AAPLX_MINT,
          inputAmount: 50_000_000n,
          expectedOutputAmount: 219_780n,
          minimumOutputAmount: 217_582n,
          executablePriceMicros: 227_550_000n,
          priceImpactBps: 5,
          routeHops: 1,
        };
      },
    };

    let executed = false;
    const guardedAction = withValueCuratorGuard(
      async (tradeRequest: { target: string; amountUsdc: number }, proposal) => {
        executed = true;
        return { status: "simulated_success", proposalId: proposal.proposalId };
      },
      {
        mandate,
        provider: mockProvider,
        extractIntent: (req) => ({
          symbol: req.target,
          outputMint: AAPLX_MINT,
          inputMint: USDC_MINT,
          inputAmount: BigInt(req.amountUsdc * 1_000_000),
        }),
      },
    );

    const res = await guardedAction({ target: "AAPLx", amountUsdc: 50 });
    expect(res.success).toBe(true);
    expect(executed).toBe(true);
  });
});
