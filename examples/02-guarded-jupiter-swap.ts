/**
 * Example 02: Guarded Jupiter Swap with Price Divergence Check
 *
 * Demonstrates:
 * 1. Comparing Pyth reference price with Jupiter executable quote.
 * 2. Blocking swap on excessive price divergence (front-running / MEV / illiquid route protection).
 * 3. Building an immutable proposal and signed approval receipt.
 */

import {
  buildExecutionProposal,
  createMandate,
  evaluatePolicy,
  formatMicros,
  formatProposalSignMessage,
  type ExecutableQuote,
  type OracleEvidence,
} from "../packages/sdk/src/index.js";

const AAPLX_MINT = "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

async function main() {
  console.log("=== Value Curator: Example 02 - Guarded Jupiter Swap ===\n");

  const mandate = createMandate({
    id: "mandate-conservative-swap",
    allowedAssets: [AAPLX_MINT],
    maxTradeUsdc: 100,
    maxDailyUsdc: 500,
    maxPriceDeviationBps: 150, // Max 1.50% deviation between Pyth and DEX quote
  });

  const now = Date.now();
  const oracle: OracleEvidence = {
    feedId: "922",
    symbol: "AAPLx",
    priceMicros: 227_500_000n, // $227.50
    confidenceMicros: 35_000n,
    publishTimeMs: now - 3_000,
  };

  // Case 1: Healthy Liquidity Route (Low divergence)
  const healthyQuote: ExecutableQuote = {
    inputMint: USDC_MINT,
    outputMint: AAPLX_MINT,
    inputAmount: 100_000_000n, // $100 USDC
    expectedOutputAmount: 439_000n,
    minimumOutputAmount: 434_610n,
    executablePriceMicros: 227_790_000n, // $227.79 (~12 bps divergence)
    priceImpactBps: 8,
    routeHops: 1,
  };

  console.log("--- Step 1: Evaluating Healthy Jupiter Quote ---");
  const healthyEval = evaluatePolicy({ mandate, oracle, quote: healthyQuote });
  console.log(`Reference Price (Pyth): ${formatMicros(oracle.priceMicros)}`);
  console.log(`Executable Price (Jupiter): ${formatMicros(healthyQuote.executablePriceMicros)}`);
  console.log(`Divergence: ${healthyEval.deviationBps} bps (Tolerated: ${mandate.maxPriceDeviationBps} bps)`);
  console.log(`Decision: ${healthyEval.decision}\n`);

  if (healthyEval.allowed) {
    const proposal = buildExecutionProposal({
      mandate,
      oracle,
      quote: healthyQuote,
      evaluation: healthyEval,
    });
    console.log(`[Proposal Generated] ID: ${proposal.proposalId}`);
    console.log(`[Evidence Digest]: ${proposal.evidenceDigest}`);
    console.log("\n[Attestation Message for Owner Signer]:");
    console.log("-----------------------------------------");
    console.log(formatProposalSignMessage(proposal));
    console.log("-----------------------------------------\n");
  }

  // Case 2: Divergent / Manipulated Route (Excessive divergence)
  const manipulatedQuote: ExecutableQuote = {
    inputMint: USDC_MINT,
    outputMint: AAPLX_MINT,
    inputAmount: 100_000_000n,
    expectedOutputAmount: 400_000n,
    minimumOutputAmount: 396_000n,
    executablePriceMicros: 250_000_000n, // $250.00 (~989 bps divergence > 150 bps)
    priceImpactBps: 150,
    routeHops: 3,
  };

  console.log("--- Step 2: Evaluating Manipulated / Illiquid Quote ---");
  const badEval = evaluatePolicy({ mandate, oracle, quote: manipulatedQuote });
  console.log(`Reference Price (Pyth): ${formatMicros(oracle.priceMicros)}`);
  console.log(`Executable Price (Jupiter): ${formatMicros(manipulatedQuote.executablePriceMicros)}`);
  console.log(`Divergence: ${badEval.deviationBps} bps (Tolerated: ${mandate.maxPriceDeviationBps} bps)`);
  console.log(`Decision: ${badEval.decision}`);
  console.log(`Blocking Reasons: ${badEval.reasons.join("; ")}\n`);
}

main().catch(console.error);
