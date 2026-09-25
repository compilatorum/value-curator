/**
 * AI Agent Wrapper & Plugin: withValueCuratorGuard
 *
 * Wraps any AI Agent execution pipeline with deterministic policy validation,
 * ensuring no AI model can move capital outside of the mandate.
 */

import { evaluatePolicy } from "./policy.js";
import { buildExecutionProposal } from "./proposals.js";
import type {
  ExecutableQuote,
  ExecutionProposal,
  InvestmentMandate,
  OracleEvidence,
  PolicyEvaluation,
} from "./types.js";

export type AgentTradeIntent = {
  symbol: string;
  outputMint: string;
  inputMint: string;
  inputAmount: bigint;
  reason?: string;
};

export type GuardedTradeResult =
  | {
      approved: true;
      proposal: ExecutionProposal;
      evaluation: PolicyEvaluation;
      quote: ExecutableQuote;
      oracle: OracleEvidence;
    }
  | {
      approved: false;
      proposal: ExecutionProposal;
      evaluation: PolicyEvaluation;
      blockedReasons: readonly string[];
    };

export interface MarketEvidenceProvider {
  getOraclePrice(symbol: string): Promise<OracleEvidence>;
  getExecutableQuote(params: {
    inputMint: string;
    outputMint: string;
    amount: bigint;
  }): Promise<ExecutableQuote>;
}

/**
 * Higher-order guard function for AI Agent architectures.
 * Evaluates trade intentions against mandate constraints before any transaction can be formed.
 */
export async function evaluateAgentIntent(params: {
  intent: AgentTradeIntent;
  mandate: InvestmentMandate;
  provider: MarketEvidenceProvider;
}): Promise<GuardedTradeResult> {
  const { intent, mandate, provider } = params;

  // 1. Fetch real or simulated oracle evidence and executable quote
  const [oracle, quote] = await Promise.all([
    provider.getOraclePrice(intent.symbol),
    provider.getExecutableQuote({
      inputMint: intent.inputMint,
      outputMint: intent.outputMint,
      amount: intent.inputAmount,
    }),
  ]);

  // 2. Evaluate deterministically through Value Curator Policy Gate
  const evaluation = evaluatePolicy({ mandate, oracle, quote });
  const proposal = buildExecutionProposal({ mandate, oracle, quote, evaluation });

  if (evaluation.allowed) {
    return {
      approved: true,
      proposal,
      evaluation,
      quote,
      oracle,
    };
  }

  return {
    approved: false,
    proposal,
    evaluation,
    blockedReasons: evaluation.reasons,
  };
}

/**
 * Creates an agent middleware wrapper.
 * Compatible with ElizaOS action handlers, LangChain tools, and Vercel AI SDK functions.
 */
export function withValueCuratorGuard<TInput, TOutput>(
  action: (input: TInput, proposal: ExecutionProposal) => Promise<TOutput>,
  options: {
    mandate: InvestmentMandate;
    provider: MarketEvidenceProvider;
    extractIntent: (input: TInput) => AgentTradeIntent;
  },
) {
  return async (input: TInput): Promise<{ success: boolean; result?: TOutput; error?: string }> => {
    const intent = options.extractIntent(input);
    const guarded = await evaluateAgentIntent({
      intent,
      mandate: options.mandate,
      provider: options.provider,
    });

    if (!guarded.approved) {
      return {
        success: false,
        error: `Value Curator Guard blocked execution: ${guarded.blockedReasons.join("; ")}`,
      };
    }

    const result = await action(input, guarded.proposal);
    return { success: true, result };
  };
}
