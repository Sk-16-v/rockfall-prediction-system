import React from 'react';
import { ShieldCheck, MapPin, Printer, X, Award, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MINE_METADATA } from '../data/mineData';

export default function ReportModal({ sector, onClose }) {
  if (!sector) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="report-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-actions">
          <div className="modal-title-chip">
            <Award className="text-cyan" />
            <span>OFFICIAL MINE SAFETY AUDIT CERTIFICATE</span>
          </div>
          <div className="action-buttons">
            <button className="print-btn glowing-btn" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="printable-report-area" id="printable-report">
          <div className="certificate-header">
            <div className="company-logo-area">
              <ShieldCheck size={36} className="text-cyan" />
              <div>
                <h2>NATIONAL MINE SAFETY AUTHORITY</h2>
                <p>AI Geotechnical Rockfall Risk Audit & Compliance Division</p>
              </div>
            </div>
            <div className="cert-meta">
              <span className="cert-id">REPORT ID: TG-AI-2026-889</span>
              <span className="cert-date">Date: {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <hr className="divider" />

          {/* Section 1: Landform Location & Coordinates */}
          <div className="cert-section">
            <h3 className="section-title">1. Landform Area Specification</h3>
            <div className="cert-grid-2">
              <div className="cert-box">
                <span className="label">Mine Facility</span>
                <span className="val">{MINE_METADATA.name}</span>
              </div>
              <div className="cert-box">
                <span className="label">Target Landform Zone</span>
                <span className="val">{sector.name}</span>
              </div>
              <div className="cert-box">
                <span className="label">Exact Spatial Coordinates</span>
                <span className="val highlight">{sector.lat}° N, {sector.lng}° E</span>
              </div>
              <div className="cert-box">
                <span className="label">Geological Strata Type</span>
                <span className="val">{sector.type}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Rockfall Probability & Hazard Level */}
          <div className="cert-section">
            <h3 className="section-title">2. AI Rockfall & Landslide Probability Analysis</h3>
            <div className={`risk-cert-banner ${sector.riskLevel.toLowerCase()}`}>
              <div className="risk-banner-left">
                <span className="banner-label">EVALUATED HAZARD STATUS</span>
                <span className="banner-risk-level">{sector.riskLevel} RISK</span>
              </div>
              <div className="risk-banner-right">
                <span className="banner-prob-val">{sector.probability}%</span>
                <span className="banner-prob-sub">Probability of Failure</span>
              </div>
            </div>
          </div>

          {/* Section 3: Geotechnical Metric Table */}
          <div className="cert-section">
            <h3 className="section-title">3. Telemetry Sensor Measurements</h3>
            <table className="cert-table">
              <thead>
                <tr>
                  <th>Telemetry Metric</th>
                  <th>Observed Value</th>
                  <th>Threshold Standard</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>InSAR Radar Shear Velocity</td>
                  <td><strong>{sector.displacementRate} mm/hr</strong></td>
                  <td>5.0 mm/hr</td>
                  <td>
                    <span className={sector.displacementRate > 5 ? 'text-crimson' : 'text-emerald'}>
                      {sector.displacementRate > 5 ? 'EXCEEDED' : 'NORMAL'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Micro-Seismic Acoustic Events</td>
                  <td><strong>{sector.acousticEmission} events/min</strong></td>
                  <td>150 events/min</td>
                  <td>
                    <span className={sector.acousticEmission > 150 ? 'text-amber' : 'text-emerald'}>
                      {sector.acousticEmission > 150 ? 'HIGH FRACTURING' : 'STABLE'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Pore Water Pressure</td>
                  <td><strong>{sector.porePressure} kPa</strong></td>
                  <td>120 kPa</td>
                  <td>
                    <span className={sector.porePressure > 120 ? 'text-blue' : 'text-emerald'}>
                      {sector.porePressure > 120 ? 'SATURATED' : 'DRAINED'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Rock Mass Rating (RMR)</td>
                  <td><strong>{sector.rmr} / 100</strong></td>
                  <td>&gt; 50 (Good Rock)</td>
                  <td>{sector.rmr < 50 ? 'POOR GEOLOGICAL MASS' : 'STRONG'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Mandatory Action Directives */}
          <div className="cert-section">
            <h3 className="section-title">4. Mandatory AI Mine Safety Directives</h3>
            <p className="cert-directive-text">{sector.recommendedAction}</p>
          </div>

          {/* Verification Stamp Seal */}
          <div className="cert-footer">
            <div className="stamp-seal">
              <CheckCircle2 size={32} className="text-emerald" />
              <div>
                <strong>VERIFIED BY TERRA-GUARD AI ENGINE</strong>
                <p>Digital Cryptographic Audit Signature Valid</p>
              </div>
            </div>
            <div className="signature-box">
              <div className="sig-line"></div>
              <span>Chief Mining Safety Engineer Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
