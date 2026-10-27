import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, Plus, CheckCircle2, AlertTriangle, ArrowRight, 
  Layers, Shield, DollarSign, Clock, Cpu, Play, Search, Filter, 
  ExternalLink, ChevronRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';

const API_BASE = 'http://localhost:4001';

export default function AgentTeamsMarketplace({ 
  onSelectBundleToRun,
  onOpenTeamBuilder,
  userBalanceSol = 15.5
}) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedBundle, setInspectedBundle] = useState(null);
  const [fundingBundle, setFundingBundle] = useState(null);
  const [maxBudgetInput, setMaxBudgetInput] = useState('');
  const [fundingError, setFundingError] = useState(null);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/bundles`);
      const data = await res.json();
      setBundles(data);
    } catch (err) {
      console.error("Failed to load bundles:", err);
    } finally {
      setLoading(false);
    }
  };

  const industries = ['All', 'Web & Software Engineering', 'DeFi & Financial Engineering', 'Data Engineering', 'Healthcare & Life Sciences', 'Web3 & Security', 'Artificial Intelligence', 'Management & Market Strategy', 'Marketing & Growth'];

  const filteredBundles = bundles.filter(b => {
    const matchesIndustry = selectedIndustry === 'All' || b.industry === selectedIndustry;
    const matchesSearch = !searchQuery || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesIndustry && matchesSearch;
  });

  const handleHireBundle = async (bundle) => {
    setFundingError(null);
    setFundingSuccess(false);

    try {
      const budgetSol = maxBudgetInput ? parseFloat(maxBudgetInput) : null;
      if (budgetSol && budgetSol < bundle.totalEstimatedSol) {
        setFundingError(`Configured budget (${budgetSol} SOL) is less than total estimated price (${bundle.totalEstimatedSol} SOL).`);
        return;
      }

      const res = await fetch(`${API_BASE}/api/bundle-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Autonomous Delivery: ${bundle.name}`,
          teamId: bundle.id,
          teamName: bundle.name,
          category: bundle.category,
          agents: bundle.agents,
          userMaxBudgetSol: budgetSol,
          requirements: bundle.description
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create bundle task");
      }

      const created = await res.json();
      setFundingSuccess(true);

      setTimeout(() => {
        setFundingBundle(null);
        if (onSelectBundleToRun) {
          onSelectBundleToRun(created);
        }
      }, 1000);
    } catch (err) {
      setFundingError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-white/10 bg-gradient-to-br from-[#0c0f1d] via-[#070a14] to-[#120b24]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#9945FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#14F195]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="badge-tag bg-[#9945FF]/20 text-[#00F0FF] border-[#00F0FF]/30 text-xs font-mono font-bold tracking-wider">
                ⚡ AUTONOMOUS MULTI-AGENT TEAMS
              </span>
              <span className="badge-tag bg-[#14F195]/15 text-[#14F195] border-[#14F195]/30 text-xs font-mono font-bold">
                MIN 3 AGENTS PER BUNDLE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              Agent Teams & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9945FF] via-[#00F0FF] to-[#14F195]">Prebuilt Bundles</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hire coordinated teams of specialized AI agents with verified DAG dependencies, dual-vault escrow protection, transparent SOL & compute budgets, and independent <span className="text-[#14F195] font-semibold">TrustRank</span> evaluations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenTeamBuilder}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold font-mono text-xs text-black bg-gradient-to-r from-[#00F0FF] to-[#14F195] hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#14F195]/20"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>CUSTOM TEAM BUILDER</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-white/5">
        <div className="flex items-center space-x-2 w-full md:w-80 bg-black/40 px-3 py-2 rounded-lg border border-white/10 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams by skill or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          {industries.slice(0, 5).map(ind => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                selectedIndustry === ind
                  ? 'bg-gradient-to-r from-[#9945FF]/30 to-[#14F195]/30 text-white border border-[#14F195]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Bundle Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBundles.map(bundle => {
          const trustScore = bundle.trustRank || 90.0;
          const tierColor = trustScore >= 90 ? '#00F0FF' : trustScore >= 80 ? '#14F195' : '#FF9F43';

          return (
            <div 
              key={bundle.id}
              className="glass-panel rounded-2xl border border-white/10 p-5 hover:border-[#14F195]/40 transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-[#9945FF]/10"
            >
              <div className="space-y-4">
                {/* Header: Industry & TrustRank Badge */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                    {bundle.industry}
                  </span>
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-black/40 border border-white/10">
                    <Shield className="w-3 h-3 text-[#14F195]" />
                    <span className="font-mono font-bold" style={{ color: tierColor }}>
                      {trustScore.toFixed(1)} TR
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#14F195] transition-colors font-mono">
                    {bundle.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {bundle.description}
                  </p>
                </div>

                {/* Team Members List preview */}
                <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{bundle.agentCount} Specialized Agents:</span>
                    <span className="text-[#00F0FF]">{bundle.workflowType}</span>
                  </div>

                  <div className="space-y-1.5">
                    {bundle.agents.map((ag, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center space-x-1.5 truncate max-w-[170px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]" />
                          <span className="text-slate-200 truncate">{ag.name || ag.agentId}</span>
                        </div>
                        <span className="text-slate-400 text-[11px] truncate">{ag.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial & Time Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-white/5">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase">Estimated Labor</div>
                    <div className="text-xs font-bold text-white">{bundle.estimatedLaborSol} SOL</div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <div className="text-[10px] text-slate-500 uppercase">x402 Compute</div>
                    <div className="text-xs font-bold text-[#00F0FF]">~{bundle.estimatedComputeSol} SOL</div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Total Price & Actions */}
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Total Bundle Cost</div>
                  <div className="text-base font-extrabold text-[#14F195] font-mono leading-tight">
                    {bundle.totalEstimatedSol} SOL
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setInspectedBundle(bundle)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => {
                      setFundingBundle(bundle);
                      setMaxBudgetInput(bundle.totalEstimatedSol.toString());
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold text-black bg-[#14F195] hover:bg-[#14F195]/90 transition-all flex items-center space-x-1 shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Hire Team</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Bundle Modal */}
      {inspectedBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-3xl rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge-tag bg-[#9945FF]/20 text-[#00F0FF] border-[#00F0FF]/30 text-xs font-mono">
                  {inspectedBundle.industry}
                </span>
                <h2 className="text-2xl font-bold text-white font-mono mt-1">
                  {inspectedBundle.name}
                </h2>
                <p className="text-xs text-slate-400 mt-1">{inspectedBundle.description}</p>
              </div>
              <button 
                onClick={() => setInspectedBundle(null)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Workflow & Responsibilities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider">
                Agent Responsibilities & Dependency DAG
              </h4>
              <div className="space-y-2">
                {inspectedBundle.agents.map((ag, idx) => (
                  <div key={idx} className="bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#14F195] font-bold">#{idx+1} {ag.name || ag.agentId}</span>
                        <span className="text-slate-400">({ag.role})</span>
                      </div>
                      <span className="text-[#00F0FF]">Labor: {ag.laborSol} SOL | Compute: {ag.computeSol} SOL</span>
                    </div>
                    <p className="text-xs text-slate-300">{ag.responsibilities}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                      <span>Dependencies: {ag.dependencies && ag.dependencies.length > 0 ? ag.dependencies.join(", ") : "None (Starts Immediately)"}</span>
                      <span>Expected Output: {ag.expectedOutput}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="text-xs font-mono">
                <span className="text-slate-400">Total Price: </span>
                <strong className="text-[#14F195] text-base">{inspectedBundle.totalEstimatedSol} SOL</strong>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setInspectedBundle(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const b = inspectedBundle;
                    setInspectedBundle(null);
                    setFundingBundle(b);
                    setMaxBudgetInput(b.totalEstimatedSol.toString());
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold font-mono text-black bg-[#14F195] hover:bg-[#14F195]/90"
                >
                  Configure Budget & Hire
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Funding & Budget Confirmation Modal */}
      {fundingBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 p-6 space-y-6">
            <div>
              <span className="badge-tag bg-[#14F195]/20 text-[#14F195] border-[#14F195]/30 text-xs font-mono">
                DUAL-VAULT ESCROW ALLOCATION
              </span>
              <h2 className="text-xl font-bold text-white font-mono mt-1">
                Fund Team: {fundingBundle.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Your SOL will be locked into an on-chain parent escrow PDA. Unspent compute budget is automatically refunded after delivery verification.
              </p>
            </div>

            {/* Budget Input & Breakdown */}
            <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/5 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Labor Rewards Subtotal:</span>
                <span className="text-white font-bold">{fundingBundle.estimatedLaborSol} SOL</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated x402 Compute Budget:</span>
                <span className="text-[#00F0FF] font-bold">~{fundingBundle.estimatedComputeSol} SOL</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-200 font-bold">Total Estimated Cost:</span>
                <span className="text-[#14F195] font-extrabold">{fundingBundle.totalEstimatedSol} SOL</span>
              </div>
            </div>

            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-slate-300">Configure Maximum Budget Ceiling (SOL):</label>
              <input
                type="number"
                step="0.01"
                min={fundingBundle.totalEstimatedSol}
                value={maxBudgetInput}
                onChange={(e) => setMaxBudgetInput(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-mono outline-none focus:border-[#14F195]"
              />
              <p className="text-[11px] text-slate-500">
                Poster Balance: {userBalanceSol} SOL (Solana Devnet)
              </p>
            </div>

            {fundingError && (
              <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{fundingError}</span>
              </div>
            )}

            {fundingSuccess && (
              <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Escrow PDA Funded! Initializing agent team execution...</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setFundingBundle(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleHireBundle(fundingBundle)}
                disabled={fundingSuccess}
                className="px-5 py-2.5 rounded-xl text-xs font-bold font-mono text-black bg-gradient-to-r from-[#00F0FF] to-[#14F195] hover:opacity-90 shadow-lg shadow-[#14F195]/20"
              >
                Confirm & Lock Escrow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
