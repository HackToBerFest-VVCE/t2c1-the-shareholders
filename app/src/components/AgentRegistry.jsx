import React, { useState } from 'react';
import { Bot, ShieldCheck, Award, TrendingUp, Users, CheckCircle, ExternalLink, Sparkles, Coins } from 'lucide-react';
import DeployDemoBanner from './DeployDemoBanner';

export default function AgentRegistry({ agents, onSelectAgentForEval, onOpenDeploy, onDeployDemo, isDeploying }) {
  const [backedAgents, setBackedAgents] = useState({});

  // Sort agents by score descending — highest rated appear first
  const sortedAgents = [...(agents || [])].sort((a, b) => (b.score || 0) - (a.score || 0));

  const handleBackAgent = (agentId) => {
    setBackedAgents(prev => ({
      ...prev,
      [agentId]: (prev[agentId] || 0) + 100
    }));
  };

  return (
    <div className="space-y-6">
      {/* Interactive Deploy Banner & Walkthrough */}
      <DeployDemoBanner 
        onOpenDeploy={onOpenDeploy} 
        onDeployDemo={onDeployDemo} 
        isDeploying={isDeploying} 
      />

      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Autonomous Agent Registry</span>
            <span className="badge-tag bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
              MPL AGENT IDENTITY VERIFIED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Agents register via Metaplex Core Agent Identity (Program 1DREGFgys...). Our Anchor contract CPI-reads the 40-byte PDA to verify legitimacy and settle SOL coin rewards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs font-mono text-slate-400 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5 space-y-0.5">
            <div>
              <span className="text-slate-500">Active Agents: </span>
              <span className="text-[#14F195] font-bold">{sortedAgents.length} Verified</span>
            </div>
            <div className="text-amber-400 font-bold text-[10px] flex items-center space-x-1">
              <span>⭐</span>
              <span>Ranked by TrustScore — Highest Rated First</span>
            </div>
          </div>

          {onOpenDeploy && (
            <button
              onClick={onOpenDeploy}
              className="px-3.5 py-2 rounded-xl font-mono text-xs font-bold bg-[#14F195]/10 hover:bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30 transition-all flex items-center space-x-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>+ Deploy Agent</span>
            </button>
          )}
        </div>
      </div>

      {/* Agents Grid — Sorted by TrustScore (Highest First) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedAgents.map((agent, rankIdx) => {
          const userBacking = backedAgents[agent.id] || 0;
          const displayBacking = (agent.total_backing_usdc || 500) + userBacking;
          const repPercentage = (agent.score / 100).toFixed(1);

          const rankMedal = rankIdx === 0 ? '🥇' : rankIdx === 1 ? '🥈' : rankIdx === 2 ? '🥉' : `#${rankIdx + 1}`;

          return (
            <div
              key={agent.id}
              className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-[#14F195]/40 transition-all relative overflow-hidden group"
            >
              {/* Rank position indicator */}
              <div className="absolute top-3 right-3 text-lg font-bold" title={`Rank #${rankIdx + 1} by TrustScore`}>
                {rankMedal}
              </div>

              {/* Top: Avatar, Name, Category */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <img
                      src={agent.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"}
                      alt={agent.name}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                      <ShieldCheck className="w-4 h-4 text-[#14F195]" />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      {agent.is_user_deployed && (
                        <span className="badge-tag bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/30 text-[9px] font-mono">
                          USER DEPLOYED
                        </span>
                      )}
                      <span className="badge-tag bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 inline" />
                        <span>MPL VERIFIED</span>
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {agent.status || "Available"}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-1.5">
                    <span>{agent.name}</span>
                  </h3>
                  <div className="text-xs font-mono text-[#9945FF] mt-0.5">
                    {agent.category}
                  </div>
                </div>

                {/* Asking Rate & Full Cost Breakdown in SOL & USDC */}
                <div className="mt-3 bg-gradient-to-r from-[#9945FF]/15 via-[#14F195]/10 to-transparent p-3 rounded-xl border border-[#14F195]/20 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-[#14F195]" />
                      <span>Base Asking Rate:</span>
                    </span>
                    <span className="text-white font-bold text-sm">
                      <strong className="text-[#14F195]">{agent.rate_sol || 1.00} SOL</strong>
                      <span className="text-slate-400 text-xs ml-1 font-normal">(${agent.rate_usdc || 200})</span>
                    </span>
                  </div>

                  {/* Price breakdown below */}
                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>x402 Compute Gas:</span>
                    <span className="text-[#9945FF] font-semibold">+{agent.rate_sol ? (agent.rate_sol * 0.05).toFixed(2) : '0.05'} SOL (${agent.rate_usdc ? (agent.rate_usdc * 0.05).toFixed(0) : '10'})</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-semibold">Total Price to Hire:</span>
                    <span className="text-[#14F195] font-bold">
                      {agent.rate_sol ? (agent.rate_sol * 1.05).toFixed(2) : '1.05'} SOL (${agent.rate_usdc ? (agent.rate_usdc * 1.05).toFixed(0) : '210'})
                    </span>
                  </div>
                </div>

                {/* Live Micro-Action Status */}
                <div className="mt-2.5 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 flex items-center space-x-2 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
                  <span className="text-slate-400">Active Action:</span>
                  <span className="text-slate-200 truncate font-semibold">
                    {agent.category?.includes("Web") 
                      ? "Scaffolding Responsive UI DOM" 
                      : (agent.category?.includes("Trade") 
                          ? "Scanning Raydium CLMM Ticks" 
                          : (agent.category?.includes("Code") 
                              ? "Fuzzing Anchor PDA Invariants" 
                              : "Modeling DePIN Hotspots"))}
                  </span>
                </div>

                {/* Score & Rep Bar */}
                <div className="mt-3 bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Reputation Score</span>
                    <span className="text-[#14F195] font-bold">{repPercentage}% ({agent.score} bps)</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#9945FF] to-[#14F195] h-full rounded-full transition-all duration-500"
                      style={{ width: `${repPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase">Tasks Completed</div>
                    <div className="text-sm font-bold text-white mt-0.5">{agent.tasks_completed || 0}</div>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase">Current SOL Balance</div>
                    <div className="text-sm font-bold text-[#14F195] mt-0.5">{agent.sol_balance || 0} SOL</div>
                  </div>
                </div>

                {/* Staking & Backing */}
                <div className="mt-2.5 bg-black/20 p-2.5 rounded-lg border border-white/5 text-xs font-mono flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Earned SOL / USDC</div>
                    <div className="font-semibold text-white">{agent.total_earned_sol || 0} SOL (${agent.total_earned_usdc || 0})</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Total Backing</div>
                    <div className="font-semibold text-[#14F195]">${displayBacking} USDC</div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <a
                  href={`https://explorer.solana.com/address/${agent.wallet}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-slate-400 hover:text-[#14F195] flex items-center space-x-1"
                >
                  <span className="truncate max-w-[90px]">{agent.wallet.slice(0, 4)}...{agent.wallet.slice(-4)}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>

                {onSelectAgentForEval && (
                  <button
                    onClick={() => onSelectAgentForEval(agent.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black hover:opacity-90 transition-all flex items-center space-x-1"
                  >
                    <span>⚡ Run Eval</span>
                  </button>
                )}

                <button
                  onClick={() => handleBackAgent(agent.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5 text-[#9945FF]" />
                  <span>+Back</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
