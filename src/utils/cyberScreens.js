import * as THREE from 'three';

/**
 * Creates an HTML5 canvas for high-performance dynamic screen rendering.
 */
function createScreenCanvas(width, height) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * 1. DYNAMIC KALI LINUX TERMINAL SCREEN
 * Renders streaming hacker logs, port scans, exploit execution, matrix digital rain, and blinking cursor.
 */
export function createTerminalScreen() {
  const width = 512;
  const height = 288;
  const canvas = createScreenCanvas(width, height);
  if (!canvas) return { texture: null, update: () => {} };

  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Terminal log script
  const terminalLines = [
    'mrwhitehat@cyber-command:~$ nmap -sV -sC -p- 10.0.4.1/24',
    '[+] Nmap scan report for 10.0.4.1 (ctos-core-gateway)',
    'PORT 22/tcp   OPEN  OpenSSH 9.6p1 Debian-4',
    'PORT 80/tcp   OPEN  nginx/1.24.0 (Reverse Proxy)',
    'PORT 443/tcp  OPEN  ssl/https (TLS_AES_256_GCM)',
    'PORT 8080/tcp OPEN  ctos-v3-cluster (REST API v2)',
    '[*] tcpdump -i eth0: IP 10.0.4.15 > 10.0.4.1:443 [SYN] win=65535',
    '[*] Metasploit: msf6 exploit(multi/handler) > exploit -j',
    '[*] Meterpreter session 1 opened (10.0.4.1:4444 -> 10.0.4.15:52410)',
    '[✓] PRIVILEGE ESCALATION: uid=0(root) gid=0(root) groups=0(root)',
    '[*] Exfiltrating shadow database... [0x9F82A41C... 100% DONE]',
    'mrwhitehat@cyber-command:~$ sudo ./deploy_zero_trust_mesh.sh',
    '[+] Hardening kernel sysctl: net.ipv4.ip_forward=0',
    '[+] Enforcing iptables strict DROP rules on WAN interface',
    '[+] WireGuard encrypted tunnel established to HQ-ALPHA',
    '[✓] CYBER DEFENSE GRID: 100% OPERATIONAL',
  ];

  // Matrix rain drops
  const columns = Math.floor(width / 14);
  const drops = Array.from({ length: columns }).map(() => Math.floor(Math.random() * 20));

  let currentLineIndex = 6;
  let lineScrollTimer = 0;
  let customCommand = '';
  let cursorBlink = 0;

  function update(delta) {
    lineScrollTimer += delta;
    cursorBlink += delta * 3;

    // Advance terminal scroll every 1.4s
    if (lineScrollTimer > 1.4) {
      lineScrollTimer = 0;
      currentLineIndex = (currentLineIndex + 1) % terminalLines.length;
    }

    // 1. Dark CRT Background with scanlines
    ctx.fillStyle = '#030805';
    ctx.fillRect(0, 0, width, height);

    // 2. Matrix Rain Background Watermark
    ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
    ctx.font = '10px monospace';
    for (let i = 0; i < drops.length; i++) {
      const char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
      ctx.fillText(char, i * 14, drops[i] * 12);
      if (drops[i] * 12 > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    // 3. Terminal Header Bar
    ctx.fillStyle = '#061a0e';
    ctx.fillRect(0, 0, width, 22);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('● BASH // KALI-LINUX 6.6-AMD64 [ROOT SESSION]', 10, 15);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('PID: 1337 | ENCRYPTED', width - 145, 15);

    // Header divider line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(width, 22);
    ctx.stroke();

    // 4. Render Visible Terminal Text Lines
    const visibleCount = 10;
    const startIdx = Math.max(0, currentLineIndex - visibleCount + 1);
    ctx.font = '11px "Courier New", monospace';

    let yPos = 42;
    for (let i = startIdx; i <= currentLineIndex; i++) {
      const line = terminalLines[i % terminalLines.length];
      if (!line) continue;

      if (line.startsWith('mrwhitehat')) {
        ctx.fillStyle = '#38bdf8';
      } else if (line.includes('[✓]')) {
        ctx.fillStyle = '#4ade80';
      } else if (line.includes('OPEN')) {
        ctx.fillStyle = '#facc15';
      } else if (line.startsWith('[*]')) {
        ctx.fillStyle = '#a78bfa';
      } else {
        ctx.fillStyle = '#86efac';
      }

      ctx.fillText(line, 14, yPos);
      yPos += 18;
    }

    // Blinking prompt cursor
    if (Math.sin(cursorBlink) > 0) {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(14, yPos - 6, 8, 12);
    }

    // Subtle CRT scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }

    texture.needsUpdate = true;
  }

  function injectCommand(cmd) {
    terminalLines.push(`mrwhitehat@cyber-command:~$ ${cmd}`);
    terminalLines.push(`[+] Executing: ${cmd} -> SUCCESS [0x00]`);
    currentLineIndex = terminalLines.length - 1;
  }

  return { texture, update, injectCommand };
}

/**
 * 2. DYNAMIC CYBER THREAT RADAR & SOC MONITOR
 * Renders rotating circular radar sweep with intruder blips, CPU core meters, and real-time network throughput graphs.
 */
export function createRadarScreen() {
  const width = 512;
  const height = 288;
  const canvas = createScreenCanvas(width, height);
  if (!canvas) return { texture: null, update: () => {} };

  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  let radarAngle = 0;
  const radarCenter = { x: 125, y: 148 };
  const radarRadius = 90;

  // Blip coordinates
  const blips = [
    { dist: 38, angle: 0.8, color: '#f43f5e', label: 'EXPLOIT_ATTEMPT' },
    { dist: 65, angle: 2.4, color: '#fbbf24', label: 'PORT_SCAN' },
    { dist: 78, angle: 4.6, color: '#38bdf8', label: 'FRIENDLY_NODE' },
    { dist: 52, angle: 5.7, color: '#f43f5e', label: 'BRUTE_FORCE' },
  ];

  // Moving throughput buffer (40 points)
  const throughputHistory = Array.from({ length: 40 }).map(() => 0.5);

  function update(delta) {
    radarAngle = (radarAngle + delta * 2.5) % (Math.PI * 2);

    // Shift throughput history
    throughputHistory.shift();
    const newRate = 0.3 + Math.sin(radarAngle * 3) * 0.25 + Math.random() * 0.3;
    throughputHistory.push(Math.min(1.0, Math.max(0.1, newRate)));

    // 1. Background
    ctx.fillStyle = '#040b08';
    ctx.fillRect(0, 0, width, height);

    // 2. Top Header Bar
    ctx.fillStyle = '#091c12';
    ctx.fillRect(0, 0, width, 24);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('● CYBER THREAT RADAR // SECTOR-07', 10, 16);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('THREAT LEVEL: ELEVATED (DEFCON 2)', width - 235, 16);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(width, 24);
    ctx.stroke();

    // 3. Left Section: Circular Radar Grid
    ctx.save();
    ctx.translate(radarCenter.x, radarCenter.y);

    // Concentric Radar Rings
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
    ctx.lineWidth = 1;
    [30, 60, 90].forEach((r) => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(-radarRadius, 0);
    ctx.lineTo(radarRadius, 0);
    ctx.moveTo(0, -radarRadius);
    ctx.lineTo(0, radarRadius);
    ctx.stroke();

    // Rotating Sweep Pie Gradient
    const sweepGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, radarRadius);
    sweepGrad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
    sweepGrad.addColorStop(1, 'rgba(52, 211, 153, 0.05)');

    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radarRadius, radarAngle - 0.55, radarAngle);
    ctx.closePath();
    ctx.fill();

    // Sweep Leading Edge Line
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(radarAngle) * radarRadius, Math.sin(radarAngle) * radarRadius);
    ctx.stroke();

    // Radar Blips
    blips.forEach((blip) => {
      const bx = Math.cos(blip.angle) * blip.dist;
      const by = Math.sin(blip.angle) * blip.dist;

      // Distance from sweep angle
      let diff = radarAngle - blip.angle;
      while (diff < 0) diff += Math.PI * 2;
      while (diff > Math.PI * 2) diff -= Math.PI * 2;

      const alpha = diff < 1.2 ? 1.0 - diff / 1.2 : 0.25;

      ctx.fillStyle = blip.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Blip pulse ring
      if (diff < 0.4) {
        ctx.strokeStyle = blip.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.restore();
    ctx.globalAlpha = 1.0;

    // 4. Right Section: Telemetry & Network Graphs
    const rightX = 245;

    // A. Network Throughput Waveform Box
    ctx.fillStyle = '#07150e';
    ctx.fillRect(rightX, 36, 255, 78);
    ctx.strokeStyle = '#154029';
    ctx.strokeRect(rightX, 36, 255, 78);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.fillText('ETH0 REAL-TIME THROUGHPUT: 842.6 MB/s', rightX + 8, 50);

    // Plot waveform
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    throughputHistory.forEach((val, idx) => {
      const px = rightX + 8 + idx * 5.8;
      const py = 104 - val * 45;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // B. CPU Core Load Bars
    ctx.fillStyle = '#86efac';
    ctx.font = '9px monospace';
    ctx.fillText('SYSTEM CPU MULTI-CORE LOAD:', rightX, 130);

    const cores = [0.82, 0.94, 0.48, 0.72];
    cores.forEach((load, cIdx) => {
      const cy = 140 + cIdx * 15;
      ctx.fillStyle = '#64748b';
      ctx.fillText(`CPU_${cIdx}`, rightX, cy + 9);

      // Bar bg
      ctx.fillStyle = '#0f2419';
      ctx.fillRect(rightX + 42, cy, 140, 10);

      // Bar fill
      ctx.fillStyle = load > 0.85 ? '#f43f5e' : load > 0.65 ? '#fbbf24' : '#10b981';
      ctx.fillRect(rightX + 42, cy, 140 * load, 10);

      // Pct text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${Math.floor(load * 100)}%`, rightX + 188, cy + 9);
    });

    // C. Security Status Boxes
    const bottomY = 212;
    ctx.fillStyle = '#0b2014';
    ctx.fillRect(rightX, bottomY, 255, 62);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(rightX, bottomY, 255, 62);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('ACTIVE HONEYPOTS: 4 ARMED (2 TRAPPED)', rightX + 8, bottomY + 16);
    ctx.fillText('IDS/IPS: SNORT-3 ENGINE BLOCKING', rightX + 8, bottomY + 32);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('CRYPTO ENGINE: AES-256-GCM HARDWARE MESH', rightX + 8, bottomY + 48);

    // CRT Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }

    texture.needsUpdate = true;
  }

  return { texture, update };
}

/**
 * 3. DYNAMIC PROJECTOR SCREEN: GLOBAL CYBER ATTACK MAP
 * Renders global vector cyber warfare arcs, real-time blocked counter, and threat matrix.
 */
export function createProjectorScreen() {
  const width = 1024;
  const height = 512;
  const canvas = createScreenCanvas(width, height);
  if (!canvas) return { texture: null, update: () => {} };

  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  let animTime = 0;
  let blockedCount = 1489214;

  // Major cyber operations centers
  const hubs = [
    { name: 'DELHI/BBSR', x: 670, y: 260, color: '#34d399' },
    { name: 'TOKYO', x: 860, y: 210, color: '#38bdf8' },
    { name: 'LONDON', x: 480, y: 160, color: '#fbbf24' },
    { name: 'SAN FRANCISCO', x: 190, y: 200, color: '#f43f5e' },
    { name: 'FRANKFURT', x: 520, y: 175, color: '#34d399' },
    { name: 'SINGAPORE', x: 740, y: 310, color: '#38bdf8' },
    { name: 'SYDNEY', x: 890, y: 390, color: '#a78bfa' },
  ];

  // Attack arcs connecting hubs
  const arcs = [
    { from: 0, to: 1, speed: 0.8 },
    { from: 0, to: 2, speed: 1.1 },
    { from: 2, to: 3, speed: 0.9 },
    { from: 0, to: 5, speed: 1.4 },
    { from: 5, to: 6, speed: 0.7 },
    { from: 4, to: 0, speed: 1.2 },
    { from: 3, to: 0, speed: 0.85 },
  ];

  function update(delta) {
    animTime += delta;
    blockedCount += Math.floor(Math.random() * 3);

    // 1. Dark Cyber Blue Background
    ctx.fillStyle = '#040d12';
    ctx.fillRect(0, 0, width, height);

    // 2. Global Cyber Grid Background Dots
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    for (let x = 40; x < width - 40; x += 32) {
      for (let y = 50; y < height - 70; y += 32) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // 3. Header Banner
    ctx.fillStyle = '#081e28';
    ctx.fillRect(0, 0, width, 44);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('● GLOBAL THREAT INTELLIGENCE COMMAND // MR. WHITE HAT DEFENSE GRID', 24, 28);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`ATTACKS MITIGATED: ${blockedCount.toLocaleString()}`, width - 360, 28);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 44);
    ctx.lineTo(width, 44);
    ctx.stroke();

    // 4. Simplified Stylized World Landmass Wireframe
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.5;

    // Americas
    ctx.strokeRect(120, 130, 220, 240);
    // Europe/Africa
    ctx.strokeRect(440, 120, 160, 260);
    // Asia/Australia
    ctx.strokeRect(640, 110, 280, 280);

    // 5. Connecting Cyber Arcs with Traveling Packet Pulses
    arcs.forEach((arc, i) => {
      const h1 = hubs[arc.from];
      const h2 = hubs[arc.to];
      const cx = (h1.x + h2.x) / 2;
      const cy = Math.min(h1.y, h2.y) - 60 - (i % 3) * 20;

      // Arc curve
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(h1.x, h1.y);
      ctx.quadraticCurveTo(cx, cy, h2.x, h2.y);
      ctx.stroke();

      // Traveling glowing packet
      const t = (animTime * arc.speed + i * 0.3) % 1;
      const px = (1 - t) * (1 - t) * h1.x + 2 * (1 - t) * t * cx + t * t * h2.x;
      const py = (1 - t) * (1 - t) * h1.y + 2 * (1 - t) * t * cy + t * t * h2.y;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Cyber Hub Nodes
    hubs.forEach((hub) => {
      // Glow circle
      ctx.fillStyle = hub.color;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 11 + Math.sin(animTime * 4) * 2, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(hub.name, hub.x - 30, hub.y + 20);
    });

    // 7. Footer Status Telemetry Bar
    ctx.fillStyle = '#061720';
    ctx.fillRect(0, height - 48, width, 48);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, height - 48, width, 48);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px monospace';
    ctx.fillText('STATUS: ZERO-TRUST SENTINEL ARMED // BGP ROUTE HIJACK PROTECTION: ACTIVE', 24, height - 20);
    ctx.fillStyle = '#4ade80';
    ctx.fillText('ALL GLOBAL POPs: 100% HEALTHY', width - 260, height - 20);

    texture.needsUpdate = true;
  }

  return { texture, update };
}

/**
 * 4. DYNAMIC BIOMETRIC TABLET SCREEN
 * Renders scanning fingerprint laser line, clearance verification, and crypto key telemetry.
 */
export function createTabletScreen() {
  const width = 256;
  const height = 180;
  const canvas = createScreenCanvas(width, height);
  if (!canvas) return { texture: null, update: () => {} };

  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  let scanProgress = 0;

  function update(delta) {
    scanProgress = (scanProgress + delta * 1.5) % 1;

    // Background
    ctx.fillStyle = '#03101c';
    ctx.fillRect(0, 0, width, height);

    // Header
    ctx.fillStyle = '#07243d';
    ctx.fillRect(0, 0, width, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('● BIOMETRIC CLEARANCE PAD', 10, 15);
    ctx.fillText('SEC-LVL-5', width - 65, 15);

    // Fingerprint representation in center
    const fX = width / 2;
    const fY = 85;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    [10, 18, 26, 34, 42].forEach((r) => {
      ctx.beginPath();
      ctx.ellipse(fX, fY, r * 0.7, r, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Animated Red/Cyan Laser Scan Bar
    const scanY = 45 + scanProgress * 80;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fX - 45, scanY);
    ctx.lineTo(fX + 45, scanY);
    ctx.stroke();

    // Laser glow
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillRect(fX - 45, scanY - 6, 90, 12);

    // Footer credentials
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('IDENTITY: MR. WHITE HAT', fX, 146);
    ctx.fillStyle = '#bae6fd';
    ctx.font = '8px monospace';
    ctx.fillText('ROOT CREDENTIALS VERIFIED', fX, 162);
    ctx.textAlign = 'left';

    texture.needsUpdate = true;
  }

  return { texture, update };
}
