import React, { useState } from 'react';
import { 
  Search, MapPin, AlertTriangle, ShieldCheck, Cpu, 
  Activity, ArrowRight, CornerDownRight, FileText, Zap, Compass, RefreshCw
} from 'lucide-react';
import { MINE_SECTORS, computeCustomLocationAnalysis } from '../data/mineData';

export default function AIAgentQuery({ selectedSector, onSelectSector, onOpenReport }) {
  const [customLat, setCustomLat] = useState('22.5784');
  const [customLng, setCustomLng] = useState('85.4351');
  const [naturalQuery, setNaturalQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'agent',
      text: 'Greetings. I am Terra-Guard AI, your Mine Geological Safety Assistant. Select a landform sector or input Latitude & Longitude to evaluate rock sliding probability and geotechnical hazard metrics.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle Sector Click
  const handleSectorSelect = (sector) => {
    onSelectSector(sector);
    setCustomLat(sector.lat.toString());
    setCustomLng(sector.lng.toString());
    
    // Add to conversation
    const newMsg = {
      sender: 'user',
      text: `Client requested full status report for landform area: "${sector.name}"`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const agentReply = {
      sender: 'agent',
      text: `Target Sector Loaded: ${sector.name} [Lat: ${sector.lat}°, Lng: ${sector.lng}°]. Rockfall Probability: ${sector.probability}%. Status: ${sector.riskLevel}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatLog((prev) => [...prev, newMsg, agentReply]);
  };

  // Handle Custom Coordinate Scan
  const handleCustomScan = (e) => {
    e.preventDefault();
    if (!customLat || !customLng) return;

    setIsAnalyzing(true);
    const userMessage = `Client Query: Requesting landform status at Lat ${customLat}°, Lng ${customLng}°`;
    setChatLog((prev) => [
      ...prev,
      { sender: 'user', text: userMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    setTimeout(() => {
      const result = computeCustomLocationAnalysis(customLat, customLng);
      if (result) {
        onSelectSector(result);
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: `AI Geological Scan Complete for (${customLat}°, ${customLng}°). Landform Type: ${result.type}. Rockslide Probability: ${result.probability}%. Hazard Level: ${result.riskLevel}.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      setIsAnalyzing(false);
    }, 600);
  };

  // Handle Natural Language Prompt
  const handleNaturalSubmit = (e) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    const text = naturalQuery;
    setNaturalQuery('');
    setIsAnalyzing(true);

    setChatLog((prev) => [
      ...prev,
      { sender: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    // Parse coordinates or sector keywords from query
    setTimeout(() => {
      const coordMatch = text.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
      let targetResult = null;

      if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        setCustomLat(lat);
        setCustomLng(lng);
        targetResult = computeCustomLocationAnalysis(lat, lng);
      } else {
        // Search sector keywords
        const found = MINE_SECTORS.find(s => 
          text.toLowerCase().includes(s.name.toLowerCase()) || 
          text.toLowerCase().includes(s.id.toLowerCase()) ||
          text.toLowerCase().includes('north') && s.name.includes('North') ||
          text.toLowerCase().includes('east') && s.name.includes('East') ||
          text.toLowerCase().includes('south') && s.name.includes('South') ||
          text.toLowerCase().includes('dump') && s.name.includes('Dump')
        );
        targetResult = found || selectedSector;
      }

      if (targetResult) {
        onSelectSector(targetResult);
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: `Evaluated Landform: ${targetResult.name}. Coordinates: (${targetResult.lat}°, ${targetResult.lng}°). Rockfall Probability: ${targetResult.probability}%. AI Directive: ${targetResult.recommendedAction}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      setIsAnalyzing(false);
    }, 700);
  };

  const getRiskBadgeClass = (risk) => {
    switch (risk) {
      case 'CRITICAL': return 'badge-risk-critical';
      case 'WARNING': return 'badge-risk-warning';
      default: return 'badge-risk-safe';
    }
  };

  return (
    <div className="ai-agent-container grid-layout-agent">
      {/* LEFT COLUMN: Client Query Controls & Sector Selection */}
      <div className="agent-control-panel glass-card">
        <div className="panel-header">
          <Cpu className="header-icon text-cyan" />
          <div>
            <h3>Landform Area Query Engine</h3>
            <p className="panel-subtitle">Select pit landform or input custom spatial coordinates</p>
          </div>
        </div>

        {/* Preset Landforms */}
        <div className="sector-preset-section">
          <label className="section-label">Select Pit Landform Bench / Slope:</label>
          <div className="preset-buttons-grid">
            {MINE_SECTORS.map((sec) => (
              <button
                key={sec.id}
                className={`preset-btn ${selectedSector?.id === sec.id ? 'active' : ''}`}
                onClick={() => handleSectorSelect(sec)}
              >
                <div className="preset-btn-top">
                  <span className="preset-name">{sec.name}</span>
                  <span className={`risk-pill ${getRiskBadgeClass(sec.riskLevel)}`}>
                    {sec.probability}%
                  </span>
                </div>
                <div className="preset-btn-coords">
                  <MapPin size={12} />
                  <span>{sec.lat}° N, {sec.lng}° E</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Latitude & Longitude Query Form */}
        <div className="custom-coord-form">
          <label className="section-label">Or Specify Particular Area Coordinates:</label>
          <form onSubmit={handleCustomScan} className="coord-input-grid">
            <div className="input-group">
              <span className="input-label">Latitude (°N)</span>
              <input
                type="text"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                placeholder="e.g. 22.5784"
                className="custom-input"
              />
            </div>
            <div className="input-group">
              <span className="input-label">Longitude (°E)</span>
              <input
                type="text"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                placeholder="e.g. 85.4351"
                className="custom-input"
              />
            </div>
            <button 
              type="submit" 
              className="scan-btn glowing-btn"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="spin" size={16} />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Run AI Scan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Natural Language Agent Interface */}
        <div className="natural-chat-section">
          <div className="chat-history-box">
            {chatLog.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                <div className="chat-meta">
                  <span className="chat-sender-name">
                    {msg.sender === 'agent' ? 'Terra-Guard AI' : 'Mine Engineer / Client'}
                  </span>
                  <span className="chat-time">{msg.time}</span>
                </div>
                <p className="chat-text">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleNaturalSubmit} className="chat-input-bar">
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="Ask AI agent (e.g. 'What is the rockfall probability at 22.578, 85.435?')"
              className="chat-input"
            />
            <button type="submit" className="chat-send-btn" disabled={isAnalyzing}>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Full Information & AI Rock Sliding Status Report */}
      <div className="agent-report-panel glass-card">
        {selectedSector ? (
          <div className="report-content">
            {/* Header Section */}
            <div className="report-header">
              <div className="report-title-area">
                <div className="location-pin-chip">
                  <MapPin size={16} className="text-amber" />
                  <span>LANDFORM AREA IDENTIFIER</span>
                </div>
                <h2 className="landform-title">{selectedSector.name}</h2>
                <p className="landform-type">{selectedSector.type}</p>
              </div>

              <button className="export-report-btn" onClick={() => onOpenReport(selectedSector)}>
                <FileText size={16} />
                <span>Export Safety Audit</span>
              </button>
            </div>

            {/* Latitude & Longitude Highlight Card */}
            <div className="coords-banner-card">
              <div className="coord-box">
                <Compass className="coord-icon" />
                <div>
                  <span className="coord-label">Latitude</span>
                  <span className="coord-value">{selectedSector.lat}° N</span>
                </div>
              </div>
              <div className="coord-divider"></div>
              <div className="coord-box">
                <Compass className="coord-icon" />
                <div>
                  <span className="coord-label">Longitude</span>
                  <span className="coord-value">{selectedSector.lng}° E</span>
                </div>
              </div>
              <div className="coord-divider"></div>
              <div className="coord-box">
                <Activity className="coord-icon" />
                <div>
                  <span className="coord-label">Elevation / Angle</span>
                  <span className="coord-value">{selectedSector.elevation}m MSL | {selectedSector.slopeAngle}°</span>
                </div>
              </div>
            </div>

            {/* Probability of Landslide / Rockfall Gauge Section */}
            <div className="probability-gauge-card">
              <div className="gauge-header">
                <div>
                  <span className="gauge-title">PROBABILITY OF ROCK SLIDING / LANDSLIDE</span>
                  <span className="gauge-subtitle">Predictive InSAR & Machine Learning Confidence Index</span>
                </div>
                <div className={`risk-badge-large ${getRiskBadgeClass(selectedSector.riskLevel)}`}>
                  {selectedSector.riskLevel === 'CRITICAL' && <AlertTriangle size={18} />}
                  {selectedSector.riskLevel === 'WARNING' && <AlertTriangle size={18} />}
                  {selectedSector.riskLevel === 'STABLE' && <ShieldCheck size={18} />}
                  <span>{selectedSector.riskLevel} HAZARD</span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="gauge-meter-wrapper">
                <div className="gauge-meter-bar">
                  <div 
                    className={`gauge-meter-fill ${selectedSector.riskLevel.toLowerCase()}`}
                    style={{ width: `${selectedSector.probability}%` }}
                  ></div>
                </div>
                <div className="gauge-percentage-display">
                  <span className="big-prob-number">{selectedSector.probability}%</span>
                  <span className="prob-caption">Probability of Slope Failure</span>
                </div>
              </div>
            </div>

            {/* Full Information Geotechnical Status Grid */}
            <div className="geotech-grid">
              <div className="geotech-card">
                <span className="metric-label">Shear Velocity (Displacement)</span>
                <span className={`metric-value ${selectedSector.displacementRate > 10 ? 'text-crimson' : 'text-cyan'}`}>
                  {selectedSector.displacementRate} mm/hr
                </span>
                <span className="metric-sub">InSAR Line-of-Sight Radar</span>
              </div>

              <div className="geotech-card">
                <span className="metric-label">Acoustic Micro-Fractures</span>
                <span className="metric-value text-amber">
                  {selectedSector.acousticEmission} events/min
                </span>
                <span className="metric-sub">Seismic Sensor Telemetry</span>
              </div>

              <div className="geotech-card">
                <span className="metric-label">Pore Water Pressure</span>
                <span className="metric-value text-blue">
                  {selectedSector.porePressure} kPa
                </span>
                <span className="metric-sub">Piezometer Ground Saturation</span>
              </div>

              <div className="geotech-card">
                <span className="metric-label">Rock Mass Rating (RMR)</span>
                <span className="metric-value">
                  {selectedSector.rmr} / 100
                </span>
                <span className="metric-sub">{selectedSector.rmr < 40 ? 'Poor Jointed Rock' : 'Good Rock Mass'}</span>
              </div>
            </div>

            {/* AI Status Description & Failure Mechanics */}
            <div className="ai-diagnosis-card">
              <h4 className="diagnosis-heading">
                <Cpu size={18} className="text-cyan" />
                <span>AI Geological Diagnosis & Rock Sliding Status</span>
              </h4>
              <p className="diagnosis-text">{selectedSector.statusDescription}</p>
              <div className="weather-chip">
                <span>Weather & Hydro-Impact: </span>
                <strong>{selectedSector.weatherImpact}</strong>
              </div>
            </div>

            {/* Recommended Safety Actions */}
            <div className={`ai-action-card ${selectedSector.riskLevel.toLowerCase()}`}>
              <h4 className="action-heading">
                <ShieldCheck size={18} />
                <span>Recommended Mine Safety Directives</span>
              </h4>
              <p className="action-text">{selectedSector.recommendedAction}</p>
            </div>
          </div>
        ) : (
          <div className="no-selection-placeholder">
            <Search size={48} className="placeholder-icon" />
            <h3>No Landform Selected</h3>
            <p>Select a preset sector on the left or enter Latitude and Longitude to generate full rockfall prediction details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
