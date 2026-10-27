import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Terminal, CheckCircle2, AlertCircle, ShieldCheck, 
  Cpu, Coins, ExternalLink, ArrowRight, Sparkles, RefreshCw, Layers, Globe, Monitor, X 
} from 'lucide-react';

export default function AgentEvaluator({ tasks, agents, onRunEvaluation, activeLogs, isEvaluating, latestSettlement }) {
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (tasks && tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [tasks, selectedTaskId]);

  useEffect(() => {
    if (agents && agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeLogs]);

  const activeTask = tasks.find(t => t.id === Number(selectedTaskId)) || tasks[0];
  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];
  const demoUrl = latestSettlement?.demoUrl || activeTask?.delivery?.demo_url;
  const outputType = activeTask?.delivery?.output_type || 'website';
  const outputTitle = activeTask?.delivery?.preview_title || 'Agent Output';

  const OUTPUT_META = {
    website:         { icon: '🌐', label: 'OPEN LIVE WEBSITE',           previewLabel: 'In-App Website Preview',    color: '#14F195' },
    audit_report:    { icon: '📋', label: 'OPEN AUDIT REPORT',           previewLabel: 'In-App Audit Report',       color: '#9945FF' },
    trading_report:  { icon: '📊', label: 'OPEN ARB TRADING REPORT',     previewLabel: 'In-App Trading Dashboard',  color: '#F59E0B' },
    data_report:     { icon: '🔬', label: 'OPEN DATA CLEANING REPORT',   previewLabel: 'In-App Data Report',        color: '#22D3EE' },
    analytics_report:{ icon: '📡', label: 'OPEN DEPIN ANALYTICS REPORT', previewLabel: 'In-App Analytics View',    color: '#2DD4BF' },
  };
  const outMeta = OUTPUT_META[outputType] || OUTPUT_META.website;

  const handleStartEval = () => {
    if (!selectedTaskId) return;
    onRunEvaluation(selectedTaskId, selectedAgentId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 1 Col: Control & Context Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="badge-tag bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30 text-xs font-mono">
              REAL SOLANA TRANSFERS
            </span>
            <span className="badge-tag bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/30 text-xs font-mono">
              FORMAL EVALUATION
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">Agent Execution & Evaluation</h2>
          <p className="text-xs text-slate-400 mt-1">
            Trigger the autonomous agent to solve the task, pay for x402 compute via PDA CPI, verify delivery (code/website), and claim real SOL crypto payment.
          </p>
        </div>

        {/* Task Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-slate-400 uppercase">
            Select Task to Evaluate
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={isEvaluating}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#9945FF]"
          >
            {(tasks || []).map(t => (
              <option key={t.id} value={t.id}>
                #{t.id} - {t.title.slice(0, 42)}... ({t.reward_sol || 1.0} SOL)
              </option>
            ))}
          </select>
        </div>

        {/* Agent Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-slate-400 uppercase">
            Assign Autonomous Agent
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            disabled={isEvaluating}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#14F195]"
          >
            {(agents || []).map(a => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.category}) — {a.sol_balance || 0} SOL (Rate: {a.rate_sol || 1.0} SOL)
              </option>
            ))}
          </select>
        </div>

        {/* Active Economics Card */}
        {activeTask && (
          <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/5">
              <span>Escrow Reward Pot:</span>
              <span className="text-[#14F195] font-bold text-sm">{activeTask.reward_sol || 1.0} SOL (${activeTask.reward_usdc} USDC)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/5">
              <span>x402 Compute Budget:</span>
              <span className="text-[#9945FF] font-bold">{activeTask.budget_sol || 0.2} SOL (${activeTask.budget_usdc} USDC)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Agent Target Wallet:</span>
              <span className="text-slate-300">{activeAgent?.wallet ? `${activeAgent.wallet.slice(0, 6)}...${activeAgent.wallet.slice(-4)}` : 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleStartEval}
          disabled={isEvaluating}
          className={`w-full py-3.5 rounded-xl font-bold font-mono text-xs tracking-wider uppercase flex items-center justify-center space-x-2 transition-all ${
            isEvaluating
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-black font-extrabold shadow-lg shadow-[#14F195]/20'
          }`}
        >
          {isEvaluating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>AGENT EVALUATION IN PROGRESS...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>RUN AGENT & SETTLE REWARD COIN</span>
            </>
          )}
        </button>

        {/* Agent Output Delivered Card — All 4 Agent Types */}
        {demoUrl && (
          <div className="bg-gradient-to-br from-[#9945FF]/20 via-[#14F195]/20 to-black/60 border border-[#14F195]/40 p-4 rounded-xl space-y-2.5 animate-in fade-in duration-300 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Globe className="w-4 h-4" style={{ color: outMeta.color }} />
                <span>AGENT OUTPUT DELIVERED</span>
              </div>
              <span className="badge-tag text-[10px] font-bold" style={{ background: `${outMeta.color}22`, color: outMeta.color, border: `1px solid ${outMeta.color}44` }}>LIVE OUTPUT LINK</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              <strong className="text-white">{outputTitle}</strong><br />
              Agent has completed task execution and published the live output report:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1 font-mono">
              <a
                href={demoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-black hover:opacity-95 text-center flex items-center justify-center space-x-1 shadow-md transition-all"
                style={{ background: `linear-gradient(135deg, #9945FF, ${outMeta.color})` }}
              >
                <span>{outMeta.icon} {outMeta.label}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="py-2 px-3 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center justify-center space-x-1 transition-all"
              >
                <Monitor className="w-3 h-3" />
                <span>{outMeta.previewLabel}</span>
              </button>
            </div>
          </div>
        )}

        {/* Real Crypto Settlement Proof Box */}
        {latestSettlement && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl space-y-1.5 animate-in fade-in duration-300">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>REAL SOLANA CRYPTO TRANSFERRED!</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300">
              Reward: <strong className="text-white">{latestSettlement.rewardPaidSol} SOL</strong> transferred to {latestSettlement.agent}.
            </div>
            <a
              href={`https://explorer.solana.com/tx/${latestSettlement.signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-mono text-[#14F195] hover:underline flex items-center space-x-1 pt-1 truncate"
            >
              <span>View On Solana Devnet Explorer</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}
      </div>

      {/* Right 2 Cols: Live Streaming Execution Terminal */}
      <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 flex flex-col h-[580px] overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
            </div>
            <span className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#14F195]" />
              <span>solhire-agent-sandbox :: stdout</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#14F195] hover:underline flex items-center space-x-1"
              >
                <span>🌐 Demo Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
              <span>Devnet Live</span>
            </div>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-5 overflow-y-auto bg-black/90 font-mono text-xs space-y-2 select-text">
          <div className="text-slate-500">// SolHire Autonomous Agent Runtime Environment</div>
          <div className="text-slate-500">// Target Cluster: Solana Devnet (Program: ALMk8Z9bXaTnYWqJYk5dCNGrJ5RCqj5N7EqYpVYEfJPr)</div>
          <div className="text-slate-500">// Metaplex MPL Agent Identity: Verified 40-byte PDA</div>
          <div className="h-2" />

          {activeLogs && activeLogs.length > 0 ? (
            activeLogs.map((log, index) => {
              let color = 'text-slate-300';
              if (log.level === 'warn') color = 'text-amber-400';
              if (log.level === 'success') color = 'text-[#14F195] font-semibold';
              if (log.level === 'error') color = 'text-red-400';

              return (
                <div key={index} className="leading-relaxed flex items-start space-x-2">
                  <span className="text-slate-600 shrink-0 text-[10px] mt-0.5">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '00:00:00'}
                  </span>
                  <span className={color}>{log.text}</span>
                </div>
              );
            })
          ) : (
            <div className="text-slate-600 italic py-12 text-center">
              No evaluation running. Select a task (e.g. Task #4 Website Dev) and click "RUN AGENT & SETTLE REWARD COIN" to begin live execution.
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* In-App Live Interactive Website Preview Modal */}
      {showPreviewModal && demoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel w-full max-w-5xl h-[85vh] rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-black/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5" style={{ color: outMeta.color }} />
                <div>
                  <h3 className="text-sm font-bold text-white">{outputTitle}</h3>
                  <p className="text-[11px] font-mono text-slate-400">{demoUrl}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/40 hover:bg-[#14F195]/30 transition-all flex items-center space-x-1"
                >
                  <span>Open in Full Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Live iframe */}
            <div className="flex-1 w-full bg-[#070A11] relative">
              <iframe
                src={demoUrl}
                title="Autonomous Website Demo"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
