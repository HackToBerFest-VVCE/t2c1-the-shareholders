import React from 'react';
import { Zap, Play, CheckCircle2, ArrowRight, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';

export default function DemoRunnerBanner({ onRunDemo, isRunningDemo, lastDemoTaskId }) {
  const steps = [
    { title: "1. Create Task", desc: "Dual Escrow Vaults Funded" },
    { title: "2. Assign Agent", desc: "MPL Identity Verified" },
    { title: "3. x402 Compute", desc: "PDA Vault CPI to Vendor" },
    { title: "4. Submit Proof", desc: "Output & Trace Hashes" },
    { title: "5. Attestation", desc: "Mock Checker Evaluates" },
    { title: "6. Settlement", desc: "Agent Paid & Budget Refund" },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#9945FF]/30 bg-gradient-to-r from-[#9945FF]/10 via-[#0B0F19] to-[#14F195]/10 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="badge-tag bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs font-mono">
              DEMO READY — NO DOCKER NEEDED
            </span>
            <span className="badge-tag bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/20 text-xs font-mono">
              CUSTOM x402 ADAPTER
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            1-Click Autonomous Agent Lifecycle Demo
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Experience the complete on-chain lifecycle: A task is funded in dual vaults, an autonomous agent gets hired via MPL identity, spends its compute budget through <strong className="text-[#9945FF]">x402 CPI transfers</strong> without holding funds, delivers cryptographic output, passes objective attestation, and collects its reward while unspent budget is refunded.
          </p>

          {/* Stepper overview */}
          <div className="hidden sm:grid grid-cols-6 gap-2 pt-3">
            {steps.map((st, i) => (
              <div key={i} className="bg-black/30 p-2 rounded-lg border border-white/5 text-center">
                <div className="text-[10px] font-bold text-[#14F195] font-mono">{st.title}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Action */}
        <div className="shrink-0 flex flex-col items-center sm:items-end justify-center">
          <button
            onClick={onRunDemo}
            disabled={isRunningDemo}
            className={`px-6 py-4 rounded-xl font-extrabold text-sm tracking-wider uppercase flex items-center space-x-2 shadow-2xl transition-all ${
              isRunningDemo
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-wait animate-pulse'
                : 'bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:scale-105 text-black font-mono shadow-[#9945FF]/40 border border-white/20'
            }`}
          >
            <Zap className={`w-5 h-5 ${isRunningDemo ? 'animate-spin text-amber-300' : 'text-black'}`} />
            <span>{isRunningDemo ? 'EXECUTING AUTONOMOUS LIFECYCLE...' : '⚡ LAUNCH 1-CLICK DEMO'}</span>
          </button>

          <div className="text-[10px] font-mono text-slate-400 mt-2 text-center sm:text-right">
            {isRunningDemo ? (
              <span className="text-amber-400 animate-pulse">Running live transaction sequence...</span>
            ) : lastDemoTaskId ? (
              <span className="text-emerald-400">✓ Last run: Task #{lastDemoTaskId} settled</span>
            ) : (
              <span>Simulates live on-chain devnet transactions</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
