import { DEFAULT_SETTINGS } from "../utils/constants.js";
import { getSettings, saveSettings } from "../utils/storage.js";

const form = document.getElementById("settings-form");
const statusMessage = document.getElementById("status-message");
const resetBtn = document.getElementById("reset-btn");
const testBtn = document.getElementById("test-connection-btn");

const fields = [
  "githubToken",
  "githubOwner",
  "githubRepo",
  "githubBranch",
  "autoCommit",
  "organizeByTopic",
  "organizeByDifficulty",
  "notifyOnCapture",
  "namingConvention"
];

function readFormValues() {
  const values = {};
  for (const field of fields) {
    const element = document.getElementById(field);
    values[field] = element.type === "checkbox" ? element.checked : element.value.trim();
  }
  return values;
}

function applySettings(settings) {
  for (const field of fields) {
    const element = document.getElementById(field);
    const value = settings[field] ?? DEFAULT_SETTINGS[field];
    if (element.type === "checkbox") {
      element.checked = Boolean(value);
    } else {
      element.value = value;
    }
  }
}

async function load() {
  applySettings(await getSettings());
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveSettings(readFormValues());
  statusMessage.textContent = "Settings saved.";
});

testBtn.addEventListener("click", async () => {
  await saveSettings(readFormValues());
  statusMessage.textContent = "Testing GitHub connection…";

  const response = await chrome.runtime.sendMessage({ type: "TEST_GITHUB_CONNECTION" });
  statusMessage.textContent = response?.ok
    ? `Connected as ${response.name}.`
    : response?.error || "GitHub connection failed.";
});

resetBtn.addEventListener("click", async () => {
  await saveSettings(DEFAULT_SETTINGS);
  await load();
  statusMessage.textContent = "Settings reset.";
});

load();
