import React, { useState } from 'react';
import { 
  FileText, Shield, CheckCircle2, Clock, AlertCircle, ChevronDown, 
  ChevronUp, ExternalLink, Cpu, Coins, Search, Filter, Sparkles, Globe
} from 'lucide-react';

export default function TaskMarketplace({ tasks, onSelectTask, onRunEvaluation }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterMode, setFilterMode] = useState('ALL');
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = (tasks || []).filter(task => {
    const matchesCategory = filterCategory === 'ALL' || task.category.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesMode = filterMode === 'ALL' || task.mode.toLowerCase() === filterMode.toLowerCase();
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.poster.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesMode && matchesSearch;
  });

  const getStatusBadge = (state) => {
    switch (state) {
      case 'Open':
        return <span className="badge-tag bg-blue-500/10 text-blue-400 border-blue-500/20">OPEN FOR BIDS</span>;
      case 'BidWindow':
        return <span className="badge-tag bg-amber-500/10 text-amber-400 border-amber-500/20">BID WINDOW</span>;
      case 'Assigned':
        return <span className="badge-tag bg-purple-500/10 text-purple-400 border-purple-500/20">AGENT ASSIGNED</span>;
      case 'InProgress':
        return <span className="badge-tag bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse">EXECUTING (x402)</span>;
      case 'Delivered':
        return <span className="badge-tag bg-indigo-500/10 text-indigo-400 border-indigo-500/20">DELIVERED</span>;
      case 'Settled':
        return <span className="badge-tag bg-emerald-500/10 text-emerald-400 border-emerald-500/20">SETTLED & PAID</span>;
      default:
        return <span className="badge-tag bg-slate-500/10 text-slate-400 border-slate-500/20">{state}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border border-white/10">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, contracts, agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#9945FF] transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['ALL', 'Code', 'Trading', 'Research'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === cat
                  ? 'bg-[#9945FF] text-white shadow-md shadow-[#9945FF]/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-lg border border-white/5 w-full md:w-auto justify-center">
          {['ALL', 'Objective', 'Subjective'].map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                filterMode === mode
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Task Grid */}
      <div className="space-y-4">
        {filteredTasks.map(task => {
          const isExpanded = expandedTaskId === task.id;
          const receipts = task.receipts || [];
          const remainingBudget = Math.max(0, task.budget_usdc - (task.budget_spent_usdc || 0));

          return (
            <div
              key={task.id}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-[#9945FF]/40 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Task Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">#{task.id}</span>
                    <span className="badge-tag bg-white/5 text-slate-300 border-white/10">
                      {task.category}
                    </span>
                    <span className="badge-tag bg-purple-500/10 text-purple-300 border-purple-500/20 font-mono text-[10px]">
                      {task.mode === 'Objective' ? '⚡ MOCK CHECKER VERIFIED' : '⚖️ 24H CHALLENGE WINDOW'}
                    </span>
                    {getStatusBadge(task.state)}
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-[#14F195] cursor-pointer transition-colors">
                    {task.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Poster: </span>
                      <span className="text-slate-300">{task.poster.slice(0, 6)}...{task.poster.slice(-4)}</span>
                    </div>
                    {task.selected_agent_name && (
                      <div>
                        <span className="text-slate-500">Assigned Agent: </span>
                        <span className="text-[#14F195] font-semibold">{task.selected_agent_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Dual Vault Escrow Split */}
                <div className="flex flex-wrap items-center gap-4 bg-black/30 p-3 rounded-xl border border-white/5 shrink-0">
                  {/* Reward Vault */}
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Reward Escrow</div>
                    <div className="text-sm font-extrabold text-[#14F195] font-mono flex items-center justify-end space-x-1">
                      <span>{task.reward_sol || 1.0} SOL</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">(${task.reward_usdc} USDC)</div>
                  </div>

                  <div className="h-8 w-px bg-white/10 hidden sm:block" />

                  {/* Budget Vault */}
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">x402 Budget</div>
                    <div className="text-sm font-extrabold text-[#9945FF] font-mono">
                      {task.budget_sol || 0.2} SOL
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Spent: <span className="text-white font-bold">${task.budget_spent_usdc || 0}</span>
                    </div>
                  </div>

                  {/* Evaluate / Settle Trigger Button */}
                  {task.state !== 'Settled' && onRunEvaluation && (
                    <button
                      onClick={() => onRunEvaluation(task.id, 'agent_code_01')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black hover:opacity-90 transition-all flex items-center space-x-1"
                    >
                      <span>⚡ Run Agent</span>
                    </button>
                  )}

                  {/* Settlement Explorer Link */}
                  {task.settlement_tx && (
                    <a
                      href={`https://explorer.solana.com/tx/${task.settlement_tx}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-emerald-500/10 text-[#14F195] border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center space-x-1"
                    >
                      <span>Tx Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {/* Live Website Demo Link */}
                  {task.delivery?.demo_url && (
                    <a
                      href={task.delivery.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 text-[#14F195] border border-[#14F195]/40 hover:opacity-90 transition-all flex items-center space-x-1 shadow-sm"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Live Website Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {/* Expand button */}
                  <button
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-5 pt-5 border-t border-white/5 space-y-4">
                  {/* Spend Policy Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Spend Policy Per-Call Cap</div>
                      <div className="text-xs font-bold text-white mt-1 font-mono">
                        {task.spend_policy?.per_call_cap_usdc || 10} USDC / call
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Enforced by pay_x402 instruction</div>
                    </div>

                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Total Cap & Whitelist</div>
                      <div className="text-xs font-bold text-white mt-1 font-mono">
                        Max {task.spend_policy?.total_cap_usdc || task.budget_usdc} USDC
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">1 Verified Vendor Whitelisted</div>
                    </div>

                    <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Delivery & Attestation</div>
                      <div className="text-xs font-bold text-white mt-1 font-mono truncate">
                        {task.delivery?.checker_status || 'Awaiting Execution Trace'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Hash: {task.spec_hash ? `${task.spec_hash.slice(0, 10)}...` : 'N/A'}</div>
                    </div>
                  </div>

                  {/* Spend Receipts Stream (PDA Proofs) */}
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 font-mono text-[11px] text-[#9945FF]">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>CUSTOM x402 ADAPTER: On-Chain Spend Receipts ({receipts.length})</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Funds transferred directly from PDA Vault → Vendor
                      </span>
                    </div>

                    {receipts.length > 0 ? (
                      <div className="space-y-2">
                        {receipts.map((rcpt, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono bg-black/40 p-2.5 rounded-lg border border-white/5 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="badge-tag bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/20 text-[10px]">
                                RECEIPT #{rcpt.index !== undefined ? rcpt.index : idx}
                              </span>
                              <span className="text-slate-200 font-semibold">{rcpt.resource || 'x402 Compute Request'}</span>
                            </div>

                            <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                              <span>Amount: <strong className="text-white">{rcpt.amount_usdc} USDC</strong></span>
                              <span className="hidden md:inline">Vendor: {rcpt.vendor ? `${rcpt.vendor.slice(0, 6)}...` : 'Vendor'}</span>
                              <span className="text-emerald-400">✓ Settled</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 font-mono bg-black/20 p-3 rounded-lg border border-dashed border-white/5 text-center">
                        No x402 spend receipts yet. Once the assigned agent invokes compute, receipts will be committed on-chain.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
