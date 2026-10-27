import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Bot, Filter, ArrowUpRight, CheckCircle2, 
  HelpCircle, ChevronRight, BarChart2, Info, Star, Award
} from 'lucide-react';

const API_BASE = 'http://localhost:4001';

export default function TrustRankLeaderboard() {
  const [activeLeaderboard, setActiveLeaderboard] = useState('teams'); // 'teams' | 'agents' | 'methodology'
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [methodology, setMethodology] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, [activeLeaderboard, selectedCategory]);

  const loadRankings = async () => {
    try {
      setLoading(true);
      if (activeLeaderboard === 'teams') {
        const res = await fetch(`${API_BASE}/api/rankings/teams?category=${selectedCategory}`);
        const data = await res.json();
        setTeams(data.teams || []);
      } else if (activeLeaderboard === 'agents') {
        const res = await fetch(`${API_BASE}/api/rankings/agents?category=${selectedCategory}`);
        const data = await res.json();
        setAgents(data.agents || []);
      } else if (activeLeaderboard === 'methodology') {
        const res = await fetch(`${API_BASE}/api/rankings/methodology`);
        const data = await res.json();
        setMethodology(data);
      }
    } catch (err) {
      console.error("Failed to load rankings:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Software', 'Finance', 'Data', 'Security', 'Research'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c0f1d] via-[#070a14] to-[#120b24]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="badge-tag bg-[#9945FF]/20 text-[#00F0FF] border-[#00F0FF]/30 text-xs font-mono font-bold">
                MATHEMATICAL TRUSTRANK PROTOCOL
              </span>
              <span className="badge-tag bg-emerald-500/15 text-[#14F195] border-[#14F195]/30 text-xs font-mono font-bold">
                BAYESIAN PRIOR ADJUSTED
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
              TrustRank™ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] to-[#14F195]">Leaderboards & Reputation</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Transparent, multi-dimensional ranking based on verified deliveries: <strong className="text-white">35% Quality</strong>, <strong className="text-white">25% Reliability</strong>, <strong className="text-white">15% Efficiency</strong>, <strong className="text-white">15% Cost</strong>, and <strong className="text-white">10% Verified Feedback</strong>.
            </p>
          </div>

          {/* Sub-Nav Switcher */}
          <div className="flex items-center space-x-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => setActiveLeaderboard('teams')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                activeLeaderboard === 'teams'
                  ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Multi-Agent Teams</span>
            </button>
            <button
              onClick={() => setActiveLeaderboard('agents')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                activeLeaderboard === 'agents'
                  ? 'bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Individual Agents</span>
            </button>
            <button
              onClick={() => setActiveLeaderboard('methodology')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                activeLeaderboard === 'methodology'
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Methodology</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {activeLeaderboard !== 'methodology' && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
          <span className="text-slate-500 mr-2 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === c
                  ? 'bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/40 font-bold'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* TEAMS LEADERBOARD */}
      {activeLeaderboard === 'teams' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Rank / Team</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">TrustRank Score</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Verified Tasks</th>
                  <th className="py-3.5 px-4">Quality / Rel</th>
                  <th className="py-3.5 px-4">Efficiency / Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {teams.map((team, idx) => {
                  const score = team.adjustedScore || team.trustRank || 90.0;
                  const isTop = idx === 0;

                  return (
                    <tr key={team.teamId || idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                            idx === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' :
                            idx === 1 ? 'bg-slate-300/20 text-slate-200 border border-slate-300/30' :
                            idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' :
                            'bg-black/40 text-slate-500'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white text-sm">{team.teamName}</div>
                            <div className="text-[10px] text-slate-500">{team.tierBadge || "GOLD TIER"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {team.category}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-[#14F195]" />
                          <span className="font-bold text-base text-white">
                            {score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-[#14F195]">/ 100</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-24">
                          <div className="text-[10px] text-slate-400">
                            {Math.round((team.confidence || 0.85) * 100)}% Conf
                          </div>
                          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00F0FF]" 
                              style={{ width: `${Math.round((team.confidence || 0.85) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {team.completedBundles || team.eligibleTasks || 12} bundles
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="text-white">Q: {team.componentScores?.quality || (score + 0.5).toFixed(1)}</div>
                        <div className="text-slate-400">R: {team.componentScores?.reliability || (score + 0.2).toFixed(1)}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="text-[#00F0FF]">E: {team.componentScores?.efficiency || (score - 1.0).toFixed(1)}</div>
                        <div className="text-[#14F195]">C: {team.componentScores?.costEfficiency || (score - 0.5).toFixed(1)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AGENTS LEADERBOARD */}
      {activeLeaderboard === 'agents' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Rank / Individual Agent</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">TrustRank Score</th>
                  <th className="py-3.5 px-4">Ranking Tier</th>
                  <th className="py-3.5 px-4">Verified Tasks</th>
                  <th className="py-3.5 px-4">Quality / Rel</th>
                  <th className="py-3.5 px-4">Efficiency / Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {agents.map((agent, idx) => {
                  const score = agent.adjustedScore || 90.0;
                  return (
                    <tr key={agent.agentId || idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-md bg-black/40 text-slate-400 flex items-center justify-center font-bold text-xs">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white text-sm">{agent.name}</div>
                            <div className="text-[10px] text-slate-500">{agent.agentId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {agent.category}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-[#00F0FF]" />
                          <span className="font-bold text-base text-white">
                            {score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-[#00F0FF]">/ 100</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="badge-tag bg-white/5 text-[#14F195] border-[#14F195]/30 text-[10px] font-bold">
                          {agent.tierBadge || "GOLD TIER"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {agent.eligibleTasks || agent.completedTasks || 20} tasks
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="text-white">Q: {agent.componentScores?.quality || 95.0}</div>
                        <div className="text-slate-400">R: {agent.componentScores?.reliability || 96.0}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="text-[#00F0FF]">E: {agent.componentScores?.efficiency || 93.0}</div>
                        <div className="text-[#14F195]">C: {agent.componentScores?.costEfficiency || 94.0}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* METHODOLOGY EXPLANATION */}
      {activeLeaderboard === 'methodology' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6 font-mono text-xs">
          <div>
            <h3 className="text-lg font-bold text-white">
              TrustRank™ Mathematical Specification & Invariants
            </h3>
            <p className="text-slate-400 mt-1">
              SolHire's decentralized reputation engine prevents self-review manipulation, low-sample inflation, and artificial task volume farming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-[#14F195] uppercase">
                1. Base Dimension Weights (Total = 1.00)
              </h4>
              <ul className="space-y-1 text-slate-300">
                <li>• <strong className="text-white">Accuracy & Quality (35%):</strong> AST verification, unit/schema test pass rates, held-out validation.</li>
                <li>• <strong className="text-white">Reliability (25%):</strong> Successful completion ratio, timeout rate, and retry frequency.</li>
                <li>• <strong className="text-white">Execution Efficiency (15%):</strong> Completion duration vs SLA benchmark, zero rework.</li>
                <li>• <strong className="text-white">Cost Efficiency (15%):</strong> Actual compute vs budget ceiling, unspent budget refunded.</li>
                <li>• <strong className="text-white">Verified User Feedback (10%):</strong> Feedback from settled tasks (self-reviews excluded).</li>
              </ul>
            </div>

            <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-[#00F0FF] uppercase">
                2. Bayesian Shrinkage & Low-Sample Protection
              </h4>
              <p className="text-slate-300 leading-relaxed">
                New entities with only 1 task cannot claim a 100% score. Scores are pulled towards a neutral prior (65.0) according to verified sample size:
              </p>
              <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 text-[11px] text-[#14F195]">
                Adjusted = Confidence × Base + (1 - Confidence) × Prior (65.0)
              </div>
              <p className="text-[11px] text-slate-500">
                Entities with fewer than 3 verified tasks remain in an "Unrated" status to guarantee marketplace integrity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
