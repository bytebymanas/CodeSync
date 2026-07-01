export const PLATFORMS = Object.freeze({
  LEETCODE: "leetcode",
  GFG: "gfg"
});

export const DIFFICULTIES = Object.freeze({
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  UNKNOWN: "unknown"
});

export const DEFAULT_SETTINGS = Object.freeze({
  githubToken: "",
  githubOwner: "",
  githubRepo: "",
  githubBranch: "main",
  autoCommit: false,
  organizeByTopic: true,
  organizeByDifficulty: true,
  notifyOnCapture: true,
  namingConvention: "kebab-case"
});

export const STORAGE_KEYS = Object.freeze({
  SETTINGS: "settings",
  LAST_CAPTURE: "lastCapture",
  CAPTURE_QUEUE: "captureQueue",
  SYNC_HISTORY: "syncHistory"
});

