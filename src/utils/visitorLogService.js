// ============================================================================
// CTOS VISITOR LOG & WALL COUNTER SERVICE (SIMPLE & CLEAN)
// ============================================================================

const STORAGE_KEY_LOGS = 'mrwhitehat_office_visitor_logs_v3';
const STORAGE_KEY_COUNT = 'mrwhitehat_office_visitor_count_v3';
const BASE_VISITOR_SEED_COUNT = 1482;

const INITIAL_SEED_VISITORS = [
  {
    id: 'seed-01',
    name: 'Aarav Sharma',
    archetype: 'Alpha',
    archetypeName: 'Operative Alpha',
    accentColor: '#34d399',
    timestamp: 'Oct 12, 2026 · 11:42',
  },
  {
    id: 'seed-02',
    name: 'Elena Rostova',
    archetype: 'Beta',
    archetypeName: 'Operative Beta',
    accentColor: '#38bdf8',
    timestamp: 'Oct 12, 2026 · 09:15',
  },
  {
    id: 'seed-03',
    name: 'Vikramaditya Sen',
    archetype: 'Android',
    archetypeName: 'Autonomous Android',
    accentColor: '#ff2244',
    timestamp: 'Oct 11, 2026 · 22:58',
  },
  {
    id: 'seed-04',
    name: 'Sarah Jenkins',
    archetype: 'Alpha',
    archetypeName: 'Operative Alpha',
    accentColor: '#ec4899',
    timestamp: 'Oct 11, 2026 · 18:34',
  },
];

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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_VISITORS;
  } catch (err) {
    return INITIAL_SEED_VISITORS;
  }
}

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

export function registerNewVisitor(visitorData) {
  if (!visitorData || !visitorData.name || !visitorData.name.trim()) {
    return null;
  }

  const cleanName = visitorData.name.trim();
  const logs = getVisitorLogs();
  const currentCount = getVisitorCount();
  const newCount = currentCount + 1;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formattedTime = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const newEntry = {
    id: `vis-${Date.now()}`,
    name: cleanName,
    archetype: visitorData.archetype || 'Alpha',
    archetypeName: visitorData.archetypeName || 'Operative Alpha',
    accentColor: visitorData.accentColor || '#34d399',
    timestamp: formattedTime,
    isCurrent: true,
  };

  const updatedLogs = [
    newEntry,
    ...logs.map((item) => ({ ...item, isCurrent: false })),
  ];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));
      window.localStorage.setItem(STORAGE_KEY_COUNT, String(newCount));
    } catch (err) {}
  }

  return { entry: newEntry, count: newCount, logs: updatedLogs };
}
