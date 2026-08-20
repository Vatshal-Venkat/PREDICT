import React from 'react';
import { Activity, Factory, RefreshCw, Server, Zap } from 'lucide-react';

export default function Header({ apiStatus, onReset, isResetting }) {
  return (
    <header className="glass-card mb-6 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
          <Factory size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Predictive Maintenance Platform
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              v2.0 Decoupled
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Multi-Agent Autonomous Telemetry Ingestion • Fault Diagnostics • RUL Forecasting • Prescriptive Work Orders
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <Server size={14} className={apiStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'} />
          <span className="text-slate-400">Backend API:</span>
          <span className={apiStatus === 'online' ? 'font-semibold text-emerald-400' : 'font-semibold text-amber-400'}>
            {apiStatus.toUpperCase()}
          </span>
        </div>

        <button
          onClick={onReset}
          disabled={isResetting}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isResetting ? 'animate-spin' : ''} />
          Reset Simulation
        </button>
      </div>
    </header>
  );
}
