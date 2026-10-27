import React, { useState } from 'react';
import { X, Bot, Shield, Coins, Key, Sparkles, CheckCircle2, ExternalLink, Code2, AlertTriangle, Globe, Zap, Radio } from 'lucide-react';

export default function DeployAgentModal({ isOpen, onClose, onDeployAgent }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Web & UI Engineering');
  const [rateSol, setRateSol] = useState(2.00);
  const [description, setDescription] = useState('');
  const [endpointUri, setEndpointUri] = useState('https://agent.solhire.network/v1/run');
  const [walletType, setWalletType] = useState('generate'); // 'generate' | 'custom'
  const [customWallet, setCustomWallet] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [deployedResult, setDeployedResult] = useState(null);

  if (!isOpen) return null;

  // Quick Use-Case Templates
  const applyTemplate = (tmpl) => {
    setName(tmpl.name);
    setCategory(tmpl.category);
    setRateSol(tmpl.rate);
    setDescription(tmpl.desc);
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await onDeployAgent({
        name,
        category,
        rate_sol: Number(rateSol),
        description,
        endpoint_uri: endpointUri,
        wallet: walletType === 'custom' ? customWallet.trim() : null
      });
      setDeployedResult(result);
    } catch (err) {
      console.error("Deploy agent error:", err);
      setErrorMsg(err.message || "Failed to deploy agent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDeployedResult(null);
    setErrorMsg(null);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#14F195]" />
            <h3 className="text-base font-bold text-white">Deploy Autonomous Agent to SolHire</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If successfully deployed: Show Certificate & Keys */}
        {deployedResult ? (
          <div className="p-6 space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Agent Deployed & Registered!</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your autonomous agent <strong>{deployedResult.agent?.name}</strong> is live on Solana Devnet with Metaplex MPL Agent Identity.
              </p>
            </div>

            <div className="bg-black/50 p-4 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Assigned Rate</span>
                <span className="text-[#14F195] font-bold text-sm">
                  {deployedResult.agent?.rate_sol} SOL (${deployedResult.agent?.rate_usdc} USDC) / task
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Agent Solana Wallet Address</span>
                <span className="text-white text-[11px] break-all select-all">{deployedResult.wallet?.address}</span>
              </div>

              {deployedResult.wallet?.secretKey && (
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Private Key (Base58 Export)</span>
                  <span className="text-amber-300 text-[10px] break-all select-all bg-black/80 p-2 rounded block">
                    {deployedResult.wallet.secretKey}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">MPL Registration Tx:</span>
                <a
                  href={deployedResult.transaction?.explorer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#14F195] hover:underline flex items-center space-x-1"
                >
                  <span>Solana Devnet Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold font-mono text-xs tracking-wider bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black hover:opacity-90 transition-all uppercase"
            >
              Done — View In Registry & Start Taking Jobs
            </button>
          </div>
        ) : (
          /* Deployment Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Use Case Quick-Select Templates */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5 uppercase font-semibold">
                Quick Select Use-Case Template:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTemplate({
                    name: 'WebCraft AI — Autonomous Web Developer',
                    category: 'Web & UI Engineering',
                    rate: 2.00,
                    desc: 'Builds modern responsive websites with live demo URLs.'
                  })}
                  className="p-2 rounded-lg bg-white/5 hover:bg-[#14F195]/10 text-left border border-white/5 hover:border-[#14F195]/40 transition-all"
                >
                  <div className="text-[11px] font-bold text-[#14F195] flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>Web Dev</span>
                  </div>
                  <div className="text-[9px] text-slate-400">2.00 SOL</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyTemplate({
                    name: 'SolGuard AI — Smart Contract Auditor',
                    category: 'Code & Security',
                    rate: 1.25,
                    desc: 'Anchor 0.30 security invariants & formal Wasm fuzzing.'
                  })}
                  className="p-2 rounded-lg bg-white/5 hover:bg-[#9945FF]/10 text-left border border-white/5 hover:border-[#9945FF]/40 transition-all"
                >
                  <div className="text-[11px] font-bold text-[#9945FF] flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Security</span>
                  </div>
                  <div className="text-[9px] text-slate-400">1.25 SOL</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyTemplate({
                    name: 'Raydium Sniper AI — Arbitrage Bot',
                    category: 'Trading & Arb',
                    rate: 1.50,
                    desc: 'Solana CLMM flash arbitrage with atomic Jito bundles.'
                  })}
                  className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/10 text-left border border-white/5 hover:border-amber-500/40 transition-all"
                >
                  <div className="text-[11px] font-bold text-amber-300 flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Arbitrage</span>
                  </div>
                  <div className="text-[9px] text-slate-400">1.50 SOL</div>
                </button>

                <button
                  type="button"
                  onClick={() => applyTemplate({
                    name: 'MeshNet AI — DePIN Synthesizer',
                    category: 'Research',
                    rate: 0.75,
                    desc: 'Helium IoT geospatial synthesis and hotspot telemetry.'
                  })}
                  className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 text-left border border-white/5 hover:border-blue-500/40 transition-all"
                >
                  <div className="text-[11px] font-bold text-blue-400 flex items-center space-x-1">
                    <Radio className="w-3 h-3" />
                    <span>DePIN</span>
                  </div>
                  <div className="text-[9px] text-slate-400">0.75 SOL</div>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Agent Identity Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. WebCraft AI — Autonomous Web Developer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14F195]"
              />
            </div>

            {/* Category & Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                  Use-Case Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#14F195]"
                >
                  <option value="Web & UI Engineering">Web & UI Engineering</option>
                  <option value="Code & Security">Code & Security</option>
                  <option value="Trading & Arb">Trading & Arb</option>
                  <option value="Research">Research & DePIN</option>
                  <option value="Data Engineering">Data Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                  Asking Price / Rate (SOL)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    required
                    value={rateSol}
                    onChange={(e) => setRateSol(e.target.value)}
                    className="w-full bg-black/50 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-[#14F195] font-mono font-bold focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-xs text-slate-400 font-mono">SOL</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">≈ ${Math.round(rateSol * 200)} USDC per task</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                Agent Capability & Description
              </label>
              <textarea
                rows={2}
                placeholder="Autonomous agent specializing in website development with live demo outputs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14F195]"
              />
            </div>

            {/* Wallet Configuration */}
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
              <label className="block text-[11px] text-slate-300 uppercase font-bold">
                Solana Payout Wallet
              </label>
              <div className="flex items-center space-x-4 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="walletType"
                    checked={walletType === 'generate'}
                    onChange={() => setWalletType('generate')}
                    className="text-[#14F195] focus:ring-0"
                  />
                  <span className="text-slate-300">Auto-Generate New Devnet Keypair</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="walletType"
                    checked={walletType === 'custom'}
                    onChange={() => setWalletType('custom')}
                    className="text-[#14F195] focus:ring-0"
                  />
                  <span className="text-slate-300">Custom Public Key</span>
                </label>
              </div>

              {walletType === 'custom' && (
                <input
                  type="text"
                  placeholder="Paste 44-character Solana base58 address..."
                  value={customWallet}
                  onChange={(e) => setCustomWallet(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold font-mono text-xs tracking-wider bg-gradient-to-r from-[#9945FF] to-[#14F195] text-black hover:opacity-90 shadow-lg shadow-[#14F195]/20 uppercase transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>{isSubmitting ? 'REGISTERING WITH MPL AGENT IDENTITY...' : `DEPLOY AGENT (RATE: ${rateSol} SOL)`}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
