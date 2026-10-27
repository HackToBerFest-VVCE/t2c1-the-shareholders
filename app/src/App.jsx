import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MoneyFlowGraph from './components/MoneyFlowGraph';
import TaskMarketplace from './components/TaskMarketplace';
import AgentRegistry from './components/AgentRegistry';
import AgentEvaluator from './components/AgentEvaluator';
import TransactionHistory from './components/TransactionHistory';
import CreateTaskModal from './components/CreateTaskModal';
import DemoRunnerBanner from './components/DemoRunnerBanner';
import DeployAgentModal from './components/DeployAgentModal';
import UserRequirementsAgentHub from './components/UserRequirementsAgentHub';
import AgentTeamsMarketplace from './components/AgentTeamsMarketplace';
import CustomTeamBuilder from './components/CustomTeamBuilder';
import TeamExecutionDashboard from './components/TeamExecutionDashboard';
import TrustRankLeaderboard from './components/TrustRankLeaderboard';
import SolanaOnChainRegistry from './components/SolanaOnChainRegistry';
import { 
  Bot, ShieldCheck, Activity, Layers, Terminal, Sparkles, 
  ExternalLink, Code2, AlertTriangle, ArrowUpRight, Play, CheckCircle2, History, Users, Shield, Plus
} from 'lucide-react';

const API_BASE = 'http://localhost:4001';
const WS_BASE = 'ws://localhost:4001';
const GATEWAY_BASE = 'http://localhost:4002';

export default function App() {
  const [stats, setStats] = useState(null);
  const [blockchain, setBlockchain] = useState(null);
  const [wallets, setWallets] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [moneyFlows, setMoneyFlows] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('requirements'); // default to requirements so user can describe needs, see actions & agent follow-ups with prices!
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeployingDemo, setIsDeployingDemo] = useState(false);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [latestSettlement, setLatestSettlement] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [activeBundleTask, setActiveBundleTask] = useState(null);
  const [isCustomBuilderOpen, setIsCustomBuilderOpen] = useState(false);

  // Initial Fetch
  const loadData = async () => {
    try {
      const [statsRes, blockRes, walletsRes, tasksRes, agentsRes, flowsRes, txRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/blockchain-status`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/wallets`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/tasks`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/agents`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/money-flows`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/transactions`).then(r => r.json()).catch(() => [])
      ]);

      if (statsRes) setStats(statsRes);
      if (blockRes) setBlockchain(blockRes);
      if (walletsRes) setWallets(walletsRes);
      if (tasksRes) setTasks(tasksRes);
      if (agentsRes) setAgents(agentsRes);
      if (flowsRes) setMoneyFlows(flowsRes);
      if (txRes) setTransactions(txRes);
    } catch (err) {
      console.warn("Initial load error:", err.message);
    }
  };

  // Check Gateway Health
  useEffect(() => {
    fetch(`${GATEWAY_BASE}/health`)
      .then(r => r.json())
      .then(d => setGatewayStatus(d))
      .catch(() => setGatewayStatus({ status: "offline", error: "Run 'npm run dev' in gateway/" }));
  }, []);

  // WebSocket Connection
  useEffect(() => {
    loadData();

    let ws;
    const connectWs = () => {
      ws = new WebSocket(WS_BASE);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const { type, data } = msg;

          if (type === 'BLOCKCHAIN_TICK') {
            setBlockchain(data);
          } else if (type === 'WALLET_UPDATED') {
            setWallets(data);
          } else if (type === 'TRANSACTION_CONFIRMED') {
            setTransactions(prev => [data, ...prev]);
          } else if (type === 'AGENT_LOG') {
            setAgentLogs(prev => [...prev, data]);
          } else if (type === 'TASK_CREATED') {
            setTasks(prev => [data, ...prev]);
            setStats(s => s ? { ...s, totalTasks: s.totalTasks + 1, activeTasks: s.activeTasks + 1 } : s);
          } else if (type === 'MONEY_FLOW') {
            setMoneyFlows(prev => [data, ...prev]);
          } else if (type === 'SPEND_EXECUTED') {
            setTasks(prev => prev.map(t => {
              if (t.id === data.taskId) {
                const currentReceipts = t.receipts || [];
                return {
                  ...t,
                  state: 'InProgress',
                  receipts: [...currentReceipts, data.receipt],
                  budget_spent_usdc: (t.budget_spent_usdc || 0) + (data.receipt.amount_usdc || 10)
                };
              }
              return t;
            }));
            setStats(s => s ? { ...s, totalComputePaidUSDC: s.totalComputePaidUSDC + (data.receipt.amount_usdc || 10) } : s);
          } else if (type === 'DELIVERY_SUBMITTED') {
            setTasks(prev => prev.map(t => t.id === data.taskId ? { ...t, state: 'Delivered', delivery: data.delivery } : t));
          } else if (type === 'TASK_SETTLED') {
            setTasks(prev => prev.map(t => t.id === data.taskId ? { 
              ...t, 
              state: 'Settled', 
              budget_refunded_usdc: data.budgetRefundedUsdc,
              settlement_tx: data.signature
            } : t));
            setLatestSettlement(data);
            setIsEvaluating(false);
            setIsRunningDemo(false);
          }
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Post Task Handler
  const handleCreateTask = async (taskData) => {
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error("Failed to post task");
    const created = await res.json();
    return created;
  };

  // Top-Up Faucet Handler
  const handleTopUpFaucet = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wallet/faucet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 5 })
      });
      const data = await res.json();
      loadData();
    } catch (e) {
      console.error("Faucet error:", e);
    }
  };

  // Run Agent Live Evaluation Handler
  const handleRunEvaluation = async (taskId, agentId) => {
    setIsEvaluating(true);
    setLatestSettlement(null);
    setAgentLogs([]);
    try {
      await fetch(`${API_BASE}/api/agents/run-evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, agentId })
      });
    } catch (e) {
      alert("Evaluation failed: " + e.message);
      setIsEvaluating(false);
    }
  };

  // Deploy Custom Agent Handler
  const handleDeployAgent = async (agentData) => {
    const res = await fetch(`${API_BASE}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to deploy agent');
    }
    const result = await res.json();
    await loadData();
    return result;
  };

  // 1-Click Demo Agent Deploy Handler
  const handleDeployDemo = async () => {
    setIsDeployingDemo(true);
    try {
      const res = await fetch(`${API_BASE}/api/agents/deploy-demo`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to deploy demo agent");
      const result = await res.json();
      await loadData();
      setActiveTab('agents');
    } catch (e) {
      alert("Error deploying demo agent: " + e.message);
    } finally {
      setIsDeployingDemo(false);
    }
  };

  // 1-Click Autonomous Demo
  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    setActiveTab('evaluator'); // switch to evaluator terminal so user sees live output
    try {
      const res = await fetch(`${API_BASE}/api/demo/run-autonomous-flow`, { method: 'POST' });
      const data = await res.json();
    } catch (err) {
      alert("Error starting demo: " + err.message);
      setIsRunningDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070A11] text-slate-100">
      {/* Top Navigation */}
      <Navbar
        stats={stats}
        blockchain={blockchain}
        posterWallet={wallets?.poster}
        isConnected={isConnected}
        onOpenCreate={() => setIsCreateModalOpen(true)}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        onRunDemo={handleRunDemo}
        isRunningDemo={isRunningDemo || isEvaluating}
        onTopUpFaucet={handleTopUpFaucet}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8 space-y-8">
        {/* Banner: 1-Click Autonomous Demo */}
        <DemoRunnerBanner
          onRunDemo={handleRunDemo}
          isRunningDemo={isRunningDemo || isEvaluating}
          lastDemoTaskId={tasks[0]?.id}
        />

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'requirements'
                ? 'bg-gradient-to-r from-[#9945FF]/40 to-[#14F195]/40 text-white border border-[#14F195]/50 shadow-lg shadow-[#14F195]/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#14F195] animate-pulse" />
            <span>Describe Needs & Agent Follow-ups</span>
            <span className="badge-tag bg-[#14F195]/20 text-[#14F195] text-[10px] font-bold">
              ⚡ LIVE ACTIONS & PRICES
            </span>
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-[#9945FF]/40 to-[#00F0FF]/40 text-white border border-[#00F0FF]/50 shadow-lg shadow-[#00F0FF]/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-[#00F0FF]" />
            <span>Agent Teams & Bundles</span>
            <span className="badge-tag bg-[#00F0FF]/20 text-[#00F0FF] text-[10px] font-bold">
              8 PREBUILT
            </span>
          </button>

          <button
            onClick={() => setActiveTab('team-execution')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'team-execution'
                ? 'bg-gradient-to-r from-[#00F0FF]/30 to-[#14F195]/30 text-white border border-[#14F195]/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 text-[#14F195]" />
            <span>Team Execution & DAG</span>
            {activeBundleTask && (
              <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('trustrank')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'trustrank'
                ? 'bg-gradient-to-r from-[#9945FF]/40 to-[#14F195]/40 text-white border border-[#14F195]/50 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4 text-[#14F195]" />
            <span>TrustRank™ Leaderboards</span>
            <span className="badge-tag bg-[#14F195]/20 text-[#14F195] text-[10px] font-bold">
              REPUTATION
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evaluator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'evaluator'
                ? 'bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 text-white border border-[#14F195]/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#14F195]" />
            <span>Single Agent Evaluator</span>
            {isEvaluating && (
              <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'marketplace'
                ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 text-[#9945FF]" />
            <span>Task Marketplace</span>
            <span className="badge-tag bg-white/5 text-slate-400 text-[10px]">
              {(tasks || []).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'transactions'
                ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>On-Chain Ledger</span>
            <span className="badge-tag bg-emerald-500/10 text-emerald-400 text-[10px]">
              {(transactions || []).length} TXs
            </span>
          </button>

          <button
            onClick={() => setActiveTab('topology')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'topology'
                ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4 text-[#9945FF]" />
            <span>Money-Flow Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('onchain-registry')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'onchain-registry'
                ? 'bg-gradient-to-r from-[#14F195]/40 to-[#9945FF]/40 text-white border border-[#14F195]/60 shadow-lg shadow-[#14F195]/15'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4 text-[#14F195]" />
            <span>⛓️ On-Chain Registry</span>
            <span className="badge-tag bg-[#14F195]/20 text-[#14F195] text-[10px] font-bold">
              TRACK 2 ✓
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'agents'
                ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bot className="w-4 h-4 text-blue-400" />
            <span>Agent Registry</span>
            <span className="badge-tag bg-blue-500/10 text-blue-400 text-[10px]">
              MPL VERIFIED
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gateway')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center space-x-2 ${
              activeTab === 'gateway'
                ? 'bg-white/10 text-white border border-white/10 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>x402 Inspector</span>
          </button>
        </div>

        {/* Tab 0: Describe Needs, Live Agent Actions & Follow-ups */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            <UserRequirementsAgentHub
              agents={agents}
              tasks={tasks}
              onCreateTask={handleCreateTask}
              onRunEvaluation={handleRunEvaluation}
              onNavigateTab={setActiveTab}
            />
          </div>
        )}

        {/* Tab: Agent Teams & Bundles Marketplace */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {isCustomBuilderOpen ? (
              <CustomTeamBuilder
                availableAgents={agents}
                userBalanceSol={wallets?.poster?.sol_balance || 15.5}
                onCancel={() => setIsCustomBuilderOpen(false)}
                onTeamCreated={(bundleTask) => {
                  setIsCustomBuilderOpen(false);
                  setActiveBundleTask(bundleTask);
                  setActiveTab('team-execution');
                }}
              />
            ) : (
              <AgentTeamsMarketplace
                userBalanceSol={wallets?.poster?.sol_balance || 15.5}
                onOpenTeamBuilder={() => setIsCustomBuilderOpen(true)}
                onSelectBundleToRun={(bundleTask) => {
                  setActiveBundleTask(bundleTask);
                  setActiveTab('team-execution');
                }}
              />
            )}
          </div>
        )}

        {/* Tab: Team Execution Dashboard & Live DAG Telemetry */}
        {activeTab === 'team-execution' && (
          <div className="space-y-6">
            <TeamExecutionDashboard
              initialBundleTask={activeBundleTask}
              onOpenAnotherTeam={() => setActiveTab('teams')}
            />
          </div>
        )}

        {/* Tab: TrustRank Mathematical Leaderboards */}
        {activeTab === 'trustrank' && (
          <div className="space-y-6">
            <TrustRankLeaderboard />
          </div>
        )}

        {/* Tab 1: Agent Live Execution Console & Evaluator */}
        {activeTab === 'evaluator' && (
          <div className="space-y-6">
            <AgentEvaluator
              tasks={tasks}
              agents={agents}
              onRunEvaluation={handleRunEvaluation}
              activeLogs={agentLogs}
              isEvaluating={isEvaluating}
              latestSettlement={latestSettlement}
            />
          </div>
        )}

        {/* Tab 2: Task Marketplace */}
        {activeTab === 'marketplace' && (
          <div className="space-y-8">
            <TaskMarketplace 
              tasks={tasks} 
              onRunEvaluation={(taskId, agentId) => {
                setActiveTab('evaluator');
                handleRunEvaluation(taskId, agentId);
              }}
            />
          </div>
        )}

        {/* Tab 3: On-Chain Transaction Ledger */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <TransactionHistory transactions={transactions} />
          </div>
        )}

        {/* Tab 4: Money-Flow Graph */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <MoneyFlowGraph events={moneyFlows} activeStep={isRunningDemo || isEvaluating} />
          </div>
        )}

        {/* Tab: Solana On-Chain Registry — Track 2 Challenge-A */}
        {activeTab === 'onchain-registry' && (
          <div className="space-y-6">
            <SolanaOnChainRegistry />
          </div>
        )}

        {/* Tab 5: Agent Registry */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            <AgentRegistry 
              agents={agents} 
              onSelectAgentForEval={(agentId) => {
                setActiveTab('evaluator');
                handleRunEvaluation(tasks[0]?.id || 1, agentId);
              }}
              onOpenDeploy={() => setIsDeployModalOpen(true)}
              onDeployDemo={handleDeployDemo}
              isDeploying={isDeployingDemo}
            />
          </div>
        )}

        {/* Tab 6: x402 Gateway Inspector */}
        {activeTab === 'gateway' && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>x402 Facilitator & Paid Compute Gateway</span>
                  <span className="badge-tag bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs">
                    CUSTOM x402 ADAPTER
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Exposes HTTP 402 Payment Required endpoints. The custom facilitator verifies on-chain SpendReceipt PDAs.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${gatewayStatus?.status === 'ok' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span>{gatewayStatus?.status === 'ok' ? 'GATEWAY ONLINE (:402)' : 'GATEWAY PENDING'}</span>
              </div>
            </div>

            {/* Endpoints Table */}
            <div className="space-y-3 font-mono text-xs">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[#9945FF]">
                  <span className="font-bold">POST /compute/llm-inference</span>
                  <span>5.00 USDC / 0.025 SOL</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Reasoning cluster (DeepSeek-V3 proxy). Requires valid X-PAYMENT-RECEIPT header with on-chain PDA receipt.
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[#14F195]">
                  <span className="font-bold">POST /compute/market-data</span>
                  <span>3.00 USDC / 0.015 SOL</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  High-frequency Solana DEX tick feed & backtest runner.
                </div>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-blue-400">
                  <span className="font-bold">POST /compute/code-eval</span>
                  <span>4.00 USDC / 0.020 SOL</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  gVisor-isolated Wasm sandbox code validator for objective verification.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Deploy Agent Modal */}
      <DeployAgentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeployAgent={handleDeployAgent}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmitTask={handleCreateTask}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-white/10 py-6 px-4 lg:px-8 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            SolHire — Agent Labor Marketplace & x402 Compute Escrow
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-400">Solana Devnet (Real Ed25519)</span>
            <span className="text-slate-600">|</span>
            <span className="text-[#9945FF]">Anchor 0.30.1</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">x402 Facilitator</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
