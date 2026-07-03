// ─────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────
const mainView      = document.getElementById("main-view");
const ghDot         = document.getElementById("gh-dot");
const ghStatusText  = document.getElementById("gh-status-text");
const ghOwnerText   = document.getElementById("gh-owner-text");
const queueText     = document.getElementById("queue-count-text");
const queueHint     = document.getElementById("queue-hint-text");
const captureTs     = document.getElementById("capture-ts");
const latestOutput  = document.getElementById("latest-output");

const captureBtn    = document.getElementById("capture-btn");
const pushBtn       = document.getElementById("push-btn");
const clearBtn      = document.getElementById("clear-btn");
const refreshBtn    = document.getElementById("refresh-btn");

// Language modal
const langModal     = document.getElementById("lang-modal");
const modalProbName = document.getElementById("modal-problem-name");
const langSelect    = document.getElementById("lang-select");
const langCancelBtn = document.getElementById("lang-cancel-btn");
const langConfirmBtn= document.getElementById("lang-confirm-btn");

// Sync progress view
const syncView      = document.getElementById("sync-view");
const syncSpinWrap  = document.getElementById("sync-spin-wrap");
const syncTitle     = document.getElementById("sync-title");
const syncSub       = document.getElementById("sync-sub");
const syncBarFill   = document.getElementById("sync-bar-fill");
const syncPct       = document.getElementById("sync-pct");
const syncFileList  = document.getElementById("sync-file-list");
const syncResult    = document.getElementById("sync-result");
const toastContainer= document.getElementById("toast-container");

// ─────────────────────────────────────────────────────────────
// TOAST SYSTEM
// ─────────────────────────────────────────────────────────────
function showToast(type, title, message, duration = 4000) {
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
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
  return toast;
}

// ─────────────────────────────────────────────────────────────
// STATUS RENDERING
// ─────────────────────────────────────────────────────────────
function renderStatus(response) {
  if (!response?.ok) {
    ghDot.className = "dot dot--err";
    ghStatusText.textContent = "Unavailable";
    ghStatusText.className = "status-val status-val--red";
    queueText.textContent = "? pending";
    pushBtn.disabled = true;
    clearBtn.disabled = true;
    return;
  }

  if (response.githubConfigured && response.settings?.autoCommit) {
    ghDot.className = "dot dot--ok";
    ghStatusText.textContent = "Connected";
    ghStatusText.className = "status-val status-val--green";
    ghOwnerText.textContent = `@${response.settings.githubOwner}`;
    queueHint.textContent = "Auto-sync on";
  } else if (response.githubConfigured) {
    ghDot.className = "dot dot--ok";
    ghStatusText.textContent = "Connected";
    ghStatusText.className = "status-val status-val--green";
    ghOwnerText.textContent = `@${response.settings.githubOwner}`;
    queueHint.textContent = "Ready to push";
  } else {
    ghDot.className = "dot dot--warn";
    ghStatusText.textContent = "Not configured";
    ghStatusText.className = "status-val";
    ghOwnerText.textContent = "Open Settings →";
    queueHint.textContent = "Setup required";
  }

  const n = response.queueSize || 0;
  queueText.textContent = n === 0 ? "0 pending" : `${n} pending`;
  queueText.className = n > 0 ? "status-val status-val--blue" : "status-val";
  pushBtn.disabled = n === 0;
  clearBtn.disabled = n === 0;

  renderLatestCapture(response);
}

function renderLatestCapture(status) {
  const entry = status.recentHistory?.[0];
  const last  = status.lastCapture;

  if (!entry && !last) {
    latestOutput.innerHTML = `<p class="no-data">Nothing captured yet.</p>`;
    captureTs.textContent = "";
    return;
  }

  if (last) {
    const ext = getExtension(last.language);
    const slug = slugify(last.title);
    const filename = `${slug}.${ext}`;
    const diff = last.difficulty ? capitalize(last.difficulty) : "Unknown";
    const tags = Array.isArray(last.tags) && last.tags.length ? last.tags.slice(0, 4).join(", ") : "N/A";
    const lang = last.language || "Unknown";
    const code = (last.code || "").split("\n").slice(0, 8).join("\n");

    latestOutput.innerHTML = `
      <p class="cap-filename">&gt; ${filename}</p>
      <p class="cap-meta">Difficulty: <strong>${diff}</strong></p>
      <p class="cap-meta">Tags: <strong>${tags}</strong></p>
      ${last.link ? `<p class="cap-meta">URL: <strong style="color:#5B8DEF;font-size:0.65rem">${last.link}</strong></p>` : ""}
      <div class="cap-code">${escapeHtml(code)}</div>
    `;
    captureTs.textContent = entry?.action ? actionLabel(entry.action) : "Just now";
    return;
  }

  latestOutput.innerHTML = `<p class="no-data">Nothing captured yet.</p>`;
}

// ─────────────────────────────────────────────────────────────
// CAPTURE FLOW (with language fallback)
// ─────────────────────────────────────────────────────────────
async function captureCurrentSolution() {
  captureBtn.disabled = true;
  captureBtn.querySelector(".btn-main").textContent = "Capturing…";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      showToast("error", "No active tab", "Open a LeetCode or GFG problem first.");
      return;
    }

    const response = await chrome.tabs.sendMessage(tab.id, { type: "CAPTURE_CURRENT_SOLUTION" }).catch(() => null);
    if (!response?.ok || !response.solution) {
      showToast("warning", "Nothing detected", "Make sure you're on a LeetCode or GFG problem page.");
      return;
    }

    let solution = response.solution;

    // Language is Unknown → ask user
    if (!solution.language || solution.language.toLowerCase() === "unknown") {
      solution = await resolveLanguageWithModal(solution);
      if (!solution) {
        // User cancelled — don't queue
        showToast("info", "Cancelled", "Solution was not queued.");
        return;
      }
    }

    const captureResult = await chrome.runtime.sendMessage({ type: "SOLUTION_CAPTURED", solution });
    if (captureResult?.ok) {
      showToast("success", "Captured!", `"${solution.title}" added to queue.`);
    } else {
      showToast("error", "Capture failed", captureResult?.error || "Unknown error.");
    }

    await refreshStatus();
  } finally {
    captureBtn.disabled = false;
    captureBtn.querySelector(".btn-main").textContent = "Capture & Queue";
  }
}

// ─────────────────────────────────────────────────────────────
// LANGUAGE RESOLVER MODAL
// ─────────────────────────────────────────────────────────────
function resolveLanguageWithModal(solution) {
  return new Promise((resolve) => {
    modalProbName.textContent = `"${solution.title || "this problem"}"`;
    langSelect.value = "cpp"; // sensible default

    langModal.classList.remove("hidden");

    const confirm = () => {
      cleanup();
      resolve({ ...solution, language: langSelect.value });
    };
    const cancel = () => {
      cleanup();
      resolve(null);
    };
    const cleanup = () => {
      langModal.classList.add("hidden");
      langConfirmBtn.removeEventListener("click", confirm);
      langCancelBtn.removeEventListener("click", cancel);
    };

    langConfirmBtn.addEventListener("click", confirm);
    langCancelBtn.addEventListener("click", cancel);
  });
}

// ─────────────────────────────────────────────────────────────
// SYNC FLOW WITH PROGRESS VIEW
// ─────────────────────────────────────────────────────────────
async function syncQueue() {
  // First get current queue to show file list
  const statusBefore = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  const queue = statusBefore?.recentHistory || [];

  // Check if any queued item will have unknown language (from history or status)
  showSyncView(statusBefore?.queueSize || 1);

  const response = await chrome.runtime.sendMessage({ type: "PROCESS_QUEUE" });

  finishSyncView(response);
  await refreshStatus();
}

function showSyncView(totalCount) {
  // Build file items as "pending"
  syncFileList.innerHTML = "";
  for (let i = 0; i < Math.min(totalCount, 10); i++) {
    const item = document.createElement("div");
    item.className = "sync-file-item";
    item.id = `sync-file-${i}`;
    item.innerHTML = `
      <span class="sync-file-name">Queued item ${i + 1}</span>
      <span class="sync-file-status pending">Pending</span>
    `;
    syncFileList.appendChild(item);
  }

  syncResult.classList.add("hidden");
  syncResult.className = "sync-result hidden";
  syncBarFill.style.width = "0%";
  syncPct.textContent = "0%";
  syncTitle.textContent = "Pushing to GitHub…";
  syncSub.textContent = `0 of ${totalCount} files synced`;
  syncSpinWrap.className = "sync-spin-wrap spinning";

  // Animate progress bar while waiting
  let pct = 0;
  const timer = setInterval(() => {
    pct = Math.min(pct + 8, 88); // Fill to 88%, leave rest for actual result
    syncBarFill.style.width = `${pct}%`;
    syncPct.textContent = `${pct}%`;
    const done = Math.floor((pct / 88) * totalCount);
    syncSub.textContent = `${Math.min(done, totalCount - 1)} of ${totalCount} files synced`;
  }, 300);

  syncView._progressTimer = timer;

  // Show the sync view
  syncView.classList.remove("hidden");

  // Add a close button (will be shown after done)
  if (!document.getElementById("sync-close-btn")) {
    const closeBtn = document.createElement("button");
    closeBtn.id = "sync-close-btn";
    closeBtn.className = "sync-close-btn hidden";
    closeBtn.textContent = "← Back";
    closeBtn.addEventListener("click", hideSyncView);
    syncView.appendChild(closeBtn);
  }
}

function finishSyncView(response) {
  clearInterval(syncView._progressTimer);

  const total    = response?.processed || 0;
  const pushed   = response?.pushed || 0;
  const failed   = total - pushed;
  const success  = response?.ok && pushed > 0;
  const allFail  = pushed === 0 && total > 0;

  // Finish progress bar
  syncBarFill.style.width = "100%";
  syncPct.textContent = "100%";
  syncSub.textContent = `${pushed} of ${total} files synced`;

  // Update spin icon
  syncSpinWrap.className = success ? "sync-spin-wrap done" : "sync-spin-wrap failed";
  syncSpinWrap.innerHTML = success
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  syncTitle.textContent = success ? "Push complete!" : (allFail ? "Push failed" : "Push partial");

  // Result card
  if (success) {
    syncResult.className = "sync-result success";
    syncResult.innerHTML = `
      <p class="sync-result-title">🎉 All Done!</p>
      <p class="sync-result-sub">${pushed} file${pushed !== 1 ? "s" : ""} successfully pushed to GitHub.</p>
    `;
  } else if (allFail) {
    syncResult.className = "sync-result failure";
    syncResult.innerHTML = `
      <p class="sync-result-title">Push Failed</p>
      <p class="sync-result-sub">${response?.error || "Failed to push. Check your connection and try again."}</p>
    `;
  } else {
    syncResult.className = "sync-result failure";
    syncResult.innerHTML = `
      <p class="sync-result-title">Partial Push</p>
      <p class="sync-result-sub">${pushed} pushed, ${failed} failed. Check your connection.</p>
    `;
  }
  syncResult.classList.remove("hidden");

  const closeBtn = document.getElementById("sync-close-btn");
  if (closeBtn) closeBtn.classList.remove("hidden");
}

function hideSyncView() {
  clearInterval(syncView._progressTimer);
  syncView.classList.add("hidden");
  // Reset spin icon
  syncSpinWrap.className = "sync-spin-wrap spinning";
  syncSpinWrap.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
}

// ─────────────────────────────────────────────────────────────
// CLEAR QUEUE (no native confirm — use toast instead)
// ─────────────────────────────────────────────────────────────
let clearPending = false;
async function clearQueue() {
  if (!clearPending) {
    clearPending = true;
    const t = showToast("warning", "Clear queue?", "Click again to confirm. All queued solutions will be lost.", 4000);
    setTimeout(() => { clearPending = false; }, 4000);
    return;
  }

  clearPending = false;
  const response = await chrome.runtime.sendMessage({ type: "CLEAR_QUEUE" });
  if (response?.ok) {
    showToast("success", "Queue cleared", `${response.cleared} item${response.cleared !== 1 ? "s" : ""} removed.`);
  } else {
    showToast("error", "Clear failed", response?.error || "Unknown error.");
  }
  await refreshStatus();
}

// ─────────────────────────────────────────────────────────────
// REFRESH STATUS
// ─────────────────────────────────────────────────────────────
async function refreshStatus() {
  const response = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  renderStatus(response);
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getExtension(lang = "") {
  const map = {
    "C++": "cpp", "C": "c", "C#": "cs", "Java": "java",
    "Python": "py", "Python3": "py", "JavaScript": "js", "TypeScript": "ts",
    "Go": "go", "Rust": "rs", "Kotlin": "kt", "Swift": "swift",
    "PHP": "php", "Ruby": "rb", "Scala": "scala", "R": "r", "Dart": "dart"
  };
  return map[lang] || (lang.toLowerCase().replace(/[^a-z0-9]/g, "") || "txt");
}

function slugify(title = "") {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
}

function capitalize(s = "") { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

function escapeHtml(s = "") {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function actionLabel(action = "") {
  const map = { pushed: "Just pushed", captured: "Just now", updated: "Updated", failed: "Failed", queued: "Queued" };
  return map[action] || "Just now";
}

// ─────────────────────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────────────────────
captureBtn.addEventListener("click", captureCurrentSolution);
pushBtn.addEventListener("click", syncQueue);
clearBtn.addEventListener("click", clearQueue);
refreshBtn.addEventListener("click", refreshStatus);

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
refreshStatus();
