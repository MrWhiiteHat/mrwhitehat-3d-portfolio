// 3D HACKING CIRCUIT PUZZLE LOGIC & EVALUATION ENGINE
// Watch Dogs 2–inspired spatial network bypass rules, graph propagation, and validation

/**
 * Port Directions:
 * 0: North / Top (+Z or +Y depending on orientation)
 * 1: East / Right (+X)
 * 2: South / Bottom (-Z or -Y)
 * 3: West / Left (-X)
 */

export const NODE_TYPES = {
  SOURCE: 'source',
  SWITCH_STRAIGHT: 'switch_straight',
  SWITCH_ELBOW: 'switch_elbow',
  SWITCH_T: 'switch_t',
  LOCKED_ROUTER: 'locked_router',
  KEY_NODE: 'key_node',
  HOSTILE_IDS: 'hostile_ids',
  TARGET: 'target',
};

/**
 * Returns the currently active ports for a node based on its type, basePorts, and rotationIndex
 */
export function getActivePorts(node) {
  if (node.isLocked) {
    return []; // Locked router conducts zero power until unlocked
  }
  const rot = node.rotationIndex || 0;
  const base = node.basePorts || [0, 1, 2, 3];
  return base.map((p) => (p + rot) % 4);
}

// -------------------------------------------------------------
// STAGE DEFINITIONS
// -------------------------------------------------------------

export const STAGES = [
  // -----------------------------------------------------------
  // STAGE 1: SIGNAL TRACE (Tutorial / Local Subnet Infiltration)
  // -----------------------------------------------------------
  {
    id: 'stage_1',
    stageNumber: 1,
    title: 'STAGE 01 // SIGNAL TRACE',
    objective: 'Rotate circuit switches to route carrier signal to the Workstation Gateway',
    targetName: 'DUAL-MONITOR WORKSTATION',
    timeLimit: null, // Relaxed tutorial
    cameraPreset: 'DESK_VIEW',
    camPos: [1.8, 2.0, 2.2],
    camTarget: [0.1, 0.55, 0.5],
    nodes: [
      {
        id: 's1_n0',
        type: NODE_TYPES.SOURCE,
        position: [1.80, 0.55, 0.95],
        basePorts: [3], // West (-X)
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Coffee Table Terminal',
        desc: 'Carrier Signal Injector',
      },
      {
        id: 's1_n1',
        type: NODE_TYPES.SWITCH_ELBOW,
        position: [0.80, 0.55, 0.95],
        basePorts: [1, 2], // East (+X), South (-Z)
        rotationIndex: 2, // Scrambled
        solutionRotation: 0,
        label: 'Floor Conduit A',
        desc: '90° Directional Switch',
      },
      {
        id: 's1_n2',
        type: NODE_TYPES.SWITCH_ELBOW,
        position: [0.80, 0.55, 0.15],
        basePorts: [0, 3], // North (+Z), West (-X)
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Floor Conduit B',
        desc: '90° Directional Switch',
      },
      {
        id: 's1_n3',
        type: NODE_TYPES.SWITCH_STRAIGHT,
        position: [-0.10, 0.55, 0.15],
        basePorts: [1, 3], // East (+X), West (-X)
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Under-Desk Bus',
        desc: '180° In-Line Bridge',
      },
      {
        id: 's1_n4',
        type: NODE_TYPES.SWITCH_STRAIGHT,
        position: [-0.90, 0.55, 0.15],
        basePorts: [1, 3], // East (+X), West (-X)
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Desk Riser Relay',
        desc: '180° In-Line Bridge',
      },
      {
        id: 's1_n5',
        type: NODE_TYPES.TARGET,
        position: [-1.55, 0.55, 0.15],
        basePorts: [1], // East (+X)
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Workstation Gateway',
        desc: 'Target Security Port',
      },
    ],
    connections: [
      { from: 's1_n0', fromPort: 3, to: 's1_n1', toPort: 1 },
      { from: 's1_n1', fromPort: 2, to: 's1_n2', toPort: 0 },
      { from: 's1_n2', fromPort: 3, to: 's1_n3', toPort: 1 },
      { from: 's1_n3', fromPort: 3, to: 's1_n4', toPort: 1 },
      { from: 's1_n4', fromPort: 3, to: 's1_n5', toPort: 1 },
    ],
  },

  // -----------------------------------------------------------
  // STAGE 2: SECURITY BYPASS (Locked Router & Hostile IDS)
  // -----------------------------------------------------------
  {
    id: 'stage_2',
    stageNumber: 2,
    title: 'STAGE 02 // SECURITY BYPASS',
    objective: 'Power the Encryption Key to Unlock Router; Avoid Red Alarm Sensor',
    targetName: '42U HARDENED SERVER RACK',
    timeLimit: null,
    cameraPreset: 'SERVER_WALL',
    camPos: [-2.6, 2.0, 0.4],
    camTarget: [-2.9, 2.0, -3.85],
    nodes: [
      {
        id: 's2_n0',
        type: NODE_TYPES.SOURCE,
        position: [-1.40, 2.40, -3.85],
        orientation: 'wall_z',
        basePorts: [3], // Left (-X)
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Tactical Arsenal Bus',
        desc: 'Carrier Signal Injector',
      },
      {
        id: 's2_n1',
        type: NODE_TYPES.SWITCH_T,
        position: [-2.40, 2.40, -3.85],
        orientation: 'wall_z',
        basePorts: [1, 2, 3], // Right from Source, Down to Key, Left to Router
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Wall Master Splitter',
        desc: '3-Way Junction Router',
      },
      {
        id: 's2_n2',
        type: NODE_TYPES.HOSTILE_IDS,
        position: [-2.40, 3.20, -3.85],
        orientation: 'wall_z',
        basePorts: [2], // Down (-Y)
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'CTOS Perimeter Alarm',
        desc: 'HOSTILE: Intrusion Sensor',
      },
      {
        id: 's2_n3',
        type: NODE_TYPES.SWITCH_ELBOW,
        position: [-2.40, 1.40, -3.85],
        orientation: 'wall_z',
        basePorts: [0, 1], // Up from Splitter, Right to Key
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Briefing Table Bus A',
        desc: '90° Directional Switch',
      },
      {
        id: 's2_n4',
        type: NODE_TYPES.KEY_NODE,
        position: [-1.40, 1.40, -3.85],
        orientation: 'wall_z',
        basePorts: [3], // Left from Elbow
        unlocksNodeId: 's2_n6',
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Encryption Key Sub-Node',
        desc: 'De-scrambles Security Router Lock',
      },
      {
        id: 's2_n5',
        type: NODE_TYPES.SWITCH_STRAIGHT,
        position: [-3.20, 2.40, -3.85],
        orientation: 'wall_z',
        basePorts: [1, 3], // Right from Splitter, Left to Router
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Lower Conduit Line',
        desc: '180° In-Line Bridge',
      },
      {
        id: 's2_n6',
        type: NODE_TYPES.LOCKED_ROUTER,
        position: [-3.90, 2.40, -3.85],
        orientation: 'wall_z',
        basePorts: [1, 3], // Right from Straight, Left to Elbow
        rotationIndex: 2, // Scrambled
        solutionRotation: 0,
        isLocked: true,
        label: 'CTOS Hardened Router',
        desc: 'LOCKED // Requires Encryption Key',
      },
      {
        id: 's2_n7',
        type: NODE_TYPES.SWITCH_ELBOW,
        position: [-4.50, 2.40, -3.85],
        orientation: 'wall_z',
        basePorts: [1, 2], // Right from Router, Down to Target
        rotationIndex: 3, // Scrambled
        solutionRotation: 0,
        label: 'Server Rack Intake Switch',
        desc: '90° Directional Switch',
      },
      {
        id: 's2_n8',
        type: NODE_TYPES.TARGET,
        position: [-4.50, 1.40, -3.85],
        orientation: 'wall_z',
        basePorts: [0], // Up from Elbow
        rotationIndex: 0,
        solutionRotation: 0,
        label: '42U Mainframe Interface',
        desc: 'Target Security Port',
      },
    ],
    connections: [
      { from: 's2_n0', fromPort: 3, to: 's2_n1', toPort: 1 },
      { from: 's2_n1', fromPort: 2, to: 's2_n3', toPort: 0 },
      { from: 's2_n3', fromPort: 1, to: 's2_n4', toPort: 3 },
      { from: 's2_n1', fromPort: 3, to: 's2_n5', toPort: 1 },
      { from: 's2_n5', fromPort: 3, to: 's2_n6', toPort: 1 },
      { from: 's2_n6', fromPort: 3, to: 's2_n7', toPort: 1 },
      { from: 's2_n7', fromPort: 2, to: 's2_n8', toPort: 0 },
      // Hostile trap: if s2_n1 rotated by 1 (port 0 points Up to s2_n2)
      { from: 's2_n1', fromPort: 0, to: 's2_n2', toPort: 2 },
    ],
  },

  // -----------------------------------------------------------
  // STAGE 3: SYSTEM OVERRIDE (Facility Master Grid)
  // -----------------------------------------------------------
  {
    id: 'stage_3',
    stageNumber: 3,
    title: 'STAGE 03 // SYSTEM OVERRIDE',
    objective: 'Complete Facility Overdrive before Trace Alarm Triggers (3 Min Limit)',
    targetName: 'CYBER SENTINEL DRONE ROOT CORE',
    timeLimit: 180, // 180 seconds countdown (3 minutes)
    cameraPreset: 'ROOM_OVERVIEW',
    camPos: [-1.8, 1.6, 2.0],
    camTarget: [-1.8, 1.4, -3.85],
    nodes: [
      {
        id: 's3_n0',
        type: NODE_TYPES.SOURCE,
        position: [-1.00, 2.50, -3.85],
        orientation: 'wall_z',
        basePorts: [2], // Down (-Y)
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Ceiling Grid Main Bus',
        desc: 'High-Voltage Carrier Source',
      },
      {
        id: 's3_n1',
        type: NODE_TYPES.SWITCH_T,
        position: [-1.00, 1.70, -3.85],
        orientation: 'wall_z',
        basePorts: [0, 1, 3], // Up from Source, Right to Bookcase, Left to Server
        rotationIndex: 2, // Scrambled
        solutionRotation: 0,
        label: 'Overhead Bridge Router',
        desc: '3-Way Junction Router',
      },
      {
        id: 's3_n2',
        type: NODE_TYPES.SWITCH_ELBOW,
        position: [0.60, 1.70, -3.85],
        orientation: 'wall_z',
        basePorts: [3, 2], // Left from Splitter, Down to Mid-Relay
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Bookcase High Conduit',
        desc: '90° Directional Switch',
      },
      {
        id: 's3_n3',
        type: NODE_TYPES.SWITCH_STRAIGHT,
        position: [0.60, 1.10, -3.85],
        orientation: 'wall_z',
        basePorts: [0, 2], // Up from High Conduit, Down to Key
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        label: 'Bookcase Mid-Relay',
        desc: '180° In-Line Bridge',
      },
      {
        id: 's3_n4',
        type: NODE_TYPES.KEY_NODE,
        position: [0.60, 0.50, -3.85],
        orientation: 'wall_z',
        basePorts: [0], // Up from Mid-Relay
        unlocksNodeId: 's3_n6',
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Sub-Routine Alpha',
        desc: 'Unlocks Security Router Alpha',
      },
      {
        id: 's3_n5',
        type: NODE_TYPES.HOSTILE_IDS,
        position: [-1.00, 0.90, -3.85],
        orientation: 'wall_z',
        basePorts: [0], // Up from Splitter Down
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Hostile Sensor A',
        desc: 'HOSTILE: Deducts 5s From Clock!',
      },
      {
        id: 's3_n6',
        type: NODE_TYPES.LOCKED_ROUTER,
        position: [-2.20, 1.70, -3.85],
        orientation: 'wall_z',
        basePorts: [1, 2], // Right from Splitter, Down to Distributor
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        isLocked: true,
        label: 'Security Router Alpha',
        desc: 'LOCKED // Requires Sub-Routine Alpha',
      },
      {
        id: 's3_n7',
        type: NODE_TYPES.SWITCH_T,
        position: [-2.20, 1.00, -3.85],
        orientation: 'wall_z',
        basePorts: [0, 2, 3], // Up from Router Alpha, Down to Key Beta, Left to Router Beta
        rotationIndex: 3, // Scrambled
        solutionRotation: 0,
        label: 'Server Rack Distributor',
        desc: '3-Way Junction Router',
      },
      {
        id: 's3_n8',
        type: NODE_TYPES.KEY_NODE,
        position: [-2.20, 0.35, -3.85],
        orientation: 'wall_z',
        basePorts: [0], // Up from Distributor
        unlocksNodeId: 's3_n10',
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Sub-Routine Beta',
        desc: 'Unlocks Security Router Beta',
      },
      {
        id: 's3_n9',
        type: NODE_TYPES.HOSTILE_IDS,
        position: [-1.60, 1.00, -3.85],
        orientation: 'wall_z',
        basePorts: [3], // Left from Distributor Right
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Hostile Sensor B',
        desc: 'HOSTILE: Deducts 5s From Clock!',
      },
      {
        id: 's3_n10',
        type: NODE_TYPES.LOCKED_ROUTER,
        position: [-3.30, 1.00, -3.85],
        orientation: 'wall_z',
        basePorts: [1, 3], // Right from Distributor, Left to Drone Uplink
        rotationIndex: 1, // Scrambled
        solutionRotation: 0,
        isLocked: true,
        label: 'Security Router Beta',
        desc: 'LOCKED // Requires Sub-Routine Beta',
      },
      {
        id: 's3_n11',
        type: NODE_TYPES.SWITCH_ELBOW,
        position: [-4.20, 1.00, -3.85],
        orientation: 'wall_z',
        basePorts: [1, 0], // Right from Router Beta, Up to Target
        rotationIndex: 2, // Scrambled
        solutionRotation: 0,
        label: 'Corner Drone Uplink',
        desc: '90° Directional Switch',
      },
      {
        id: 's3_n12',
        type: NODE_TYPES.TARGET,
        position: [-4.20, 2.00, -3.85],
        orientation: 'wall_z',
        basePorts: [2], // Down from Uplink
        rotationIndex: 0,
        solutionRotation: 0,
        label: 'Sentinel Drone Root Gateway',
        desc: 'Final Facility Override Core',
      },
    ],
    connections: [
      { from: 's3_n0', fromPort: 2, to: 's3_n1', toPort: 0 },
      { from: 's3_n1', fromPort: 1, to: 's3_n2', toPort: 3 },
      { from: 's3_n2', fromPort: 2, to: 's3_n3', toPort: 0 },
      { from: 's3_n3', fromPort: 2, to: 's3_n4', toPort: 0 },
      { from: 's3_n1', fromPort: 3, to: 's3_n6', toPort: 1 },
      { from: 's3_n6', fromPort: 2, to: 's3_n7', toPort: 0 },
      { from: 's3_n7', fromPort: 2, to: 's3_n8', toPort: 0 },
      { from: 's3_n7', fromPort: 3, to: 's3_n10', toPort: 1 },
      { from: 's3_n10', fromPort: 3, to: 's3_n11', toPort: 1 },
      { from: 's3_n11', fromPort: 0, to: 's3_n12', toPort: 2 },
      // Hostile branches
      { from: 's3_n1', fromPort: 2, to: 's3_n5', toPort: 0 },
      { from: 's3_n7', fromPort: 1, to: 's3_n9', toPort: 3 },
    ],
  },
];

// -------------------------------------------------------------
// CIRCUIT GRAPH PROPAGATION & EVALUATION
// -------------------------------------------------------------

/**
 * Evaluates power flow from Source node across active ports and connections.
 * Returns an evaluation object:
 * {
 *   poweredNodeIds: Set<string>,
 *   poweredConnectionIndices: Set<number>,
 *   unlockedNodeIds: Set<string>,
 *   isHostileTriggered: boolean,
 *   triggeredHostileId: string | null,
 *   isTargetPowered: boolean
 * }
 */
export function evaluateCircuit(stageConfig, nodeStates) {
  const nodesMap = new Map();
  stageConfig.nodes.forEach((n) => {
    const state = nodeStates[n.id] || {};
    nodesMap.set(n.id, {
      ...n,
      rotationIndex: state.rotationIndex !== undefined ? state.rotationIndex : n.rotationIndex,
      isLocked: state.isLocked !== undefined ? state.isLocked : n.isLocked,
    });
  });

  const poweredNodeIds = new Set();
  const poweredConnectionIndices = new Set();
  const unlockedNodeIds = new Set();
  const flowDirections = new Map();

  // Initialize all connections with canonical topological direction (idle/unpowered)
  stageConfig.connections.forEach((conn, idx) => {
    flowDirections.set(idx, {
      fromId: conn.from,
      toId: conn.to,
      forward: true,
      bidirectional: false,
      isPowered: false,
    });
  });

  let isHostileTriggered = false;
  let triggeredHostileId = null;

  // 1. Locate Source Node
  const sourceNode = stageConfig.nodes.find((n) => n.type === NODE_TYPES.SOURCE);
  if (!sourceNode) {
    return {
      poweredNodeIds,
      poweredConnectionIndices,
      unlockedNodeIds,
      isHostileTriggered,
      triggeredHostileId,
      isTargetPowered: false,
      flowDirections,
    };
  }

  // 2. Multi-pass BFS queue
  let changed = true;
  let passes = 0;
  poweredNodeIds.add(sourceNode.id);

  while (changed && passes < 10) {
    changed = false;
    passes++;

    for (const currentId of Array.from(poweredNodeIds)) {
      const currentNode = nodesMap.get(currentId);
      if (!currentNode) continue;

      const activePortsCurrent = getActivePorts(currentNode);

      stageConfig.connections.forEach((conn, connIdx) => {
        let neighborId = null;
        let myPort = null;
        let neighborPort = null;

        if (conn.from === currentId) {
          neighborId = conn.to;
          myPort = conn.fromPort;
          neighborPort = conn.toPort;
        } else if (conn.to === currentId) {
          neighborId = conn.from;
          myPort = conn.toPort;
          neighborPort = conn.fromPort;
        }

        if (!neighborId) return;

        // Check if my active ports include this connection
        if (!activePortsCurrent.includes(myPort)) return;

        const neighborNode = nodesMap.get(neighborId);
        if (!neighborNode) return;

        // Check if neighbor's active ports include this connection
        const activePortsNeighbor = getActivePorts(neighborNode);
        if (!activePortsNeighbor.includes(neighborPort)) return;

        // Valid connected flow!
        if (!poweredConnectionIndices.has(connIdx)) {
          poweredConnectionIndices.add(connIdx);
          changed = true;
        }

        const flow = flowDirections.get(connIdx);
        if (flow) {
          if (!flow.isPowered) {
            flow.isPowered = true;
            flow.fromId = currentId;
            flow.toId = neighborId;
            flow.forward = conn.from === currentId;
            flow.bidirectional = false;
          } else if (flow.fromId !== currentId) {
            flow.bidirectional = true;
          }
        }

        if (!poweredNodeIds.has(neighborId)) {
          poweredNodeIds.add(neighborId);
          changed = true;

          // If this neighbor is a key node, unlock its target router!
          if (neighborNode.type === NODE_TYPES.KEY_NODE && neighborNode.unlocksNodeId) {
            unlockedNodeIds.add(neighborNode.unlocksNodeId);
            const targetLocked = nodesMap.get(neighborNode.unlocksNodeId);
            if (targetLocked && targetLocked.isLocked) {
              targetLocked.isLocked = false;
              changed = true;
            }
          }

          // If this neighbor is hostile
          if (neighborNode.type === NODE_TYPES.HOSTILE_IDS) {
            isHostileTriggered = true;
            triggeredHostileId = neighborId;
          }
        }
      });
    }
  }

  const targetNode = stageConfig.nodes.find((n) => n.type === NODE_TYPES.TARGET);
  const isTargetPowered = targetNode ? poweredNodeIds.has(targetNode.id) : false;

  return {
    poweredNodeIds,
    poweredConnectionIndices,
    unlockedNodeIds,
    isHostileTriggered,
    triggeredHostileId,
    isTargetPowered,
    flowDirections,
  };
}
