import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, Zap, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function SignalXaiView({ selectedMachineId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSignalXai = async (mId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/signal/xai/${mId}`);
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
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', color: '#f8fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#38bdf8' }}>
            <Activity size={22} />
            Signal Diagnostics & Explainable AI (SHAP XAI): {selectedMachineId}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Fast Fourier Transform (FFT) vibration frequency spectrum & SHAP anomaly factor attribution breakdown.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* FFT Frequency Spectrum Graph */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} color="#38bdf8" />
              FFT Vibration Power Spectrum (0-500 Hz)
            </h3>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              Peak: {data?.fft_spectrum?.dominant_frequency_hz || 0} Hz
            </span>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fftChartData}>
                <defs>
                  <linearGradient id="fftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="frequency" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="amplitude" stroke="#38bdf8" fillOpacity={1} fill="url(#fftGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '0.75rem', background: '#0f172a', padding: '0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', border: '1px solid #334155' }}>
            <strong>Spectral Band Classification:</strong><br />
            <span style={{ color: '#f8fafc' }}>{data?.fft_spectrum?.band_classification || 'Analyzing spectral peaks...'}</span>
          </div>
        </div>

        {/* SHAP Feature Attribution Breakdown Cards */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart2 size={16} color="#f59e0b" />
            Explainable AI (SHAP Anomaly Factor Attribution)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.shap_contributions?.map((item, idx) => (
              <div key={idx} style={{ background: '#0f172a', padding: '0.75rem', borderRadius: '6px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{item.feature}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: item.contribution_pct > 35 ? '#ef4444' : (item.contribution_pct > 20 ? '#f59e0b' : '#10b981') }}>
                    +{item.contribution_pct}% Risk Impact
                  </span>
                </div>
                
                {/* Progress bar */}
                <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${item.contribution_pct}%`,
                      background: item.contribution_pct > 35 ? '#ef4444' : (item.contribution_pct > 20 ? '#f59e0b' : '#10b981'),
                      transition: 'width 0.4s ease'
                    }}
                  ></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                  <span>Current Value: {item.current_value}</span>
                  <span>Classification: {item.impact}</span>
                </div>
              </div>
            )) || <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Loading SHAP attributions...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
