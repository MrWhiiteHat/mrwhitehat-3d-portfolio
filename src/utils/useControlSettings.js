import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mrwhitehat_control_settings_v1';

/**
 * Default control parameters:
 * - sensitivity: 1.0x (scales the new increased baseline: 0.0028 pointer lock, 0.0034 drag, 0.0038 touch)
 * - moveSpeed: 1.0x (scales 3.1 m/s walk, 4.8 m/s sprint)
 */
export const DEFAULT_CONTROL_SETTINGS = {
  sensitivity: 1.0,
  moveSpeed: 1.0,
};

export function loadControlSettings() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_CONTROL_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONTROL_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      sensitivity:
        typeof parsed.sensitivity === 'number'
          ? Math.max(0.4, Math.min(3.0, parsed.sensitivity))
          : DEFAULT_CONTROL_SETTINGS.sensitivity,
      moveSpeed:
        typeof parsed.moveSpeed === 'number'
          ? Math.max(0.5, Math.min(2.5, parsed.moveSpeed))
          : DEFAULT_CONTROL_SETTINGS.moveSpeed,
    };
  } catch (e) {
    return { ...DEFAULT_CONTROL_SETTINGS };
  }
}

export function saveControlSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    window.__CONTROLS_SETTINGS__ = settings;
    window.dispatchEvent(new CustomEvent('control-settings-changed', { detail: settings }));
  } catch (e) {}
}

export function useControlSettings() {
  const [settings, setSettings] = useState(() => loadControlSettings());

  useEffect(() => {
    window.__CONTROLS_SETTINGS__ = settings;
  }, [settings]);

  const updateSensitivity = useCallback((val) => {
    const rounded = Math.round(Math.max(0.4, Math.min(3.0, val)) * 100) / 100;
    setSettings((prev) => {
      const next = { ...prev, sensitivity: rounded };
      saveControlSettings(next);
      return next;
    });
  }, []);

  const updateMoveSpeed = useCallback((val) => {
    const rounded = Math.round(Math.max(0.5, Math.min(2.5, val)) * 100) / 100;
    setSettings((prev) => {
      const next = { ...prev, moveSpeed: rounded };
      saveControlSettings(next);
      return next;
    });
  }, []);

  const resetDefaults = useCallback(() => {
    setSettings({ ...DEFAULT_CONTROL_SETTINGS });
    saveControlSettings({ ...DEFAULT_CONTROL_SETTINGS });
  }, []);

  return {
    settings,
    updateSensitivity,
    updateMoveSpeed,
    resetDefaults,
  };
}
