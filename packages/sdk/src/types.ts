/**
 * Value Curator SDK — Type Definitions
 * Evidence-gated execution contracts for autonomous finance.
 */

export const BPS_DENOMINATOR = 10_000n;

export type InvestmentMandate = {
  id: string;
  version: number;
  validFromMs: number;
  validUntilMs: number;
  allowedAssets: readonly string[];
  maxTradeValueUsdcMicros: bigint;
  maxDailyVolumeUsdcMicros: bigint;
  maxPriceAgeMs: number;
  maxConfidenceBps: number;
  maxPriceDeviationBps: number;
  maxSlippageBps: number;
  advisorMode: "off" | "shadow" | "enforce";
};

export type OracleEvidence = {
  feedId: string;
  symbol: string;
  priceMicros: bigint;
  confidenceMicros: bigint;
  publishTimeMs: number;
};

export type ExecutableQuote = {
  inputMint: string;
  outputMint: string;
  inputAmount: bigint;
  expectedOutputAmount: bigint;
  minimumOutputAmount: bigint;
  executablePriceMicros: bigint;
  priceImpactBps: number;
  routeHops: number;
};

export type PolicyEvaluation = {
  allowed: boolean;
  decision: "APPROVED" | "BLOCKED";
  priceAgeMs: number;
  confidenceBps: number;
  deviationBps: number | null;
  reasons: readonly string[];
  passedChecks: readonly string[];
};

export type ExecutionProposal = {
  schemaVersion: 1;
  proposalId: string;
  evidenceDigest: string;
  createdAt: string;
  validUntil: string;
  status: "READY_FOR_APPROVAL" | "BLOCKED";
  executionMode: "APPROVAL_ONLY" | "ON_CHAIN_ENFORCE";
  asset: {
    symbol: string;
    mint: string;
    inputMint: string;
    inputAmount: string;
    minimumOutputAmount: string;
  };
  policy: {
    referencePriceMicros: string;
    executablePriceMicros: string;
    deviationBps: number;
    priceAgeMs: number;
    confidenceBps: number;
  };
  reasons: readonly string[];
};

export type ApprovalReceipt = {
  schemaVersion: 1;
  kind: "VALUE_CURATOR_PROPOSAL_APPROVAL";
  proposalId: string;
  evidenceDigest: string;
  signerPublicKey: string;
  signatureHex: string;
  signedAt: string;
};
