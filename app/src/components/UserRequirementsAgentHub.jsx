import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, Send, CheckCircle2, ArrowRight, ShieldCheck, 
  Coins, Cpu, Zap, Activity, Clock, Terminal, Check, RefreshCw, 
  Layers, Globe, Shield, TrendingUp, AlertCircle, ChevronRight, Play
} from 'lucide-react';

export default function UserRequirementsAgentHub({ 
  agents = [], 
  tasks = [], 
  onCreateTask, 
  onRunEvaluation,
  onNavigateTab
}) {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState('Pro');
  const [selectedSpeed, setSelectedSpeed] = useState('instant');
  const [isMatching, setIsMatching] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [matchedAgents, setMatchedAgents] = useState([]);
  const [hiringAgentId, setHiringAgentId] = useState(null);
  const [actionTick, setActionTick] = useState(0);

  // Live Micro-Actions for ALL mentioned agents
  const [agentsLiveState, setAgentsLiveState] = useState({
    agent_webdev_00: {
      action: "Compiling React 18 JSX & Tailwind JIT styles",
      subAction: "Scaffolding responsive DOM with glassmorphism layout",
      progress: 88,
      status: "EXECUTING",
      opsCount: 1420
    },
    agent_code_01: {
      action: "Running Anchor 0.30 dual-vault invariant assertion",
      subAction: "Fuzzing reentrancy vectors in Wasm sandbox",
      progress: 94,
      status: "VERIFYING",
      opsCount: 3810
    },
    agent_backtest_02: {
      action: "Scanning Raydium CLMM liquidity tick streams",
      subAction: "Calculating Jito MEV atomic bundle slippage",
      progress: 76,
      status: "ARBITRAGING",
      opsCount: 8940
    },
    agent_research_03: {
      action: "Aggregating Helium DePIN geospatial hotspot metrics",
      subAction: "Synthesizing coverage density & tokenomic forecast",
      progress: 65,
      status: "MODELING",
      opsCount: 650
    }
  });

  // Cycle live micro-actions continuously so ALL agents are visibly performing actions!
  useEffect(() => {
    const actionPool = {
      agent_webdev_00: [
        { action: "Compiling React 18 JSX & Tailwind JIT styles", subAction: "Scaffolding responsive DOM with glassmorphism layout", status: "COMPILING" },
        { action: "Executing Lighthouse SEO & Performance Audit", subAction: "Verifying 100% Mobile Accessibility & Meta Tags", status: "OPTIMIZING" },
        { action: "Deploying Local Web Sandbox Preview", subAction: "Hosting cyber-saas interactive DOM at port 4001", status: "DEPLOYING" },
        { action: "Bundling micro-interactions & SVG animations", subAction: "Optimizing CSS gradient transitions and card hover effects", status: "STYLING" }
      ],
      agent_code_01: [
        { action: "Running Anchor 0.30 dual-vault invariant assertion", subAction: "Fuzzing reentrancy vectors in Wasm sandbox", status: "VERIFYING" },
        { action: "Checking x402 Spend Policy per-call caps", subAction: "Asserting PDA authority constraint on budget escrow", status: "AUDITING" },
        { action: "Formal verification of refund_unspent instructions", subAction: "Validating Lamports balance preservation invariants", status: "PROVING" },
        { action: "Scanning Metaplex Core Agent Identity PDA", subAction: "Validating 40-byte CPI signer authorization", status: "INSPECTING" }
      ],
      agent_backtest_02: [
        { action: "Scanning Raydium CLMM liquidity tick streams", subAction: "Calculating Jito MEV atomic bundle slippage", status: "ARBITRAGING" },
        { action: "Simulating Orca Whirlpool triangular swap", subAction: "Verifying atomic routing path against flash crash risk", status: "ROUTING" },
        { action: "Broadcasting Jito leader tip transaction", subAction: "Securing block inclusion within slot target", status: "EXECUTING" },
        { action: "Indexing sub-millisecond mempool orderbook", subAction: "Optimizing compute units (CU) limit to 14,000", status: "INDEXING" }
      ],
      agent_research_03: [
        { action: "Aggregating Helium DePIN geospatial hotspot metrics", subAction: "Synthesizing coverage density & tokenomic forecast", status: "MODELING" },
        { action: "Querying Solana DePIN telemetry stream", subAction: "Running geospatial H3 hex clustering algorithms", status: "SYNTHESIZING" },
        { action: "Generating DePIN proof-of-coverage statistical report", subAction: "Correlating hotspot packet transfer proof data", status: "CALCULATING" },
        { action: "Evaluating network reward emission curve", subAction: "Predicting 30-day validator yields and epoch splits", status: "FORECASTING" }
      ]
    };

    const interval = setInterval(() => {
      setActionTick(prev => prev + 1);
      setAgentsLiveState(prev => {
        const next = { ...prev };
        Object.keys(actionPool).forEach(agentId => {
          const pool = actionPool[agentId];
          const randomIdx = Math.floor(Math.random() * pool.length);
          const current = next[agentId] || {};
          next[agentId] = {
            ...current,
            ...pool[randomIdx],
            progress: Math.min(100, Math.max(30, Math.floor(Math.random() * 40) + 60)),
            opsCount: (current.opsCount || 500) + Math.floor(Math.random() * 45) + 5
          };
        });
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Quick Preset Requirements
  const requirementPresets = [
    {
      label: "Full-Stack Web3 DApp",
      icon: "🌐",
      text: "I need an autonomous full-stack Web3 application with responsive cyberpunk styling, Solana wallet integration, dual-vault escrow display, and a live working interactive demo link.",
      targetAgents: ["agent_webdev_00", "agent_code_01"]
    },
    {
      label: "Anchor Security Audit",
      icon: "🛡️",
      text: "I need a rigorous formal invariant audit for our Solana Anchor 0.30 escrow contract, testing dual-vault separation, reentrancy guards, and x402 budget cap spend limits.",
      targetAgents: ["agent_code_01", "agent_webdev_00"]
    },
    {
      label: "CLMM Arbitrage Bot",
      icon: "⚡",
      text: "I need an autonomous high-frequency flash arbitrage bot that scans Raydium CLMM liquidity pools, calculates atomic swaps, and bundles via Jito MEV with slippage limits.",
      targetAgents: ["agent_backtest_02", "agent_code_01"]
    },
    {
      label: "DePIN Telemetry & Modeling",
      icon: "📡",
      text: "I need an intelligent DePIN telemetry analyst to ingest geospatial IoT hotspot data, model coverage density, and forecast token reward emissions on Solana.",
      targetAgents: ["agent_research_03", "agent_webdev_00"]
    }
  ];

  // Helper to get agent data
  const getAgentInfo = (agentId) => {
    return agents.find(a => a.id === agentId) || {
      id: agentId,
      name: agentId,
      category: "Specialist",
      rate_sol: 1.0,
      rate_usdc: 200,
      score: 9800,
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
    };
  };

  // Handle User Submitting Requirements
  const handleSubmitRequirements = (customPromptText = null) => {
    const textToProcess = customPromptText || userPrompt;
    if (!textToProcess.trim()) return;

    setIsMatching(true);
    setHasSubmitted(false);

    setTimeout(() => {
      // Determine which agents match best based on keywords in prompt
      const lower = textToProcess.toLowerCase();
      let matched = [];

      const webDev = getAgentInfo("agent_webdev_00");
      const codeAudit = getAgentInfo("agent_code_01");
      const arbBot = getAgentInfo("agent_backtest_02");
      const depin = getAgentInfo("agent_research_03");

      if (lower.includes("web") || lower.includes("dapp") || lower.includes("frontend") || lower.includes("ui") || lower.includes("demo") || lower.includes("site") || lower.includes("responsive")) {
        matched.push({
          agent: webDev,
          matchScore: 99,
          role: "Primary Web & UI Architect",
          followUpMessage: "Hello! I reviewed your project requirements for the modern Web3 application. I will autonomously scaffold a high-performance responsive interface with Tailwind CSS, wire up Solana Devnet RPC connectors, and deploy a live interactive sandbox demo immediately.",
          plan: [
            "Scaffold React 18 component tree with Cyberpunk glassmorphism design tokens",
            "Synthesize responsive layouts with 100% Mobile & Desktop SEO compliance",
            "Integrate live on-chain wallet connector and escrow status feed",
            "Deploy live working demo at http://localhost:4001/demos/cyber-saas"
          ],
          eta: "15 seconds (Autonomous Live Build)",
          computeGasSol: 0.10,
          computeGasUsdc: 20
        });

        matched.push({
          agent: codeAudit,
          matchScore: 94,
          role: "Security & Escrow Auditor",
          followUpMessage: "I can pair with WebCraft AI to audit the dual-vault escrow integration and guarantee your DApp's smart contract invocations are 100% invariant verified.",
          plan: [
            "Audit dual-vault escrow instruction hooks",
            "Verify signer authorizations and spend limits",
            "Issue formal attestation proof hash"
          ],
          eta: "20 seconds (Parallel Fuzzing)",
          computeGasSol: 0.05,
          computeGasUsdc: 10
        });
      } else if (lower.includes("audit") || lower.includes("security") || lower.includes("contract") || lower.includes("anchor") || lower.includes("invariant") || lower.includes("vault")) {
        matched.push({
          agent: codeAudit,
          matchScore: 99,
          role: "Lead Smart Contract Auditor",
          followUpMessage: "Greetings! I analyzed your smart contract verification request. I will run formal Wasm invariant fuzzing on Anchor 0.30 dual-vault PDA isolation, verify pay_x402 spend policy caps, and ensure zero fund leakage.",
          plan: [
            "Formal verification of dual-vault PDA fund segregation",
            "Wasm sandbox fuzzing against reentrancy vectors",
            "Check spend policy cap & authorized vendor whitelisting",
            "Publish cryptographically signed verification certificate"
          ],
          eta: "18 seconds (Wasm Sandbox Fuzzing)",
          computeGasSol: 0.05,
          computeGasUsdc: 10
        });

        matched.push({
          agent: webDev,
          matchScore: 92,
          role: "Audit Dashboard Specialist",
          followUpMessage: "I can publish a live interactive security report and executive visual dashboard summarizing SolGuard's formal verification proofs.",
          plan: [
            "Scaffold real-time security score dashboard",
            "Render interactive PDA hierarchy diagram",
            "Deploy live attestation viewer"
          ],
          eta: "15 seconds (Auto-Deploy)",
          computeGasSol: 0.08,
          computeGasUsdc: 16
        });
      } else if (lower.includes("trade") || lower.includes("arb") || lower.includes("clmm") || lower.includes("bot") || lower.includes("raydium") || lower.includes("jito") || lower.includes("mev")) {
        matched.push({
          agent: arbBot,
          matchScore: 99,
          role: "High-Frequency Arbitrage Engine",
          followUpMessage: "Attention Trader! I have detected your algorithmic trading request. I will connect to Raydium CLMM liquidity tick streams, calculate atomic triangular routing paths, and bundle swaps through Jito MEV with strict slippage protection.",
          plan: [
            "Stream sub-second Raydium CLMM tick arrays",
            "Calculate triangular arbitrage profit margin after gas",
            "Submit atomic swap via Jito MEV leader bundle",
            "Verify zero-loss execution in Solana Devnet sandbox"
          ],
          eta: "12 seconds (Sub-Millisecond Engine)",
          computeGasSol: 0.08,
          computeGasUsdc: 16
        });

        matched.push({
          agent: codeAudit,
          matchScore: 91,
          role: "Flash Loan Security Guard",
          followUpMessage: "I will formally verify the atomic swap contract logic to guarantee reentrancy resistance during flash arbitrage execution.",
          plan: [
            "Fuzz flash loan callback hooks",
            "Assert slippage limit boundary checks"
          ],
          eta: "16 seconds",
          computeGasSol: 0.04,
          computeGasUsdc: 8
        });
      } else {
        // General or DePIN / Research
        matched.push({
          agent: depin,
          matchScore: 98,
          role: "Lead Geospatial Analyst",
          followUpMessage: "Hello! I reviewed your analytical requirements. I will ingest geospatial hotspot telemetry, model coverage clusters, and deliver a comprehensive tokenomic reward simulation on Solana.",
          plan: [
            "Ingest DePIN telemetry data feed",
            "Model H3 geospatial coverage density",
            "Synthesize tokenomic emission forecasts",
            "Deliver structured analytical report & metrics"
          ],
          eta: "20 seconds (Telemetry Ingestion)",
          computeGasSol: 0.05,
          computeGasUsdc: 10
        });

        matched.push({
          agent: webDev,
          matchScore: 93,
          role: "Interactive Analytics UI Specialist",
          followUpMessage: "I can construct a real-time geospatial telemetry dashboard to visualize Helium Synth's coverage models with live SVG data layers.",
          plan: [
            "Build interactive telemetry dashboard",
            "Render live hotspot cluster charts",
            "Deploy live web demo viewer"
          ],
          eta: "15 seconds",
          computeGasSol: 0.08,
          computeGasUsdc: 16
        });
      }

      setMatchedAgents(matched);
      setIsMatching(false);
      setHasSubmitted(true);
    }, 1100);
  };

  // Handle Direct Hire of a Following-Up Agent
  const handleHireAgent = async (matchedItem) => {
    const { agent, computeGasSol, computeGasUsdc } = matchedItem;
    setHiringAgentId(agent.id);

    try {
      const taskTitle = userPrompt.length > 55 ? `${userPrompt.slice(0, 52)}...` : (userPrompt || `Custom Task for ${agent.name}`);
      const rewardSol = agent.rate_sol || 1.0;
      const rewardUsdc = agent.rate_usdc || 200;
      const budgetSol = computeGasSol || 0.1;
      const budgetUsdc = computeGasUsdc || 20;

      // Create Task through the App's handler
      const created = await onCreateTask({
        title: taskTitle,
        category: agent.category?.includes("Web") ? "Code" : (agent.category?.includes("Trade") ? "Trading" : "Research"),
        mode: "Objective",
        reward_sol: rewardSol,
        reward_usdc: rewardUsdc,
        budget_sol: budgetSol,
        budget_usdc: budgetUsdc,
        per_call_cap_usdc: 10,
        spec_uri: `ipfs://solhire_req_${Date.now()}`
      });

      const newTaskId = created?.task?.id || created?.id || tasks[0]?.id || 1;

      // Switch to Evaluator and run evaluation!
      if (onNavigateTab) {
        onNavigateTab('evaluator');
      }

      setTimeout(() => {
        if (onRunEvaluation) {
          onRunEvaluation(newTaskId, agent.id);
        }
      }, 500);

    } catch (err) {
      alert("Error hiring agent: " + err.message);
    } finally {
      setHiringAgentId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP SECTION: ALL MENTIONED AGENTS LIVE ACTION WORKSTATION              */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#9945FF]/10 via-[#14F195]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="badge-tag bg-[#14F195]/15 text-[#14F195] border-[#14F195]/30 text-xs font-mono font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
                <span>ALL AGENTS CURRENTLY ACTIVE</span>
              </span>
              <span className="badge-tag bg-[#9945FF]/15 text-[#9945FF] border-[#9945FF]/30 text-xs font-mono">
                REAL-TIME TELEMETRY STREAM
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-2 flex items-center space-x-2">
              <span>Autonomous Agents Live Action Matrix</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              All registered autonomous agents continuously process decentralized workloads, run formal Wasm assertions, stream CLMM orders, and execute x402 compute calls on Solana Devnet.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs font-mono bg-black/50 border border-white/10 px-3.5 py-2 rounded-xl flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#14F195] animate-pulse" />
              <span className="text-slate-400">Total Ops:</span>
              <span className="text-white font-bold">
                {Object.values(agentsLiveState).reduce((acc, curr) => acc + (curr.opsCount || 0), 24100).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Agent Action Grid: All Mentioned Agents Performing Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "agent_webdev_00",
              name: "WebCraft AI",
              tagline: "Autonomous Web Developer",
              icon: Globe,
              rateSol: 2.00,
              rateUsdc: 400,
              computeSol: 0.10,
              accent: "from-cyan-500/20 to-blue-500/20",
              badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
              avatar: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=150&auto=format&fit=crop&q=80"
            },
            {
              id: "agent_code_01",
              name: "SolGuard AI",
              tagline: "Smart Contract Auditor",
              icon: ShieldCheck,
              rateSol: 1.00,
              rateUsdc: 200,
              computeSol: 0.05,
              accent: "from-purple-500/20 to-indigo-500/20",
              badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
              avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
            },
            {
              id: "agent_backtest_02",
              name: "Kamino Sniper AI",
              tagline: "Flash Arbitrage Bot",
              icon: Zap,
              rateSol: 1.50,
              rateUsdc: 300,
              computeSol: 0.08,
              accent: "from-amber-500/20 to-orange-500/20",
              badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
              avatar: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80"
            },
            {
              id: "agent_research_03",
              name: "Helium Synth AI",
              tagline: "DePIN Network Analyst",
              icon: TrendingUp,
              rateSol: 0.75,
              rateUsdc: 150,
              computeSol: 0.04,
              accent: "from-emerald-500/20 to-teal-500/20",
              badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
              avatar: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=150&auto=format&fit=crop&q=80"
            }
          ].map((agentMeta) => {
            const liveData = agentsLiveState[agentMeta.id] || {
              action: "Executing background operations",
              subAction: "Processing on-chain blocks",
              progress: 80,
              status: "ACTIVE",
              opsCount: 1200
            };

            const IconComponent = agentMeta.icon;

            return (
              <div 
                key={agentMeta.id}
                className="bg-black/40 rounded-xl p-4 border border-white/10 hover:border-[#14F195]/40 transition-all flex flex-col justify-between space-y-3 relative group"
              >
                {/* Agent Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img 
                        src={agentMeta.avatar} 
                        alt={agentMeta.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white leading-none">{agentMeta.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{agentMeta.tagline}</span>
                      </div>
                    </div>

                    <span className={`badge-tag text-[9px] font-mono px-2 py-0.5 rounded-md ${agentMeta.badgeColor}`}>
                      {liveData.status}
                    </span>
                  </div>

                  {/* Current Active Action */}
                  <div className="mt-3 bg-black/60 p-2.5 rounded-lg border border-white/5 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Terminal className="w-3 h-3 text-[#14F195]" />
                        <span>Current Action:</span>
                      </span>
                      <span className="text-[#14F195] font-bold">{liveData.progress}%</span>
                    </div>

                    <p className="text-xs text-white font-medium truncate" title={liveData.action}>
                      {liveData.action}
                    </p>

                    <p className="text-[10px] text-slate-400 truncate" title={liveData.subAction}>
                      ↳ {liveData.subAction}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full transition-all duration-700"
                        style={{ width: `${liveData.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Agent Pricing & Rate Displayed Below */}
                <div className="pt-2 border-t border-white/5 space-y-1 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Base Asking Rate:</span>
                    <span className="text-white font-bold">
                      <strong className="text-[#14F195]">{agentMeta.rateSol} SOL</strong>
                      <span className="text-slate-400 text-[10px] ml-1">(${agentMeta.rateUsdc})</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>x402 Compute:</span>
                    <span className="text-[#9945FF]">~{agentMeta.computeSol} SOL</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. USER REQUIREMENTS INTAKE: DESCRIBE YOUR NEEDS & PROBLEM               */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="badge-tag bg-[#9945FF]/15 text-[#9945FF] border-[#9945FF]/30 text-xs font-mono font-bold">
                INTERACTIVE MATCHMAKING
              </span>
              <span className="badge-tag bg-[#14F195]/15 text-[#14F195] border-[#14F195]/30 text-xs font-mono font-bold">
                INSTANT AGENT FOLLOW-UPS
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-white mt-2">
              Describe Your Requirements & Needs
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Tell our autonomous agent network what you need built, audited, or analyzed. Specialized agents will immediately follow up with personalized execution proposals, timeframes, and transparent price tags.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 font-mono">Speed:</span>
            <div className="bg-black/40 p-1 rounded-xl border border-white/5 flex items-center">
              <button
                onClick={() => setSelectedSpeed('instant')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedSpeed === 'instant' ? 'bg-[#14F195] text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Instant (~15s)
              </button>
              <button
                onClick={() => setSelectedSpeed('deep')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedSpeed === 'deep' ? 'bg-[#9945FF] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Formal Deep Audit
              </button>
            </div>
          </div>
        </div>

        {/* Quick Requirement Presets */}
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
            Or pick a quick requirement template:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {requirementPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserPrompt(preset.text);
                  handleSubmitRequirements(preset.text);
                }}
                className="text-left bg-black/40 hover:bg-white/5 border border-white/10 hover:border-[#14F195]/40 p-3 rounded-xl transition-all group"
              >
                <div className="text-base mb-1">{preset.icon}</div>
                <div className="text-xs font-bold text-white group-hover:text-[#14F195] transition-colors">
                  {preset.label}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                  {preset.text}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* User Description Textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-slate-400 uppercase">
            Your Requirements Specification:
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g. I need an autonomous full-stack Web3 application with responsive cyberpunk styling, Solana wallet connection, dual-vault escrow display, and a live working interactive demo link..."
              className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#14F195] transition-all resize-none shadow-inner"
            />

            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <span className="text-[10px] font-mono text-slate-500">
                {userPrompt.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#14F195]" />
            <span>Escrow Protected • 100% Refundable on Non-Delivery</span>
          </div>

          <button
            onClick={() => handleSubmitRequirements()}
            disabled={isMatching || !userPrompt.trim()}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
              isMatching || !userPrompt.trim()
                ? 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-black shadow-lg shadow-[#14F195]/20 cursor-pointer active:scale-95'
            }`}
          >
            {isMatching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>AGENTS ANALYZING YOUR REQUIREMENTS...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 fill-current" />
                <span>SUBMIT REQUIREMENTS & RECEIVE AGENT FOLLOW-UPS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. AGENT FOLLOW-UPS & DETAILED PRICE BREAKDOWN BELOW                      */}
      {/* ========================================================================= */}
      {hasSubmitted && matchedAgents.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#14F195]" />
                <span>Specialized Autonomous Agents Following Up</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                These verified agents analyzed your requirements and generated tailored execution proposals with exact pricing below:
              </p>
            </div>

            <span className="badge-tag bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30 text-xs font-mono">
              {matchedAgents.length} Tailored Proposals
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matchedAgents.map((matchItem, idx) => {
              const { agent, matchScore, role, followUpMessage, plan, eta, computeGasSol, computeGasUsdc } = matchItem;
              const isHiring = hiringAgentId === agent.id;
              const baseRateSol = agent.rate_sol || 1.0;
              const baseRateUsdc = agent.rate_usdc || 200;
              const totalCostSol = (baseRateSol + computeGasSol).toFixed(2);
              const totalCostUsdc = (baseRateUsdc + computeGasUsdc).toFixed(0);

              return (
                <div
                  key={agent.id || idx}
                  className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-[#14F195]/50 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group shadow-xl"
                >
                  {/* Subtle top indicator */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9945FF] to-[#14F195]" />

                  <div>
                    {/* Header: Agent Identity & Match Score */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <img 
                          src={agent.avatar} 
                          alt={agent.name} 
                          className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-md"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-bold text-white">{agent.name}</h4>
                            <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                          </div>
                          <span className="text-xs font-mono text-[#9945FF] font-semibold">{role}</span>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Status: <span className="text-[#14F195]">Available for Immediate Dispatch</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="badge-tag bg-[#14F195]/15 text-[#14F195] border-[#14F195]/30 text-xs font-mono font-bold">
                          {matchScore}% MATCH
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          ETA: <strong className="text-white">{eta}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Message from the Agent */}
                    <div className="mt-4 bg-gradient-to-r from-white/5 to-white/[0.02] p-4 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-1.5 text-xs font-mono text-[#14F195] mb-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Direct Follow-up Response:</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed italic">
                        "{followUpMessage}"
                      </p>
                    </div>

                    {/* Proposed Action Steps */}
                    <div className="mt-4 space-y-2">
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                        Proposed Execution Steps:
                      </span>
                      <ul className="space-y-1.5 font-mono text-xs">
                        {plan.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start space-x-2 text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195] shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* PRICE OF THE AGENTS MENTIONED BELOW                       */}
                  {/* ========================================================= */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="text-xs font-mono text-slate-400 uppercase flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Coins className="w-4 h-4 text-[#14F195]" />
                        <span className="font-bold text-white">Transparent Price & Cost Breakdown:</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Escrow Dual-Vault</span>
                    </div>

                    {/* Cost Breakdown Grid */}
                    <div className="bg-black/60 rounded-xl p-3.5 border border-white/10 space-y-2 font-mono text-xs">
                      {/* Base Agent Fee */}
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center space-x-1">
                          <Bot className="w-3 h-3 text-slate-400" />
                          <span>Agent Base Fee:</span>
                        </span>
                        <span className="text-white font-bold">
                          {baseRateSol} SOL <span className="text-slate-400 text-[11px]">(${baseRateUsdc} USDC)</span>
                        </span>
                      </div>

                      {/* x402 Compute & AI Gas */}
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="flex items-center space-x-1">
                          <Cpu className="w-3 h-3 text-[#9945FF]" />
                          <span>x402 AI & Compute Gas:</span>
                        </span>
                        <span className="text-[#9945FF] font-bold">
                          +{computeGasSol} SOL <span className="text-slate-400 text-[11px]">(${computeGasUsdc} USDC)</span>
                        </span>
                      </div>

                      {/* Escrow Guarantee */}
                      <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-white/5">
                        <span>On-Chain Escrow Protection:</span>
                        <span className="text-[#14F195]">100% Refundable Guarantee</span>
                      </div>

                      {/* Total Price Mentioned Below */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-sm font-bold text-white">
                          Total Price to Hire:
                        </span>
                        <div className="text-right">
                          <div className="text-base font-extrabold text-[#14F195]">
                            {totalCostSol} SOL
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ≈ ${totalCostUsdc} USDC (All-inclusive)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hire & Dispatch Button */}
                    <button
                      onClick={() => handleHireAgent(matchItem)}
                      disabled={isHiring}
                      className={`w-full py-3 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                        isHiring
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                          : 'bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-black shadow-lg shadow-[#14F195]/20 active:scale-98'
                      }`}
                    >
                      {isHiring ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                          <span>LOCKING ESCROW & DISPATCHING {agent.name.toUpperCase()}...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>⚡ HIRE {agent.name.split(' ')[0].toUpperCase()} FOR {totalCostSol} SOL & EXECUTE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
