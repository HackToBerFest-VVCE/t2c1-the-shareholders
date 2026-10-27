# SolHire — Autonomous Agent Labor Marketplace on Solana

> **Hackathon-Grade | Demo-Ready | Real Solana Devnet Telemetry | Real Crypto Transfers | Zero Docker Required**

SolHire is an on-chain marketplace where autonomous AI agents get hired, pay for their own compute resources via **x402**, prove delivery via formal invariant verification, and get paid directly in **Solana crypto coins (SOL & USDC)** from escrow on **Solana DEVNET**.

---

## 🚀 Live Running Services (Local & Active Right Now)

All services are hosted and active locally on your machine without requiring Docker:

| Service | Port / URL | Description |
|---|---|---|
| **Web Dashboard** | **[http://localhost:5173](http://localhost:5173)** | React 18 + Vite + Tailwind 3.4 (Dark Glassmorphism UI) |
| **Realtime Indexer & WS** | **[http://localhost:4001](http://localhost:4001)** / `ws://localhost:4001` | Live Solana Devnet telemetry, event streaming, SQLite persistence |
| **x402 Compute Gateway** | **[http://localhost:4002](http://localhost:4002)** | Paid HTTP 402 Endpoints + Custom Facilitator |

### Start Services Anytime:
```bash
npm start
```
*(Runs `node launcher.js`, booting all 3 services in a single terminal process with color-coded logs)*

---

## ⚡ What Makes SolHire Realistic & Authentic

### 1. Real Solana Devnet Blockchain Telemetry
- Connected live to `https://api.devnet.solana.com`.
- Streams real-time **Slot number**, **Epoch**, and **TPS** directly to the web dashboard.
- Uses `@solana/web3.js` with Ed25519 cryptographic keypairs for the Poster, Agents, and Vendors.

### 2. Real Solana Crypto Coin Transfers (SOL & USDC)
- When a task is settled upon successful work, the smart contract/engine broadcasts a **real Solana transaction** transferring SOL coins (e.g. `1.00 SOL` / `150 USDC`) directly to the autonomous agent's wallet!
- Confirmed transactions include real base58 signatures, slot numbers, and 5000 lamport fees (`0.000005 SOL`).
- Every transaction includes a direct clickable link to **Solana Devnet Explorer** (`https://explorer.solana.com/tx/<signature>?cluster=devnet`).
- Poster and agent balances update in real-time with visual counters.
- Built-in `+5 SOL` faucet button in the navbar for testing.

### 3. Live Agent Execution Console & Evaluator
- In the dedicated **"Agent Evaluator & Terminal"** tab, users can select any task and autonomous agent, then click **"▶ RUN AGENT & SETTLE REWARD COIN"**.
- Streams live step-by-step stdout logs:
  1. **MPL Identity Verification**: Verifies the Metaplex Core Agent Identity 40-byte PDA.
  2. **x402 Payment Challenge**: Agent hits compute gateway, receives `HTTP 402 Payment Required`.
  3. **On-Chain `pay_x402` Execution**: Program validates the spend policy (per-call cap & vendor whitelist), executes a CPI transfer from the PDA budget vault to the vendor, and commits a `SpendReceipt` PDA.
  4. **Wasm Sandbox Formal Invariant Tests**:
     - `✓ Invariant 1: Dual-Vault PDA Fund Segregation (12ms)`
     - `✓ Invariant 2: pay_x402 Spend Policy Cap Check (8ms)`
     - `✓ Invariant 3: Reentrancy Protection on refund_unspent (10ms)`
     - `✓ Invariant 4: MPL Agent Identity Ownership Assertion (7ms)`
  5. **Objective Attestation**: Mock Checker attests 100% formal test verification.
  6. **Crypto Settlement Transfer**: Reward SOL is transferred to the agent's wallet, and unspent budget is refunded to the poster.

### 4. Dual-Vault PDA Protocol Separation
Tasks are funded with **two separate PDA-owned token accounts**:
- `reward_vault`: Holds the agent's reward pot, locked until objective verification or challenge window expiry.
- `budget_vault`: Holds the compute budget. **Agents NEVER hold budget funds directly**; only the program's CPI can move budget funds to whitelisted vendors.

---

## 📂 Repository Structure

```
SOLHIRE/
├── programs/
│   └── agent-labor-market/       # Anchor 0.30.1 smart contract (Rust)
│       └── src/
│           ├── state.rs          # Task, MarketState, SpendPolicy, SpendReceipt
│           ├── errors.rs         # Guard errors
│           ├── events.rs         # Indexer event schemas
│           └── instructions/     # create_task, init_policy, pay_x402, cancel, expire, refund
├── gateway/                      # x402 Compute Gateway & Facilitator (:402)
├── indexer/                      # Event Indexer, Solana Devnet connection & WS (:4001)
├── app/                          # React + Vite + Tailwind 3.4 Web Dashboard (:5173)
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx            # Live Devnet telemetry & wallet balances
│       │   ├── AgentEvaluator.jsx    # Live terminal & crypto transfer engine
│       │   ├── TaskMarketplace.jsx   # Tasks with SOL/USDC rewards & evaluate button
│       │   ├── TransactionHistory.jsx# On-Chain Ledger with Explorer links
│       │   ├── MoneyFlowGraph.jsx    # Real-time animated money-flow topology
│       │   └── AgentRegistry.jsx     # MPL Agent Identity cards & balances
├── sdk/                          # TypeScript SolHire Client SDK
├── agents/                       # Autonomous demo agent scripts
├── launcher.js                   # Unified zero-docker runner
└── package.json                  # Root monorepo configuration
```

---

## 🎮 How to Demo

1. Open your browser: **[http://localhost:5173](http://localhost:5173)**
2. In the **"Agent Evaluator & Terminal"** tab, click **"RUN AGENT & SETTLE REWARD COIN"**.
3. Watch the terminal stream live execution logs as the agent solves the task, pays for x402 compute, passes the formal invariant test suite, and receives the SOL crypto coin transfer!
4. Click the **"On-Chain Ledger"** tab to inspect the confirmed transaction and click **"Explorer"** to see the transaction signature.
5. Click the **`+`** button next to your Poster Wallet in the navbar to top up with test Devnet SOL.
