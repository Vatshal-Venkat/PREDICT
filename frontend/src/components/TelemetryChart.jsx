import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Activity, Flame, Wind, Zap, Gauge as RpmIcon } from 'lucide-react';

export default function TelemetryChart({ machineId, history }) {
  const [activeSensor, setActiveSensor] = useState('vibration_rms');

  const sensors = [
    { key: 'vibration_rms', label: 'Vibration RMS (mm/s)', color: '#3b82f6', icon: Activity },
    { key: 'temperature', label: 'Bearing Temp (°C)', color: '#ef4444', icon: Flame },
    { key: 'pressure', label: 'Hydraulic Pressure (PSI)', color: '#06b6d4', icon: Wind },
    { key: 'motor_current', label: 'Motor Current (A)', color: '#f59e0b', icon: Zap },
    { key: 'rpm', label: 'Spindle Speed (RPM)', color: '#10b981', icon: RpmIcon },
  ];

  const currentSensor = sensors.find((s) => s.key === activeSensor) || sensors[0];

  return (
    <div className="card">
      <div className="flex-between" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        <div className="flex-gap-2">
          <Activity style={{ color: '#60a5fa' }} size={20} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>Real-Time Sensor Telemetry — {machineId}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live multi-channel sensor waveform monitoring ({history.length} frames ingested)</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#0f172a', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b' }}>
          {sensors.map((s) => {
            const Icon = s.icon;
            const isActive = activeSensor === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSensor(s.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: isActive ? '1px solid #334155' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon size={12} style={{ color: s.color }} />
                <span>{s.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '300px', width: '100%', paddingTop: '0.5rem' }}>
        {history && history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp_idx" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Simulation Step', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey={activeSensor}
                name={`${currentSensor.label}`}
                stroke={currentSensor.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No telemetry history available. Inject telemetry steps to generate signals.
          </div>
        )}
      </div>
    </div>
  );
}
