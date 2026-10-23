// ============================================================================
// SPEEDRUN LEADERBOARD & BREACH TELEMETRY SERVICE
// ============================================================================

const STORAGE_KEY_LEADERBOARD = 'mrwhitehat_speedrun_leaderboard_v1';
const STORAGE_KEY_PERSONAL_BESTS = 'mrwhitehat_speedrun_personal_bests_v1';

export const PUZZLES = [
  { id: 'projects', name: 'Network Circuit', station: 'Workstation', parTime: 25.0 },
  { id: 'skills', name: 'Hex Buffer', station: 'Holotable', parTime: 20.0 },
  { id: 'achievements', name: 'Timing Scanner', station: 'Trophy Showcase', parTime: 18.0 },
  { id: 'about', name: 'Cipher Dial', station: 'Dossier Wall', parTime: 22.0 },
  { id: 'resume', name: 'Wire Splice', station: 'Filing Station', parTime: 15.0 },
  { id: 'contact', name: 'Waveform Tuner', station: 'Comms Relay', parTime: 18.0 },
  { id: 'server_rack', name: 'Mainframe Firewall', station: 'Server Rack', parTime: 24.0 },
  { id: 'hardware_arsenal', name: 'Hardware Arsenal', station: 'Tool Pegboard', parTime: 20.0 },
  { id: 'wireshark_monitor', name: 'Packet Sniffer', station: 'PCAP Monitor', parTime: 22.0 },
  { id: 'secret_vault', name: 'Zero-Day Vault', station: 'Black Hat Vault', parTime: 30.0 },
];

/**
 * Authentic baseline speedrun records for benchmark competition.
 */
const BASELINE_RECORDS = [
  {
    id: 'rec-001',
    puzzleId: 'projects',
    codename: 'MrWhiteHat',
    archetype: 'Alpha',
    timeSec: 8.42,
    flag: '🇮🇳',
    country: 'India',
    verified: true,
    rankBadge: 'ROOT_GOD',
    timestamp: 'Today · 10:14 AM',
  },
  {
    id: 'rec-002',
    puzzleId: 'projects',
    codename: 'Ghost_0x',
    archetype: 'Ghost',
    timeSec: 11.25,
    flag: '🇺🇸',
    country: 'United States',
    verified: true,
    rankBadge: 'ELITE',
    timestamp: 'Yesterday',
  },
  {
    id: 'rec-003',
    puzzleId: 'projects',
    codename: 'RoninZero',
    archetype: 'Ronin',
    timeSec: 14.88,
    flag: '🇯🇵',
    country: 'Japan',
    verified: true,
    rankBadge: 'OPERATIVE',
    timestamp: 'Oct 20, 2026',
  },
  {
    id: 'rec-004',
    puzzleId: 'skills',
    codename: 'MrWhiteHat',
    archetype: 'Alpha',
    timeSec: 7.95,
    flag: '🇮🇳',
    country: 'India',
    verified: true,
    rankBadge: 'ROOT_GOD',
    timestamp: 'Today · 11:30 AM',
  },
  {
    id: 'rec-005',
    puzzleId: 'skills',
    codename: 'HexBuster',
    archetype: 'Ghost',
    timeSec: 10.40,
    flag: '🇩🇪',
    country: 'Germany',
    verified: true,
    rankBadge: 'ELITE',
    timestamp: 'Oct 21, 2026',
  },
  {
    id: 'rec-006',
    puzzleId: 'achievements',
    codename: 'PulseMaster',
    archetype: 'Ronin',
    timeSec: 6.84,
    flag: '🇨🇦',
    country: 'Canada',
    verified: true,
    rankBadge: 'ROOT_GOD',
    timestamp: 'Oct 19, 2026',
  },
  {
    id: 'rec-007',
    puzzleId: 'about',
    codename: 'EnigmaCoder',
    archetype: 'Alpha',
    timeSec: 9.15,
    flag: '🇬🇧',
    country: 'United Kingdom',
    verified: true,
    rankBadge: 'ELITE',
    timestamp: 'Oct 22, 2026',
  },
  {
    id: 'rec-008',
    puzzleId: 'resume',
    codename: 'WireDoctor',
    archetype: 'Ghost',
    timeSec: 5.62,
    flag: '🇸🇬',
    country: 'Singapore',
    verified: true,
    rankBadge: 'ROOT_GOD',
    timestamp: 'Oct 22, 2026',
  },
  {
    id: 'rec-009',
    puzzleId: 'secret_vault',
    codename: 'MrWhiteHat',
    archetype: 'Alpha',
    timeSec: 12.05,
    flag: '🇮🇳',
    country: 'India',
    verified: true,
    rankBadge: 'ROOT_GOD',
    timestamp: 'Today · Classified',
  },
];

/**
 * Get all leaderboard entries for a given puzzle or all puzzles.
 */
export function getLeaderboard(puzzleId = 'all') {
  if (typeof window === 'undefined' || !window.localStorage) {
    return filterEntries(BASELINE_RECORDS, puzzleId);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_LEADERBOARD);
    let entries = BASELINE_RECORDS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        entries = [...parsed];
        // Ensure baseline records exist
        for (const b of BASELINE_RECORDS) {
          if (!entries.some((e) => e.id === b.id)) {
            entries.push(b);
          }
        }
      }
    }
    return filterEntries(entries, puzzleId);
  } catch (err) {
    return filterEntries(BASELINE_RECORDS, puzzleId);
  }
}

function filterEntries(entries, puzzleId) {
  let list = puzzleId && puzzleId !== 'all'
    ? entries.filter((e) => e.puzzleId === puzzleId)
    : entries;

  return list.sort((a, b) => a.timeSec - b.timeSec);
}

/**
 * Record a newly completed solve time.
 */
export function recordSolveTime(puzzleId, timeSec, operative = null) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  if (!timeSec || timeSec <= 0) return null;

  const codename = operative?.codename || 'Operative';
  const archetype = operative?.archetype || 'Alpha';
  const flag = operative?.flag || '🌐';
  const country = operative?.country || 'Global';

  let rankBadge = 'OPERATIVE';
  if (timeSec < 10.0) rankBadge = 'ROOT_GOD';
  else if (timeSec < 18.0) rankBadge = 'ELITE';

  const newEntry = {
    id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    puzzleId,
    codename,
    archetype,
    timeSec: parseFloat(timeSec.toFixed(2)),
    flag,
    country,
    verified: true,
    rankBadge,
    timestamp: 'Just now',
    isPersonalRun: true,
  };

  try {
    const all = getLeaderboard('all');
    all.push(newEntry);
    all.sort((a, b) => a.timeSec - b.timeSec);
    window.localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(all));

    // Update Personal Bests
    updatePersonalBest(puzzleId, newEntry.timeSec);
  } catch (err) {}

  return newEntry;
}

/**
 * Get personal best times dictionary per puzzle.
 */
export function getPersonalBests() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PERSONAL_BESTS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

function updatePersonalBest(puzzleId, timeSec) {
  try {
    const pbs = getPersonalBests();
    if (!pbs[puzzleId] || timeSec < pbs[puzzleId]) {
      pbs[puzzleId] = timeSec;
      window.localStorage.setItem(STORAGE_KEY_PERSONAL_BESTS, JSON.stringify(pbs));
    }
  } catch (err) {}
}
