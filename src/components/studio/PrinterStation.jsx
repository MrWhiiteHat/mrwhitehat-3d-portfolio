import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep, playWhooshSound } from '../../utils/audio.js';
import {
  getWalnutWoodTextures,
  getBrushedMetalTextures,
} from '../../utils/textures.js';

/**
 * Generates an authentic high-resolution printed resume document texture
 * with clean header, experience lines, skills badges, and security certification seal.
 */
function createResumeSheetTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');

  // Parchment / Crisp Security White Paper Base
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 680);

  // Subtle Header Watermark Bar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(36, 36, 440, 52);

  // Candidate Name & Title
  ctx.font = 'bold 22px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('SADASHIBA SARANGI', 52, 68);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CYBERSECURITY ARCHITECT & AI RESEARCHER', 52, 84);

  // Decorative Accent Bar
  ctx.fillStyle = '#10b981';
  ctx.fillRect(36, 96, 440, 4);

  // Section 1: Executive Summary
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('// OPERATIONAL SUMMARY', 36, 126);

  ctx.fillStyle = '#475569';
  ctx.font = '10px monospace';
  ctx.fillText('Offensive security researcher specializing in binary exploitation,', 36, 146);
  ctx.fillText('automated mobile vulnerability triage, and AI-driven defense.', 36, 162);

  // Section 2: Experience & Projects
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('// TECHNICAL ACHIEVEMENTS', 36, 198);

  const bullets = [
    '> Lead Security Researcher · KSecurity Threat Platform',
    '> Autonomous Mobile App Security Pen-Test Agent (LLM + Frida)',
    '> KrishiMitra · Multimodal AI Edge Agricultural System',
    '> NeuroFlux · Low-Latency Brainwave Sensor Pipeline',
    '> 1st Place National Cyber Defense CTF Champion (Odisha)',
    '> Hall of Fame Contributor · Google VRP, Microsoft, Bugcrowd',
  ];

  ctx.font = '10px monospace';
  ctx.fillStyle = '#334155';
  bullets.forEach((b, i) => {
    ctx.fillText(b, 44, 222 + i * 22);
  });

  // Section 3: Core Skills Matrix
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('// CORE DOMAINS', 36, 376);

  const skills = [
    '[REVERSE_ENG: Ghidra, IDA Pro, x86/ARM, ROP Chains]',
    '[CLOUD_SEC: AWS IAM, Kubernetes, Docker, Terraform]',
    '[WEB_PENTEST: Burp Suite Pro, OWASP Top 10, GraphQL]',
    '[AI_SECURITY: Transformers, PyTorch, Model Hardening]',
  ];

  ctx.font = '10px monospace';
  ctx.fillStyle = '#0369a1';
  skills.forEach((s, i) => {
    ctx.fillText(s, 44, 400 + i * 22);
  });

  // Red Verification Official Security Seal
  ctx.save();
  ctx.translate(400, 560);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.strokeRect(-65, -30, 130, 60);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#dc2626';
  ctx.textAlign = 'center';
  ctx.fillText('MRWHITEHAT', 0, -10);
  ctx.font = '9px monospace';
  ctx.fillText('VERIFIED RESUME', 0, 8);
  ctx.fillText('LEVEL 4 CLEARANCE', 0, 22);
  ctx.restore();

  // QR Code / Verification Stamp Box
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(36, 520, 80, 80);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(44, 528, 20, 20);
  ctx.fillRect(88, 528, 20, 20);
  ctx.fillRect(44, 572, 20, 20);
  ctx.fillRect(72, 556, 16, 16);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function PrinterStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [paperOffset, setPaperOffset] = useState(0);
  const paperRef = useRef();

  // High-End Procedural PBR Textures
  const cabinetWood = useMemo(() => getWalnutWoodTextures(2, 2), []);
  const brassMetal = useMemo(() => getBrushedMetalTextures(1, 1, '#ca8a04'), []);
  const darkMetal = useMemo(() => getBrushedMetalTextures(1, 1, '#1a1a1a'), []);
  const resumePaperTexture = useMemo(() => createResumeSheetTexture(), []);

  useFrame((state, delta) => {
    // Paper slide animation (frame-rate independent easing)
    if (paperRef.current) {
      const targetY = 0.21 + (hovered ? 0.05 : 0) + paperOffset;
      paperRef.current.position.y = THREE.MathUtils.damp(
        paperRef.current.position.y,
        targetY,
        6,
        delta
      );
    }
  });

  const handlePrintTest = (e) => {
    e.stopPropagation();
    playHackingBeep(520);
    setPaperOffset((prev) => (prev > 0.06 ? 0 : prev + 0.04));
  };

  return (
    <group position={[-3.6, 0, 0.8]} name="PrinterStation">
      {/* 1. Dedicated Credenza / Storage Cabinet */}
      <group position={[0, 0.42, 0]}>
        {/* Main Cabinet Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.84, 0.65]} />
          <meshStandardMaterial {...cabinetWood} roughness={0.38} metalness={0.12} />
        </mesh>
        {/* Dual Cabinet Doors with Brass Gap Line */}
        <mesh position={[0, 0, 0.33]}>
          <boxGeometry args={[1.16, 0.78, 0.02]} />
          <meshStandardMaterial {...cabinetWood} roughness={0.42} />
        </mesh>
        {/* Modern Brass Pull Handles */}
        <mesh position={[-0.08, 0.05, 0.35]}>
          <boxGeometry args={[0.02, 0.14, 0.02]} />
          <meshStandardMaterial {...brassMetal} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 0.05, 0.35]}>
          <boxGeometry args={[0.02, 0.14, 0.02]} />
          <meshStandardMaterial {...brassMetal} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Metal Legs */}
        {[
          [-0.52, -0.45, -0.26],
          [0.52, -0.45, -0.26],
          [-0.52, -0.45, 0.26],
          [0.52, -0.45, 0.26],
        ].map((pos, i) => (
          <mesh key={`cred-leg-${i}`} position={pos} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
            <meshStandardMaterial {...darkMetal} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 2. High-Tech Laser Printer (CLICKABLE HOTSPOT FOR RESUME) */}
      <group
        position={[0, 0.88, 0]}
        onClick={(e) => {
          e.stopPropagation();
          playWhooshSound();
          onSelect?.({ section: 'resume', label: 'Printer Station · Resume' });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover?.('Printer Station · Resume');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
          onHover?.(null);
        }}
      >
        {/* Lower Main Chassis */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.62, 0.28, 0.48]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.25} metalness={0.1} />
        </mesh>

        {/* Charcoal Upper Scanner Lid & Feeder */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.6, 0.06, 0.46]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Control Screen LCD Panel */}
        <mesh position={[-0.18, 0.25, 0.245]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.16, 0.09, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Glowing Green Status LED */}
        <mesh position={[0.2, 0.25, 0.245]}>
          <sphereGeometry args={[0.014, 12, 12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

        {/* Paper Output Slot Tray */}
        <mesh position={[0, 0.16, 0.22]} rotation={[-0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.015, 0.24]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>

        {/* Printed A4 Document emerging from slot with verified resume texture */}
        <mesh
          ref={paperRef}
          position={[0, 0.21, 0.28]}
          rotation={[-Math.PI / 3.4, 0, 0]}
          castShadow
          onClick={handlePrintTest}
        >
          <planeGeometry args={[0.28, 0.36]} />
          <meshBasicMaterial map={resumePaperTexture} side={THREE.DoubleSide} />
        </mesh>

        {/* Side Stack of Fresh Printing Paper */}
        <mesh position={[0.42, 0.05, 0]} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>

        {/* BESPOKE RESUME PROPS: EXECUTIVE FOUNTAIN PEN & RED EMBOSSING WAX SEAL */}
        <group position={[-0.42, 0.02, 0.1]}>
          {/* Circular Brass Pen Stand */}
          <mesh castShadow>
            <cylinderGeometry args={[0.028, 0.035, 0.02, 16]} />
            <meshStandardMaterial {...brassMetal} metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Angled Gold & Obsidian Fountain Pen */}
          <mesh position={[0, 0.065, 0]} rotation={[0.3, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.004, 0.005, 0.14, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>

          {/* Official Red Embossing Stamp Seal beside pen */}
          <group position={[0.08, 0, 0.04]}>
            {/* Wooden Handle */}
            <mesh position={[0, 0.035, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.016, 0.06, 12]} />
              <meshStandardMaterial color="#78350f" roughness={0.5} />
            </mesh>
            {/* Brass Stamp Base */}
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
              <meshStandardMaterial {...brassMetal} metalness={0.95} roughness={0.15} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
