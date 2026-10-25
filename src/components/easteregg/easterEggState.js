// HACKER EASTER EGG STATE & PERSISTENCE SERVICE
// Manages unlocks, discovery state, completion telemetry, and local storage caching

export const REQUIRED_STATIONS = [
  'projects',
  'skills',
  'achievements',
  'about',
  'resume',
  'contact',
  'operator',
  'server_rack',
  'hardware_arsenal',
  'wireshark_monitor',
];

const STORAGE_KEY_COMPLETED = 'mrwhitehat_completed_stations_v1';
const STORAGE_KEY_DISCOVERED = 'mrwhitehat_easter_egg_discovered_v1';
const STORAGE_KEY_COMPLETED_EGG = 'mrwhitehat_easter_egg_completed_v1';
const STORAGE_KEY_BEST_TIME = 'mrwhitehat_easter_egg_best_time_v1';

export function getCompletedStations() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_COMPLETED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveCompletedStations(stationsList) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const arr = Array.from(new Set(stationsList));
    window.localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(arr));
  } catch (e) {}
}

export function markStationCompleted(stationId) {
  const current = getCompletedStations();
  if (!current.includes(stationId)) {
    current.push(stationId);
    saveCompletedStations(current);
  }
  return current;
}

export function hasCompletedAllStations(stations) {
  if (!stations) return false;
  const list = stations instanceof Set ? Array.from(stations) : Array.isArray(stations) ? stations : [];
  return REQUIRED_STATIONS.every((req) => list.includes(req));
}

export function isEasterEggDiscovered() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_DISCOVERED) === 'true';
  } catch (e) {
    return false;
  }
}

export function markEasterEggDiscovered() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_DISCOVERED, 'true');
  } catch (e) {}
}

export function isEasterEggCompleted() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY_COMPLETED_EGG) === 'true';
  } catch (e) {
    return false;
  }
}

export function markEasterEggCompleted(timeSeconds = null) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY_COMPLETED_EGG, 'true');
    window.localStorage.setItem(STORAGE_KEY_DISCOVERED, 'true');
    if (typeof timeSeconds === 'number' && timeSeconds > 0) {
      const prevBest = getEasterEggBestTime();
      if (!prevBest || timeSeconds < prevBest) {
        window.localStorage.setItem(STORAGE_KEY_BEST_TIME, timeSeconds.toFixed(1));
      }
    }
  } catch (e) {}
}

export function getEasterEggBestTime() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BEST_TIME);
    return raw ? parseFloat(raw) : null;
  } catch (e) {
    return null;
  }
}

export function resetEasterEggProgress() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY_DISCOVERED);
    window.localStorage.removeItem(STORAGE_KEY_COMPLETED_EGG);
    window.localStorage.removeItem(STORAGE_KEY_BEST_TIME);
  } catch (e) {}
}
