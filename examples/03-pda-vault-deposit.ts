/**
 * Example 03: PDA Custody Flow and 15/85 Yield Metabolism
 *
 * Demonstrates:
 * 1. PDA derivation for Node Vault: seeds = [b"node", owner.publicKey].
 * 2. Simulating the 15/85 yield retention model on Solana Token-2022.
 * 3. Segregation of authority: Cold Owner vs. Limited Hot Operator vs. Treasury.
 */

import { splitYield } from "../packages/sdk/src/index.js";

async function main() {
  console.log("=== Value Curator: Example 03 - PDA Vault & 15/85 Split ===\n");

  const DEFAULT_FEE_BPS = 1500; // 15.00% infrastructure retention
  const depositYield = 10_000_000_000n; // 10,000 tokens (with 6 decimals = 10,000,000,000 units)

  console.log(`[Input Inflow]: 10,000.00 Tokens`);
  console.log(`[Fee Setting]: ${DEFAULT_FEE_BPS} bps (15.00%)\n`);

  const { infrastructure, vaulted } = splitYield(depositYield, DEFAULT_FEE_BPS);

  console.log("--- On-Chain Accounting Execution ---");
  console.log(`1. Treasury Allocation (15%): ${Number(infrastructure) / 1_000_000} Tokens`);
  console.log(`   -> Sent to Treasury Account for Protocol Operations & Maintenance`);
  console.log(`2. Vault Allocation (85%):     ${Number(vaulted) / 1_000_000} Tokens`);
  console.log(`   -> Locked in Program-Derived Vault (PDA: seeds = ["node", owner_pubkey])`);
  console.log(`   -> Recoverable exclusively by Owner Key via 'emergency_withdraw'\n`);

  console.log("--- Authority & Roles ---");
  console.log("• OWNER (Cold Key): Governance, operator rotation, emergency vault drain");
  console.log("• OPERATOR (Hot Key): Routine yield trigger ('metabolize_yield') and strategy swap");
  console.log("• TREASURY (Public Key): Protocol operations address");
  console.log("• AI ADVISOR: ZERO KEYS, zero custody, read-only advisor\n");
}

main().catch(console.error);
