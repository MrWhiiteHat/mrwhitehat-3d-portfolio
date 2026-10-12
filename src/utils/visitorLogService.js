// ============================================================================
// CTOS VISITOR LOG & SECURITY TELEMETRY SERVICE
// Manages wall visitor counter, persistent storage, and visitor rosters.
// ============================================================================

const STORAGE_KEY_LOGS = 'mrwhitehat_office_visitor_logs_v2';
const STORAGE_KEY_COUNT = 'mrwhitehat_office_visitor_count_v2';
const BASE_VISITOR_SEED_COUNT = 1482;

// Seed initial authentic visitors to populate the log immediately
const INITIAL_SEED_VISITORS = [
  {
    id: 'seed-01',
    name: 'Aarav Sharma',
    role: 'Cyber Defense Lead · DefCon India',
    archetype: 'Alpha',
    archetypeName: 'Operative Alpha',
    visor: 'mono',
    accentColor: '#34d399',
    division: 'Red Team',
    timestamp: '2026-10-12 11:42:18',
    clearanceLevel: 'LEVEL 4 // SENIOR SPECIALIST',
    ipHash: 'AUTH-NODE::MUMBAI-04',
  },
  {
    id: 'seed-02',
    name: 'Elena Rostova',
    role: 'Staff AppSec Engineer · FinTech CyberLab',
    archetype: 'Beta',
    archetypeName: 'Operative Beta',
    visor: 'dual',
    accentColor: '#38bdf8',
    division: 'Blue Team',
    timestamp: '2026-10-12 09:15:02',
    clearanceLevel: 'LEVEL 5 // SECURITY AUDITOR',
    ipHash: 'AUTH-NODE::BERLIN-09',
  },
  {
    id: 'seed-03',
    name: 'Vikramaditya Sen',
    role: 'Tech Lead & Student Coordinator',
    archetype: 'Android',
    archetypeName: 'Autonomous Android',
    visor: 'crown',
    accentColor: '#ff2244',
    division: 'Purple Team',
    timestamp: '2026-10-11 22:58:44',
    clearanceLevel: 'LEVEL 5 // MAINFRAME ADMIN',
    ipHash: 'AUTH-NODE::CAMPUS-01',
  },
  {
    id: 'seed-04',
    name: 'Sarah Jenkins',
    role: 'Senior Tech Talent Partner · CloudScale',
    archetype: 'Phantom',
    archetypeName: 'Cyber Phantom',
    visor: 'shades',
    accentColor: '#ec4899',
    division: 'Executive Guest',
    timestamp: '2026-10-11 18:34:11',
    clearanceLevel: 'LEVEL 2 // AUTHORIZED ENVOY',
    ipHash: 'AUTH-NODE::LONDON-14',
  },
  {
    id: 'seed-05',
    name: 'Tatsuo Kenji',
    role: 'CTF Captain & Binary Exploiter · 0xNull',
    archetype: 'Netrunner',
    archetypeName: 'Rogue Netrunner',
    visor: 'dual',
    accentColor: '#fbbf24',
    division: 'Red Team',
    timestamp: '2026-10-11 14:02:30',
    clearanceLevel: 'LEVEL 4 // RECON UNIT',
    ipHash: 'AUTH-NODE::TOKYO-07',
  },
  {
    id: 'seed-06',
    name: 'Priyanka Patel',
    role: 'SOC Analyst L3 · Threat Intel Hub',
    archetype: 'Sentinel',
    archetypeName: 'Sentinel Zero',
    visor: 'mono',
    accentColor: '#10b981',
    division: 'Blue Team',
    timestamp: '2026-10-10 20:19:55',
    clearanceLevel: 'LEVEL 3 // THREAT HUNTER',
    ipHash: 'AUTH-NODE::BENGALURU-12',
  },
];

/**
 * Retrieve all registered visitor logs from localStorage with fallback to seed logs.
 */
export function getVisitorLogs() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_SEED_VISITORS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(INITIAL_SEED_VISITORS));
      return INITIAL_SEED_VISITORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SEED_VISITORS;
  } catch (err) {
    console.warn('Failed to parse visitor logs from localStorage:', err);
    return INITIAL_SEED_VISITORS;
  }
}

/**
 * Retrieve the current total visitor count.
 */
export function getVisitorCount() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return BASE_VISITOR_SEED_COUNT + INITIAL_SEED_VISITORS.length;
  }
  try {
    const rawCount = window.localStorage.getItem(STORAGE_KEY_COUNT);
    if (!rawCount) {
      const initialCount = BASE_VISITOR_SEED_COUNT + INITIAL_SEED_VISITORS.length;
      window.localStorage.setItem(STORAGE_KEY_COUNT, String(initialCount));
      return initialCount;
    }
    const num = parseInt(rawCount, 10);
    return isNaN(num) ? BASE_VISITOR_SEED_COUNT + INITIAL_SEED_VISITORS.length : num;
  } catch (err) {
    return BASE_VISITOR_SEED_COUNT + INITIAL_SEED_VISITORS.length;
  }
}

/**
 * Format timestamp to military cyber format
 */
export function formatCyberTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

/**
 * Register a new visitor upon airlock clearance.
 * Adds their character details to the log and increments the total counter.
 */
export function registerNewVisitor(visitorData) {
  if (!visitorData || !visitorData.name || !visitorData.name.trim()) {
    return null;
  }

  const cleanName = visitorData.name.trim();
  const logs = getVisitorLogs();
  const currentCount = getVisitorCount();
  const newCount = currentCount + 1;

  const now = new Date();
  const randomNode = Math.floor(1000 + Math.random() * 9000);

  const newEntry = {
    id: `vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    role: visitorData.role?.trim() || 'Cyber Space Explorer',
    archetype: visitorData.archetype || 'Alpha',
    archetypeName: visitorData.archetypeName || 'Operative Alpha',
    visor: visitorData.visor || 'mono',
    accentColor: visitorData.accentColor || '#34d399',
    division: visitorData.division || 'Special Operative',
    timestamp: formatCyberTimestamp(now),
    clearanceLevel: visitorData.clearanceLevel || 'LEVEL 4 // CLEARANCE GRANTED',
    ipHash: `NODE-${randomNode}::AIRLOCK`,
    isCurrent: true,
  };

  // Mark all previous entries as not current
  const updatedLogs = [
    newEntry,
    ...logs.map((item) => ({ ...item, isCurrent: false })),
  ];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));
      window.localStorage.setItem(STORAGE_KEY_COUNT, String(newCount));
    } catch (err) {
      console.warn('Failed to save new visitor log to localStorage:', err);
    }
  }

  return { entry: newEntry, count: newCount, logs: updatedLogs };
}
