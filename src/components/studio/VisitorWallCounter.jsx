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

  // Create a dynamic high-resolution canvas texture for the wall terminal screen (2048 x 1280 Retina/High-DPI)
  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');

    const updateCanvas = (count, visitor) => {
      // 1. Deep Cyber Dark Background with Radial Vignette
      const bgGrad = ctx.createRadialGradient(1024, 640, 100, 1024, 640, 1200);
      bgGrad.addColorStop(0, '#0a1611');
      bgGrad.addColorStop(0.55, '#060d09');
      bgGrad.addColorStop(1, '#020504');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 2048, 1280);

      // Micro Cyber Grid
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.04)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < 2048; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1280);
        ctx.stroke();
      }
      for (let y = 0; y < 1280; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(2048, y);
        ctx.stroke();
      }

      // Outer Technical Border & Corner Brackets
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, 1976, 1208);

      // Corner Brackets
      const bLen = 42;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      // Top-Left
      ctx.beginPath(); ctx.moveTo(36, 36 + bLen); ctx.lineTo(36, 36); ctx.lineTo(36 + bLen, 36); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(2012 - bLen, 36); ctx.lineTo(2012, 36); ctx.lineTo(2012, 36 + bLen); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(36, 1244 - bLen); ctx.lineTo(36, 1244); ctx.lineTo(36 + bLen, 1244); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(2012 - bLen, 1244); ctx.lineTo(2012, 1244); ctx.lineTo(2012, 1244 - bLen); ctx.stroke();

      // =========================================================================
      // 2. TOP HEADER BAR
      // =========================================================================
      ctx.fillStyle = 'rgba(13, 26, 20, 0.9)';
      ctx.fillRect(60, 60, 1928, 100);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 1928, 100);

      // Left: Pulsing Live Indicator + Terminal Title
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(105, 110, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 34px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('OFFICE ACCESS TERMINAL // VISITOR TELEMETRY', 135, 122);

      // Right: Live Status
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('NODE: GATEWAY-01 ● ENCRYPTED', 1948, 122);

      // =========================================================================
      // 3. MAIN VISITOR COUNT DISPLAY (7-Segment LED Scoreboard Style)
      // =========================================================================
      const countBoxY = 190;
      const countBoxH = 460;
      ctx.fillStyle = 'rgba(10, 20, 16, 0.92)';
      ctx.fillRect(60, countBoxY, 1928, countBoxH);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, countBoxY, 1928, countBoxH);

      // Label above numbers
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TOTAL VERIFIED OFFICE VISITORS', 1024, countBoxY + 68);

      // Digital LED Display Chassis (Inset well)
      const ledWellY = countBoxY + 105;
      const ledWellH = 260;
      const ledWellW = 1560;
      const ledWellX = 1024 - ledWellW / 2;
      ctx.fillStyle = '#040907';
      ctx.fillRect(ledWellX, ledWellY, ledWellW, ledWellH);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(ledWellX, ledWellY, ledWellW, ledWellH);

      // LED Scanlines inside the well
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 3;
      for (let sy = ledWellY + 4; sy < ledWellY + ledWellH; sy += 8) {
        ctx.beginPath();
        ctx.moveTo(ledWellX, sy);
        ctx.lineTo(ledWellX + ledWellW, sy);
        ctx.stroke();
      }

      // Format count with 6 digits
      const formattedNum = String(count).padStart(6, '0');
      const ledText = `# ${formattedNum}`;

      // Faint ghosted background LED digits
      ctx.font = '900 170px "Courier New", monospace';
      ctx.fillStyle = 'rgba(52, 211, 153, 0.08)';
      ctx.textAlign = 'center';
      ctx.fillText('# 888888', 1024, ledWellY + 195);

      // Glowing active LED digits
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 35;
      ctx.fillText(ledText, 1024, ledWellY + 195);
      ctx.shadowBlur = 0;

      // Sub-caption under LED well
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('BIOMETRIC CHECKPOINT · ACTIVE ROSTER LOGGING', 1024, countBoxY + 415);

      // =========================================================================
      // 4. LATEST VISITOR SECTION (Dedicated Operative Badge)
      // =========================================================================
      const visitorBoxY = 680;
      const visitorBoxH = 340;
      ctx.fillStyle = 'rgba(12, 24, 18, 0.92)';
      ctx.fillRect(60, visitorBoxY, 1928, visitorBoxH);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, visitorBoxY, 1928, visitorBoxH);

      // Header row inside visitor box
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('MOST RECENT ENTRANT', 110, visitorBoxY + 60);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('STATUS: CLEARED ✓', 1938, visitorBoxY + 60);

      // Decorative divider
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(110, visitorBoxY + 85);
      ctx.lineTo(1938, visitorBoxY + 85);
      ctx.stroke();

      // Visitor Name & Archetype Details
      const rawName = (visitor?.name || 'Visitor').trim();
      // Auto-fit font size based on string length to guarantee NO CLIPPING
      let nameFontSize = 74;
      if (rawName.length > 20) nameFontSize = 48;
      else if (rawName.length > 14) nameFontSize = 58;
      else if (rawName.length > 8) nameFontSize = 66;

      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${nameFontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 24;
      ctx.fillText(rawName.toUpperCase(), 1024, visitorBoxY + 195);
      ctx.shadowBlur = 0;

      // Meta info badge under name
      const archetype = visitor?.archetypeName || 'Operative';
      const timeStr = visitor?.timestamp
        ? new Date(visitor.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'LOGGED';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`ROLE: ${archetype.toUpperCase()}  |  CHECK-IN: ${timeStr}  |  CLEARANCE: LEVEL 4`, 1024, visitorBoxY + 275);

      // =========================================================================
      // 5. BOTTOM INTERACTIVE ACTION STRIP (Sleek Cyber Callout)
      // =========================================================================
      const actionY = 1050;
      const actionH = 150;
      const actGrad = ctx.createLinearGradient(60, actionY, 1988, actionY);
      actGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      actGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.18)');
      actGrad.addColorStop(1, 'rgba(16, 185, 129, 0.12)');
      ctx.fillStyle = actGrad;
      ctx.fillRect(60, actionY, 1928, actionH);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(60, actionY, 1928, actionH);

      // Centered Action Hint with Key Badges
      ctx.fillStyle = '#34d399';
      ctx.font = '900 36px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
      ctx.fillText('▶ CLICK OR PRESS [E] TO INSPECT FULL VISITOR LOG ◀', 1024, actionY + 90);
      ctx.shadowBlur = 0;
    };

    updateCanvas(visitorCount, latestVisitor);
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 8;
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
      position={[4.94, 2.25, -0.4]}
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

      {/* Live Cyber Display Screen (1.6 aspect ratio matching 2048x1280) */}
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
