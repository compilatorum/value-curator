/**
 * Cryptographic Execution Proposals & Approval Receipts
 * Pure cryptographic binding ensuring no state manipulation between gate and execution.
 */

import { createHash } from "node:crypto";
import type {
  ApprovalReceipt,
  ExecutableQuote,
  ExecutionProposal,
  InvestmentMandate,
  OracleEvidence,
  PolicyEvaluation,
} from "./types.js";

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(record[k])}`).join(",")}}`;
}

export function sha256Digest(data: unknown): string {
  return createHash("sha256").update(canonicalJson(data)).digest("hex");
}

export function buildExecutionProposal(params: {
  mandate: InvestmentMandate;
  oracle: OracleEvidence;
  quote: ExecutableQuote;
  evaluation: PolicyEvaluation;
  executionMode?: "APPROVAL_ONLY" | "ON_CHAIN_ENFORCE";
}): ExecutionProposal {
  const { mandate, oracle, quote, evaluation } = params;
  const now = Date.now();
  const validUntilMs = Math.min(
    oracle.publishTimeMs + mandate.maxPriceAgeMs,
    mandate.validUntilMs,
  );

  const evidenceBody = {
    oracleFeed: oracle.feedId,
    oraclePrice: oracle.priceMicros.toString(),
    quoteInputMint: quote.inputMint,
    quoteOutputMint: quote.outputMint,
    quoteInputAmount: quote.inputAmount.toString(),
    quoteMinOutputAmount: quote.minimumOutputAmount.toString(),
    evaluationDecision: evaluation.decision,
    evaluationReasons: evaluation.reasons,
  };

  const evidenceDigest = sha256Digest(evidenceBody);

  const proposalBody = {
    schemaVersion: 1 as const,
    evidenceDigest,
    createdAt: new Date(now).toISOString(),
    validUntil: new Date(validUntilMs).toISOString(),
    status: evaluation.allowed ? ("READY_FOR_APPROVAL" as const) : ("BLOCKED" as const),
    executionMode: params.executionMode ?? ("APPROVAL_ONLY" as const),
    asset: {
      symbol: oracle.symbol,
      mint: quote.outputMint,
      inputMint: quote.inputMint,
      inputAmount: quote.inputAmount.toString(),
      minimumOutputAmount: quote.minimumOutputAmount.toString(),
    },
    policy: {
      referencePriceMicros: oracle.priceMicros.toString(),
      executablePriceMicros: quote.executablePriceMicros.toString(),
      deviationBps: evaluation.deviationBps ?? 0,
      priceAgeMs: evaluation.priceAgeMs,
      confidenceBps: evaluation.confidenceBps,
    },
    reasons: evaluation.reasons,
  };

  return {
    ...proposalBody,
    proposalId: sha256Digest(proposalBody),
  };
}

export function formatProposalSignMessage(proposal: ExecutionProposal): string {
  return [
    "VALUE CURATOR EXECUTION PROPOSAL",
    `Proposal ID: ${proposal.proposalId}`,
    `Evidence Digest: ${proposal.evidenceDigest}`,
    `Asset: ${proposal.asset.symbol} (${proposal.asset.mint})`,
    `Input: ${proposal.asset.inputAmount} ${proposal.asset.inputMint}`,
    `Min Output: ${proposal.asset.minimumOutputAmount}`,
    `Valid Until: ${proposal.validUntil}`,
    `Mode: ${proposal.executionMode}`,
  ].join("\n");
}
