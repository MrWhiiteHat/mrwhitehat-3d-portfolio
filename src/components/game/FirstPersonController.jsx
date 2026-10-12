import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playFootstepSound, playProximityChime } from '../../utils/audio.js';

// Station interaction coordinates, reach limits & exact 3D Box3 physical hit-volumes
const STATIONS = [
  // 1. Desk Intercom Console (Prioritized small sub-target on desk)
  {
    id: 'contact',
    title: 'Desk Intercom Console',
    action: 'TUNE FREQUENCY // CONTACT',
    position: [-0.15, 0.85, 0.6],
    maxDist: 2.8,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(-0.4, 0.72, 0.4),
        new THREE.Vector3(0.1, 1.2, 0.8)
      ),
    ],
  },
  // 2. Dual-Monitor Workstation (Monitors, keyboard, PC tower, desk surface)
  {
    id: 'projects',
    title: 'Dual-Monitor Workstation',
    action: 'HACK NETWORK CIRCUIT // PROJECTS',
    position: [-1.2, 0.9, 0.4],
    maxDist: 3.5,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(-2.65, 0.35, -0.35),
        new THREE.Vector3(0.25, 1.65, 1.25)
      ),
    ],
  },
  // 3. Cyber Security Bookcase (ArchiveStation shelves and books)
  {
    id: 'skills',
    title: 'Cyber Security Bookcase',
    action: 'INSPECT ARCHIVE // SKILLS',
    position: [0.6, 1.8, -4.4],
    maxDist: 4.2,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(-0.65, 0.1, -4.95),
        new THREE.Vector3(1.85, 3.6, -4.4)
      ),
    ],
  },
  // 4. Auditorium Projector & Trophies Credenza
  {
    id: 'achievements',
    title: 'Auditorium Projector',
    action: 'BYPASS RADAR FIREWALL // ACHIEVEMENTS',
    position: [-4.6, 2.1, -2.0],
    maxDist: 4.2,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(-4.95, 0.2, -3.5),
        new THREE.Vector3(-4.2, 3.25, -0.5)
      ),
    ],
  },
  // 5. Executive Wall Plaque & Lounge Tablet
  {
    id: 'about',
    title: 'Executive Wall Plaque',
    action: 'ALIGN CIPHER TUMBLERS // ABOUT',
    position: [4.6, 2.1, 1.6],
    maxDist: 4.0,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(4.2, 1.3, 0.9),
        new THREE.Vector3(4.95, 2.8, 2.3)
      ),
      new THREE.Box3(
        new THREE.Vector3(1.4, 0.25, 0.4),
        new THREE.Vector3(3.8, 1.2, 2.4)
      ),
    ],
  },
  // 6. Laser Printer Output Tray & Credenza
  {
    id: 'resume',
    title: 'Laser Printer Output Tray',
    action: 'SPLICE SYSTEM WIRES // RESUME',
    position: [-3.5, 1.0, 1.1],
    maxDist: 3.2,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(-4.3, 0.35, 0.4),
        new THREE.Vector3(-2.9, 1.55, 1.2)
      ),
    ],
  },
  // 7. Holographic Cyber Core
  {
    id: 'core',
    title: 'Holographic Cyber Core',
    action: 'CYCLE ATMOSPHERE THEME (T)',
    position: [1.95, 0.9, 0.85],
    maxDist: 3.2,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(1.7, 0.65, 0.6),
        new THREE.Vector3(2.2, 1.45, 1.1)
      ),
    ],
  },
  // 8. 42U Mainframe Server Rack
  {
    id: 'server_rack',
    title: '42U Mainframe Server Rack',
    action: 'INSPECT NETWORK MAINFRAME // TELEMETRY',
    position: [-2.3, 1.4, -4.2],
    maxDist: 3.5,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(-2.85, 0.05, -4.95),
        new THREE.Vector3(-1.75, 2.85, -4.0)
      ),
    ],
  },
  // 9. Cyber Sentinel Drone & Operator Hologram
  {
    id: 'hologram_drone',
    title: 'Cyber Sentinel Drone',
    action: 'INSPECT OPERATOR HOLOGRAM // MR. WHITE HAT',
    position: [-3.35, 1.6, -3.85],
    maxDist: 3.8,
    boxes: [
      new THREE.Box3(
        new THREE.Vector3(-3.85, 0.85, -4.35),
        new THREE.Vector3(-2.85, 2.65, -3.35)
      ),
    ],
  },
];

// Room Obstacle Bounding Boxes for AABB Collision Response
// Precisely aligned to 3D furniture meshes with zero phantom invisible barriers.
const OBSTACLES = [
  // 1. Workstation Executive Desk (Top: 2.7m x 1.3m centered at [-1.2, 0, 0.4])
  { minX: -2.55, maxX: 0.15, minZ: -0.25, maxZ: 1.05 },
  // 2. Workstation Executive Swivel Chair (Centered at [-1.2, 0, 1.25])
  { minX: -1.5, maxX: -0.9, minZ: 0.98, maxZ: 1.55 },
  // 3. Conference Table & Surrounding Chairs (Centered at [-3.08, 0, -2.0])
  { minX: -4.3, maxX: -1.9, minZ: -2.8, maxZ: -1.2 },
  // 4. Media Credenza under presentation screen (Left Wall, X = -4.63)
  { minX: -4.85, maxX: -4.4, minZ: -3.4, maxZ: -0.6 },
  // 5. Cyber Security Archive Bookcase (Back Wall Center, [0.6, 0, -4.75])
  { minX: -0.6, maxX: 1.8, minZ: -4.95, maxZ: -4.5 },
  // 6. 42U Mainframe Server Rack (Back Wall Left, [-2.3, 0, -4.55])
  { minX: -2.75, maxX: -1.85, minZ: -4.95, maxZ: -4.12 },
  // 7. Lounge Leather Couch (Rotated 45 deg, [2.8, 0, 1.6])
  { minX: 2.0, maxX: 3.8, minZ: 0.8, maxZ: 2.5 },
  // 8. Lounge Coffee Table (Marble Disc, [1.95, 0, 0.85])
  { minX: 1.45, maxX: 2.45, minZ: 0.35, maxZ: 1.35 },
  // 9. Laser Printer Credenza Storage ([-3.6, 0, 0.8])
  { minX: -4.2, maxX: -3.0, minZ: 0.47, maxZ: 1.13 },
  // 10. Tall Designer Monstera Plant (Back Right Corner, [2.2, 0, -4.2])
  { minX: 1.9, maxX: 2.5, minZ: -4.5, maxZ: -3.9 },
  // 11. Potted Plant (Left Front Corner, [-4.4, 0, 1.8])
  { minX: -4.7, maxX: -4.1, minZ: 1.5, maxZ: 2.1 },
];

/**
 * Continuous Circle-AABB Resolution with Depenetration.
 * Prevents getting stuck on corners or obstacle surfaces:
 * 1. Pushes player center out along collision normal.
 * 2. Removes only velocity components moving INTO the obstacle (v . n < 0).
 * 3. Moving away from an obstacle is ALWAYS allowed with 0 resistance.
 */
function resolveCircleAABB(pos, vel, box, radius) {
  const cx = Math.max(box.minX, Math.min(pos.x, box.maxX));
  const cz = Math.max(box.minZ, Math.min(pos.z, box.maxZ));

  const dx = pos.x - cx;
  const dz = pos.z - cz;
  const distSq = dx * dx + dz * dz;

  if (distSq < radius * radius) {
    const dist = Math.sqrt(distSq);

    if (dist > 0.0001) {
      const nx = dx / dist;
      const nz = dz / dist;
      const penetration = radius - dist;

      // Gently push out
      pos.x += nx * penetration;
      pos.z += nz * penetration;

      // Cancel only velocity into the surface
      const velNormal = vel.x * nx + vel.z * nz;
      if (velNormal < 0) {
        vel.x -= velNormal * nx;
        vel.z -= velNormal * nz;
      }
    } else {
      // Center penetrated inside box: push out to nearest edge
      const dLeft = Math.abs(pos.x - box.minX);
      const dRight = Math.abs(pos.x - box.maxX);
      const dBottom = Math.abs(pos.z - box.minZ);
      const dTop = Math.abs(pos.z - box.maxZ);
      const minD = Math.min(dLeft, dRight, dBottom, dTop);

      if (minD === dLeft) {
        pos.x = box.minX - radius;
        if (vel.x > 0) vel.x = 0;
      } else if (minD === dRight) {
        pos.x = box.maxX + radius;
        if (vel.x < 0) vel.x = 0;
      } else if (minD === dBottom) {
        pos.z = box.minZ - radius;
        if (vel.z > 0) vel.z = 0;
      } else {
        pos.z = box.maxZ + radius;
        if (vel.z < 0) vel.z = 0;
      }
    }
  }
}

/**
 * Clamps player to room outer walls and airlock doorway without freezing.
 * Room walls inner boundaries: X in [-4.95, 4.95], Z in [-4.95, 4.95].
 * Airlock doorway on right wall at Z in [-3.75, -1.85] allows stepping into airlock vestibule up to X = 6.6.
 */
function clampToRoomBounds(pos, vel, radius) {
  const inDoorwayZ = pos.z >= -3.75 && pos.z <= -1.85;

  // Left wall
  if (pos.x < -4.85 + radius) {
    pos.x = -4.85 + radius;
    if (vel.x < 0) vel.x = 0;
  }

  // Right wall & entrance doorway
  if (inDoorwayZ) {
    if (pos.x > 6.6 - radius) {
      pos.x = 6.6 - radius;
      if (vel.x > 0) vel.x = 0;
    }
  } else {
    if (pos.x > 4.85 - radius) {
      pos.x = 4.85 - radius;
      if (vel.x > 0) vel.x = 0;
    }
  }

  // Front & Back walls (adjusting for vestibule corridor)
  if (pos.x > 4.85) {
    // Inside airlock vestibule
    if (pos.z < -3.65 + radius) {
      pos.z = -3.65 + radius;
      if (vel.z < 0) vel.z = 0;
    }
    if (pos.z > -1.95 - radius) {
      pos.z = -1.95 - radius;
      if (vel.z > 0) vel.z = 0;
    }
  } else {
    // Inside room
    if (pos.z < -4.85 + radius) {
      pos.z = -4.85 + radius;
      if (vel.z < 0) vel.z = 0;
    }
    if (pos.z > 4.85 - radius) {
      pos.z = 4.85 - radius;
      if (vel.z > 0) vel.z = 0;
    }
  }
}

// Hoisted temporary objects for 60fps zero-allocation crosshair raycasting
const _tempCamDir = new THREE.Vector3();
const _tempRay = new THREE.Ray();
const _tempHitPoint = new THREE.Vector3();

export default function FirstPersonController({
  isActive,
  onProximityChange,
  onInteract,
  mobileInput = { x: 0, y: 0 },
}) {
  const { camera, gl } = useThree();

  // Player position & smoothed kinematics
  const playerPos = useRef(new THREE.Vector3(3.4, 1.68, -2.6));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  // Orientation with target damping for silky-smooth mouse look
  const yaw = useRef(2.22);
  const targetYaw = useRef(2.22);
  const pitch = useRef(-0.06);
  const targetPitch = useRef(-0.06);
  const rollZ = useRef(0);

  // Dynamic head-bobbing & footsteps
  const walkDist = useRef(0);
  const lastFootstepDist = useRef(0);
  const bobY = useRef(0);
  const activeTargetRef = useRef(null);

  // Key tracking: W = Forward, S = Backward, A = Left, D = Right
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
  });

  // Pointer lock state
  const isPointerLocked = useRef(false);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Sync position & reset input states whenever explore mode becomes active
  useEffect(() => {
    if (!isActive) {
      keys.current = { forward: false, backward: false, left: false, right: false, sprint: false };
      velocity.current.set(0, 0, 0);
      return;
    }

    // Synchronize position with camera if camera has valid coordinates
    if (Math.abs(camera.position.x) > 0.01 || Math.abs(camera.position.z) > 0.01) {
      playerPos.current.x = camera.position.x;
      playerPos.current.z = camera.position.z;
    }

    // Reset keys and velocity so character never gets stuck in a move state
    keys.current = { forward: false, backward: false, left: false, right: false, sprint: false };
    velocity.current.set(0, 0, 0);

    const canvas = gl.domElement;

    // Helper: checks whether an event targets an interactive input element
    const isInputElement = (target) => {
      if (!target) return false;
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
    };

    // 1. Keyboard Controls: Supports both e.code (keyboard-layout immune) and e.key
    const onKeyDown = (e) => {
      if (isInputElement(e.target)) return;

      const code = e.code;
      const key = e.key;
      const lowerKey = key ? key.toLowerCase() : '';
      let handled = false;

      // W = Forward (ArrowUp fallback)
      if (code === 'KeyW' || lowerKey === 'w' || code === 'ArrowUp') {
        keys.current.forward = true;
        handled = true;
      }
      // S = Backward (ArrowDown fallback)
      if (code === 'KeyS' || lowerKey === 's' || code === 'ArrowDown') {
        keys.current.backward = true;
        handled = true;
      }
      // A = Left (ArrowLeft fallback)
      if (code === 'KeyA' || lowerKey === 'a' || code === 'ArrowLeft') {
        keys.current.left = true;
        handled = true;
      }
      // D = Right (ArrowRight fallback)
      if (code === 'KeyD' || lowerKey === 'd' || code === 'ArrowRight') {
        keys.current.right = true;
        handled = true;
      }
      // Shift = Sprint
      if (key === 'Shift' || code === 'ShiftLeft' || code === 'ShiftRight') {
        keys.current.sprint = true;
        handled = true;
      }

      if (handled) {
        e.preventDefault();
      }

      // Alternative Keyboard Interact: 'E' or Space
      if (lowerKey === 'e' || code === 'KeyE') {
        if (activeTargetRef.current) {
          playClickSound(1100);
          onInteract(activeTargetRef.current.id);
        }
      }
    };

    const onKeyUp = (e) => {
      const code = e.code;
      const key = e.key;
      const lowerKey = key ? key.toLowerCase() : '';

      if (code === 'KeyW' || lowerKey === 'w' || code === 'ArrowUp') {
        keys.current.forward = false;
      }
      if (code === 'KeyS' || lowerKey === 's' || code === 'ArrowDown') {
        keys.current.backward = false;
      }
      if (code === 'KeyA' || lowerKey === 'a' || code === 'ArrowLeft') {
        keys.current.left = false;
      }
      if (code === 'KeyD' || lowerKey === 'd' || code === 'ArrowRight') {
        keys.current.right = false;
      }
      if (key === 'Shift' || code === 'ShiftLeft' || code === 'ShiftRight') {
        keys.current.sprint = false;
      }
    };

    // Window blur: Clear all keys if window/tab loses focus to prevent stuck keys
    const onWindowBlur = () => {
      keys.current = { forward: false, backward: false, left: false, right: false, sprint: false };
      velocity.current.set(0, 0, 0);
    };

    // 2. Mouse Clicks: Left Click interacts with targeted objects / locks pointer
    const onMouseDown = (e) => {
      if (e.target.closest && e.target.closest('button, input, a, .hud-top-bar, .hud-bottom-bar, .quick-nav-dock')) {
        return;
      }

      // Ensure active element blur so keys are captured cleanly
      if (document.activeElement && document.activeElement !== canvas && document.activeElement.blur) {
        document.activeElement.blur();
      }

      if (e.button === 0) {
        // If an object is targeted, LEFT CLICK interacts with it!
        if (activeTargetRef.current) {
          playClickSound(1100);
          onInteract(activeTargetRef.current.id);
          return;
        }

        // Otherwise request pointer lock for smooth camera control
        if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
          try {
            const req = canvas.requestPointerLock();
            if (req && typeof req.catch === 'function') req.catch(() => {});
          } catch (err) {}
        }

        if (!isPointerLocked.current) {
          isDragging.current = true;
          lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
      }
    };

    const onCanvasClick = (e) => {
      if (e.target.closest && e.target.closest('button, input, a, .hud-top-bar, .hud-bottom-bar, .quick-nav-dock')) {
        return;
      }
      if (activeTargetRef.current) {
        playClickSound(1100);
        onInteract(activeTargetRef.current.id);
        return;
      }
      if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
        try {
          const req = canvas.requestPointerLock();
          if (req && typeof req.catch === 'function') req.catch(() => {});
        } catch (err) {}
      }
    };

    const onPointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    // 3. Mouse Movement: Pointer Lock + Drag fallback
    const onMouseMove = (e) => {
      if (isPointerLocked.current) {
        const sensitivity = 0.0022;
        targetYaw.current -= e.movementX * sensitivity;
        targetPitch.current -= e.movementY * sensitivity;
        targetPitch.current = Math.max(-1.3, Math.min(1.3, targetPitch.current));
      } else if (isDragging.current) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.003;
        targetYaw.current -= dx * sensitivity;
        targetPitch.current -= dy * sensitivity;
        targetPitch.current = Math.max(-1.3, Math.min(1.3, targetPitch.current));
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    // 4. Touch Look for Mobile Phones & Tablets
    let touchLookId = null;
    let touchLastX = 0;
    let touchLastY = 0;
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e) => {
      const target = e.target;
      if (
        target &&
        target.closest &&
        target.closest(
          'button, input, a, .hud-top-bar, .hud-bottom-bar, .hud-wasd-widget, .hud-mobile-joystick-zone, .hud-mobile-interact-btn, .proximity-action-btn'
        )
      ) {
        return;
      }

      if (touchLookId === null && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        touchLookId = touch.identifier;
        touchLastX = touch.clientX;
        touchLastY = touch.clientY;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
      }
    };

    const onTouchMove = (e) => {
      if (touchLookId === null) return;
      const touch = Array.from(e.changedTouches).find((t) => t.identifier === touchLookId);
      if (!touch) return;

      const dx = touch.clientX - touchLastX;
      const dy = touch.clientY - touchLastY;
      touchLastX = touch.clientX;
      touchLastY = touch.clientY;

      const touchSensitivity = 0.0036;
      targetYaw.current -= dx * touchSensitivity;
      targetPitch.current -= dy * touchSensitivity;
      targetPitch.current = Math.max(-1.3, Math.min(1.3, targetPitch.current));
    };

    const onTouchEnd = (e) => {
      if (touchLookId === null) return;
      const touch = Array.from(e.changedTouches).find((t) => t.identifier === touchLookId);
      if (!touch) return;

      const elapsed = Date.now() - touchStartTime;
      const dist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);
      touchLookId = null;

      // Quick tap without dragging on a targeted station triggers interaction
      if (elapsed < 300 && dist < 12 && activeTargetRef.current) {
        playClickSound(1100);
        onInteract(activeTargetRef.current.id);
      }
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp, { passive: false });
    window.addEventListener('blur', onWindowBlur);
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      canvas.removeEventListener('click', onCanvasClick);
      canvas.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);

      if (document.pointerLockElement === canvas && document.exitPointerLock) {
        try {
          document.exitPointerLock();
        } catch (err) {}
      }
    };
  }, [isActive, gl, onInteract, camera]);

  useFrame((state, delta) => {
    if (!isActive) return;

    const time = state.clock.getElapsedTime();
    const clampedDelta = Math.min(delta, 0.05);

    // =========================================================================
    // 1. SMOOTH MOUSE LOOK DAMPING (Eliminates jitter, butter-smooth camera)
    // =========================================================================
    yaw.current = THREE.MathUtils.damp(yaw.current, targetYaw.current, 28, clampedDelta);
    pitch.current = THREE.MathUtils.damp(pitch.current, targetPitch.current, 28, clampedDelta);

    // =========================================================================
    // 2. DIRECTIONAL INPUT (W=Forward, S=Backward, A=Left, D=Right) & KINEMATICS
    // =========================================================================
    let inputForward = 0;
    let inputRight = 0;

    if (keys.current.forward) inputForward += 1;
    if (keys.current.backward) inputForward -= 1;
    if (keys.current.right) inputRight += 1;
    if (keys.current.left) inputRight -= 1;

    // Mobile Virtual Touch Joystick support
    if (mobileInput && (Math.abs(mobileInput.x) > 0.05 || Math.abs(mobileInput.y) > 0.05)) {
      inputRight += mobileInput.x;
      inputForward += -mobileInput.y;
    }

    const isMoving = Math.abs(inputForward) > 0.01 || Math.abs(inputRight) > 0.01;
    const targetSpeed = keys.current.sprint ? 4.4 : 2.8;

    let targetVelX = 0;
    let targetVelZ = 0;

    if (isMoving) {
      const len = Math.hypot(inputForward, inputRight);
      const normFwd = inputForward / len;
      const normRight = inputRight / len;

      const sinY = Math.sin(yaw.current);
      const cosY = Math.cos(yaw.current);

      // Camera forward vector in Three.js right-handed coordinate system (YXZ order):
      // W (Forward):  (-sin(yaw), -cos(yaw))
      // S (Backward): (+sin(yaw), +cos(yaw))
      // D (Right):    (+cos(yaw), -sin(yaw))
      // A (Left):     (-cos(yaw), +sin(yaw))
      const fwdX = -sinY;
      const fwdZ = -cosY;
      const rightX = cosY;
      const rightZ = -sinY;

      targetVelX = (normFwd * fwdX + normRight * rightX) * targetSpeed;
      targetVelZ = (normFwd * fwdZ + normRight * rightZ) * targetSpeed;
    }

    // Velocity momentum damping (smooth acceleration & coasting deceleration)
    const accelRate = isMoving ? 14.0 : 16.0;
    velocity.current.x = THREE.MathUtils.damp(velocity.current.x, targetVelX, accelRate, clampedDelta);
    velocity.current.z = THREE.MathUtils.damp(velocity.current.z, targetVelZ, accelRate, clampedDelta);

    const currentSpeed = Math.hypot(velocity.current.x, velocity.current.z);

    // =========================================================================
    // 3. ROBUST COLLISION DETECTION & SLIDING (NEVER GETS STUCK)
    // =========================================================================
    const playerRadius = 0.22;

    // Apply movement delta
    playerPos.current.x += velocity.current.x * clampedDelta;
    playerPos.current.z += velocity.current.z * clampedDelta;

    // Resolve obstacles using continuous circle-AABB depenetration (2-pass for multi-obstacle sliding)
    for (let iter = 0; iter < 2; iter++) {
      for (const obs of OBSTACLES) {
        resolveCircleAABB(playerPos.current, velocity.current, obs, playerRadius);
      }
      clampToRoomBounds(playerPos.current, velocity.current, playerRadius);
    }

    // =========================================================================
    // 4. SMOOTH HEAD-BOB, SUBTLE ROLL & PROCEDURAL FOOTSTEPS
    // =========================================================================
    const frameSpeed = currentSpeed * clampedDelta;
    walkDist.current += frameSpeed;

    const isMovingNoticeably = currentSpeed > 0.15;
    const targetBob = isMovingNoticeably
      ? Math.sin(walkDist.current * 6.8) * Math.min(0.035, 0.015 + currentSpeed * 0.007)
      : Math.sin(time * 1.5) * 0.004;

    bobY.current = THREE.MathUtils.damp(bobY.current, targetBob, 12, clampedDelta);

    // Subtle bank roll when strafing left/right
    const strafeFactor = inputRight * (keys.current.sprint ? 0.02 : 0.012);
    rollZ.current = THREE.MathUtils.damp(rollZ.current, -strafeFactor, 10, clampedDelta);

    // Footstep audio trigger
    if (walkDist.current - lastFootstepDist.current > 0.68) {
      const px = playerPos.current.x;
      const pz = playerPos.current.z;
      const isRug =
        (px >= -2.8 && px <= 1.4 && pz >= -1.0 && pz <= 2.2) ||
        (px >= 1.0 && px <= 4.2 && pz >= 0.2 && pz <= 3.0);

      playFootstepSound(isRug);
      lastFootstepDist.current = walkDist.current;
    }

    // Update camera transform
    camera.position.x = playerPos.current.x;
    camera.position.y = 1.68 + bobY.current;
    camera.position.z = playerPos.current.z;

    camera.rotation.set(0, 0, 0);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = rollZ.current;

    // =========================================================================
    // 5. TRUE 3D CROSSHAIR RAYCAST TARGETING (EXACT OBJECT PIERCING)
    // Shows details ONLY when the crosshair ray directly intersects the 3D volume of an object.
    // If the crosshair is pointing at the window, floor, ceiling, or empty air, NOTHING is shown.
    // =========================================================================
    camera.getWorldDirection(_tempCamDir);
    _tempRay.origin.copy(camera.position);
    _tempRay.direction.copy(_tempCamDir);

    let bestTarget = null;
    let minHitDist = Infinity;

    for (const st of STATIONS) {
      if (!st.boxes) continue;
      for (const box of st.boxes) {
        const hit = _tempRay.intersectBox(box, _tempHitPoint);
        if (hit !== null) {
          const hitDist = camera.position.distanceTo(_tempHitPoint);
          if (hitDist <= st.maxDist && hitDist < minHitDist) {
            minHitDist = hitDist;
            bestTarget = { ...st, dist: hitDist, isAimed: true };
          }
        }
      }
    }

    if (bestTarget?.id !== activeTargetRef.current?.id) {
      if (bestTarget && !activeTargetRef.current) {
        playProximityChime();
      }
      activeTargetRef.current = bestTarget;
      onProximityChange(bestTarget);
    }
  });

  return null;
}
