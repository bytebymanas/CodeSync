const connectionStatus = document.getElementById("connection-status");
const queueStatus = document.getElementById("queue-status");
const latestOutput = document.getElementById("latest-output");
const captureBtn = document.getElementById("capture-btn");
const refreshBtn = document.getElementById("refresh-btn");
const pushBtn = document.getElementById("push-btn");
const clearBtn = document.getElementById("clear-btn");

function renderLatest(status) {
  const lastEntry = status.recentHistory?.[0];
  if (lastEntry) {
    latestOutput.textContent = `${lastEntry.title}\n${lastEntry.action}${lastEntry.path ? ` → ${lastEntry.path}` : ""}`;
    return;
  }

  if (status.lastCapture) {
    latestOutput.textContent = JSON.stringify(status.lastCapture, null, 2);
    return;
  }

  latestOutput.textContent = "Nothing captured yet.";
}

async function refreshStatus() {
  const response = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  if (!response?.ok) {
    connectionStatus.textContent = "Extension unavailable";
    queueStatus.textContent = "Queue: ?";
    pushBtn.disabled = true;
    clearBtn.disabled = true;
    return;
  }

  if (response.githubConfigured && response.settings.autoCommit) {
    connectionStatus.textContent = "GitHub connected and auto-sync is on";
  } else if (response.githubConfigured) {
    connectionStatus.textContent = "GitHub connected, queue mode active";
  } else {
    connectionStatus.textContent = "GitHub not configured yet";
  }

  queueStatus.textContent = `Queue: ${response.queueSize}`;
  pushBtn.disabled = response.queueSize === 0;
  clearBtn.disabled = response.queueSize === 0;
  renderLatest(response);
}

async function captureCurrentSolution() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    latestOutput.textContent = "No active tab found.";
    return;
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type: "CAPTURE_CURRENT_SOLUTION" }).catch(() => null);
  if (response?.ok && response.solution) {
    latestOutput.textContent = JSON.stringify(response.solution, null, 2);
    const captureResult = await chrome.runtime.sendMessage({ type: "SOLUTION_CAPTURED", solution: response.solution });
    if (!captureResult?.ok) {
      latestOutput.textContent = captureResult?.error || "Capture failed.";
    }
    await refreshStatus();
    return;
  }

  latestOutput.textContent = "No solution detected on this page.";
}

async function syncQueue() {
  latestOutput.textContent = "Pushing queued solutions…";
  const response = await chrome.runtime.sendMessage({ type: "PROCESS_QUEUE" });
  latestOutput.textContent = response?.ok
    ? `Processed ${response.processed} item(s)\nPushed: ${response.pushed}\nRemaining: ${response.remaining}`
    : response?.error || "Queue sync failed.";
  await refreshStatus();
}

async function clearQueue() {
  const confirmed = window.confirm("Clear all queued solutions? This cannot be undone.");
  if (!confirmed) {
    return;
  }

  latestOutput.textContent = "Clearing queue…";
  const response = await chrome.runtime.sendMessage({ type: "CLEAR_QUEUE" });
  latestOutput.textContent = response?.ok
    ? `Cleared ${response.cleared} item(s)\nRemaining: ${response.remaining}`
    : response?.error || "Clear queue failed.";
  await refreshStatus();
}

captureBtn.addEventListener("click", captureCurrentSolution);
refreshBtn.addEventListener("click", refreshStatus);
pushBtn.addEventListener("click", syncQueue);
clearBtn.addEventListener("click", clearQueue);

refreshStatus();
