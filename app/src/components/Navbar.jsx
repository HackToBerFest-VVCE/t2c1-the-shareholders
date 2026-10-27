import React from 'react';
import { Bot, Zap, PlusCircle, Wallet, ShieldCheck, Activity, Globe, Plus, ExternalLink } from 'lucide-react';

export default function Navbar({ 
  stats, 
  blockchain, 
  posterWallet, 
  isConnected, 
  onOpenCreate, 
  onRunDemo, 
  isRunningDemo,
  onTopUpFaucet,
  onOpenDeploy
}) {
  const posterSol = posterWallet ? Number(posterWallet.sol_balance).toFixed(3) : '15.500';
  const posterAddr = posterWallet?.address || '9xUS59AspnXsK4mn1Lebb5hozUyXei5kQBrmYUDwuqNb';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Network Badge */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9945FF] to-[#14F195] p-0.5 flex items-center justify-center shadow-lg shadow-[#9945FF]/20">
              <div className="w-full h-full bg-[#070A11] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#14F195]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                  SOL<span className="text-[#14F195]">HIRE</span>
                </span>
                <span className="badge-tag bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30 font-mono text-[10px]">
                  SOLANA DEVNET
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                On-Chain Autonomous AI Agent Labor & Escrow
              </p>
            </div>
          </div>

          {/* Mobile Faucet Button */}
          <button
            onClick={onTopUpFaucet}
            className="md:hidden px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-[#14F195] border border-emerald-500/30"
          >
            +5 SOL
          </button>
        </div>

        {/* Center: Live Blockchain Devnet Status Bar */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/5">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-slate-300">
              Slot: <strong className="text-white">#{blockchain?.slot ? Number(blockchain.slot).toLocaleString() : '362,820,140'}</strong>
            </span>
          </div>

          <div className="h-3 w-px bg-white/10" />

          <div className="text-slate-400">
            Epoch: <strong className="text-slate-200">{blockchain?.epoch || 712}</strong>
          </div>

          <div className="h-3 w-px bg-white/10" />

          <div className="text-slate-400">
            TPS: <strong className="text-[#14F195]">2,840</strong>
          </div>
        </div>

        {/* Right: Wallet Balance & Actions */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          {/* Poster Wallet SOL Balance & Top-up */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono">
            <div className="mr-2.5">
              <div className="text-[9px] text-slate-500 uppercase leading-none">Poster Wallet</div>
              <div className="text-xs font-bold text-[#14F195] leading-snug">
                {posterSol} SOL
              </div>
            </div>
            <button
              onClick={onTopUpFaucet}
              title="Add 5 Devnet SOL for testing"
              className="p-1 rounded-md bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-white/5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Deploy Agent Button */}
          {onOpenDeploy && (
            <button
              onClick={onOpenDeploy}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wide bg-[#14F195]/15 hover:bg-[#14F195]/25 text-[#14F195] border border-[#14F195]/40 transition-all shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>+ DEPLOY AGENT</span>
            </button>
          )}

          {/* 1-Click Autonomous Demo */}
          <button
            onClick={onRunDemo}
            disabled={isRunningDemo}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              isRunningDemo
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                : 'bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-95 text-black font-mono shadow-lg shadow-[#9945FF]/20'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isRunningDemo ? 'animate-spin text-amber-300' : 'text-black fill-current'}`} />
            <span>{isRunningDemo ? 'RUNNING DEMO...' : '1-CLICK DEMO'}</span>
          </button>

          {/* Post Task Button */}
          <button
            onClick={onOpenCreate}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#14F195]" />
            <span>POST TASK</span>
          </button>
        </div>
      </div>
    </header>
  );
}
