import { DEFAULT_SETTINGS } from "../utils/constants.js";
import { getSettings, saveSettings } from "../utils/storage.js";

// ─────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────
const navSettings   = document.getElementById("nav-settings");
const navAbout      = document.getElementById("nav-about");
const pageSettings  = document.getElementById("page-settings");
const pageAbout     = document.getElementById("page-about");

const githubToken   = document.getElementById("githubToken");
const githubOwner   = document.getElementById("githubOwner");
const githubRepo    = document.getElementById("githubRepo");
const githubBranch  = document.getElementById("githubBranch");
const autoCommit    = document.getElementById("autoCommit");
const orgByDiff     = document.getElementById("organizeByDifficulty");
const orgByTopic    = document.getElementById("organizeByTopic");
const notifyCapture = document.getElementById("notifyOnCapture");
const namingConv    = document.getElementById("namingConvention");

const toggleVisBtn  = document.getElementById("toggle-token-visibility");
const eyeIconShow   = document.getElementById("eye-icon-show");
const eyeIconHide   = document.getElementById("eye-icon-hide");

const saveBtn       = document.getElementById("save-btn");
const resetBtn      = document.getElementById("reset-btn");
const testBtn       = document.getElementById("test-connection-btn");
const toastContainer= document.getElementById("toast-container");

const FIELDS = [
  "githubToken", "githubOwner", "githubRepo", "githubBranch",
  "autoCommit", "organizeByTopic", "organizeByDifficulty", "notifyOnCapture", "namingConvention"
];

// ─────────────────────────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────────────────────────
function showToast(type, title, message, duration = 5000) {
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-content">
      <p class="toast-title">${title}</p>
      ${message ? `<p class="toast-msg">${message}</p>` : ""}
    </div>
    <button class="toast-close" aria-label="Dismiss">×</button>
  `;

  const dismiss = () => {
    toast.classList.add("exiting");
    setTimeout(() => toast.remove(), 220);
  };

  toast.querySelector(".toast-close").addEventListener("click", dismiss);
  toastContainer.appendChild(toast);
  if (duration > 0) setTimeout(dismiss, duration);
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION
// ─────────────────────────────────────────────────────────────
function activatePage(page) {
  const pages = { settings: pageSettings, about: pageAbout };
  const navItems = { settings: navSettings, about: navAbout };

  Object.entries(pages).forEach(([key, el]) => {
    el.classList.toggle("hidden", key !== page);
  });
  Object.entries(navItems).forEach(([key, btn]) => {
    btn.classList.toggle("nav-item--active", key === page);
    btn.setAttribute("aria-current", key === page ? "page" : "false");
  });
}

navSettings.addEventListener("click", () => activatePage("settings"));
navAbout.addEventListener("click", () => activatePage("about"));

// ─────────────────────────────────────────────────────────────
// TOKEN VISIBILITY TOGGLE
// ─────────────────────────────────────────────────────────────
toggleVisBtn.addEventListener("click", () => {
  const isPassword = githubToken.type === "password";
  githubToken.type = isPassword ? "text" : "password";
  eyeIconShow.classList.toggle("hidden", isPassword);
  eyeIconHide.classList.toggle("hidden", !isPassword);
});

// ─────────────────────────────────────────────────────────────
// FORM READ / APPLY
// ─────────────────────────────────────────────────────────────
function readFormValues() {
  const values = {};
  for (const field of FIELDS) {
    const el = document.getElementById(field);
    if (!el) continue;
    values[field] = el.type === "checkbox" ? el.checked : el.value.trim();
  }
  return values;
}

function applySettings(settings) {
  for (const field of FIELDS) {
    const el = document.getElementById(field);
    if (!el) continue;
    const value = settings[field] ?? DEFAULT_SETTINGS[field];
    if (el.type === "checkbox") {
      el.checked = Boolean(value);
    } else {
      el.value = value ?? "";
    }
  }
}

async function loadSettings() {
  applySettings(await getSettings());
}

// ─────────────────────────────────────────────────────────────
// SAVE
// ─────────────────────────────────────────────────────────────
saveBtn.addEventListener("click", async () => {
  saveBtn.textContent = "Saving…";
  saveBtn.disabled = true;
  try {
    await saveSettings(readFormValues());
    showToast("success", "Settings saved", "Your configuration has been updated.");
  } catch (err) {
    showToast("error", "Save failed", err.message || "Unknown error.");
  } finally {
    saveBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
      </svg>
      Save Settings`;
    saveBtn.disabled = false;
  }
});

// ─────────────────────────────────────────────────────────────
// RESET
// ─────────────────────────────────────────────────────────────
resetBtn.addEventListener("click", async () => {
  await saveSettings(DEFAULT_SETTINGS);
  await loadSettings();
  showToast("info", "Settings reset", "All settings have been restored to defaults.");
});

// ─────────────────────────────────────────────────────────────
// TEST CONNECTION
// ─────────────────────────────────────────────────────────────
testBtn.addEventListener("click", async () => {
  // Save current values first
  await saveSettings(readFormValues());

  const originalHtml = testBtn.innerHTML;
  testBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 0.8s linear infinite">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
    Testing…`;
  testBtn.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({ type: "TEST_GITHUB_CONNECTION" });
    if (response?.ok) {
      showToast("success", "Connection successful!", `Successfully connected as ${response.name || response.login}.`);
    } else {
      const msg = response?.error || "GitHub connection failed.";
      if (msg.toLowerCase().includes("token")) {
        showToast("error", "Invalid GitHub token", "Please check your token and try again.");
      } else if (msg.toLowerCase().includes("repo") || msg.toLowerCase().includes("not found")) {
        showToast("warning", "Repository not found", "Please verify the repository name.");
      } else {
        showToast("error", "Connection failed", msg);
      }
    }
  } catch (err) {
    showToast("error", "Connection error", err.message || "Failed to reach GitHub.");
  } finally {
    testBtn.innerHTML = originalHtml;
    testBtn.disabled = false;
  }
});

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
loadSettings();

// Add spin animation globally
const style = document.createElement("style");
style.textContent = "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
document.head.appendChild(style);
