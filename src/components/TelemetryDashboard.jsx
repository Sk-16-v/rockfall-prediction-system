import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Activity, Radio, Cpu, Satellite, HardDrive } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TelemetryDashboard({ selectedSector }) {
  // Generate timestamps for past 12 hours
  const hours = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '20:30', '20:45', '20:55 (Now)'];

  // Radar displacement dataset based on sector
  const baseRate = selectedSector ? selectedSector.displacementRate : 8.5;
  const displacementData = [
    (baseRate * 0.2).toFixed(1),
    (baseRate * 0.25).toFixed(1),
    (baseRate * 0.3).toFixed(1),
    (baseRate * 0.35).toFixed(1),
    (baseRate * 0.4).toFixed(1),
    (baseRate * 0.5).toFixed(1),
    (baseRate * 0.6).toFixed(1),
    (baseRate * 0.75).toFixed(1),
    (baseRate * 0.85).toFixed(1),
    (baseRate * 0.92).toFixed(1),
    (baseRate * 0.98).toFixed(1),
    baseRate.toFixed(1)
  ];

  // Acoustic emission count data
  const baseAcoustic = selectedSector ? selectedSector.acousticEmission : 180;
  const acousticData = [
    Math.round(baseAcoustic * 0.15),
    Math.round(baseAcoustic * 0.2),
    Math.round(baseAcoustic * 0.25),
    Math.round(baseAcoustic * 0.3),
    Math.round(baseAcoustic * 0.4),
    Math.round(baseAcoustic * 0.5),
    Math.round(baseAcoustic * 0.65),
    Math.round(baseAcoustic * 0.75),
    Math.round(baseAcoustic * 0.85),
    Math.round(baseAcoustic * 0.9),
    Math.round(baseAcoustic * 0.95),
    baseAcoustic
  ];

  // Radar Displacement Line Chart Config
  const displacementChartConfig = {
    labels: hours,
    datasets: [
      {
        label: 'InSAR Radar Shear Velocity (mm/hr)',
        data: displacementData,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#38bdf8',
        pointRadius: 4
      },
      {
        label: 'Critical Threshold (5.0 mm/hr)',
        data: Array(12).fill(5.0),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }
    ]
  };

  // Acoustic Emissions Bar Chart Config
  const acousticChartConfig = {
    labels: hours,
    datasets: [
      {
        label: 'Micro-Seismic Acoustic Events (count/min)',
        data: acousticData,
        backgroundColor: acousticData.map(v => v > 200 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(245, 158, 11, 0.8)'),
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter' } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } }
    }
  };

  return (
    <div className="telemetry-dashboard-wrapper glass-card">
      <div className="telemetry-header">
        <div className="title-box">
          <Radio className="text-cyan pulse" />
          <div>
            <h3>Real-Time Geotechnical Sensor Telemetry Stream</h3>
            <p className="subtitle">
              Synchronized InSAR satellite radar, ground-based Total Station LiDAR, and acoustic micro-seismic sensors.
            </p>
          </div>
        </div>

        <div className="sensor-pills-row">
          <div className="sensor-pill green">
            <Satellite size={14} />
            <span>InSAR Sentinel-1B: ONLINE</span>
          </div>
          <div className="sensor-pill cyan">
            <HardDrive size={14} />
            <span>LiDAR Ground Radar 04: ACTIVE</span>
          </div>
          <div className="sensor-pill amber">
            <Cpu size={14} />
            <span>Edge AI Predictor: LOW LATENCY</span>
          </div>
        </div>
      </div>

      <div className="telemetry-grid grid-2-col">
        {/* Chart 1: InSAR Radar Displacement Rate */}
        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <h4>InSAR Radar Line-of-Sight Shear Velocity (mm/hr)</h4>
            <span className="card-badge">Target: {selectedSector ? selectedSector.name : 'North Wall'}</span>
          </div>
          <div className="chart-container-box">
            <Line data={displacementChartConfig} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Acoustic Micro-Fractures */}
        <div className="chart-card glass-card">
          <div className="chart-card-header">
            <h4>Acoustic Emission (Micro-Seismic Rock Fracturing)</h4>
            <span className="card-badge amber">High Frequency Monitoring</span>
          </div>
          <div className="chart-container-box">
            <Bar data={acousticChartConfig} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
