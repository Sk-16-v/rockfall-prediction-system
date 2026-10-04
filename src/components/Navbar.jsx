import React from 'react';
import { Activity, ShieldAlert, Cpu, Database, Satellite, Bell } from 'lucide-react';
import { MINE_METADATA } from '../data/mineData';

export default function Navbar({ activeTab, setActiveTab, criticalCount, isSirenActive, toggleSiren }) {
  return (
    <header className="navbar-container">
      <div className="navbar-top">
        <div className="brand-section">
          <div className="brand-logo">
            <Cpu className="logo-icon spin-slow" />
          </div>
          <div>
            <h1 className="brand-title">TERRA-GUARD AI</h1>
            <p className="brand-subtitle">AI-Based Rockfall Prediction & Alert Platform | Open-Pit Mines</p>
          </div>
        </div>

        <div className="telemetry-bar">
          <div className="telemetry-item">
            <Satellite className="telemetry-icon pulse" />
            <div>
              <span className="telemetry-label">Radar Status</span>
              <span className="telemetry-value text-emerald">InSAR Synchronized</span>
            </div>
          </div>

          <div className="telemetry-item">
            <Database className="telemetry-icon" />
            <div>
              <span className="telemetry-label">Active Mine</span>
              <span className="telemetry-value">{MINE_METADATA.name}</span>
            </div>
          </div>

          <div className="telemetry-item">
            <Activity className="telemetry-icon" />
            <div>
              <span className="telemetry-label">Sensors Online</span>
              <span className="telemetry-value">{MINE_METADATA.activeSensors} Nodes</span>
            </div>
          </div>

          {criticalCount > 0 && (
            <button 
              className={`siren-button ${isSirenActive ? 'siren-active' : ''}`}
              onClick={toggleSiren}
              title="Toggle Emergency Hazard Alarm Siren"
            >
              <Bell className="siren-icon" />
              <span>{isSirenActive ? 'SIREN ON' : 'TEST SIREN'}</span>
            </button>
          )}
        </div>
      </div>

      <nav className="navbar-tabs">
        <button 
          className={`tab-button ${activeTab === 'ai-agent' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-agent')}
        >
          <Cpu size={18} />
          <span>AI Safety Agent Query</span>
          <span className="badge-chip glow">Client Request</span>
        </button>

        <button 
          className={`tab-button ${activeTab === 'pit-map' ? 'active' : ''}`}
          onClick={() => setActiveTab('pit-map')}
        >
          <Satellite size={18} />
          <span>Interactive GIS Pit Map</span>
        </button>

        <button 
          className={`tab-button ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Activity size={18} />
          <span>Real-time Telemetry</span>
        </button>

        <button 
          className={`tab-button ${activeTab === 'slope-3d' ? 'active' : ''}`}
          onClick={() => setActiveTab('slope-3d')}
        >
          <ShieldAlert size={18} />
          <span>3D Slope Fracture Canvas</span>
        </button>
      </nav>
    </header>
  );
}
