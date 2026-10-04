import React, { useEffect, useRef, useState } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, Play, RotateCcw } from 'lucide-react';

export default function SlopeInspector3D({ selectedSector }) {
  const canvasRef = useRef(null);
  
  // Interactive simulation parameters initialized from selected sector or defaults
  const [slopeAngle, setSlopeAngle] = useState(selectedSector ? selectedSector.slopeAngle : 68);
  const [poreWater, setPoreWater] = useState(selectedSector ? selectedSector.porePressure : 150);
  const [seismicForce, setSeismicForce] = useState(0.15); // Peak Ground Acceleration in g
  const [isSimulating, setIsSimulating] = useState(false);
  const [rocks, setRocks] = useState([]);

  // Sync controls when selectedSector changes
  useEffect(() => {
    if (selectedSector) {
      setSlopeAngle(selectedSector.slopeAngle);
      setPoreWater(selectedSector.porePressure);
    }
  }, [selectedSector]);

  // Compute dynamic Factor of Safety (FoS) based on Limit Equilibrium Method
  // FoS = (Cohesion + (Normal Stress - Pore Pressure) * tan(frictionAngle)) / Shear Driving Stress
  const cohesion = 45; // kPa
  const frictionAngle = 32 * (Math.PI / 180); // radians
  const angleRad = slopeAngle * (Math.PI / 180);

  const drivingForce = Math.sin(angleRad) + seismicForce;
  const effectiveNormalForce = Math.cos(angleRad) * 100 - poreWater * 0.25;
  const resistingForce = cohesion + Math.max(0, effectiveNormalForce) * Math.tan(frictionAngle);
  const factorOfSafety = parseFloat((resistingForce / (drivingForce * 50)).toFixed(2));
  const slidingProbability = Math.min(99, Math.max(5, Math.round((1.6 - factorOfSafety) * 80)));

  // Canvas drawing of cross-section bench wall
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0b131e';
    ctx.fillRect(0, 0, w, h);

    // Bench Geometry coordinates
    const startX = 80;
    const startY = h - 60;
    const toeX = startX + 220;
    const toeY = startY;
    
    // Crest position calculated from slope angle
    const height = 240;
    const crestDx = height / Math.tan(angleRad);
    const crestX = toeX + crestDx;
    const crestY = toeY - height;
    const topEnd = crestX + 220;

    // Draw Rock Mass Base Body
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(toeX, toeY);
    ctx.lineTo(crestX, crestY);
    ctx.lineTo(topEnd, crestY);
    ctx.lineTo(topEnd, startY + 40);
    ctx.lineTo(startX, startY + 40);
    ctx.closePath();

    const rockGrad = ctx.createLinearGradient(0, 0, w, h);
    rockGrad.addColorStop(0, '#243447');
    rockGrad.addColorStop(1, '#131e2c');
    ctx.fillStyle = rockGrad;
    ctx.fill();
    ctx.strokeStyle = '#47638a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Fractured Bedding Planes (Joint Sets)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    for (let j = -200; j < 400; j += 40) {
      ctx.beginPath();
      ctx.moveTo(toeX + j, toeY);
      ctx.lineTo(crestX + j + 80, crestY - 40);
      ctx.stroke();
    }

    // Draw Potential Circular / Planar Failure Surface (Slip Plane)
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = factorOfSafety < 1.0 ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.moveTo(toeX - 10, toeY);
    ctx.quadraticCurveTo(toeX + crestDx * 0.4, toeY - height * 0.6, crestX + 60, crestY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Groundwater Table Line & Pore Pressure Gradient
    if (poreWater > 50) {
      const waterHeight = (poreWater / 300) * height * 0.8;
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.moveTo(startX, startY - 20);
      ctx.lineTo(toeX + 20, toeY - 20);
      ctx.lineTo(crestX + 40, crestY + height - waterHeight);
      ctx.stroke();

      // Water fill
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.fill();
    }

    // Draw Tension Crack at crest
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.moveTo(crestX + 40, crestY);
    ctx.lineTo(crestX + 40, crestY + 50);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Tension Crack', crestX + 50, crestY + 25);

    // Draw Sliding Rock Particles if simulating or critical
    rocks.forEach((r) => {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.size, 0, Math.PI * 2);
      ctx.fillStyle = '#f87171';
      ctx.fill();
    });

    // Annotations
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter';
    ctx.fillText(`Slope Angle: ${slopeAngle}°`, toeX + 60, toeY - 40);
    ctx.fillText(`Pore Pressure: ${poreWater} kPa`, crestX + 10, crestY - 15);
  }, [slopeAngle, poreWater, seismicForce, factorOfSafety, rocks]);

  // Rock animation loop when simulation is active
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setRocks((prev) => {
        return prev
          .map((r) => ({
            ...r,
            x: r.x + r.vx,
            y: r.y + r.vy,
            vy: r.vy + 0.3 // gravity
          }))
          .filter((r) => r.y < 450);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const triggerRockfall = () => {
    setIsSimulating(true);
    const newRocks = [];
    for (let i = 0; i < 20; i++) {
      newRocks.push({
        x: 320 + Math.random() * 80,
        y: 120 + Math.random() * 40,
        vx: (Math.random() - 0.2) * 3,
        vy: Math.random() * 2,
        size: 3 + Math.random() * 5
      });
    }
    setRocks(newRocks);
  };

  return (
    <div className="slope-inspector-wrapper glass-card">
      <div className="inspector-header">
        <div className="title-box">
          <Sliders className="text-cyan" />
          <div>
            <h3>3D Slope Cross-Section & Limit Equilibrium Failure Inspector</h3>
            <p className="subtitle">
              Simulate geological bench wall slope stability, water table saturation, and structural slip planes.
            </p>
          </div>
        </div>

        <div className="fos-banner">
          <div className="fos-metric">
            <span className="label">Factor of Safety (FoS)</span>
            <span className={`value ${factorOfSafety < 1.0 ? 'text-crimson' : factorOfSafety < 1.3 ? 'text-amber' : 'text-emerald'}`}>
              {factorOfSafety}
            </span>
          </div>
          <div className="fos-metric">
            <span className="label">Failure Probability</span>
            <span className="value">{slidingProbability}%</span>
          </div>
        </div>
      </div>

      <div className="inspector-body grid-2-col">
        {/* Canvas Section */}
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} width={620} height={380} className="slope-canvas" />
          <div className="canvas-actions">
            <button className="sim-btn glowing-btn" onClick={triggerRockfall}>
              <Play size={16} />
              <span>Simulate Rock Sliding</span>
            </button>
            <button className="reset-btn" onClick={() => { setIsSimulating(false); setRocks([]); }}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Dynamic Controls Slider Panel */}
        <div className="controls-panel">
          <h4>Geotechnical Variable Simulators</h4>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Slope Angle (°)</span>
              <strong className="text-cyan">{slopeAngle}°</strong>
            </div>
            <input 
              type="range" 
              min="30" 
              max="80" 
              value={slopeAngle} 
              onChange={(e) => setSlopeAngle(parseFloat(e.target.value))}
              className="slider-input"
            />
            <span className="slider-hint">Steeper angles reduce normal stress resistance</span>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Groundwater Pore Pressure (kPa)</span>
              <strong className="text-blue">{poreWater} kPa</strong>
            </div>
            <input 
              type="range" 
              min="10" 
              max="300" 
              value={poreWater} 
              onChange={(e) => setPoreWater(parseFloat(e.target.value))}
              className="slider-input"
            />
            <span className="slider-hint">Monsoon water buildup reduces effective shear strength</span>
          </div>

          <div className="slider-group">
            <div className="slider-label-row">
              <span>Seismic Acceleration (g)</span>
              <strong className="text-amber">{seismicForce.toFixed(2)} g</strong>
            </div>
            <input 
              type="range" 
              min="0.0" 
              max="0.4" 
              step="0.02"
              value={seismicForce} 
              onChange={(e) => setSeismicForce(parseFloat(e.target.value))}
              className="slider-input"
            />
            <span className="slider-hint">Simulates blasting vibration or natural tremor shockwaves</span>
          </div>

          <div className={`status-summary-box ${factorOfSafety < 1.0 ? 'critical' : 'stable'}`}>
            <AlertTriangle className="summary-icon" />
            <div>
              <strong>{factorOfSafety < 1.0 ? 'UNSTABLE - SHEAR FAILURE IMMINENT' : 'STRUCTURALLY STABLE'}</strong>
              <p>
                {factorOfSafety < 1.0 
                  ? 'Limit equilibrium failure condition met (FoS < 1.0). Rock mass along slip plane is sliding under gravitational shear driving force.' 
                  : 'Resisting frictional forces exceed driving shear stresses. Slope is in equilibrium.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
