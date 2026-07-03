import { createOrUpdateFile, getFileMetadata, testGitHubConnection } from "./github-api.js";
import { appendVersionSuffix, buildSolutionPath, formatSolution } from "../utils/formatters.js";
import { appendHistory, getHistory, getQueue, getSettings, getStorage, saveQueue, setStorage } from "../utils/storage.js";
import { STORAGE_KEYS } from "../utils/constants.js";
import { log, warn, error } from "../utils/logger.js";

function hasGitHubConfig(settings) {
  return Boolean(settings.githubToken && settings.githubOwner && settings.githubRepo && settings.githubBranch);
}

function createNotification(options) {
  if (!chrome.notifications?.create) {
    return;
  }

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: options.title,
    message: options.message
  });
}

function buildCommitMessage(solution) {
  return `Add ${solution.platform}:${solution.title}`;
}

async function queueSolution(solution) {
  const queue = await getQueue();
  queue.push({
    id: crypto.randomUUID(),
    solution: {
      ...solution,
      status: solution.status || "Accepted"
    },
    capturedAt: new Date().toISOString()
  });
  await saveQueue(queue);
}

async function syncSolution(solution, settings) {
  const basePath = buildSolutionPath(solution, settings);
  const content = formatSolution(solution);
  const existingFile = await getFileMetadata({
    token: settings.githubToken,
    owner: settings.githubOwner,
    repo: settings.githubRepo,
    branch: settings.githubBranch,
    path: basePath
  });

  let path = basePath;
  if (existingFile) {
    let version = 2;
    while (true) {
      const candidatePath = appendVersionSuffix(basePath, version);
      const candidateFile = await getFileMetadata({
        token: settings.githubToken,
        owner: settings.githubOwner,
        repo: settings.githubRepo,
        branch: settings.githubBranch,
        path: candidatePath
      });

      if (!candidateFile) {
        path = candidatePath;
        break;
      }

      version += 1;
    }
  }

  await createOrUpdateFile({
    token: settings.githubToken,
    owner: settings.githubOwner,
    repo: settings.githubRepo,
    branch: settings.githubBranch,
    path,
    message: buildCommitMessage(solution),
    content,
    sha: undefined
  });

  return {
    path,
    updated: false
  };
}

async function processQueue(options = {}) {
  const forcePush = Boolean(options.forcePush);
  const settings = await getSettings();
  const queue = await getQueue();
  if (!queue.length) {
    return {
      ok: true,
      processed: 0,
      pushed: 0,
      remaining: 0,
      pendingLanguage: 0,
      mode: "idle"
    };
  }

  const remaining = [];
  let pushed = 0;
  let lastResult = null;
  let pendingLanguage = 0;

  for (const item of queue) {
    try {
      // Skip items waiting on user to resolve language (unless this call is for a specific item)
      if (item.languagePending && options.resolveItemId !== item.id) {
        remaining.push(item);
        pendingLanguage++;
        continue;
      }

      await setStorage({
        lastCapture: item.solution
      });

      if (!hasGitHubConfig(settings)) {
        remaining.push(item);
        await appendHistory({
          title: item.solution.title,
          platform: item.solution.platform,
          difficulty: item.solution.difficulty,
          action: "queued-needs-setup"
        });
        continue;
      }

      if (!forcePush && !settings.autoCommit) {
        remaining.push(item);
        await appendHistory({
          title: item.solution.title,
          platform: item.solution.platform,
          difficulty: item.solution.difficulty,
          action: "captured"
        });
        continue;
      }

      const result = await syncSolution(item.solution, settings);
      pushed += 1;
      lastResult = {
        ...result,
        title: item.solution.title
      };

      await appendHistory({
        title: item.solution.title,
        platform: item.solution.platform,
        difficulty: item.solution.difficulty,
        action: result.updated ? "updated" : "pushed",
        path: result.path
      });
    } catch (err) {
      error("Failed to process queue item", err);
      remaining.push(item);
      await appendHistory({
        title: item.solution.title,
        platform: item.solution.platform,
        difficulty: item.solution.difficulty,
        action: "failed",
        error: err.message
      });
    }
  }

  await saveQueue(remaining);

  if (settings.notifyOnCapture && pushed > 0 && lastResult) {
    createNotification({
      title: "CodeSync",
      message: `${lastResult.title} synced to ${lastResult.path}`
    });
  }

  return {
    ok: true,
    processed: queue.length,
    pushed,
    remaining: remaining.length,
    pendingLanguage,
    mode: hasGitHubConfig(settings) && settings.autoCommit ? "auto-sync" : "queue-only"
  };
}

async function clearQueue() {
  const queue = await getQueue();
  if (!queue.length) {
    return {
      ok: true,
      cleared: 0,
      remaining: 0
    };
  }

  await saveQueue([]);
  await appendHistory({
    title: "Queue",
    platform: "codesync",
    difficulty: "unknown",
    action: "queue-cleared"
  });

  return {
    ok: true,
    cleared: queue.length,
    remaining: 0
  };
}

async function buildStatus() {
  const [settings, queue, history, storedLastCapture] = await Promise.all([
    getSettings(),
    getQueue(),
    getHistory(),
    getStorage(STORAGE_KEYS.LAST_CAPTURE)
  ]);
  return {
    ok: true,
    queueSize: queue.length,
    settings,
    githubConfigured: hasGitHubConfig(settings),
    lastCapture: storedLastCapture[STORAGE_KEYS.LAST_CAPTURE] || queue[queue.length - 1]?.solution || null,
    recentHistory: history.slice(0, 5)
  };
}

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  log("Extension installed", {
    autoCommit: settings.autoCommit,
    githubConfigured: hasGitHubConfig(settings)
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message?.type === "SOLUTION_CAPTURED" && message.solution) {
        await queueSolution(message.solution);
        const result = await processQueue();
        sendResponse(result);
        return;
      }

      if (message?.type === "PROCESS_QUEUE") {
        const result = await processQueue({ forcePush: true });
        sendResponse(result);
        return;
      }

      if (message?.type === "GET_STATUS") {
        sendResponse(await buildStatus());
        return;
      }

      if (message?.type === "CLEAR_QUEUE") {
        sendResponse(await clearQueue());
        return;
      }

      if (message?.type === "RESOLVE_LANGUAGE") {
        // Update a queued item's language and mark it as resolved, then push it
        const { itemId, extension } = message;
        const queue = await getQueue();
        const updated = queue.map(item => {
          if (item.id !== itemId) return item;
          return {
            ...item,
            languagePending: false,
            solution: { ...item.solution, language: extension }
          };
        });
        await saveQueue(updated);
        const result = await processQueue({ forcePush: true, resolveItemId: itemId });
        sendResponse({ ok: true, ...result });
        return;
      }

      if (message?.type === "TEST_GITHUB_CONNECTION") {
        const settings = await getSettings();
        if (!settings.githubToken) {
          throw new Error("Add a GitHub token first.");
        }

        const user = await testGitHubConnection(settings.githubToken);
        sendResponse({
          ok: true,
          login: user.login,
          name: user.name || user.login
        });
        return;
      }

      sendResponse({ ok: false, error: "Unknown message" });
    } catch (err) {
      warn("Message handling failed", err);
      sendResponse({ ok: false, error: err.message });
    }
  })();

  return true;
});
