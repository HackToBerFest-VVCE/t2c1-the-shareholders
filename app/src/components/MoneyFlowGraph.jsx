import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, Database, Cpu, Coins, CheckCircle, RefreshCcw, Activity, Layers } from 'lucide-react';

export default function MoneyFlowGraph({ events, activeStep }) {
  const [pulseNode, setPulseNode] = useState(null);

  useEffect(() => {
    if (events && events.length > 0) {
      const latest = events[0];
      setPulseNode(latest.type);
      const timer = setTimeout(() => setPulseNode(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [events]);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#9945FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#14F195]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Live Money-Flow Topology</span>
              <span className="badge-tag bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                ON-CHAIN PDA ESCROW
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Dual-Vault Protocol Separation: Agents never hold budget funds; only CPI moves funds to whitelisted vendors.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
          <span>Real-time WebSocket Streaming</span>
        </div>
      </div>

      {/* Visual Topology Diagram */}
      <div className="py-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Node 1: Task Poster */}
        <div className={`glass-card p-4 rounded-xl border text-center transition-all ${
          pulseNode === 'ESCROW_DEPOSIT' ? 'border-[#14F195] ring-2 ring-[#14F195]/40 shadow-lg shadow-[#14F195]/20' : 'border-white/10'
        }`}>
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div className="text-xs text-slate-400 font-mono">STEP 1</div>
          <div className="font-bold text-sm text-white">Task Poster</div>
          <div className="text-[11px] text-slate-400 mt-1">Deposits USDC</div>
          <div className="mt-2 text-[10px] font-mono bg-blue-500/10 text-blue-300 py-0.5 px-1.5 rounded border border-blue-500/20">
            Signs create_task
          </div>
        </div>

        {/* Transition Arrow 1 */}
        <div className="hidden md:flex flex-col items-center justify-center text-slate-500">
          <div className="text-[10px] font-mono text-slate-400 mb-1">Fund Split</div>
          <ArrowRight className="w-5 h-5 text-slate-400 animate-pulse" />
          <div className="text-[9px] font-mono text-[#14F195] mt-1">Dual Vaults</div>
        </div>

        {/* Node 2: Dual PDA Vaults (Core Escrow) */}
        <div className="md:col-span-1 glass-card p-4 rounded-xl border border-[#9945FF]/30 bg-[#9945FF]/5 relative">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#9945FF] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            PDA ESCROW
          </div>

          <div className="space-y-3 pt-2">
            {/* Reward Vault */}
            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              pulseNode === 'SETTLEMENT' ? 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-400/40' : 'border-emerald-500/20 bg-emerald-500/5'
            }`}>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-center space-x-1">
                <Database className="w-3 h-3" />
                <span>REWARD VAULT (PDA)</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">Locked for Delivery</div>
              <div className="text-[10px] text-slate-400">Paid to agent on success</div>
            </div>

            {/* Budget Vault */}
            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              pulseNode === 'X402_SPEND' ? 'border-[#9945FF] bg-[#9945FF]/20 ring-2 ring-[#9945FF]/50 shadow-lg shadow-[#9945FF]/30' : 'border-[#9945FF]/20 bg-[#9945FF]/5'
            }`}>
              <div className="text-[10px] text-[#9945FF] font-mono flex items-center justify-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>BUDGET VAULT (PDA)</span>
              </div>
              <div className="text-xs font-bold text-white mt-0.5">Spend Policy Gated</div>
              <div className="text-[10px] text-slate-400">Agent NEVER holds funds</div>
            </div>
          </div>
        </div>

        {/* Transition Arrow 2 */}
        <div className="hidden md:flex flex-col items-center justify-center text-slate-500">
          <div className="text-[10px] font-mono text-[#9945FF] mb-1">x402 CPI</div>
          <ArrowRight className="w-5 h-5 text-[#9945FF] animate-pulse" />
          <div className="text-[9px] font-mono text-emerald-400 mt-1">Settlement</div>
        </div>

        {/* Node 3 & 4: Destinations (Vendor & Agent) */}
        <div className="space-y-3">
          {/* Destination A: x402 Compute Vendor */}
          <div className={`glass-card p-3 rounded-xl border transition-all ${
            pulseNode === 'X402_SPEND' ? 'border-[#9945FF] ring-2 ring-[#9945FF]/50 bg-[#9945FF]/10' : 'border-white/10'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/20">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">x402 Compute Vendor</div>
                <div className="text-[10px] text-slate-400">LLM Reasoning / Sandbox</div>
              </div>
            </div>
            <div className="mt-2 text-[9px] font-mono text-[#9945FF] bg-black/40 px-2 py-0.5 rounded border border-[#9945FF]/20 flex items-center justify-between">
              <span>Receipt PDA Created</span>
              <span>200 OK</span>
            </div>
          </div>

          {/* Destination B: Autonomous Agent */}
          <div className={`glass-card p-3 rounded-xl border transition-all ${
            pulseNode === 'SETTLEMENT' ? 'border-emerald-400 ring-2 ring-emerald-400/40 bg-emerald-500/10' : 'border-white/10'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Autonomous Agent</div>
                <div className="text-[10px] text-slate-400">MPL Agent Identity</div>
              </div>
            </div>
            <div className="mt-2 text-[9px] font-mono text-emerald-400 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center justify-between">
              <span>Delivery Attested</span>
              <span>Reward Paid</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Activity Feed */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
            <span>Recent On-Chain Money-Flow Transmissions</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">Auto-updating</span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {events && events.length > 0 ? (
            events.slice(0, 6).map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="flex items-center justify-between text-xs font-mono bg-black/30 hover:bg-black/50 px-3 py-2 rounded-lg border border-white/5 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    evt.type === 'X402_SPEND' ? 'bg-[#9945FF]' :
                    evt.type === 'SETTLEMENT' ? 'bg-[#14F195]' :
                    evt.type === 'BUDGET_REFUND' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-slate-300">{evt.title || `${evt.from} → ${evt.to}: ${evt.amount} USDC`}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400">
                  {evt.amount > 0 && (
                    <span className="font-semibold text-white">
                      {evt.amount} USDC
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 hidden sm:inline">
                    {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs font-mono text-slate-500">
              Listening for Solana Devnet & local event transactions...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
