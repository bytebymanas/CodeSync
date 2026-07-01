import { DEFAULT_SETTINGS, STORAGE_KEYS } from "./constants.js";

export async function getStorage(keys) {
  return chrome.storage.local.get(keys);
}

export async function setStorage(items) {
  return chrome.storage.local.set(items);
}

export async function getSettings() {
  const stored = await getStorage(STORAGE_KEYS.SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...(stored[STORAGE_KEYS.SETTINGS] || {})
  };
}

export async function saveSettings(settings) {
  return setStorage({
    [STORAGE_KEYS.SETTINGS]: {
      ...DEFAULT_SETTINGS,
      ...settings
    }
  });
}

export async function getQueue() {
  const stored = await getStorage(STORAGE_KEYS.CAPTURE_QUEUE);
  return Array.isArray(stored[STORAGE_KEYS.CAPTURE_QUEUE]) ? stored[STORAGE_KEYS.CAPTURE_QUEUE] : [];
}

export async function saveQueue(queue) {
  return setStorage({
    [STORAGE_KEYS.CAPTURE_QUEUE]: queue
  });
}

export async function appendHistory(entry) {
  const stored = await getStorage(STORAGE_KEYS.SYNC_HISTORY);
  const history = Array.isArray(stored[STORAGE_KEYS.SYNC_HISTORY]) ? stored[STORAGE_KEYS.SYNC_HISTORY] : [];
  history.unshift({
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString()
  });
  return setStorage({
    [STORAGE_KEYS.SYNC_HISTORY]: history.slice(0, 50)
  });
}

export async function getHistory() {
  const stored = await getStorage(STORAGE_KEYS.SYNC_HISTORY);
  return Array.isArray(stored[STORAGE_KEYS.SYNC_HISTORY]) ? stored[STORAGE_KEYS.SYNC_HISTORY] : [];
}
