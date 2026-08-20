import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { API_BASE } from '../apiConfig';

export default function SignalXaiView({ selectedMachineId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSignalXai = async (mId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/signal/xai/${mId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching Signal XAI data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedMachineId) {
      fetchSignalXai(selectedMachineId);
    }
  }, [selectedMachineId]);

  const fftChartData = data?.fft_spectrum?.frequencies?.map((freq, idx) => ({
    frequency: `${freq} Hz`,
    amplitude: data.fft_spectrum.amplitudes[idx] || 0
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card" style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="flex-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#38bdf8' }}>
              <Activity size={20} />
              Signal Diagnostics & Explainable AI (SHAP XAI): {selectedMachineId}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '3px 0 0 0' }}>
              Fast Fourier Transform (FFT) spectral power density & SHAP anomaly factor risk attribution breakdown.
            </p>
          </div>
        </div>

        <div className="grid-2">
          {/* FFT Frequency Spectrum Graph */}
          <div style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Zap size={15} color="#38bdf8" />
                FFT Vibration Power Spectrum (0-500 Hz)
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                Dominant Peak: {data?.fft_spectrum?.dominant_frequency_hz || 0} Hz
              </span>
            </div>

            <div style={{ height: '230px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fftChartData}>
                  <defs>
                    <linearGradient id="fftGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis dataKey="frequency" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="amplitude" stroke="#38bdf8" fillOpacity={1} fill="url(#fftGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '0.85rem', background: '#080d1a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <strong style={{ color: '#f8fafc' }}>Spectral Band Classification:</strong><br />
              <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{data?.fft_spectrum?.band_classification || 'Analyzing spectral peaks...'}</span>
            </div>
          </div>

          {/* SHAP Feature Attribution Breakdown Cards */}
          <div style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart2 size={15} color="#f59e0b" />
              Explainable AI (SHAP Anomaly Risk Attribution)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data?.shap_contributions?.map((item, idx) => (
                <div key={idx} style={{ background: '#080d1a', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{item.feature}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace', color: item.contribution_pct > 35 ? '#ef4444' : (item.contribution_pct > 20 ? '#f59e0b' : '#10b981') }}>
                      +{item.contribution_pct}% Risk Impact
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${item.contribution_pct}%`,
                        background: item.contribution_pct > 35 ? 'linear-gradient(90deg, #dc2626, #ef4444)' : (item.contribution_pct > 20 ? 'linear-gradient(90deg, #d97706, #f59e0b)' : 'linear-gradient(90deg, #059669, #10b981)'),
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    <span>Value: {item.current_value}</span>
                    <span>Classification: {item.impact}</span>
                  </div>
                </div>
              )) || <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Loading SHAP attributions...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
