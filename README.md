# 🏛️ Value Curator

<p align="center">
  <strong>Evidence-Gated Execution Toolkit & Developer Starterkit for Solana Autonomous Finance</strong>
</p>

<p align="center">
  <a href="https://explorer.solana.com/address/6owAcXj4FxJom96cEX9CSFjGrg6zp4U8atTjrpCUMiW5?cluster=devnet">
    <img src="https://img.shields.io/badge/Solana%20Devnet-Deployed%20%C2%B7%206owAcX...-14F195?logo=solana" alt="Devnet Program" />
  </a>
  <a href="https://proofgate-dashboard.smp-sandramariaperei.chatgpt.site">
    <img src="https://img.shields.io/badge/Live%20Dashboard-Public%20Access-9945FF" alt="Dashboard" />
  </a>
  <a href="https://github.com/compilatorum/value-curator/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-Apache--2.0-blue.svg" alt="License" />
  </a>
  <a href="https://pyth.network/">
    <img src="https://img.shields.io/badge/Pyth%20Pro-Live%20Feed%20922-white" alt="Pyth Pro" />
  </a>
  <a href="https://jup.ag/">
    <img src="https://img.shields.io/badge/Jupiter%20v6-Guarded%20Quotes-orange" alt="Jupiter DEX" />
  </a>
</p>

---

## 💡 Overview

**Value Curator** is a developer toolkit and starterkit designed to democratize **evidence-gated execution** on Solana. 

Autonomous financial agents and AI models can operate 24/7, but standard wallet infrastructure gives them all-or-nothing access to capital. A hallucinated recommendation, a stale oracle price, an illiquid DEX route, or a compromised hot key can wipe out an entire treasury.

Value Curator turns an investor's mandate into **deterministic execution boundaries**:
* **Pyth Pro Oracle Data** and a **Jupiter Executable Quote** must pass strict age, confidence, and deviation limits.
* **Deterministic Policy Gate:** Fails closed if data is stale, divergent, or beyond slippage caps.
* **Authority Segregation:** Cold governance owner separated from limited hot operational keys.
* **AI Advisor Isolation:** AI may advise; it never holds private keys, alters custody, or bypasses policy.

> ℹ️ **Public Developer Portal:** `Value Curator` serves as the open developer kit, SDK, and educational showcase providing developers with accessible tools while safeguarding core proprietary engine IP.

---

## ⚡ Quickstart (3 Steps)

### 1. Clone the repository
```bash
git clone https://github.com/compilatorum/value-curator.git
cd value-curator
```

### 2. Install dependencies & run test suite
```bash
bun install
bun test
```

### 3. Run runnable starterkit examples
```bash
# Example 01: Verify Pyth Oracle Evidence against an Investor Mandate
bun run example:pyth

# Example 02: Guarded Jupiter Swap with Price Divergence Check
bun run example:jupiter

# Example 03: PDA Custody Vault & 15/85 Yield Metabolism
bun run example:vault

# Example 04: AI Agent "Guardado" (ElizaOS / LangChain Plugin)
bun run example:agent
```

---

## 🌐 Transparent Hybrid Architecture

Value Curator operates with complete transparency regarding execution environments:

| Component | Network | Status | Description |
| :--- | :--- | :--- | :--- |
| **Custody Program** | **Solana Devnet** | Deployed | Program ID [`6owAcXj4FxJom96cEX9CSFjGrg6zp4U8atTjrpCUMiW5`](https://explorer.solana.com/address/6owAcXj4FxJom96cEX9CSFjGrg6zp4U8atTjrpCUMiW5?cluster=devnet) |
| **Market Evidence** | **Solana Mainnet** | Live (Read-Only) | Authenticated Pyth Pro feed `922` (`AAPL/USD`, 24/5 equity) |
| **Executable Quotes** | **Solana Mainnet** | Live (Read-Only) | Jupiter v6 USDC → AAPLx quotes |
| **Execution Mode** | **APPROVAL_ONLY** | Enforced | Produces signed Ed25519 receipts without risking live funds prior to formal audits |

See detailed diagrams and security guarantees in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 📁 Repository Structure

```text
value-curator/
├── README.md                      # Developer portal & overview
├── LICENSE                        # Apache-2.0 open-source license
├── docs/
│   ├── ARCHITECTURE.md            # Pipeline diagrams and hybrid Devnet/Mainnet model
│   ├── SPECIFICATION.md           # Mathematical formulas (micros, basis points, deviation)
│   └── ROADMAP_WORLD_FAIR.md      # Colosseum World's Fair expansion cases (Agro, DAOs, AI)
├── examples/
│   ├── 01-verify-pyth-mandate.ts  # Pyth oracle age & confidence bound check
│   ├── 02-guarded-jupiter-swap.ts # Jupiter quote divergence gate & signed proposal
│   ├── 03-pda-vault-deposit.ts    # 15/85 yield metabolism & PDA custody
│   └── 04-ai-agent-guard.ts       # withValueCuratorGuard AI Agent plugin
├── packages/
│   └── sdk/                       # Lightweight TypeScript SDK for AI Agent developers
│       ├── src/types.ts           # Core types, mandates, quotes
│       ├── src/math.ts            # Safe basis-point and deviation math
│       ├── src/mandate.ts         # Mandate definition and validation
│       ├── src/policy.ts          # Deterministic policy evaluation engine
│       ├── src/proposals.ts       # Cryptographic SHA-256 proposals & receipt generation
│       └── src/guard.ts           # withValueCuratorGuard middleware
└── programs/
    └── value-curator-engine/      # Anchor smart contract in Rust (Devnet reference)
        ├── Cargo.toml
        └── src/
            ├── lib.rs             # Instructions: initialize, metabolize, swap, emergency
            ├── instructions/      # Modular instruction handlers
            └── state.rs           # NodeAccount PDA state
```

---

## 🤖 AI Agent Plugin: `withValueCuratorGuard`

Developers can wrap any autonomous AI Agent (ElizaOS, LangChain, Vercel AI SDK) with a constitutional mandate in one line of code:

```typescript
import { withValueCuratorGuard, createMandate } from "@value-curator/sdk";

// 1. Establish the non-negotiable mandate
const mandate = createMandate({
  id: "dao-treasury-mandate",
  allowedAssets: ["XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp"], // AAPLx only
  maxTradeUsdc: 100, // Max $100 per trade
  maxPriceDeviationBps: 150, // Max 1.5% deviation from Pyth reference
});

// 2. Wrap your agent action
const guardedTrade = withValueCuratorGuard(agentExecutionFunction, {
  mandate,
  provider: marketEvidenceProvider,
  extractIntent: (agentInput) => agentInput.intent,
});

// 3. Execute safely: Automatically fails closed if price is stale or divergent!
const result = await guardedTrade({ intent: agentTradePlan });
```

---

## 🚀 Unique Expansion Verticals (Colosseum World's Fair)

Value Curator is built to expand far beyond single-stock demos into trillion-dollar asset verticals:

1. **🌾 Agricultural Commodity ETFs & Bio-Economy (ReFAI):**
   * Combines Pyth futures reference feeds with satellite weather oracles (NDVI crop health indices).
   * Automatically trips circuit breakers if severe weather or illiquidity threatens automated agricultural hedges.
2. **👥 Community-Governed ETFs & Social Trading (DAO Constitution):**
   * Acts as an inviolable on-chain check against social panic or meme-token governance attacks.
3. **🤖 Universal AI Agent Guardrails:**
   * Protects autonomous agents from prompt injection, model drift, and key leakage.

Read the complete expansion specification in [docs/ROADMAP_WORLD_FAIR.md](./docs/ROADMAP_WORLD_FAIR.md).

---

## 📜 On-Chain Verification

* **Solana Devnet Program:** [`6owAcXj4FxJom96cEX9CSFjGrg6zp4U8atTjrpCUMiW5`](https://explorer.solana.com/address/6owAcXj4FxJom96cEX9CSFjGrg6zp4U8atTjrpCUMiW5?cluster=devnet)
* **Devnet Node PDA:** [`LwuCrFTwdkkH24Ni3Kc4UuL56pzvvnyag1gNQzjCALS`](https://explorer.solana.com/address/LwuCrFTwdkkH24Ni3Kc4UuL56pzvvnyag1gNQzjCALS?cluster=devnet)
* **Live Interactive Dashboard:** [proofgate-dashboard.smp-sandramariaperei.chatgpt.site](https://proofgate-dashboard.smp-sandramariaperei.chatgpt.site)

---

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) for details.
