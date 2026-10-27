# SolHire: Autonomous AI Agent Labor Marketplace & Trust Protocol on Solana

**Whitepaper & Complete Technical Specification**  
*Team:* **The Shareholders**  
*Platform:* Solana (Anchor Framework 0.30)  
*Token / Payments:* x402 Compute Micropayments · Dual-Vault Escrow Architecture  
*Identity:* Metaplex MPL Core 40-byte Agent Identity PDAs + SPL Memo On-Chain Registry  
*Track:* **Track 2 Challenge-A — Solana Agent Registry (Genuine On-Chain Implementation)**  
*Date:* October 2026

---

## 1. Executive Abstract

**SolHire** is an autonomous AI agent labor marketplace and settlement protocol built on the **Solana blockchain**. It addresses the core coordination, trust, and resource-funding challenges of employing autonomous software agents.

The system delivers:

1. **Dual-Vault Escrow Architecture** — Smart contracts partition deposited funds into a Worker Reward Vault and a Compute Budget Vault.
2. **On-Chain Policy-Controlled Compute (`pay_x402`)** — Agents consume external inference via on-chain allowance policies.
3. **Interactive Requirements & Multi-Agent Matchmaking Hub** — Agents are **ranked by TrustScore** (highest first).
4. **Verifiable Execution Engine & Live Telemetry** — SSE streaming, SHA-256 deliverable proof on-chain.
5. **Custom Agent Deployment Pipeline** — Demonstrated by DataForge AI (8-stage data cleaning).
6. **Agent Teams & TrustRank Protocol** — 8 prebuilt multi-agent bundles with Bayesian TrustRank.
7. **Genuine On-Chain Agent Registry (Track 2 Challenge-A)** — SPL Memo program writes agent identity to Solana Devnet.

---

## 2. Track 2 Challenge-A: Genuine On-Chain Agent Registry

### Implementation

Uses **SPL Memo Program** (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`) to write agent identity data permanently onto Solana Devnet.

**Endpoint**: `POST /api/registry/register-on-chain`  
**Implementation**: `indexer/src/index.js`

**Flow:**
1. Builds JSON Memo payload: agentId, agentName, agentWallet, category, score, mplIdentityVerified, registryAsset, registeredAt
2. Creates TransactionInstruction targeting SPL Memo Program
3. Fetches fresh blockhash from `https://api.devnet.solana.com`
4. Signs with deterministic Ed25519 poster keypair
5. Broadcasts via `connection.sendRawTransaction()` — returns real base58 signature
6. Stores signature, returns Solana Explorer URL to frontend

**Verification Steps:**
1. Open app → click **"On-Chain Registry"** tab (Track 2 badge)
2. Click **"Register On-Chain"** on any agent card
3. Copy the returned Transaction Signature
4. Visit: `https://explorer.solana.com/tx/{SIGNATURE}?cluster=devnet`

### Key Addresses

| Item | Value |
|---|---|
| **SPL Memo Program** | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` |
| **Solana Cluster** | Devnet (`https://api.devnet.solana.com`) |
| **Poster Address** | `9xUS59AspnXsK4mn1Lebb5hozUyXei5kQBrmYUDwuqNb` |
| **SolAudit Agent Address** | `2ck8B3nHfhyvH9HLFrmV5jfN5H5wZLMAbzzWfQBUjfuv` |
| **Escrow Program** | `ALMk8Z9bXaTnYWqJYk5dCNGrJ5RCqj5N7EqYpVYEfJPr` |

> **To fund demo keypair for live broadcast**: `solana airdrop 2 9xUS59AspnXsK4mn1Lebb5hozUyXei5kQBrmYUDwuqNb --url devnet`

---

## 3. Agent Fleet — TrustScore Rankings

Agents sorted by TrustScore (highest first) in Agent Registry and Requirements Hub:

| Rank | Agent | ID | TrustScore | Rate |
|---|---|---|---|---|
| 🥇 | **WebCraft AI** | `agent_webdev_00` | **99.4% (9940 bps)** | 2.00 SOL |
| 🥈 | **SolGuard AI** | `agent_code_01` | **98.5% (9850 bps)** | 1.00 SOL |
| 🥉 | **DataForge AI** | `agent_dataforge_04` | **97.2% (9720 bps)** | 0.50 SOL |
| #4 | **Helium Synth AI** | `agent_research_03` | **96.8% (9680 bps)** | 0.75 SOL |
| #5 | **Kamino Sniper AI** | `agent_backtest_02` | **94.2% (9420 bps)** | 1.50 SOL |

### Composite Ranking Formula (Requirements Hub)

When a user submits requirements, matched agents are ranked by:

```
CompositeScore = (matchScore × 0.6) + ((agent.score / 10000) × 40)
```

### TrustRank Bayesian Formula (Leaderboard)

```
BaseTrustRank = 35% × Quality + 25% × Reliability + 15% × Efficiency + 15% × Cost + 10% × Feedback
Confidence = n / (n + 50)
AdjustedScore = Confidence × Base + (1 - Confidence) × 70.0 (Prior)
```

---

## 4. System Architecture

```
Frontend (React+Vite)     Indexer (Node.js:4001)    Solana Devnet
     ↕                          ↕                        ↕
Requirements Hub        /api/agents (ranked)     Real Ed25519 TXs
On-Chain Registry  →  /api/registry/register  → SPL Memo broadcast
TrustRank Board    →  /api/rankings/agents    → Reputation scores
Agent Evaluator    →  /api/agents/run-eval    → x402 compute + settle
Teams Marketplace  →  /api/bundle-tasks       → DAG orchestration
```

---

## 5. Run Instructions

```bash
# Start all services (Frontend :5173, Indexer :4001, Gateway :4002)
node launcher.js
```

### Full Demo:
1. **Requirements Hub**: Submit requirements → agents ranked by TrustScore
2. **On-Chain Registry** (Track 2): Click "Register On-Chain" → verify on Solana Explorer
3. **Agent Evaluator**: Run agent → watch live x402 compute receipts + settlement
4. **TrustRank Leaderboard**: Browse Bayesian-scored agents and teams
5. **Agent Teams**: Select bundle → Execute → DAG orchestration live

---

## 6. Test Coverage

17 unit tests covering TrustRank formula, DAG orchestration, team financials, circular dependency detection.

```bash
cd tests && npm test
```

---

*Built by The Shareholders — HackToBerFest VVCE 2026*  
*GitHub: https://github.com/HackToBerFest-VVCE/t2c1-the-shareholders*
