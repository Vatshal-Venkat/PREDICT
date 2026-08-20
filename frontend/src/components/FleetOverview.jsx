import React from 'react';
import { Cpu, ShieldCheck, AlertTriangle, AlertOctagon, DollarSign, Activity, Wrench, Clock } from 'lucide-react';

export default function FleetOverview({ summary, machines, selectedMachineId, onSelectMachine }) {
  const getBadgeClass = (status) => {
    if (status === 'Healthy') return 'badge-healthy';
    if (status === 'Degraded / Warning') return 'badge-warning';
    return 'badge-critical';
  };

  const getProgressColor = (health) => {
    if (health >= 70) return 'bg-emerald-500';
    if (health >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-800 text-blue-400">
            <Cpu size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{summary.total_machines || 0}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fleet Machines</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{summary.healthy_count || 0}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Healthy</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{summary.warning_count || 0}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Warning</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40">
            <AlertOctagon size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{summary.critical_count || 0}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Critical</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">${(summary.total_savings_usd || 0).toLocaleString()}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Risk Savings</div>
          </div>
        </div>
      </div>

      {/* Machine Fleet Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity size={20} className="text-blue-400" />
            Machine Fleet Health Matrix
          </h2>
          <span className="text-xs text-slate-400">Click any card to select for deep telemetry telemetry analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {machines.map((m) => {
            const isSelected = m.machine_id === selectedMachineId;

            return (
              <div
                key={m.machine_id}
                onClick={() => onSelectMachine(m.machine_id)}
                className={`glass-card p-4 cursor-pointer transition-all border ${
                  isSelected ? 'border-blue-500 ring-1 ring-blue-500 bg-slate-900/90' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{m.machine_id}</span>
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{m.type}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{m.location}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getBadgeClass(m.health_status)}`}>
                    {m.health_status}
                  </span>
                </div>

                {/* Health Index Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Health Index</span>
                    <span className="text-white font-mono">{m.health_index}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(m.health_index)}`}
                      style={{ width: `${Math.max(5, m.health_index)}%` }}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  <div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <Clock size={12} className="text-blue-400" />
                      Est. RUL
                    </div>
                    <div className="font-mono text-slate-200 mt-0.5 font-semibold">{m.predicted_rul_hours} hrs</div>
                  </div>
                  <div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <Wrench size={12} className="text-amber-400" />
                      Diagnosed Fault
                    </div>
                    <div className="font-mono text-slate-200 mt-0.5 font-semibold truncate" title={m.diagnosed_fault}>
                      {m.diagnosed_fault}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="truncate max-w-[200px]" title={m.recommendation}>{m.recommendation}</span>
                  <span className="text-blue-400 font-medium hover:underline flex items-center gap-0.5">
                    Inspect &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
