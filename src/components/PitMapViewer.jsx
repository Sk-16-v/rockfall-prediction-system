import React, { useEffect, useRef, useState } from 'react';
import { MINE_SECTORS, computeCustomLocationAnalysis } from '../data/mineData';
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Eye, Shield } from 'lucide-react';

export default function PitMapViewer({ selectedSector, onSelectSector }) {
  const canvasRef = useRef(null);
  const [heatmapMode, setHeatmapMode] = useState('probability'); // 'probability' | 'displacement' | 'normal'
  const [hoveredSector, setHoveredSector] = useState(null);

  // Render open pit topography and risk heatmaps on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0f18';
    ctx.fillRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Open-Pit Concentric Bench Terraces
    const centerX = width / 2;
    const centerY = height / 2;
    const rings = 8;

    for (let i = rings; i >= 1; i--) {
      const rx = (i * width * 0.42) / rings;
      const ry = (i * height * 0.42) / rings;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(18, 28, 45, ${0.1 + (rings - i) * 0.08})`;
      ctx.fill();
      ctx.strokeStyle = i % 2 === 0 ? '#1e385c' : '#142742';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Contour elevation labels
      ctx.fillStyle = '#47638a';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${200 + i * 40}m Elevation`, centerX + rx - 70, centerY - 5);
    }

    // Draw Haul Truck Roads (Spiral paths)
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    for (let a = 0; a < Math.PI * 4; a += 0.1) {
      const r = (a / (Math.PI * 4)) * (width * 0.4);
      const x = centerX + Math.cos(a) * r;
      const y = centerY + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Draw Heatmap Overlay if enabled
    MINE_SECTORS.forEach((sec) => {
      // Map lat/lng to canvas coordinates
      // Base Lat: 22.5726, Base Lng: 85.4312
      const x = centerX + (sec.lng - 85.4312) * 25000;
      const y = centerY - (sec.lat - 22.5726) * 25000;

      let radius = 60;
      let gradientColor = 'rgba(16, 185, 129, 0.35)'; // Stable Green

      if (heatmapMode === 'probability') {
        if (sec.probability >= 75) gradientColor = 'rgba(239, 68, 68, 0.55)'; // Critical Red
        else if (sec.probability >= 45) gradientColor = 'rgba(245, 158, 11, 0.45)'; // Warning Amber
      } else if (heatmapMode === 'displacement') {
        if (sec.displacementRate >= 10) gradientColor = 'rgba(239, 68, 68, 0.55)';
        else if (sec.displacementRate >= 4) gradientColor = 'rgba(245, 158, 11, 0.45)';
      }

      if (heatmapMode !== 'normal') {
        const radGrad = ctx.createRadialGradient(x, y, 5, x, y, radius);
        radGrad.addColorStop(0, gradientColor);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = radGrad;
        ctx.fill();
      }

      // Draw Node Pin Marker
      const isSelected = selectedSector?.id === sec.id;
      const isHovered = hoveredSector?.id === sec.id;

      // Glow effect if critical or selected
      if (isSelected || sec.riskLevel === 'CRITICAL') {
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 22 : 18, 0, 2 * Math.PI);
        ctx.fillStyle = sec.riskLevel === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(56, 189, 248, 0.3)';
        ctx.fill();
      }

      // Main Pin circle
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 12 : 9, 0, 2 * Math.PI);
      ctx.fillStyle = sec.riskLevel === 'CRITICAL' ? '#ef4444' : sec.riskLevel === 'WARNING' ? '#f59e0b' : '#10b981';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ffffff' : '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = isSelected ? 'bold 12px Inter' : '11px Inter';
      ctx.fillText(sec.name, x + 15, y + 4);
    });

  }, [heatmapMode, selectedSector, hoveredSector]);

  // Handle Clicking on Map -> Convert canvas click to Lat/Lng & Query AI
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check if clicked near an existing sector node
    let clickedSector = null;
    MINE_SECTORS.forEach((sec) => {
      const nodeX = centerX + (sec.lng - 85.4312) * 25000;
      const nodeY = centerY - (sec.lat - 22.5726) * 25000;
      const dist = Math.sqrt((clickX - nodeX) ** 2 + (clickY - nodeY) ** 2);
      if (dist <= 25) {
        clickedSector = sec;
      }
    });

    if (clickedSector) {
      onSelectSector(clickedSector);
    } else {
      // Calculate custom coordinates based on canvas offset
      const calcLng = 85.4312 + (clickX - centerX) / 25000;
      const calcLat = 22.5726 - (clickY - centerY) / 25000;
      const customAnalysis = computeCustomLocationAnalysis(calcLat, calcLng);
      if (customAnalysis) {
        onSelectSector(customAnalysis);
      }
    }
  };

  return (
    <div className="pit-map-wrapper glass-card">
      <div className="map-toolbar">
        <div className="map-title-bar">
          <Layers className="text-cyan" />
          <div>
            <h3>Open-Pit Interactive Topography & GIS Heatmap</h3>
            <p className="subtitle">Click anywhere on the map to extract spatial landform data and evaluate rockfall probability.</p>
          </div>
        </div>

        <div className="map-controls">
          <span className="control-label">Heatmap Overlay:</span>
          <div className="btn-toggle-group">
            <button 
              className={`toggle-btn ${heatmapMode === 'probability' ? 'active' : ''}`}
              onClick={() => setHeatmapMode('probability')}
            >
              <AlertTriangle size={14} />
              <span>Rockfall Risk</span>
            </button>

            <button 
              className={`toggle-btn ${heatmapMode === 'displacement' ? 'active' : ''}`}
              onClick={() => setHeatmapMode('displacement')}
            >
              <Eye size={14} />
              <span>Radar Displacement</span>
            </button>

            <button 
              className={`toggle-btn ${heatmapMode === 'normal' ? 'active' : ''}`}
              onClick={() => setHeatmapMode('normal')}
            >
              <Shield size={14} />
              <span>Topography Only</span>
            </button>
          </div>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          onClick={handleCanvasClick}
          className="pit-canvas"
        />

        <div className="map-overlay-legend">
          <h4 className="legend-title">Hazard Map Legend</h4>
          <div className="legend-items">
            <div className="legend-item"><span className="dot dot-red"></span> Critical Failure Zone (&gt;75%)</div>
            <div className="legend-item"><span className="dot dot-amber"></span> Warning Slope Area (45-75%)</div>
            <div className="legend-item"><span className="dot dot-green"></span> Stable Highwall (&lt;45%)</div>
            <div className="legend-item"><span className="line-dashed"></span> Primary Haul Ramp Road</div>
          </div>
          <div className="click-tip">💡 Click any slope zone or node to trigger AI Rockfall Scan</div>
        </div>
      </div>
    </div>
  );
}
