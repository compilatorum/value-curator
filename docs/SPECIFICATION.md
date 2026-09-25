# 📐 Value Curator — Mathematical Specification

> **Specification Version:** `1.0.0`  
> **Precision Standard:** Fixed-point integer arithmetic in micros ($10^{-6}$) and basis points ($1\text{ bp} = 0.01\% = 10^{-4}$).

Value Curator never relies on floating-point arithmetic for financial decision gates. All calculations use fixed-point arithmetic (`u64`, `u128`, or `BigInt`) to prevent rounding discrepancies across different execution runtimes.

---

## 🔢 1. Core Numerical Constants

| Constant | Value | Description |
| :--- | :--- | :--- |
| `BPS_DENOMINATOR` | `10_000` | Basis point scalar ($100\% = 10,000\text{ bps}$) |
| `USD_MICROS_SCALAR` | `1_000_000` | Micro-dollar scalar ($1.00\text{ USD} = 1,000,000\text{ micros}$) |
| `DEFAULT_INFRASTRUCTURE_FEE_BPS` | `1,500` | Default 15% retention split for protocol operations |

---

## 🧮 2. Mathematical Formulas

### 2.1. Price Freshness (Staleness Limit)

Let $t_{\text{now}}$ be the current system time in milliseconds and $t_{\text{publish}}$ be the timestamp published by the Pyth oracle:

$$\Delta t = t_{\text{now}} - t_{\text{publish}}$$

$$\text{Freshness Condition:} \quad 0 \le \Delta t \le \Delta t_{\text{max}}$$

* If $\Delta t > \Delta t_{\text{max}}$, execution is **BLOCKED** with reason `STALE_ORACLE_PRICE`.
* If $\Delta t < -5000\text{ ms}$ (clock skew / future timestamp), execution is **BLOCKED** with reason `FUTURE_TIMESTAMP`.

---

### 2.2. Oracle Confidence Ratio

Pyth publishes a price $P_{\text{ref}}$ and a confidence interval $\sigma_{\text{ref}}$ (both expressed in micro-dollars). The confidence ratio in basis points is:

$$\text{Confidence}_{\text{bps}} = \left\lfloor \frac{\sigma_{\text{ref}} \times 10,000}{P_{\text{ref}}} \right\rfloor$$

$$\text{Confidence Condition:} \quad \text{Confidence}_{\text{bps}} \le \text{Confidence}_{\text{max\_bps}}$$

* If $\text{Confidence}_{\text{bps}} > \text{Confidence}_{\text{max\_bps}}$, the oracle spread is too wide for safe automated rebalancing. Execution is **BLOCKED**.

---

### 2.3. Executable Price Divergence

Let $P_{\text{ref}}$ be the Pyth reference price and $P_{\text{exec}}$ be the executable price returned by Jupiter v6:

$$P_{\text{exec}} = \left\lfloor \frac{A_{\text{in}} \times 10^6}{A_{\text{out}}} \right\rfloor \times M_{\text{split}}$$

Where $M_{\text{split}}$ is the token multiplier (handling Token-2022 Scaled UI splits). The absolute deviation is:

$$\Delta P = |P_{\text{exec}} - P_{\text{ref}}|$$

$$\text{Deviation}_{\text{bps}} = \left\lfloor \frac{\Delta P \times 10,000}{P_{\text{ref}}} \right\rfloor$$

$$\text{Divergence Condition:} \quad \text{Deviation}_{\text{bps}} \le \text{Deviation}_{\text{max\_bps}}$$

* If $\text{Deviation}_{\text{bps}} > \text{Deviation}_{\text{max\_bps}}$, there is significant divergence (e.g., DEX illiquidity, MEV sandwich, or oracle mismatch). Execution is **BLOCKED**.

---

### 2.4. Route Slippage Protection

Let $A_{\text{out}}^{\text{expected}}$ be the expected swap output and $A_{\text{out}}^{\text{min}}$ be the minimum output enforced on-chain:

$$\text{Slippage}_{\text{bps}} = \left\lfloor \frac{(A_{\text{out}}^{\text{expected}} - A_{\text{out}}^{\text{min}}) \times 10,000}{A_{\text{out}}^{\text{expected}}} \right\rfloor$$

$$\text{Slippage Condition:} \quad \text{Slippage}_{\text{bps}} \le \text{Slippage}_{\text{max\_bps}}$$

---

### 2.5. 15/85 Yield Metabolism Split

When new yield inflow $Y$ arrives:

$$\text{Infrastructure Share} = \left\lfloor \frac{Y \times \text{Fee}_{\text{bps}}}{10,000} \right\rfloor$$

$$\text{Vault Reinvested Share} = Y - \text{Infrastructure Share}$$

* Guarantees zero remainder loss (all pennies accounted for on-chain).
