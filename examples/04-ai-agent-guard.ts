/**
 * Example 04: AI Agent "Guardado" (AI Agent Starterkit / Plugin)
 *
 * Demonstrates:
 * Wrapping an LLM / Autonomous Agent action with `withValueCuratorGuard`.
 * Even if an LLM decides to buy an asset, it cannot proceed if:
 * 1. Price is stale.
 * 2. Slippage is excessive.
 * 3. Token is outside the mandate allowlist.
 */

import {
  createMandate,
  formatMicros,
  withValueCuratorGuard,
  type MarketEvidenceProvider,
} from "../packages/sdk/src/index.js";

const AAPLX_MINT = "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp";
const UNAPPROVED_MEME_MINT = "MemeCoin11111111111111111111111111111111111";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

async function main() {
  console.log("=== Value Curator: Example 04 - AI Agent Guard Plugin ===\n");

  // 1. Investor configures constitutional mandate
  const mandate = createMandate({
    id: "mandate-dao-treasury",
    allowedAssets: [AAPLX_MINT], // Only official tokenized AAPL is permitted
    maxTradeUsdc: 100,
    maxDailyUsdc: 500,
    maxPriceDeviationBps: 200, // 2% max deviation
  });

  // 2. Mock Market Evidence Provider
  const marketProvider: MarketEvidenceProvider = {
    async getOraclePrice(symbol: string) {
      return {
        feedId: "922",
        symbol,
        priceMicros: 227_500_000n, // $227.50
        confidenceMicros: 40_000n,
        publishTimeMs: Date.now() - 3_000,
      };
    },
    async getExecutableQuote(params) {
      return {
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        inputAmount: params.amount,
        expectedOutputAmount: 439_000n,
        minimumOutputAmount: 434_610n,
        executablePriceMicros: 227_800_000n,
        priceImpactBps: 10,
        routeHops: 1,
      };
    },
  };

  // 3. Define the AI Agent Core Action (e.g. LLM execution step)
  async function executeAgentTrade(
    intent: { assetSymbol: string; targetMint: string; usdcAmount: number },
    proposal: { proposalId: string; evidenceDigest: string },
  ) {
    console.log(`[Agent Executor] Running approved trade for ${intent.assetSymbol}...`);
    console.log(`[Agent Executor] Proposal ID bound: ${proposal.proposalId}`);
    return {
      txStatus: "SUCCESS_SIMULATED",
      proposalId: proposal.proposalId,
      digest: proposal.evidenceDigest,
    };
  }

  // 4. Wrap action with Value Curator Guard
  const guardedAgentAction = withValueCuratorGuard(executeAgentTrade, {
    mandate,
    provider: marketProvider,
    extractIntent: (input) => ({
      symbol: input.assetSymbol,
      outputMint: input.targetMint,
      inputMint: USDC_MINT,
      inputAmount: BigInt(input.usdcAmount * 1_000_000),
    }),
  });

  // Scenario 1: AI Agent requests allowed AAPLx purchase
  console.log("--- Test 1: AI Agent requests AAPLx purchase ($50 USDC) ---");
  const test1 = await guardedAgentAction({
    assetSymbol: "AAPLx",
    targetMint: AAPLX_MINT,
    usdcAmount: 50,
  });
  console.log("Outcome:", test1.success ? "🟢 APPROVED & EXECUTED" : "🔴 BLOCKED");
  console.log(test1, "\n");

  // Scenario 2: AI Agent hallucinated or prompted to buy an unauthorized meme token
  console.log("--- Test 2: AI Agent attempts to buy an unapproved Meme Token ($50 USDC) ---");
  const test2 = await guardedAgentAction({
    assetSymbol: "DOGE_SOL",
    targetMint: UNAPPROVED_MEME_MINT,
    usdcAmount: 50,
  });
  console.log("Outcome:", test2.success ? "🟢 APPROVED & EXECUTED" : "🔴 BLOCKED (Constitution Enforced)");
  console.log("Error details:", test2.error, "\n");

  // Scenario 3: AI Agent attempts to exceed single-trade budget cap ($200 USDC > $100 cap)
  console.log("--- Test 3: AI Agent attempts to trade $200 USDC (Cap is $100) ---");
  const test3 = await guardedAgentAction({
    assetSymbol: "AAPLx",
    targetMint: AAPLX_MINT,
    usdcAmount: 200,
  });
  console.log("Outcome:", test3.success ? "🟢 APPROVED & EXECUTED" : "🔴 BLOCKED (Cap Enforced)");
  console.log("Error details:", test3.error, "\n");
}

main().catch(console.error);
