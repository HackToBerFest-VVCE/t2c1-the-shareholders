import React, { useState } from 'react';
import { 
  Plus, Trash2, AlertTriangle, CheckCircle2, ArrowRight, 
  Shield, Cpu, DollarSign, Layers, Clock, Zap
} from 'lucide-react';

const API_BASE = 'http://localhost:4001';

export default function CustomTeamBuilder({ 
  availableAgents = [], 
  onTeamCreated,
  onCancel,
  userBalanceSol = 15.5
}) {
  const [teamName, setTeamName] = useState('');
  const [industry, setIndustry] = useState('Web & Software Engineering');
  const [requirements, setRequirements] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([
    {
      agentId: "agent_webdev_00",
      name: "WebCraft AI",
      role: "Frontend Engineer",
      responsibilities: "Scaffold responsive user interface and state connections",
      laborSol: 1.20,
      computeSol: 0.12,
      dependencies: []
    },
    {
      agentId: "agent_code_01",
      name: "SolGuard AI",
      role: "Backend & Smart Contract Engineer",
      responsibilities: "Design secure API endpoints and verify smart contract invariants",
      laborSol: 1.00,
      computeSol: 0.10,
      dependencies: []
    },
    {
      agentId: "agent_dataforge_04",
      name: "DataForge AI",
      role: "Data & Pipeline Engineer",
      responsibilities: "Normalize datasets, handle migrations, and maintain data schemas",
      laborSol: 0.80,
      computeSol: 0.08,
      dependencies: []
    }
  ]);

  const [maxBudgetSol, setMaxBudgetSol] = useState('4.50');
  const [validationError, setValidationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute pricing
  const totalLabor = selectedAgents.reduce((s, a) => s + (Number(a.laborSol) || 0), 0);
  const totalCompute = selectedAgents.reduce((s, a) => s + (Number(a.computeSol) || 0), 0);
  const totalCost = Number((totalLabor + totalCompute).toFixed(3));

  const handleAddAgent = (agent) => {
    if (selectedAgents.some(a => a.agentId === agent.id)) {
      setValidationError(`Agent ${agent.name} is already assigned to this team.`);
      return;
    }
    setValidationError(null);

    setSelectedAgents([
      ...selectedAgents,
      {
        agentId: agent.id,
        name: agent.name,
        role: `${agent.category} Specialist`,
        responsibilities: `Execute ${agent.category} tasks within team workflow`,
        laborSol: Number(agent.rate_sol || 1.00),
        computeSol: 0.10,
        dependencies: []
      }
    ]);
  };

  const handleRemoveAgent = (agentId) => {
    if (selectedAgents.length <= 3) {
      setValidationError("Teams must contain at least 3 agents. Minimum team threshold reached.");
      return;
    }
    setValidationError(null);
    setSelectedAgents(selectedAgents.filter(a => a.agentId !== agentId));
  };

  const handleUpdateAgentField = (index, field, value) => {
    const updated = [...selectedAgents];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setSelectedAgents(updated);
  };

  const handleCreateAndHire = async () => {
    setValidationError(null);

    if (!teamName.trim()) {
      setValidationError("Please provide a name for your custom agent team.");
      return;
    }

    if (selectedAgents.length < 3) {
      setValidationError("A team must contain at least 3 specialized agents.");
      return;
    }

    const budgetCeiling = parseFloat(maxBudgetSol);
    if (budgetCeiling && budgetCeiling < totalCost) {
      setValidationError(`Configured maximum budget (${budgetCeiling} SOL) is less than estimated cost (${totalCost} SOL).`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/api/bundle-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Custom Team: ${teamName}`,
          teamId: `custom_team_${Date.now()}`,
          teamName: teamName,
          category: industry,
          agents: selectedAgents,
          userMaxBudgetSol: budgetCeiling,
          requirements: requirements || "Custom multi-agent mission"
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create custom team task");
      }

      const created = await res.json();
      if (onTeamCreated) {
        onTeamCreated(created);
      }
    } catch (err) {
      setValidationError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/10 pb-5">
        <div>
          <span className="badge-tag bg-[#9945FF]/20 text-[#00F0FF] border-[#00F0FF]/30 text-xs font-mono font-bold">
            CUSTOM TEAM BUILDER
          </span>
          <h2 className="text-2xl font-bold text-white font-mono mt-1">
            Assemble Custom Agent Fleet
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build specialized teams of 3+ autonomous agents, assign responsibilities, and set escrow budgets in SOL.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Metadata Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="space-y-1.5">
          <label className="text-slate-300">Team Name:</label>
          <input
            type="text"
            placeholder="e.g. Apex E-Commerce Engineering Fleet"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#14F195]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-300">Target Industry / Domain:</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-[#14F195]"
          >
            <option value="Web & Software Engineering">Web & Software Engineering</option>
            <option value="DeFi & Financial Engineering">DeFi & Financial Engineering</option>
            <option value="Data Engineering">Data Engineering</option>
            <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
            <option value="Web3 & Security">Web3 & Security</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
          </select>
        </div>
      </div>

      {/* Selected Agents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Assigned Team Members ({selectedAgents.length} Agents)
            </h3>
            <span className="text-[11px] text-[#14F195] font-mono">(Min: 3 Required)</span>
          </div>
        </div>

        <div className="space-y-3">
          {selectedAgents.map((ag, idx) => (
            <div key={idx} className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#14F195]/20 text-[#14F195] text-xs font-mono font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-white font-mono">{ag.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveAgent(ag.agentId)}
                  className="text-red-400 hover:text-red-300 text-xs font-mono flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Assigned Role:</label>
                  <input
                    type="text"
                    value={ag.role}
                    onChange={(e) => handleUpdateAgentField(idx, 'role', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">Labor Reward (SOL):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={ag.laborSol}
                    onChange={(e) => handleUpdateAgentField(idx, 'laborSol', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px]">x402 Compute Budget (SOL):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ag.computeSol}
                    onChange={(e) => handleUpdateAgentField(idx, 'computeSol', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[#00F0FF] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <label className="text-slate-400 text-[11px]">Specific Responsibilities:</label>
                <input
                  type="text"
                  value={ag.responsibilities}
                  onChange={(e) => handleUpdateAgentField(idx, 'responsibilities', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Agents Selector */}
      <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
        <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
          + Add Agents from Registry
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableAgents
            .filter(a => !selectedAgents.some(sa => sa.agentId === a.id))
            .map(agent => (
              <button
                key={agent.id}
                onClick={() => handleAddAgent(agent)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center space-x-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#14F195]" />
                <span>{agent.name}</span>
                <span className="text-[#14F195]">({agent.rate_sol} SOL)</span>
              </button>
            ))}
        </div>
      </div>

      {/* Budget & Escrow Pricing Summary */}
      <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 font-mono">
            <div className="text-xs text-slate-400">Total Estimated Allocation:</div>
            <div className="text-xl font-extrabold text-[#14F195] leading-tight">
              {totalCost} SOL
            </div>
            <div className="text-[11px] text-slate-500">
              Labor: {totalLabor.toFixed(2)} SOL | Compute: ~{totalCompute.toFixed(2)} SOL
            </div>
          </div>

          <div className="space-y-1 font-mono w-full sm:w-64">
            <label className="text-xs text-slate-300">Set Maximum Budget Ceiling (SOL):</label>
            <input
              type="number"
              step="0.1"
              value={maxBudgetSol}
              onChange={(e) => setMaxBudgetSol(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#14F195]"
            />
          </div>
        </div>

        {validationError && (
          <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-white/5 text-slate-300"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleCreateAndHire}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-xs font-bold font-mono text-black bg-gradient-to-r from-[#00F0FF] to-[#14F195] hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shadow-[#14F195]/20"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isSubmitting ? "Locking Escrow..." : "Confirm & Hire Team"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
