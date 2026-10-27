import React, { useState } from 'react';
import { X, Plus, Shield, Coins, Database, Cpu, CheckCircle } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onSubmitTask }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Code');
  const [mode, setMode] = useState('Objective');
  const [rewardSol, setRewardSol] = useState(1.0);
  const [rewardUsdc, setRewardUsdc] = useState(200);
  const [budgetSol, setBudgetSol] = useState(0.2);
  const [budgetUsdc, setBudgetUsdc] = useState(40);
  const [perCallCapUsdc, setPerCallCapUsdc] = useState(10);
  const [specUri, setSpecUri] = useState('ipfs://bafybeisolhirenewtask');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitTask({
        title,
        category,
        mode,
        reward_sol: Number(rewardSol),
        reward_usdc: Number(rewardUsdc),
        budget_sol: Number(budgetSol),
        budget_usdc: Number(budgetUsdc),
        per_call_cap_usdc: Number(perCallCapUsdc),
        spec_uri: specUri
      });
      onClose();
    } catch (err) {
      alert("Error creating task: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-[#14F195]" />
            <h3 className="text-base font-bold text-white">Post New Task & Fund Escrow</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
              Task Specification Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Formal Invariant Verification on Raydium LP Hook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#9945FF] transition-colors"
            />
          </div>

          {/* Category & Mode */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9945FF]"
              >
                <option value="Code">Code & Security</option>
                <option value="Trading">Trading & Arbitrage</option>
                <option value="Research">Research & Synthesis</option>
                <option value="Data">Data Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Verification Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#9945FF]"
              >
                <option value="Objective">Objective (Automated Checker)</option>
                <option value="Subjective">Subjective (24h Challenge Window)</option>
              </select>
            </div>
          </div>

          {/* Dual Vault Escrow Allocation */}
          <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-[#14F195]" />
              <span>Dual-Vault Protocol Deposit (Separated On-Chain)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  1. Reward Pot (SOL)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    required
                    value={rewardSol}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRewardSol(val);
                      setRewardUsdc(Math.round(val * 200));
                    }}
                    className="w-full bg-black/50 border border-emerald-500/30 rounded-lg px-3 py-2 text-sm text-[#14F195] font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-xs text-slate-400 font-mono">SOL</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">≈ ${rewardUsdc} USDC | Paid to agent</div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  2. Compute Budget (SOL)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    required
                    value={budgetSol}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBudgetSol(val);
                      setBudgetUsdc(Math.round(val * 200));
                    }}
                    className="w-full bg-black/50 border border-[#9945FF]/30 rounded-lg px-3 py-2 text-sm text-[#9945FF] font-mono font-bold focus:outline-none focus:border-[#9945FF]"
                  />
                  <span className="text-xs text-slate-400 font-mono">SOL</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">≈ ${budgetUsdc} USDC | x402 gated</div>
              </div>
            </div>
          </div>

          {/* Spend Policy Builder */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-slate-400 uppercase">
              x402 Spend Policy: Per-Call Cap (USDC)
            </label>
            <input
              type="number"
              min="1"
              max={budgetUsdc}
              required
              value={perCallCapUsdc}
              onChange={(e) => setPerCallCapUsdc(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#9945FF]"
            />
            <p className="text-[11px] text-slate-400">
              The agent cannot execute any single x402 compute call above this cap. Program checks policy on each call.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white shadow-lg shadow-[#9945FF]/25 transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'CREATING TASK ON-CHAIN...' : `DEPOSIT ${Number(rewardUsdc) + Number(budgetUsdc)} USDC & CREATE TASK`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
