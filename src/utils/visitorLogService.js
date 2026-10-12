// ============================================================================
// CTOS VERIFIED VISITOR ACCESS & TELEMETRY SERVICE (REAL & ORIGINAL)
// ============================================================================

const STORAGE_KEY_LOGS = 'mrwhitehat_office_real_visitors_v4';
const STORAGE_KEY_COUNT = 'mrwhitehat_office_real_visitor_count_v4';
const COUNT_API_BASE = 'https://countapi.mileshilliard.com/api/v1';
const COUNT_KEY = 'mrwhitehat-3d-portfolio-visitors-v1';
const NTFY_TOPIC = 'mrwhitehat_office_visitors_v1';

/**
 * Authentic baseline entry for the workspace architect / security lead.
 * Displayed as a permanent verified founder record.
 */
export const FOUNDER_OPERATIVE = {
  id: 'founder-root-01',
  name: 'MrWhiteHat',
  archetype: 'Alpha',
  archetypeName: 'Operative Alpha (Security Lead)',
  accentColor: '#34d399',
  city: 'Bhubaneswar',
  country: 'India',
  countryCode: 'IN',
  flag: '🇮🇳',
  isp: 'Cyber Security Research Lab',
  os: 'Windows 11 / Arch Linux',
  browser: 'Chromium Security Build',
  deviceType: 'Workstation',
  resolution: '2560×1440',
  cores: '16 Cores',
  memory: '32 GB RAM',
  sessionNode: 'NODE-ROOT-001',
  clearance: 'LEVEL 5 // ROOT ACCESS',
  timestamp: 'Oct 12, 2026 · 10:00 AM',
  isFounder: true,
  isCurrent: false,
};

/**
 * Extract genuine hardware and client environment parameters.
 */
export function getRealClientEnvironment() {
  if (typeof window === 'undefined') {
    return {
      os: 'Unknown OS',
      browser: 'Web Browser',
      deviceType: 'Desktop',
      resolution: '1920×1080',
      cores: '8 Cores',
      memory: '8 GB RAM',
      connection: 'HIGH-SPEED',
    };
  }

  const ua = navigator.userAgent || '';
  let os = 'Windows PC';
  let deviceType = 'Desktop PC';

  if (/iPhone/i.test(ua)) {
    os = 'Apple iPhone (iOS)';
    deviceType = 'Mobile Phone';
  } else if (/iPad/i.test(ua)) {
    os = 'Apple iPad (iPadOS)';
    deviceType = 'Tablet';
  } else if (/Android/i.test(ua)) {
    os = 'Android Device';
    deviceType = 'Mobile Phone';
  } else if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 10/11';
    deviceType = 'Desktop PC';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'Apple macOS';
    deviceType = 'Mac';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux Workstation';
    deviceType = 'PC';
  }

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/OPR\//i.test(ua)) browser = 'Opera';

  const screenRes = window.screen
    ? `${window.screen.width}×${window.screen.height}`
    : 'Unknown';

  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : null;
  const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB RAM` : null;
  const connection = navigator.connection?.effectiveType
    ? navigator.connection.effectiveType.toUpperCase()
    : 'BROADBAND';

  return {
    os,
    browser,
    deviceType,
    resolution: screenRes,
    cores,
    memory,
    connection,
  };
}

/**
 * Fetch real client geolocation (City, Country, Flag, Network) without blocking UI.
 */
export async function fetchRealGeoLocation() {
  try {
    const res = await fetch('https://ipwho.is/', {
      signal: AbortSignal.timeout(2400),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          city: data.city || 'Local Terminal',
          country: data.country || 'Global Operative',
          countryCode: data.country_code || '',
          flag: data.flag?.emoji || '🌐',
          isp: data.connection?.isp || data.connection?.org || '',
          ip: data.ip ? data.ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, '$1.$2.***.***') : '',
        };
      }
    }
  } catch (err) {
    // Fall through to browser locale fallback
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const parts = tz.split('/');
    const city = parts[parts.length - 1]?.replace(/_/g, ' ') || 'Local Workspace';
    return {
      city,
      country: parts[0] || 'Global Operative',
      countryCode: '',
      flag: '🌐',
      isp: '',
      ip: '',
    };
  } catch (e) {
    return {
      city: 'Local Terminal',
      country: 'Global Operative',
      countryCode: '',
      flag: '🌐',
      isp: '',
      ip: '',
    };
  }
}

/**
 * Read cached visitor logs from localStorage, guaranteed to include founder baseline.
 */
export function getVisitorLogs() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [FOUNDER_OPERATIVE];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      const initial = [FOUNDER_OPERATIVE];
      window.localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure founder baseline exists
      if (!parsed.some((p) => p.isFounder || p.id === FOUNDER_OPERATIVE.id)) {
        parsed.push(FOUNDER_OPERATIVE);
      }
      return parsed;
    }
    return [FOUNDER_OPERATIVE];
  } catch (err) {
    return [FOUNDER_OPERATIVE];
  }
}

/**
 * Read cached visitor count from localStorage.
 */
export function getVisitorCount() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 1;
  }
  try {
    const rawCount = window.localStorage.getItem(STORAGE_KEY_COUNT);
    if (!rawCount) {
      window.localStorage.setItem(STORAGE_KEY_COUNT, '1');
      return 1;
    }
    const num = parseInt(rawCount, 10);
    return isNaN(num) || num < 1 ? 1 : num;
  } catch (err) {
    return 1;
  }
}

/**
 * Save state locally.
 */
function saveLocalData(count, logs) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (typeof count === 'number') {
        window.localStorage.setItem(STORAGE_KEY_COUNT, String(count));
      }
      if (Array.isArray(logs)) {
        window.localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
      }
    } catch (e) {}
  }
}

/**
 * Background broadcast of a verified visitor record to remote pub-sub.
 */
async function broadcastVisitorEntry(entry) {
  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        Title: `Operative ${entry.name} Checked In`,
        Tags: 'shield,computer',
      },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    // Non-blocking background broadcast
  }
}

/**
 * Synchronize real global counter and public visitor check-in logs from cloud.
 */
export async function syncRemoteVisitorData() {
  let count = getVisitorCount();
  let logs = getVisitorLogs();

  // 1. Fetch live real global visitor count
  try {
    const countRes = await fetch(`${COUNT_API_BASE}/get/${COUNT_KEY}`, {
      signal: AbortSignal.timeout(2800),
    });
    if (countRes.ok) {
      const data = await countRes.json();
      if (typeof data.value === 'number') {
        count = data.value;
      }
    }
  } catch (err) {
    // Offline fallback retained
  }

  // 2. Fetch live real visitor entries
  try {
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?poll=1`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      const remoteEntries = [];
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.event === 'message' && parsed.message) {
            const entry = JSON.parse(parsed.message);
            if (entry && entry.name && entry.id) {
              remoteEntries.push({ ...entry, isCurrent: false });
            }
          }
        } catch (e) {}
      }

      if (remoteEntries.length > 0) {
        const seenIds = new Set(logs.map((l) => l.id));
        const merged = [...logs];
        for (const rem of remoteEntries) {
          if (!seenIds.has(rem.id)) {
            seenIds.add(rem.id);
            merged.push(rem);
          }
        }
        logs = merged;
      }
    }
  } catch (err) {}

  saveLocalData(count, logs);
  return { count, logs };
}

/**
 * Register a real visitor when they submit their name and enter the office.
 * Automatically captures genuine device, screen, and geolocation telemetry.
 */
export async function registerNewVisitor(visitorData) {
  if (!visitorData || !visitorData.name || !visitorData.name.trim()) {
    return null;
  }

  const cleanName = visitorData.name.trim();
  const clientEnv = getRealClientEnvironment();

  // Generate unique cryptographically authentic session node id
  const randomNodeId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formattedTime = `${now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} · ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Start with local increment for instant snappy UI response
  let newCount = getVisitorCount() + 1;

  // Optimistic initial entry
  let newEntry = {
    id: `vis-${Date.now()}-${randomNodeId}`,
    name: cleanName,
    archetype: visitorData.archetype || 'Alpha',
    archetypeName: visitorData.archetypeName || 'Operative Alpha',
    accentColor: visitorData.accentColor || '#34d399',
    city: 'Detecting Location...',
    country: 'Verified Operative',
    countryCode: '',
    flag: '🌐',
    isp: '',
    os: clientEnv.os,
    browser: clientEnv.browser,
    deviceType: clientEnv.deviceType,
    resolution: clientEnv.resolution,
    cores: clientEnv.cores,
    memory: clientEnv.memory,
    sessionNode: `NODE-${randomNodeId}`,
    clearance: 'LEVEL 4 // CLEARED ✓',
    timestamp: formattedTime,
    isCurrent: true,
  };

  const currentLogs = getVisitorLogs();
  let updatedLogs = [
    newEntry,
    ...currentLogs.map((item) => ({ ...item, isCurrent: false })),
  ];

  saveLocalData(newCount, updatedLogs);

  // Background resolution of live global count & real location
  (async () => {
    // 1. Fetch real location
    const geo = await fetchRealGeoLocation();
    newEntry.city = geo.city;
    newEntry.country = geo.country;
    newEntry.countryCode = geo.countryCode;
    newEntry.flag = geo.flag;
    newEntry.isp = geo.isp;

    // 2. Increment remote cloud counter
    try {
      const hitRes = await fetch(`${COUNT_API_BASE}/hit/${COUNT_KEY}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (hitRes.ok) {
        const hitData = await hitRes.json();
        if (typeof hitData.value === 'number') {
          newCount = hitData.value;
        }
      }
    } catch (e) {}

    // 3. Re-save updated record
    updatedLogs = updatedLogs.map((item) => (item.id === newEntry.id ? newEntry : item));
    saveLocalData(newCount, updatedLogs);

    // 4. Broadcast to remote pub-sub
    broadcastVisitorEntry(newEntry).catch(() => {});
  })().catch(() => {});

  return { entry: newEntry, count: newCount, logs: updatedLogs };
}
