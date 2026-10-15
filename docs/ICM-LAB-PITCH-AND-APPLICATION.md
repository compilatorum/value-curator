# ICM Lab Solana — Pitch & Application Strategy
## Compilatorum | Value Curator + Proofgate + Kairos

**Status:** application/pitch draft; not a submitted application. The ICM Lab page currently states that applications closed on 11 October 2026. Confirm with Darwin Startups whether late submissions or another intake are possible before relying on this document.

## 1. Executive positioning

**Working product name:** Value Curator  
**Category:** Evidence-gated financial execution infrastructure for Solana  
**One-liner:** Value Curator helps developers and financial operators constrain on-chain execution through deterministic policy checks on data freshness, quote validity, slippage, and authority—so an AI agent may recommend an action without being allowed to bypass execution controls.

**Short pitch (English):**
Value Curator is an evidence-gated execution layer for Solana. It checks market-data freshness, executable DEX quotes, slippage limits, and authority boundaries before a transaction can proceed. AI can assist with analysis, but deterministic policies—not the model—decide whether execution is allowed. We are building toward safer automated treasury operations and institutional-grade pilots, starting with a narrow, measurable use case.

**Short pitch (Português):**
Value Curator é uma camada de execução financeira condicionada a evidências na Solana. Antes de permitir uma transação, verifica atualidade dos dados, validade da cotação executável, limites de slippage e permissões. A IA pode apoiar a análise, mas não pode ignorar as políticas determinísticas de execução. O objetivo inicial é reduzir riscos operacionais em operações automatizadas de tesouraria, com um caso de uso estreito e mensurável.

## 2. Product architecture: one product, four assets

- **Value Curator — product and developer toolkit:** policy-driven execution boundary, integration examples and developer-facing interface.
- **Proofgate — enforcement layer:** evaluates preconditions and blocks execution when evidence is missing, stale, invalid or outside policy.
- **Kairos — risk/decision framework:** supplies a structured way to express market conditions and risk limits. For the MVP, prioritize measurable variables over broad conceptual dimensions.
- **VC — venture/product workbench:** business model, product specifications, customer discovery, technical roadmap and pitch/application materials. Treat this as internal venture-building infrastructure unless customer evidence supports a separate commercial product.

Do not pitch these as four independent startups. Pitch one product and describe the other components as internal modules or supporting assets.

## 3. Initial customer and wedge

**Hypothesis to validate:** Solana teams operating automated treasury strategies, trading/DeFi workflows, or agent-assisted financial operations need a transparent control layer that limits what an automated system can execute.

**Initial buyer hypotheses:**
1. Solana protocols and treasury operators.
2. Developers building autonomous financial agents.
3. Web3 asset managers or infrastructure providers that need configurable execution policies.

These are hypotheses, not confirmed customers. Conduct interviews before asserting demand or willingness to pay.

**MVP use case:** a treasury operator defines a policy; the system obtains a Pyth price feed and a Jupiter quote; Proofgate checks data age, confidence/deviation, route/quote validity and maximum slippage; the transaction is simulated or blocked; a decision record explains the outcome. Begin in devnet or simulation. Do not imply production custody, regulatory approval, or institutional adoption unless verified.

## 4. Suggested pitch deck (10 slides)

### Slide 1 — Title
**Value Curator**
Evidence-gated execution for safer autonomous finance on Solana.

Subtitle: Deterministic controls between AI recommendations and on-chain capital.

### Slide 2 — Problem
Automated strategies and AI agents can act faster than human operators can review them. Yet a stale oracle, an invalid quote, excessive slippage, or overly broad key permissions can turn a valid-looking recommendation into a costly transaction.

Keep the claim specific. Do not use unsupported market-loss statistics.

### Slide 3 — Solution
Value Curator evaluates explicit preconditions before execution:
- Fresh, acceptable market data.
- Valid executable quote.
- Policy-bounded slippage/deviation.
- Separation between advisory AI and transaction authority.
- Fail-closed behavior when checks fail.
- Human approval for configurable high-risk actions.

### Slide 4 — Product demo / workflow
1. Operator configures a policy.
2. System reads price evidence and obtains an executable quote.
3. Proofgate evaluates the policy.
4. The action is allowed, simulated, or blocked.
5. The system records the reason and evidence.

Show one successful path and at least two blocked paths. Label devnet/simulation clearly.

### Slide 5 — Why now
Autonomous agents and on-chain workflows make it increasingly important to separate model-generated recommendations from transaction permissions. Solana provides a target execution environment; Value Curator adds a policy and evidence layer. Avoid claiming that AI-agent adoption or demand is already validated without sources.

### Slide 6 — Initial market / customer
Start with Solana-native teams running automated treasury or DeFi workflows. Validate buyer, urgency, budget and integration requirements through interviews. Expand only after the first narrow use case works.

### Slide 7 — Technology and differentiation
- Deterministic policy gate rather than trusting an LLM's self-assessment.
- Oracle evidence + executable quote checks.
- Authority separation.
- Explainable allow/block outcomes.
- Solana-native integration path.

Differentiation must be tested against existing wallet policies, transaction simulation, multisig/treasury tooling, and other agent-security products. Do not claim uniqueness before competitive research.

### Slide 8 — Evidence / traction
Only include verified artifacts:
- Public repository: https://github.com/compilatorum/value-curator
- Devnet program reference currently listed in the repository README: https://explorer.solana.com/address/6owAcXj4FxJom96cEX9CSFjGrg6zp4U8atTjrpCUMiW5?cluster=devnet
- Proofgate dashboard referenced in README: https://proofgate-dashboard.smp-sandramariaperei.chatgpt.site

Before presenting, verify the deployment is live, explain what it actually demonstrates, run repeatable tests, and capture dated screenshots or a short demo. Do not equate a devnet deployment with production readiness or customer traction.

### Slide 9 — Business model and go-to-market
**Initial hypotheses to test:**
- Developer toolkit with open-source core and paid hosted monitoring/policy management.
- Team subscription for policy configuration, audit trails and alerting.
- Enterprise integration/support after security and customer validation.

Do not commit to pricing before interviews. Do not sell custody or promise investment returns.

### Slide 10 — Team, ask and next milestones
Explain founder-market fit using verifiable software engineering and systems experience. Be transparent about team size and gaps; do not imply a larger team than exists.

Ask the ICM Lab for:
- Technical review of Solana program/security architecture.
- Access to financial-market experts to sharpen the first use case.
- Introductions to design partners for a bounded proof of concept.
- Guidance on the operational requirements of institutional adoption.

**Next 8-week milestone proposal (subject to capacity):**
1. Weeks 1–2: 10–15 customer/problem interviews; select one use case.
2. Weeks 2–4: test suite for valid/stale data, quote deviation, slippage, permissions and failure modes.
3. Weeks 4–6: end-to-end devnet demo and threat model.
4. Weeks 6–8: pilot proposal with one design partner, success metrics and integration plan.

## 5. Form response bank (draft; adapt to the actual Airtable questions)

### Startup / project name
Value Curator

### Website / repository
https://github.com/compilatorum/value-curator

### What does your startup do?
Value Curator provides evidence-gated execution controls for Solana financial workflows. It checks market-data quality, executable quotes, slippage and permission boundaries before a transaction can proceed. Proofgate enforces deterministic allow/block rules, while AI remains advisory and cannot override transaction policies. We are validating an initial use case in automated treasury and agent-assisted DeFi operations.

### What problem are you solving?
Automated financial workflows can execute actions based on stale data, invalid quotes, excessive slippage or overly broad permissions. Teams need a transparent way to enforce execution limits and explain why an action was allowed or blocked.

### Who is the customer?
Our initial customer hypothesis is a Solana protocol, treasury operator, or developer building automated financial workflows who needs configurable transaction controls. We are validating this segment and its willingness to pay; we do not yet claim product-market fit unless new evidence supports it.

### How does it work?
The operator defines deterministic policies. The system checks data freshness and quality, validates an executable quote, evaluates deviation/slippage and permission constraints, then allows, simulates or blocks the action. Decisions should be auditable and fail closed when checks cannot be satisfied.

### Why Solana?
The current implementation targets Solana and references Pyth market data and Jupiter quote/execution infrastructure. The choice is based on the existing technical direction; comparative performance or cost claims should be added only after measurements.

### What is built today?
The public repository contains a developer toolkit/starterkit, documents a Solana devnet program and links a Proofgate dashboard. Before submission, verify current deployment status and specify exactly which flows are implemented, tested and reproducible. Distinguish prototype, testnet/devnet, production and customer use.

### Traction
Use only verifiable metrics: number of working flows, automated tests, successful/blocked scenarios, active developers, user interviews, pilot commitments or paying customers. If there are no customers yet, say “pre-revenue; validating the problem and MVP” rather than implying traction.

### Business model
We are testing a developer-led model: an open-source integration layer with potential paid policy management, monitoring, audit records and enterprise integration/support. Pricing and willingness to pay remain to be validated.

### What do you want from ICM Lab?
We want technical mentorship on Solana security and architecture, market expertise to focus the product on a real financial workflow, and introductions to potential design partners for a measurable proof of concept. Our goal is to validate one narrow use case rather than build a broad platform without customer evidence.

### Competitive advantage
Our proposed advantage is the combination of evidence checks, deterministic policy enforcement, explicit authority separation and explainable execution outcomes. This positioning must be validated against existing wallet, treasury, simulation and agent-security tools.

### Team
Describe the actual founder(s), relevant experience, availability, and missing capabilities honestly. Do not invent co-founders, advisors, customers, credentials or financial-market expertise. If the program strongly prefers deep traditional-finance operational knowledge, acknowledge the gap and explain how a market expert or design partner will help close it.

## 6. Claims checklist before external use

- [ ] Confirm the devnet program address and current behavior.
- [ ] Verify the Proofgate dashboard is live and accurately represents the code.
- [ ] Run tests and record pass/fail results.
- [ ] Capture a reproducible demo with successful and blocked transactions.
- [ ] Separate implemented features from roadmap items.
- [ ] Add customer interviews, letters of intent or pilot evidence only if real.
- [ ] Research direct competitors and avoid unsupported “first/only” claims.
- [ ] State the real team, legal entity status, location, stage and funding history.
- [ ] Check whether ICM Lab accepts late submissions or announces a new intake.

## 7. Strategic fit and caveat

The most direct fit is **infrastructure for on-chain asset/treasury management**, with a possible future role in agent-enabled payments. The current repository evidence does not yet establish that the product supports tokenized receivables, registered invoices, FIDCs on-chain, Pix/SPB integration, cross-border stablecoin settlement or Brazilian securities tokenization. Do not claim those capabilities. They are possible future directions only after customer discovery, technical work and legal/operational validation.

## 8. Source links

- ICM Lab: https://www.darwinstartups.com/icmlab
- Application form: https://airtable.com/appzXiVkuxVAOCDrt/shr0bC4ltLNcVECO1
- Value Curator repository: https://github.com/compilatorum/value-curator
- InvestmentOS/Kairos context: https://github.com/compilatorum/invest-os
- VC strategic repository (private): https://github.com/compilatorum/vc
