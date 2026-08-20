import React, { useState, useEffect } from 'react';
import { Camera, Volume2, Search, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { API_BASE } from '../apiConfig';

export default function VisualAcousticInspector() {
  const [activeMode, setActiveMode] = useState('visual'); // 'visual' or 'acoustic'
  const [sampleId, setSampleId] = useState('def_front/cast_def_0_0.jpeg');
  const [castingImages, setCastingImages] = useState([]);
  const [inspectionResult, setInspectionResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/casting/images`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.images && data.images.length > 0) {
          setCastingImages(data.images);
          setSampleId(data.images[0].id);
        }
      })
      .catch((err) => console.error('Error fetching casting images:', err));
  }, []);

  const runInspection = async () => {
    setIsScanning(true);
    try {
      const res = await fetch(`${API_BASE}/api/multimodal/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspection_type: activeMode, sample_id: sampleId })
      });
      if (res.ok) {
        const json = await res.json();
        setInspectionResult(json.result);
      }
    } catch (err) {
      console.error('Error running multimodal inspection:', err);
    }
    setIsScanning(false);
  };

  return (
    <div className="card" style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="flex-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: '#38bdf8' }}>
            <Camera size={20} />
            Multimodal Visual & Acoustic Defect Inspector HUD
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '3px 0 0 0' }}>
            Integrated with Casting Defect Image Dataset (<code style={{ color: '#38bdf8' }}>casting_512x512</code>) & Acoustic Spectrogram Analyzer.
          </p>
        </div>

        {/* Mode Selector Segmented Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#050811', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => { setActiveMode('visual'); setInspectionResult(null); }}
            style={{
              background: activeMode === 'visual' ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: '#f8fafc',
              border: activeMode === 'visual' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Camera size={14} />
            Casting Optical Defect Vision
          </button>
          <button
            onClick={() => { setActiveMode('acoustic'); setInspectionResult(null); }}
            style={{
              background: activeMode === 'acoustic' ? 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: '#f8fafc',
              border: activeMode === 'acoustic' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Volume2 size={14} />
            Acoustic Noise Diagnostics
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Inspection Configuration Controls */}
        <div style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ImageIcon size={16} style={{ color: '#38bdf8' }} />
            {activeMode === 'visual' ? 'Casting Image Dataset Target' : 'Microphone Audio Target'}
          </h3>

          {activeMode === 'visual' ? (
            <div className="form-group">
              <label className="form-label">Select Casting Image Sample (casting_512x512)</label>
              <select
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                className="form-select"
              >
                {castingImages.length > 0 ? (
                  castingImages.map((img) => (
                    <option key={img.id} value={img.id} style={{ background: '#0c1322' }}>
                      {img.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="def_front/cast_def_0_0.jpeg" style={{ background: '#0c1322' }}>Defective Casting Impeller Front (cast_def_0_0.jpeg)</option>
                    <option value="ok_front/cast_ok_0_1018.jpeg" style={{ background: '#0c1322' }}>Nominal Casting Impeller Front (cast_ok_0_1018.jpeg)</option>
                    <option value="sample_bearing_scan" style={{ background: '#0c1322' }}>SKF 6205 Bearing Race Scan (Spalling Defect)</option>
                  </>
                )}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Microphone Audio Recording Target</label>
              <select
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
                className="form-select"
              >
                <option value="motor_hum_anomaly" style={{ background: '#0c1322' }}>Motor Suction Cavitation Whine (Anomalous)</option>
                <option value="motor_hum_normal" style={{ background: '#0c1322' }}>Smooth Induction Motor Resonance (Normal)</option>
              </select>
            </div>
          )}

          <button
            onClick={runInspection}
            disabled={isScanning}
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            <Search size={15} />
            {isScanning ? 'Running Neural Network Inference...' : `Execute ${activeMode === 'visual' ? 'Vision Model' : 'Acoustic Model'} Pass`}
          </button>

          {/* Sample Image Preview Box */}
          {activeMode === 'visual' && sampleId.includes('/') && (
            <div style={{ marginTop: '1rem', background: '#080d1a', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Casting Dataset Source Image</div>
              <img
                src={`${API_BASE}/api/casting/image/${sampleId}`}
                alt="Casting sample"
                style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.15)', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>

        {/* Inspection Inference Results Viewport */}
        <div style={{ background: '#050811', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', margin: '0 0 1rem 0' }}>
            Diagnostic Inference HUD Output
          </h3>

          {inspectionResult ? (
            activeMode === 'visual' ? (
              <div>
                <div style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: inspectionResult.defect_detected ? '#ef4444' : '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {inspectionResult.defect_detected ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                      {inspectionResult.defect_details.defect_type}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '4px', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', fontFamily: 'monospace', fontWeight: 600 }}>
                      Confidence: {(inspectionResult.defect_details.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                    {inspectionResult.defect_details.description}
                  </p>

                  <div style={{ background: '#050811', padding: '0.65rem', borderRadius: '4px', fontSize: '0.75rem', color: '#f8fafc', borderLeft: '3px solid #0284c7' }}>
                    <strong style={{ color: '#38bdf8' }}>Prescriptive Action:</strong> {inspectionResult.defect_details.recommended_action}
                  </div>
                </div>

                {/* Analyzed Image Render inside HUD */}
                {inspectionResult.image_url && (
                  <div style={{ background: '#080d1a', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600, marginBottom: '6px' }}>
                      Neural Inference Scan [Model: ResNet-50-Casting-Classifier]
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={inspectionResult.image_url}
                        alt="Scanned sample"
                        style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.15)' }}
                      />
                      {inspectionResult.defect_details.bounding_box && (
                        <div
                          style={{
                            position: 'absolute',
                            top: `${(inspectionResult.defect_details.bounding_box.y / 512) * 100}%`,
                            left: `${(inspectionResult.defect_details.bounding_box.x / 512) * 100}%`,
                            width: `${(inspectionResult.defect_details.bounding_box.width / 512) * 100}%`,
                            height: `${(inspectionResult.defect_details.bounding_box.height / 512) * 100}%`,
                            border: '2px solid #ef4444',
                            boxShadow: '0 0 8px #ef4444',
                            borderRadius: '2px',
                            pointerEvents: 'none'
                          }}
                        >
                          <span style={{ position: 'absolute', top: '-18px', left: 0, background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '1px 4px', fontWeight: 700, borderRadius: '2px', whiteSpace: 'nowrap' }}>
                            Defect {(inspectionResult.defect_details.confidence * 100).toFixed(0)}% [X:{inspectionResult.defect_details.bounding_box.x}, Y:{inspectionResult.defect_details.bounding_box.y}]
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: inspectionResult.anomaly_score > 0.5 ? '#ef4444' : '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {inspectionResult.anomaly_score > 0.5 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                      {inspectionResult.acoustic_status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                      Sound Level: {inspectionResult.decibel_level_db} dB
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 0.75rem 0' }}>
                    Identified Acoustic Profile: <strong style={{ color: '#f8fafc' }}>{inspectionResult.identified_sound}</strong>
                  </p>

                  <div style={{ background: '#050811', padding: '0.65rem', borderRadius: '4px', fontSize: '0.75rem', color: '#f8fafc', borderLeft: '3px solid #0284c7' }}>
                    <strong style={{ color: '#38bdf8' }}>Acoustic Recommendation:</strong> {inspectionResult.recommendation}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.82rem' }}>
              Select a casting image and click 'Execute Model Pass' to run computer vision inference.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
