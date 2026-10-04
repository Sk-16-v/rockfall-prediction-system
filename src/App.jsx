import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AIAgentQuery from './components/AIAgentQuery';
import PitMapViewer from './components/PitMapViewer';
import TelemetryDashboard from './components/TelemetryDashboard';
import SlopeInspector3D from './components/SlopeInspector3D';
import ReportModal from './components/ReportModal';
import { MINE_SECTORS } from './data/mineData';
import { AlertOctagon, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('ai-agent'); // 'ai-agent' | 'pit-map' | 'telemetry' | 'slope-3d'
  const [selectedSector, setSelectedSector] = useState(MINE_SECTORS[0]); // Default to North Wall Bench 4
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSector, setReportSector] = useState(null);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  // Calculate critical risk sector count
  const criticalCount = MINE_SECTORS.filter(s => s.riskLevel === 'CRITICAL').length;

  // Synthesize Warning Alarm Siren using Web Audio API oscillator
  useEffect(() => {
    let oscillator = null;
    let gainNode = null;
    let timer = null;

    if (isSirenActive) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        oscillator = ctx.createOscillator();
        gainNode = ctx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();

        // Modulate siren pitch back and forth
        let high = false;
        timer = setInterval(() => {
          if (oscillator && ctx.state === 'running') {
            oscillator.frequency.exponentialRampToValueAtTime(high ? 600 : 950, ctx.currentTime + 0.4);
            high = !high;
          }
        }, 450);

        setAudioCtx(ctx);
      } catch (e) {
        console.error('Web Audio API not supported', e);
      }
    }

    return () => {
      if (timer) clearInterval(timer);
      if (oscillator) {
        try { oscillator.stop(); } catch(e){}
      }
    };
  }, [isSirenActive]);

  const toggleSiren = () => {
    setIsSirenActive(!isSirenActive);
  };

  const handleOpenReport = (sectorToReport) => {
    setReportSector(sectorToReport || selectedSector);
    setIsReportOpen(true);
  };

  return (
    <div className="app-layout">
      {/* Top Banner Alert if Critical Sector Active */}
      {selectedSector && selectedSector.riskLevel === 'CRITICAL' && (
        <div className="critical-hazard-banner">
          <div className="banner-alert-content">
            <AlertOctagon className="banner-icon spin-slow" />
            <div>
              <strong>CRITICAL HAZARD WARNING: {selectedSector.name.toUpperCase()}</strong>
              <span> - Rockfall failure probability at {selectedSector.probability}%. Shear velocity: {selectedSector.displacementRate} mm/hr.</span>
            </div>
          </div>
          <button className="banner-action-btn" onClick={() => handleOpenReport(selectedSector)}>
            View Evacuation Directive
          </button>
        </div>
      )}

      {/* Main Header & Navigation */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalCount={criticalCount}
        isSirenActive={isSirenActive}
        toggleSiren={toggleSiren}
      />

      {/* Main Content Body */}
      <main className="main-content">
        {activeTab === 'ai-agent' && (
          <AIAgentQuery
            selectedSector={selectedSector}
            onSelectSector={setSelectedSector}
            onOpenReport={handleOpenReport}
          />
        )}

        {activeTab === 'pit-map' && (
          <PitMapViewer
            selectedSector={selectedSector}
            onSelectSector={(sec) => {
              setSelectedSector(sec);
              setActiveTab('ai-agent'); // Switch to agent view on selection
            }}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryDashboard
            selectedSector={selectedSector}
          />
        )}

        {activeTab === 'slope-3d' && (
          <SlopeInspector3D
            selectedSector={selectedSector}
          />
        )}
      </main>

      {/* Printable Report Modal */}
      {isReportOpen && (
        <ReportModal
          sector={reportSector}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <span>TERRA-GUARD AI v3.4 | Open-Pit Rockfall Prediction System</span>
          <span className="footer-dot">•</span>
          <span>InSAR Radar & AI Engine Synchronized</span>
        </div>
        <div className="footer-right">
          <span>Client Query Node Active</span>
          <span className="live-indicator"></span>
        </div>
      </footer>
    </div>
  );
}
