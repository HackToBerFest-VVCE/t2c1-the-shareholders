import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Terminal, CheckCircle2, AlertTriangle, Clock, Cpu, 
  ExternalLink, Layers, ArrowRight, Shield, RefreshCw, Zap
} from 'lucide-react';

const API_BASE = 'http://localhost:4001';

export default function TeamExecutionDashboard({ 
  initialBundleTask = null,
  onOpenAnotherTeam
}) {
  const [task, setTask] = useState(initialBundleTask);
  const [events, setEvents] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (initialBundleTask) {
      setTask(initialBundleTask);
      loadTaskDetails(initialBundleTask.id);
      subscribeToEvents(initialBundleTask.id);
    }
  }, [initialBundleTask]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const loadTaskDetails = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/api/bundle-tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data);
        if (data.events) {
          setEvents(data.events);
        }
      }
    } catch (err) {
      console.error("Failed to load bundle task:", err);
    }
  };

  const subscribeToEvents = (taskId) => {
    const sse = new EventSource(`${API_BASE}/api/bundle-tasks/${taskId}/events`);
    sse.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data);
        setEvents(prev => {
          if (prev.some(p => p.id === evt.id)) return prev;
          return [...prev, evt];
        });
      } catch (err) {}
    };
    return () => sse.close();
  };

  const handleStartExecution = async () => {
    if (!task) return;
    setIsExecuting(true);
    try {
      await fetch(`${API_BASE}/api/bundle-tasks/${task.id}/execute`, {
        method: 'POST'
      });
      // Poll periodically until complete
      const poller = setInterval(async () => {
        const res = await fetch(`${API_BASE}/api/bundle-tasks/${task.id}`);
        if (res.ok) {
          const updated = await res.json();
          setTask(updated);
          if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
            setIsExecuting(false);
            clearInterval(poller);
          }
        }
      }, 1500);
    } catch (err) {
      console.error("Execution trigger failed:", err);
      setIsExecuting(false);
    }
  };

  if (!task) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 space-y-4">
        <Layers className="w-12 h-12 text-[#9945FF] mx-auto animate-pulse" />
        <h3 className="text-xl font-bold text-white font-mono">No Active Team Execution Selected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Hire a prebuilt bundle or construct a custom agent team to observe live parallel execution, streaming telemetry, and final deliverable aggregation.
        </p>
        {onOpenAnotherTeam && (
          <button
            onClick={onOpenAnotherTeam}
            className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-black bg-[#14F195] hover:bg-[#14F195]/90 transition-all"
          >
            Browse Agent Teams
          </button>
        )}
      </div>
    );
  }

  const isCompleted = task.status === 'COMPLETED';
  const childTasks = task.childTasks || [];
  const completedCount = childTasks.filter(c => c.status === 'COMPLETED').length;
  const progressPercent = childTasks.length > 0 ? Math.round((completedCount / childTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Task Status & Metrics */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`badge-tag text-xs font-mono font-bold ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : task.status === 'RUNNING'
                  ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                {task.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Task ID: #{task.id}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white font-mono">
              {task.teamName}
            </h2>
            <p className="text-xs text-slate-300 font-mono">
              Parent Escrow PDA: <span className="text-[#00F0FF]">{task.parentEscrowPda}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {task.status === 'FUNDED' && (
              <button
                onClick={handleStartExecution}
                disabled={isExecuting}
                className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-black bg-gradient-to-r from-[#00F0FF] to-[#14F195] hover:opacity-90 flex items-center space-x-2 shadow-lg shadow-[#14F195]/20"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isExecuting ? "Executing Team..." : "Launch Team Execution"}</span>
              </button>
            )}

            {isCompleted && task.finalDeliverable?.primaryDemoUrl && (
              <a
                href={task.finalDeliverable.primaryDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-black bg-[#14F195] hover:bg-[#14F195]/90 flex items-center space-x-2 shadow-lg shadow-[#14F195]/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>OPEN LIVE DELIVERABLE</span>
              </a>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Coordinated Team Progress ({completedCount} of {childTasks.length} Agents Finished)</span>
            <span className="text-[#14F195] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-[#9945FF] via-[#00F0FF] to-[#14F195] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-3 border-t border-white/5">
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">Labor Escrow</div>
            <div className="text-xs font-bold text-white">{task.totalLaborSol} SOL</div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">Compute Vault</div>
            <div className="text-xs font-bold text-[#00F0FF]">{task.totalComputeSol} SOL</div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">Actual Compute Spent</div>
            <div className="text-xs font-bold text-amber-400">{(task.actualComputeSol || 0).toFixed(3)} SOL</div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">Unspent Refunded</div>
            <div className="text-xs font-bold text-[#14F195]">{(task.unspentRefundSol || 0).toFixed(3)} SOL</div>
          </div>
        </div>
      </div>

      {/* Grid: Agent Child Tasks + Live Terminal Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agent Subtasks Cards */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            Agent Subtasks & Roles ({childTasks.length})
          </h3>

          <div className="space-y-2.5">
            {childTasks.map((child, idx) => {
              const isChildDone = child.status === 'COMPLETED';
              const isChildRunning = child.status === 'RUNNING';

              return (
                <div 
                  key={child.id || idx}
                  className={`p-3.5 rounded-xl border transition-all text-xs font-mono ${
                    isChildDone 
                      ? 'bg-emerald-500/5 border-emerald-500/20' 
                      : isChildRunning
                      ? 'bg-[#00F0FF]/10 border-[#00F0FF]/40'
                      : 'bg-black/40 border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white truncate max-w-[170px]">
                      {child.name || child.agentId}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      isChildDone ? 'text-emerald-400' : isChildRunning ? 'text-[#00F0FF] animate-pulse' : 'text-slate-500'
                    }`}>
                      {child.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#14F195] font-semibold">{child.role}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{child.responsibilities}</div>

                  {child.deliverableHash && (
                    <div className="text-[9px] text-slate-500 mt-2 truncate">
                      Proof Hash: {child.deliverableHash}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Streaming Execution Terminal */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/10 flex flex-col h-[520px] bg-black/60 overflow-hidden font-mono">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10 text-xs">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#14F195]" />
              <span className="text-white font-bold">Orchestrator Real-Time Telemetry</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#14F195] animate-ping" />
                <span>SSE LIVE</span>
              </span>
              <span>{events.length} Events</span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs">
            {events.length === 0 ? (
              <div className="text-slate-500 text-center py-20">
                Awaiting orchestrator launch. Click "Launch Team Execution" to start dispatching agent subtasks.
              </div>
            ) : (
              events.map((evt, i) => {
                let color = "text-slate-300";
                if (evt.level === "success") color = "text-[#14F195]";
                if (evt.level === "warn") color = "text-amber-400";
                if (evt.level === "cmd") color = "text-[#00F0FF]";
                if (evt.level === "metric") color = "text-[#9945FF] font-bold";

                return (
                  <div key={evt.id || i} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-slate-600 text-[10px] shrink-0">
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : '00:00:00'}
                    </span>
                    <span className="text-slate-400 shrink-0 font-bold">
                      [{evt.agentName || evt.agentId}]:
                    </span>
                    <span className={`${color} break-all`}>
                      {evt.text}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>

      {/* Completed Consolidated Deliverable Dossier */}
      {isCompleted && task.finalDeliverable && (
        <div className="glass-panel p-6 rounded-2xl border border-[#14F195]/40 bg-gradient-to-br from-[#070a14] to-[#0c1815] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="badge-tag bg-emerald-500/20 text-[#14F195] border-[#14F195]/30 text-xs font-mono font-bold">
                ✓ VERIFIED FINAL DELIVERABLE
              </span>
              <h3 className="text-xl font-bold text-white font-mono mt-1">
                {task.finalDeliverable.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                On-Chain Commitment: {task.finalDeliverable.onChainCommitment}
              </p>
            </div>

            {task.finalDeliverable.primaryDemoUrl && (
              <a
                href={task.finalDeliverable.primaryDemoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-black bg-[#14F195] hover:bg-[#14F195]/90 flex items-center space-x-2 shadow-lg shadow-[#14F195]/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>INSPECT DELIVERABLE</span>
              </a>
            )}
          </div>

          <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-xs font-mono whitespace-pre-line text-slate-200 leading-relaxed">
            {task.finalDeliverable.summary}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-white/5">
            <span>Deliverable SHA-256 Hash: <strong className="text-[#00F0FF]">{task.finalDeliverable.hash}</strong></span>
            <span className="text-[#14F195]">Status: {task.finalDeliverable.verificationStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
}
