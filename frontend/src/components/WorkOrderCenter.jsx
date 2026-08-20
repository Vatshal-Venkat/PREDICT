import React from 'react';
import { FileText, AlertOctagon, CheckCircle2, Clock, Wrench, DollarSign, ShieldAlert, UserCheck, Package } from 'lucide-react';

export default function WorkOrderCenter({ workOrders }) {
  const getPriorityBadge = (priority) => {
    if (priority === 'CRITICAL_IMMEDIATE') {
      return 'bg-red-950/80 text-red-400 border-red-800/80';
    }
    if (priority === 'HIGH_PRIORITY') {
      return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
    }
    return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText size={20} className="text-amber-400" />
            Prescriptive Maintenance Work Order Dispatch Center
          </h2>
          <p className="text-xs text-slate-400">
            Automatically generated prescriptive tickets with repair steps, spare parts, technician role & financial savings
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
          {workOrders.length} Active Ticket(s)
        </span>
      </div>

      {workOrders.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 opacity-60" />
          <h3 className="text-lg font-semibold text-white">All Machinery Operating Normally</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No active maintenance work orders required. Inject simulated mechanical faults to generate prescriptive repair tickets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workOrders.map((wo, idx) => {
            const impact = wo.financial_impact || {};

            return (
              <div key={wo.work_order_id || idx} className="glass-card p-5 space-y-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-blue-400">{wo.work_order_id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{wo.machine_id}</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-1">{wo.action_title}</h4>
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold tracking-wide ${getPriorityBadge(wo.priority)}`}>
                      {wo.priority}
                    </span>
                  </div>

                  {/* Technician & Time Estimate */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck size={14} className="text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Assigned Technician</div>
                        <div className="font-semibold">{wo.required_skill}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock size={14} className="text-amber-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400">Est. Repair Time</div>
                        <div className="font-semibold">{wo.estimated_repair_time_hours} Hours</div>
                      </div>
                    </div>
                  </div>

                  {/* Required Spare Parts */}
                  <div className="space-y-1 mb-3">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Package size={14} className="text-indigo-400" />
                      Required Spare Parts
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(wo.required_spare_parts || []).map((part, pIdx) => (
                        <span key={pIdx} className="text-xs px-2.5 py-1 rounded bg-slate-900 text-slate-200 border border-slate-800">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Repair Steps */}
                  <div className="space-y-1 mb-4">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Wrench size={14} className="text-emerald-400" />
                      Step-by-Step Repair Guide
                    </div>
                    <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 pl-1 pt-1">
                      {(wo.step_by_step_guide || []).map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Financial Savings Impact Card */}
                <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/40 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} />
                      Financial Risk ROI
                    </span>
                    <span className="font-mono text-emerald-300 text-sm">
                      +${(impact.net_financial_savings || 0).toLocaleString()} Saved
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1 border-t border-emerald-900/60">
                    <div>Unplanned Failure Cost: <span className="text-red-400 font-mono">${(impact.unplanned_downtime_cost || 0).toLocaleString()}</span></div>
                    <div>Planned Repair Cost: <span className="text-emerald-400 font-mono">${(impact.planned_repair_cost || 0).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
