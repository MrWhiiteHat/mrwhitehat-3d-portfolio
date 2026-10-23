import * as THREE from 'three';

// Cache generated textures so they are created once and reused across components
const textureCache = new Map();

/**
 * Creates an offscreen canvas and returns its 2D context.
 */
function createCanvas(width, height) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Helper to wrap and configure textures for realistic PBR rendering
 */
function configureTexture(canvas, repeatX = 1, repeatY = 1, isColor = true) {
  if (!canvas) return null;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  if (isColor) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  texture.anisotropy = 8;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * 1. HIGH-END PARQUET / CHEVRON HARDWOOD FLOORING
 * Dark American Walnut with alternating grain tiles, micro-planks, growth rings, and beveled seams.
 */
export function getParquetFloorTextures(repeatX = 4, repeatY = 4) {
  const cacheKey = `parquet_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 512;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);
  const roughCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas || !roughCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');
  const roughCtx = roughCanvas.getContext('2d');

  // Base floor tone
  diffCtx.fillStyle = '#1c1611';
  diffCtx.fillRect(0, 0, size, size);
  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);
  roughCtx.fillStyle = '#606060';
  roughCtx.fillRect(0, 0, size, size);

  const tiles = 4;
  const tileSize = size / tiles;
  const planksPerTile = 4;
  const plankThick = tileSize / planksPerTile;

  for (let tx = 0; tx < tiles; tx++) {
    for (let ty = 0; ty < tiles; ty++) {
      const isHorizontal = (tx + ty) % 2 === 0;
      const x0 = tx * tileSize;
      const y0 = ty * tileSize;

      for (let p = 0; p < planksPerTile; p++) {
        // Individual plank variations
        const lightnessVar = (Math.sin(tx * 3.7 + ty * 5.1 + p * 2.3) * 0.5 + 0.5);
        const red = Math.floor(26 + lightnessVar * 12);
        const green = Math.floor(19 + lightnessVar * 9);
        const blue = Math.floor(14 + lightnessVar * 7);

        let px, py, pw, ph;
        if (isHorizontal) {
          px = x0;
          py = y0 + p * plankThick;
          pw = tileSize;
          ph = plankThick;
        } else {
          px = x0 + p * plankThick;
          py = y0;
          pw = plankThick;
          ph = tileSize;
        }

        // Plank diffuse fill
        diffCtx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        diffCtx.fillRect(px, py, pw, ph);

        // Plank wood grain lines
        diffCtx.lineWidth = 1;
        const grainCount = 14;
        for (let g = 0; g < grainCount; g++) {
          const grainAlpha = 0.08 + Math.random() * 0.12;
          diffCtx.strokeStyle = `rgba(10, 7, 5, ${grainAlpha})`;
          diffCtx.beginPath();
          if (isHorizontal) {
            const gy = py + (g / grainCount) * ph + (Math.random() - 0.5) * 2;
            diffCtx.moveTo(px, gy);
            diffCtx.bezierCurveTo(
              px + pw * 0.33, gy + (Math.random() - 0.5) * 3,
              px + pw * 0.66, gy + (Math.random() - 0.5) * 3,
              px + pw, gy
            );
          } else {
            const gx = px + (g / grainCount) * pw + (Math.random() - 0.5) * 2;
            diffCtx.moveTo(gx, py);
            diffCtx.bezierCurveTo(
              gx + (Math.random() - 0.5) * 3, py + ph * 0.33,
              gx + (Math.random() - 0.5) * 3, py + ph * 0.66,
              gx, py + ph
            );
          }
          diffCtx.stroke();
        }

        // Bump grain
        bumpCtx.fillStyle = `rgb(${120 + Math.floor(lightnessVar * 20)}, ${120 + Math.floor(lightnessVar * 20)}, ${120 + Math.floor(lightnessVar * 20)})`;
        bumpCtx.fillRect(px, py, pw, ph);

        // Roughness: plank body has satiny reflection
        roughCtx.fillStyle = `rgb(${75 + Math.floor(lightnessVar * 30)}, ${75 + Math.floor(lightnessVar * 30)}, ${75 + Math.floor(lightnessVar * 30)})`;
        roughCtx.fillRect(px, py, pw, ph);

        // Beveled Joint Seam (dark groove in diffuse, deep black in bump, high roughness)
        diffCtx.strokeStyle = 'rgba(7, 5, 3, 0.9)';
        diffCtx.lineWidth = 2;
        diffCtx.strokeRect(px, py, pw, ph);

        bumpCtx.strokeStyle = 'rgb(30, 30, 30)';
        bumpCtx.lineWidth = 2;
        bumpCtx.strokeRect(px, py, pw, ph);

        roughCtx.strokeStyle = 'rgb(220, 220, 220)';
        roughCtx.lineWidth = 2;
        roughCtx.strokeRect(px, py, pw, ph);
      }
    }
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    roughnessMap: configureTexture(roughCanvas, repeatX, repeatY, false),
    bumpScale: 0.035,
    roughness: 0.38,
    metalness: 0.1,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 2. ARCHITECTURAL VENETIAN PLASTER / MICRO-CEMENT WALL
 * Subtle organic mineral mottling and micro-porosity for realistic wall depth.
 */
export function getPlasterWallTextures(repeatX = 3, repeatY = 2) {
  const cacheKey = `plaster_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 512;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  diffCtx.fillStyle = '#17221b';
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  // Layered procedural mineral grain
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const rad = 1 + Math.random() * 6;
    const alpha = 0.03 + Math.random() * 0.05;

    const isHighlight = Math.random() > 0.5;
    diffCtx.fillStyle = isHighlight
      ? `rgba(38, 55, 45, ${alpha})`
      : `rgba(14, 20, 16, ${alpha})`;
    diffCtx.beginPath();
    diffCtx.arc(x, y, rad, 0, Math.PI * 2);
    diffCtx.fill();

    bumpCtx.fillStyle = isHighlight
      ? `rgba(160, 160, 160, ${alpha * 1.5})`
      : `rgba(90, 90, 90, ${alpha * 1.5})`;
    bumpCtx.beginPath();
    bumpCtx.arc(x, y, rad, 0, Math.PI * 2);
    bumpCtx.fill();
  }

  // Trowel stroke textures
  for (let s = 0; s < 30; s++) {
    const sx = Math.random() * size;
    const sy = Math.random() * size;
    const sw = 40 + Math.random() * 80;
    const sh = 10 + Math.random() * 25;
    const rot = (Math.random() - 0.5) * 0.6;

    diffCtx.save();
    diffCtx.translate(sx, sy);
    diffCtx.rotate(rot);
    diffCtx.fillStyle = `rgba(28, 42, 34, 0.06)`;
    diffCtx.fillRect(-sw / 2, -sh / 2, sw, sh);
    diffCtx.restore();
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    bumpScale: 0.02,
    roughness: 0.76,
    metalness: 0.04,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 3. LINEAR DARK WALNUT WOOD GRAIN
 * Used on acoustic wall slats, conference table, desk top, and credenzas.
 */
export function getWalnutWoodTextures(repeatX = 1, repeatY = 2) {
  const cacheKey = `walnut_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 512;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  // Rich warm dark espresso / walnut base
  diffCtx.fillStyle = '#221912';
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  // Long flowing wood fibers
  for (let i = 0; i < 180; i++) {
    const y = (i / 180) * size;
    const waveAmp = 6 + Math.sin(i * 0.15) * 8;
    const alpha = 0.12 + Math.random() * 0.16;

    diffCtx.strokeStyle = i % 2 === 0
      ? `rgba(45, 33, 24, ${alpha})`
      : `rgba(16, 11, 7, ${alpha})`;
    diffCtx.lineWidth = 1 + Math.random() * 2;
    diffCtx.beginPath();
    diffCtx.moveTo(0, y);
    diffCtx.bezierCurveTo(
      size * 0.25, y + waveAmp,
      size * 0.75, y - waveAmp,
      size, y + waveAmp * 0.5
    );
    diffCtx.stroke();

    bumpCtx.strokeStyle = i % 2 === 0
      ? `rgba(160, 160, 160, ${alpha})`
      : `rgba(70, 70, 70, ${alpha})`;
    bumpCtx.lineWidth = 1;
    bumpCtx.beginPath();
    bumpCtx.moveTo(0, y);
    bumpCtx.bezierCurveTo(
      size * 0.25, y + waveAmp,
      size * 0.75, y - waveAmp,
      size, y + waveAmp * 0.5
    );
    bumpCtx.stroke();
  }

  // Wood knots
  for (let k = 0; k < 2; k++) {
    const kx = 100 + k * 280;
    const ky = 160 + k * 180;
    const grad = diffCtx.createRadialGradient(kx, ky, 2, kx, ky, 22);
    grad.addColorStop(0, '#100b07');
    grad.addColorStop(0.5, '#2e2016');
    grad.addColorStop(1, 'transparent');
    diffCtx.fillStyle = grad;
    diffCtx.beginPath();
    diffCtx.ellipse(kx, ky, 18, 10, 0.2, 0, Math.PI * 2);
    diffCtx.fill();
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    bumpScale: 0.025,
    roughness: 0.42,
    metalness: 0.08,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 4. EXECUTIVE DESIGNER TECH RUG / CARBON WEAVE
 * High-density woven fabric weave with subtle hexagonal cyber grid under-texture.
 */
export function getTechCarpetTextures(repeatX = 3, repeatY = 3, baseColor = '#0f1c16') {
  const cacheKey = `carpet_${repeatX}_${repeatY}_${baseColor}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 256;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  diffCtx.fillStyle = baseColor;
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  // Micro weave pattern
  const step = 4;
  for (let x = 0; x < size; x += step) {
    for (let y = 0; y < size; y += step) {
      const isAlt = ((x / step) + (y / step)) % 2 === 0;
      diffCtx.fillStyle = isAlt ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.08)';
      diffCtx.fillRect(x, y, step, step);

      bumpCtx.fillStyle = isAlt ? '#a0a0a0' : '#606060';
      bumpCtx.fillRect(x, y, step, step);
    }
  }

  // Subtle cyber hexagonal grid lines
  diffCtx.strokeStyle = 'rgba(52, 211, 153, 0.06)';
  diffCtx.lineWidth = 1;
  const hexSize = 32;
  for (let hx = 0; hx < size; hx += hexSize) {
    diffCtx.beginPath();
    diffCtx.moveTo(hx, 0);
    diffCtx.lineTo(hx, size);
    diffCtx.stroke();
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    bumpScale: 0.02,
    roughness: 0.88,
    metalness: 0.02,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 5. LUXURY EXECUTIVE PEBBLED LEATHER
 * For lounge sofa cushions and ergonomic executive chair.
 */
export function getPebbledLeatherTextures(repeatX = 2, repeatY = 2, color = '#151b18') {
  const cacheKey = `leather_${repeatX}_${repeatY}_${color}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 256;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  diffCtx.fillStyle = color;
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  // Micro leather cellular pebbles
  for (let i = 0; i < 1800; i++) {
    const px = Math.random() * size;
    const py = Math.random() * size;
    const pr = 1.5 + Math.random() * 2.5;

    bumpCtx.fillStyle = '#b5b5b5';
    bumpCtx.beginPath();
    bumpCtx.arc(px, py, pr, 0, Math.PI * 2);
    bumpCtx.fill();

    bumpCtx.strokeStyle = '#454545';
    bumpCtx.lineWidth = 0.8;
    bumpCtx.stroke();

    diffCtx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    diffCtx.beginPath();
    diffCtx.arc(px, py, pr * 0.8, 0, Math.PI * 2);
    diffCtx.fill();
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    bumpScale: 0.03,
    roughness: 0.45,
    metalness: 0.12,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 6. POLISHED NERO MARQUINA BLACK MARBLE
 * Deep obsidian base with gold & quartz veins for luxury table tops.
 */
export function getNeroMarbleTextures(repeatX = 1, repeatY = 1) {
  const cacheKey = `marble_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 512;
  const diffCanvas = createCanvas(size, size);
  if (!diffCanvas) return {};

  const ctx = diffCanvas.getContext('2d');
  ctx.fillStyle = '#0a0d0c';
  ctx.fillRect(0, 0, size, size);

  // Veins
  const veins = [
    { start: [20, 0], cp1: [120, 180], cp2: [380, 240], end: [500, 512], width: 3, color: 'rgba(235, 240, 238, 0.55)' },
    { start: [140, 0], cp1: [220, 140], cp2: [310, 360], end: [440, 512], width: 1.5, color: 'rgba(212, 175, 55, 0.45)' },
    { start: [0, 280], cp1: [160, 320], cp2: [340, 420], end: [512, 460], width: 2, color: 'rgba(200, 220, 210, 0.4)' },
    { start: [280, 0], cp1: [320, 80], cp2: [420, 160], end: [512, 200], width: 1.2, color: 'rgba(255, 255, 255, 0.35)' },
  ];

  veins.forEach((v) => {
    ctx.strokeStyle = v.color;
    ctx.lineWidth = v.width;
    ctx.beginPath();
    ctx.moveTo(v.start[0], v.start[1]);
    ctx.bezierCurveTo(v.cp1[0], v.cp1[1], v.cp2[0], v.cp2[1], v.end[0], v.end[1]);
    ctx.stroke();

    // Branchlets
    for (let b = 0; b < 6; b++) {
      const bx = v.cp1[0] + (Math.random() - 0.5) * 80;
      const by = v.cp1[1] + (Math.random() - 0.5) * 80;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(240, 245, 242, 0.25)';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + (Math.random() - 0.5) * 45, by + (Math.random() - 0.5) * 45);
      ctx.stroke();
    }
  });

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    roughness: 0.16,
    metalness: 0.1,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 7. BRUSHED TITANIUM / STAINLESS STEEL
 * Directional brushed hairline metal for chassis, mullions, and hardware.
 */
export function getBrushedMetalTextures(repeatX = 1, repeatY = 1, color = '#202824') {
  const cacheKey = `metal_${repeatX}_${repeatY}_${color}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 256;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  diffCtx.fillStyle = color;
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  // Hairline brush strokes
  for (let i = 0; i < 200; i++) {
    const y = (i / 200) * size;
    const a = 0.04 + Math.random() * 0.08;
    diffCtx.strokeStyle = Math.random() > 0.5 ? `rgba(255, 255, 255, ${a})` : `rgba(0, 0, 0, ${a})`;
    diffCtx.lineWidth = 1;
    diffCtx.beginPath();
    diffCtx.moveTo(0, y);
    diffCtx.lineTo(size, y);
    diffCtx.stroke();

    bumpCtx.strokeStyle = Math.random() > 0.5 ? `rgba(160, 160, 160, ${a * 2})` : `rgba(80, 80, 80, ${a * 2})`;
    bumpCtx.lineWidth = 1;
    bumpCtx.beginPath();
    bumpCtx.moveTo(0, y);
    bumpCtx.lineTo(size, y);
    bumpCtx.stroke();
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    bumpScale: 0.015,
    roughness: 0.32,
    metalness: 0.88,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 8. ACOUSTIC CEILING TILES
 * Matte black micro-perforated sound absorption panels.
 */
export function getCeilingTileTextures(repeatX = 5, repeatY = 5) {
  const cacheKey = `ceiling_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 256;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  diffCtx.fillStyle = '#0b100d';
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  // Micro perforations
  const step = 8;
  for (let x = 4; x < size; x += step) {
    for (let y = 4; y < size; y += step) {
      diffCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      diffCtx.fillRect(x, y, 1.5, 1.5);

      bumpCtx.fillStyle = '#404040';
      bumpCtx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // T-Bar perimeter frame
  diffCtx.strokeStyle = '#18241e';
  diffCtx.lineWidth = 2;
  diffCtx.strokeRect(0, 0, size, size);

  bumpCtx.strokeStyle = '#b0b0b0';
  bumpCtx.lineWidth = 2;
  bumpCtx.strokeRect(0, 0, size, size);

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    bumpScale: 0.02,
    roughness: 0.82,
    metalness: 0.1,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 9. TWILL WEAVE CARBON FIBER (AAA Cyber Surfaces)
 * Used on high-performance cyber desk surfaces, mouse mats, and hardware enclosures.
 */
export function getCarbonFiberTextures(repeatX = 8, repeatY = 8) {
  const cacheKey = `carbon_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 256;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);
  const roughCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas || !roughCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');
  const roughCtx = roughCanvas.getContext('2d');

  diffCtx.fillStyle = '#0a0d0c';
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  roughCtx.fillStyle = '#404040';
  roughCtx.fillRect(0, 0, size, size);

  const cellSize = 16;
  for (let x = 0; x < size; x += cellSize) {
    for (let y = 0; y < size; y += cellSize) {
      const isAlt = ((x / cellSize) + (y / cellSize)) % 2 === 0;

      // 2x2 Twill weave fiber block
      diffCtx.fillStyle = isAlt ? '#161d19' : '#0d120f';
      diffCtx.fillRect(x, y, cellSize, cellSize);

      // Micro fiber thread lines
      for (let t = 0; t < cellSize; t += 2) {
        if (isAlt) {
          diffCtx.fillStyle = t % 4 === 0 ? 'rgba(45, 60, 50, 0.4)' : 'rgba(0, 0, 0, 0.5)';
          diffCtx.fillRect(x + t, y, 1, cellSize);

          bumpCtx.fillStyle = t % 4 === 0 ? '#b0b0b0' : '#404040';
          bumpCtx.fillRect(x + t, y, 1, cellSize);
        } else {
          diffCtx.fillStyle = t % 4 === 0 ? 'rgba(45, 60, 50, 0.4)' : 'rgba(0, 0, 0, 0.5)';
          diffCtx.fillRect(x, y + t, cellSize, 1);

          bumpCtx.fillStyle = t % 4 === 0 ? '#b0b0b0' : '#404040';
          bumpCtx.fillRect(x, y + t, cellSize, 1);
        }
      }

      // Specular sheen variations
      roughCtx.fillStyle = isAlt ? '#303030' : '#555555';
      roughCtx.fillRect(x, y, cellSize, cellSize);
    }
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    roughnessMap: configureTexture(roughCanvas, repeatX, repeatY, false),
    bumpScale: 0.04,
    roughness: 0.35,
    metalness: 0.65,
  };

  textureCache.set(cacheKey, result);
  return result;
}

/**
 * 10. ACOUSTIC HEXAGONAL CYBER WALL PANELS
 * Beveled hexagonal sound-dampening panels for futuristic studio walls.
 */
export function getCyberHexWallTextures(repeatX = 3, repeatY = 3) {
  const cacheKey = `cyber_hex_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const size = 512;
  const diffCanvas = createCanvas(size, size);
  const bumpCanvas = createCanvas(size, size);

  if (!diffCanvas || !bumpCanvas) return {};

  const diffCtx = diffCanvas.getContext('2d');
  const bumpCtx = bumpCanvas.getContext('2d');

  diffCtx.fillStyle = '#080d0b';
  diffCtx.fillRect(0, 0, size, size);

  bumpCtx.fillStyle = '#808080';
  bumpCtx.fillRect(0, 0, size, size);

  // Draw hexagonal acoustic grid
  const r = 32;
  const h = r * Math.sqrt(3);

  function drawHex(ctx, cx, cy, rad, strokeStyle, fillStyle, lineWidth = 2) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = cx + rad * Math.cos(angle);
      const y = cy + rad * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  for (let y = -h; y < size + h; y += h) {
    for (let x = -r; x < size + r * 2; x += r * 3) {
      const cy1 = y;
      const cy2 = y + h / 2;

      // Hex 1
      drawHex(diffCtx, x, cy1, r - 3, 'rgba(85, 246, 154, 0.08)', '#0d1511');
      drawHex(bumpCtx, x, cy1, r - 3, '#202020', '#b0b0b0', 3);

      // Hex 2 (Offset row)
      drawHex(diffCtx, x + r * 1.5, cy2, r - 3, 'rgba(85, 246, 154, 0.08)', '#0b120e');
      drawHex(bumpCtx, x + r * 1.5, cy2, r - 3, '#202020', '#a0a0a0', 3);
    }
  }

  const result = {
    map: configureTexture(diffCanvas, repeatX, repeatY, true),
    bumpMap: configureTexture(bumpCanvas, repeatX, repeatY, false),
    bumpScale: 0.035,
    roughness: 0.55,
    metalness: 0.35,
  };

  textureCache.set(cacheKey, result);
  return result;
}
