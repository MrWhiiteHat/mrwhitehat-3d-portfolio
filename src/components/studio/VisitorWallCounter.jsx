import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';
import { LIGHTING_THEMES } from './CyberAtmosphere.jsx';

export default function VisitorWallCounter({
  visitorCount = 1488,
  latestVisitor = null,
  currentThemeKey = 'CYBER_NEON_NOIR',
  onSelect,
  onHover,
}) {
  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_MATRIX;
  const accentColor = theme.accent || '#34d399';
  const pulseRef = useRef();
  const scanlineRef = useRef();

  // Create a dynamic high-resolution canvas texture for the wall terminal screen
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    const updateCanvas = (count, visitor) => {
      ctx.fillStyle = '#060c09';
      ctx.fillRect(0, 0, 1024, 640);

      // Cyber Grid Background
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1024; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 640);
        ctx.stroke();
      }
      for (let y = 0; y < 640; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }

      // Top Header Bar
      ctx.fillStyle = '#0d1a14';
      ctx.fillRect(20, 20, 984, 64);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, 984, 64);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('CTOS AIRLOCK // SECURITY VISITOR TELEMETRY & ROSTER', 40, 58);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('● SYSTEM ACTIVE', 820, 58);

      // Large Central Visitor Count Box
      ctx.fillStyle = '#0a1410';
      ctx.fillRect(20, 104, 984, 240);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 104, 984, 240);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('TOTAL VERIFIED OFFICE OPERATIVES & VISITORS', 50, 146);

      // Giant Glowing Numbers
      const formattedNum = String(count).padStart(6, '0');
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 88px monospace';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 18;
      ctx.fillText(`# ${formattedNum}`, 50, 250);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px monospace';
      ctx.fillText('ALL ACCESS RECON EVENTS CRYPTOGRAPHICALLY LOGGED VIA SHAH-256', 50, 310);

      // Bottom Visitor Identity Panel
      ctx.fillStyle = '#0c1712';
      ctx.fillRect(20, 364, 984, 180);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 364, 984, 180);

      const visitorName = visitor?.name || 'Authorized Operative';
      const visitorRole = visitor?.role || 'Cyber Recon Specialist';
      const visitorTime = visitor?.timestamp || 'CURRENT SESSION';

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('LATEST AUTHORIZED CLEARANCE GRANTED:', 50, 404);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px monospace';
      ctx.fillText(`OPERATIVE: ${visitorName.toUpperCase()}`, 50, 456);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = '18px monospace';
      ctx.fillText(`DESIGNATION: ${visitorRole}  |  TIMESTAMP: ${visitorTime}`, 50, 498);

      // Bottom Action Callout
      ctx.fillStyle = '#10b981';
      ctx.fillRect(20, 564, 984, 56);
      ctx.fillStyle = '#05130b';
      ctx.font = '900 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK OR PRESS [E] TO INSPECT FULL VISITOR ROSTER LOGS', 512, 600);
      ctx.textAlign = 'left';
    };

    updateCanvas(visitorCount, latestVisitor);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return { texture, updateCanvas, canvas };
  }, []);

  // Update canvas texture whenever count or visitor changes
  useMemo(() => {
    if (screenTexture) {
      screenTexture.updateCanvas(visitorCount, latestVisitor);
      screenTexture.texture.needsUpdate = true;
    }
  }, [visitorCount, latestVisitor, screenTexture]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pulseRef.current) {
      pulseRef.current.intensity = 1.5 + Math.sin(time * 4) * 0.8;
    }
    if (scanlineRef.current) {
      scanlineRef.current.position.y = -0.3 + ((time * 0.5) % 0.6);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    playClickSound(1200);
    playHackingBeep(1400);
    if (onSelect) {
      onSelect({ section: 'visitor_log' });
    } else if (typeof window !== 'undefined' && window.__SET_SECTION__) {
      window.__SET_SECTION__('visitor_log');
    }
  };

  return (
    <group
      position={[4.94, 2.25, -0.75]}
      rotation={[0, -Math.PI / 2, 0]}
      name="VisitorWallCounter"
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
        onHover?.('visitor_log');
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        onHover?.(null);
      }}
    >
      {/* Heavy Anodized Titanium Frame Housing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.56, 1.04, 0.05]} />
        <meshStandardMaterial color="#0c1210" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Outer Neon Glow Bevel Border */}
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[1.52, 1.0, 0.008]} />
        <meshStandardMaterial color="#13231a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Live Cyber Display Screen */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[1.46, 0.94]} />
        <meshBasicMaterial map={screenTexture.texture} toneMapped={false} />
      </mesh>

      {/* Laser Scanning Line Bar */}
      <mesh ref={scanlineRef} position={[0, 0, 0.031]}>
        <planeGeometry args={[1.46, 0.006]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.65} />
      </mesh>

      {/* Wall Mounting Brackets (4 Corners) */}
      {[
        [-0.74, 0.48],
        [0.74, 0.48],
        [-0.74, -0.48],
        [0.74, -0.48],
      ].map(([bx, by], idx) => (
        <group key={`bracket-${idx}`} position={[bx, by, 0]}>
          <mesh position={[0, 0, -0.015]}>
            <cylinderGeometry args={[0.022, 0.022, 0.04, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#334155" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.026]}>
            <cylinderGeometry args={[0.014, 0.014, 0.006, 12]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Status LED Beacons at top frame */}
      {[
        { x: 0.62, color: '#10b981' },
        { x: 0.66, color: '#38bdf8' },
        { x: 0.7, color: '#ef4444' },
      ].map((led, i) => (
        <mesh key={`v-led-${i}`} position={[led.x, 0.49, 0.027]}>
          <sphereGeometry args={[0.007, 8, 8]} />
          <meshBasicMaterial color={led.color} />
        </mesh>
      ))}

      {/* Local Ambient Light projected onto the terminal */}
      <pointLight
        ref={pulseRef}
        position={[0, 0, 0.4]}
        color={accentColor}
        intensity={2.2}
        distance={2.8}
      />
    </group>
  );
}
