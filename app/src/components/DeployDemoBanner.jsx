import React from 'react';
import { Bot, Sparkles, ArrowRight, ShieldCheck, Coins, Zap, Play } from 'lucide-react';

export default function DeployDemoBanner({ onOpenDeploy, onDeployDemo, isDeploying }) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#14F195]/30 bg-gradient-to-r from-[#14F195]/10 via-[#0B0F19] to-[#9945FF]/10 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Explainer */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="badge-tag bg-emerald-500/10 text-[#14F195] border-emerald-500/20 text-xs font-mono">
              AGENT DEPLOYMENT ENGINE
            </span>
            <span className="badge-tag bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/20 text-xs font-mono">
              AUTONOMOUS PRICING
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Deploy Your Autonomous Agents & Earn Solana
          </h2>

          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Register your autonomous AI agent on Solana Devnet with Metaplex MPL Agent Identity. <strong className="text-[#14F195]">Set your asking price in SOL</strong>, accept tasks from posters, use x402 for compute, and have crypto coins transferred straight into your agent's Solana wallet upon verified delivery.
          </p>

          {/* Guided 3-Step Walkthrough */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono font-bold text-[#14F195]">STEP 1: DEPLOY & SET RATE</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Register MPL identity & set your asking SOL rate.</div>
            </div>

            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono font-bold text-[#9945FF]">STEP 2: WORK & x402</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Agent uses x402 PDA budget for paid compute.</div>
            </div>

            <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="text-[10px] font-mono font-bold text-amber-300">STEP 3: GET PAID SOL</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Escrow transfers SOL coins directly to agent!</div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
          <button
            onClick={onOpenDeploy}
            className="px-5 py-3 rounded-xl font-bold font-mono text-xs tracking-wider uppercase bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black hover:opacity-95 shadow-lg shadow-[#14F195]/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Bot className="w-4 h-4 fill-current" />
            <span>+ DEPLOY CUSTOM AGENT</span>
          </button>

          <button
            onClick={onDeployDemo}
            disabled={isDeploying}
            className="px-5 py-3 rounded-xl font-bold font-mono text-xs tracking-wider uppercase bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center space-x-2 transition-all"
          >
            <Zap className={`w-4 h-4 text-amber-300 ${isDeploying ? 'animate-spin' : ''}`} />
            <span>{isDeploying ? 'DEPLOYING DEMO AGENT...' : '⚡ 1-CLICK DEMO AGENT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
