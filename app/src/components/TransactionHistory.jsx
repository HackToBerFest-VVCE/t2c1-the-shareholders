import React from 'react';
import { ExternalLink, CheckCircle, ArrowUpRight, ArrowDownLeft, Shield, Cpu, Database } from 'lucide-react';

export default function TransactionHistory({ transactions }) {
  const getTxTypeBadge = (type) => {
    switch (type) {
      case 'ESCROW_DEPOSIT':
        return <span className="badge-tag bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">ESCROW DEPOSIT</span>;
      case 'X402_SPEND':
        return <span className="badge-tag bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/20 text-[10px]">x402 CPI SPEND</span>;
      case 'REWARD_SETTLEMENT':
        return <span className="badge-tag bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">REWARD TRANSFER (SOL)</span>;
      case 'BUDGET_REFUND':
        return <span className="badge-tag bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">BUDGET REFUND</span>;
      default:
        return <span className="badge-tag bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px]">{type}</span>;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>On-Chain Transaction Ledger</span>
            <span className="badge-tag bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
              SOLANA DEVNET
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically signed transactions broadcasting escrow deposits, x402 compute fees, and final SOL settlement payouts.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
          <span>Fee: </span>
          <span className="text-[#14F195] font-semibold">0.000005 SOL / tx</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-white/5 pb-2">
              <th className="py-2.5 px-3 uppercase text-[10px]">Tx Signature</th>
              <th className="py-2.5 px-3 uppercase text-[10px]">Type</th>
              <th className="py-2.5 px-3 uppercase text-[10px]">Amount</th>
              <th className="py-2.5 px-3 uppercase text-[10px]">From / To</th>
              <th className="py-2.5 px-3 uppercase text-[10px]">Slot</th>
              <th className="py-2.5 px-3 uppercase text-[10px] text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {(transactions || []).map((tx, idx) => (
              <tr key={tx.signature || idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-white">
                  <a
                    href={tx.explorer_url || `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#14F195] hover:underline flex items-center space-x-1"
                  >
                    <span>{tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </td>
                <td className="py-3 px-3">
                  {getTxTypeBadge(tx.type)}
                </td>
                <td className="py-3 px-3">
                  <div className="font-bold text-white">
                    {tx.amount_sol !== undefined ? `${tx.amount_sol} SOL` : `${tx.amount} USDC`}
                  </div>
                  {tx.amount_usdc && (
                    <div className="text-[10px] text-slate-500">(${tx.amount_usdc} USDC)</div>
                  )}
                </td>
                <td className="py-3 px-3 text-[11px] text-slate-400">
                  <div className="truncate max-w-[180px]">{tx.from}</div>
                  <div className="text-slate-500">↓ {tx.to}</div>
                </td>
                <td className="py-3 px-3 text-slate-400">
                  #{tx.slot || 362820000}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirmed</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!transactions || transactions.length === 0) && (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            No on-chain transactions yet. Run an evaluation or post a task to generate transactions.
          </div>
        )}
      </div>
    </div>
  );
}
