const PLATFORMS = Object.freeze({
  GFG: "gfg"
});

const KNOWN_LANGUAGES = ["C++", "Java", "Python", "Python3", "JavaScript", "TypeScript", "C", "C#", "Go", "Rust", "Kotlin", "Swift", "PHP"];

const GFG_DIFFICULTY_SELECTORS = [
  '[data-difficulty]',
  '[class*="difficulty"]',
  '[class*="Difficulty"]',
  '[class*="tag"]',
  '[class*="header"]',
  '.problems_header_content',
  '.problem-tab',
  'span',
  'div'
];

const GFG_LANGUAGE_SELECTORS = [
  "select",
  '[aria-label*="language" i]',
  '[class*="language"]',
  '[class*="lang"]',
  'button[id*="language" i]',
  'button[class*="language" i]'
];

function matchKnownLanguage(value = "") {
  const normalized = value.trim().toLowerCase();
  if (/\bc\+\+(?:\d+)?\b/.test(normalized) || /\bcpp\b/.test(normalized) || /\bg\+\+\b/.test(normalized)) {
    return "C++";
  }

  if (/\bc#\b/.test(normalized) || /\bcsharp\b/.test(normalized)) {
    return "C#";
  }

  if (/\bpython3\b/.test(normalized)) {
    return "Python3";
  }

  if (/\bpython\b/.test(normalized) || /\bpy\b/.test(normalized) || /\bpypy\b/.test(normalized)) {
    return "Python";
  }

  if (/\btypescript\b/.test(normalized) || /\bts\b/.test(normalized)) {
    return "TypeScript";
  }

  if (/\bjavascript\b/.test(normalized) || /\bjs\b/.test(normalized) || /\bnode\b/.test(normalized)) {
    return "JavaScript";
  }

  if (/\bgolang\b/.test(normalized) || /\bgo\b/.test(normalized)) {
    return "Go";
  }

  if (/\brust\b/.test(normalized) || /\brs\b/.test(normalized)) {
    return "Rust";
  }

  if (/\bkotlin\b/.test(normalized) || /\bkt\b/.test(normalized)) {
    return "Kotlin";
  }

  if (/\bswift\b/.test(normalized)) {
    return "Swift";
  }

  if (/\bphp\b/.test(normalized)) {
    return "PHP";
  }

  const sortedLanguages = [...KNOWN_LANGUAGES].sort((left, right) => right.length - left.length);
  return sortedLanguages.find((item) => normalized.includes(item.toLowerCase())) || null;
}

function cleanTitle(value = "") {
  return value
    .replace(/\|\s*Practice\s*\|\s*GeeksforGeeks/gi, "")
    .replace(/\|\s*GeeksforGeeks/gi, "")
    .replace(/\s+-\s+GeeksforGeeks$/i, "")
    .trim();
}

function readMeta(name) {
  const tag = document.querySelector(`meta[name="${name}"]`);
  return tag?.content?.trim() || "";
}

function readMetaProperty(name) {
  const tag = document.querySelector(`meta[property="${name}"]`);
  return tag?.content?.trim() || "";
}

function readTags() {
  const selectorList = [
    ".tag-card",
    ".problemTopic",
    "a[href*='/tag/']",
    "a[href*='/tag-list/']"
  ];

  const isValidTag = (value = "") => {
    const text = String(value).trim();
    if (!text) return false;
    if (/^(company tags|topic tags|expected complexities|difficulty|examples|constraints|problem description|related tags)$/i.test(text)) {
      return false;
    }
    if (/time complexity|auxiliary space|expected complexities|interview experience|related articles/i.test(text)) {
      return false;
    }
    if (text.length > 30) return false;
    return /^[a-z0-9][a-z0-9\s&+\-]*$/i.test(text);
  };

  const selectorTags = [];
  for (const selector of selectorList) {
    const nodes = Array.from(document.querySelectorAll(selector));
    for (const node of nodes) {
      // If the node has multiple child links/spans, extract each child individually
      // to avoid concatenated text like "ZohoAmazonMakeMyTrip" from a container
      const childElements = node.querySelectorAll?.('a, span') || [];
      if (childElements.length > 1) {
        for (const child of childElements) {
          const childText = child.textContent?.trim();
          if (childText && isValidTag(childText)) {
            selectorTags.push(childText);
          }
        }
        continue;
      }

      const value = node.textContent?.trim();
      if (isValidTag(value)) {
        selectorTags.push(value);
      }
    }
  }

  if (selectorTags.length) {
    return [...new Set(selectorTags)].slice(0, 8);
  }

  const bodyText = document.body?.innerText || "";
  const lines = bodyText
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const collected = [];
  let activeSection = null;

  for (const line of lines) {
    if (/^company tags$/i.test(line)) {
      activeSection = "company";
      continue;
    }

    if (/^topic tags$/i.test(line)) {
      activeSection = "topic";
      continue;
    }

    if (/^(report an issue|start timer|difficulty|examples|constraints|expected complexities|problem description|related tags|submissions|comments|editor)$/i.test(line)) {
      activeSection = null;
      continue;
    }

    if (!activeSection) {
      continue;
    }

    const lineTags = line
      .split(/\s{2,}|\s-\s|,|\u2022|\|/)
      .map((tag) => tag.trim())
      .filter(isValidTag);

    if (lineTags.length) {
      collected.push(...lineTags);
    } else {
      if (isValidTag(line)) {
        collected.push(line);
      }
    }
  }

  return [...new Set(collected)].slice(0, 8);
}

function uniqueLines(lines) {
  const output = [];
  for (const line of lines) {
    const normalized = line.replace(/\u00a0/g, " ").trimEnd();
    if (!normalized.trim()) {
      output.push("");
      continue;
    }

    if (output[output.length - 1] !== normalized) {
      output.push(normalized);
    }
  }
  return output;
}

function extractDifficultyFromText(text = "") {
  const match = text.match(/\b(easy|medium|hard)\b/i);
  return match?.[1] || "unknown";
}

function inferLanguageFromCode(code = "") {
  const source = code.trim();
  if (!source) return null;

  if (
    /#include\s*[<"]/i.test(source) ||
    /\busing\s+namespace\s+std\b/i.test(source) ||
    /\bstd::\w+/i.test(source) ||
    /\bcout\b|\bcin\b|\bcerr\b/i.test(source) ||
    /\bvector\s*</i.test(source) ||
    /\bunordered_(map|set)\s*</i.test(source) ||
    /\bmap\s*</i.test(source) ||
    /\bset\s*</i.test(source) ||
    /\bpair\s*</i.test(source) ||
    /\bnullptr\b/i.test(source) ||
    /\bios::sync_with_stdio\b/i.test(source) ||
    /\bprintf\s*\(/i.test(source) ||
    /\bscanf\s*\(/i.test(source)
  ) {
    return "C++";
  }

  if (/\bpublic\s+class\b/.test(source) || /\bSystem\.out\.println\b/.test(source) || /\bstatic\s+void\s+main\b/.test(source)) {
    return "Java";
  }

  if (/^\s*def\s+\w+\s*\(/m.test(source) || /^\s*class\s+\w+\s*:\s*$/m.test(source) || /\bprint\s*\(/.test(source)) {
    return "Python";
  }

  if (/\bconsole\.log\b/.test(source) || /\bfunction\b/.test(source) || /\b(let|const|var)\b/.test(source)) {
    return "JavaScript";
  }

  return null;
}

function findLanguageFromSelectors(selectors) {
  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    const singleNode = document.querySelector(selector);
    if (singleNode && !nodes.includes(singleNode)) {
      nodes.unshift(singleNode);
    }

    for (const node of nodes) {
      const values = [
        node.value,
        node.textContent,
        node.getAttribute?.("aria-label"),
        node.getAttribute?.("title"),
        node.getAttribute?.("data-language"),
        node.getAttribute?.("data-lang")
      ].filter(Boolean);
      for (const value of values) {
        const language = matchKnownLanguage(String(value));
        if (language) {
          return language;
        }
      }
    }
  }

  return null;
}

function extractCodeFromLines(selectors) {
  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) continue;

    const code = uniqueLines(nodes.map((node) => node.textContent || "")).join("\n").trim();
    if (code) {
      return code;
    }
  }

  return "";
}

function findDifficultyFromSelectors(selectors) {
  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    const singleNode = document.querySelector(selector);
    if (singleNode && !nodes.includes(singleNode)) {
      nodes.unshift(singleNode);
    }
    for (const node of nodes) {
      const candidates = [
        node.getAttribute?.("data-difficulty"),
        node.getAttribute?.("aria-label"),
        node.getAttribute?.("title"),
        node.textContent,
        node.parentElement?.textContent,
        node.nextElementSibling?.textContent,
        node.parentElement?.nextElementSibling?.textContent
      ].filter(Boolean);

      for (const text of candidates) {
        const difficulty = extractDifficultyFromText(text);
        if (difficulty !== "unknown") {
          return difficulty;
        }
      }
    }
  }

  return "unknown";
}

function readCode() {
  // Collect ALL editor lines and join with newlines to preserve formatting.
  // GFG uses Ace editor — each .ace_line is one line of code.
  const editorLineSelectors = [
    ".ace_line",
    ".ace-line",
    ".monaco-editor .view-line",
    "[class*='CodeMirror'] pre"
  ];

  for (const selector of editorLineSelectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) continue;

    const code = uniqueLines(
      nodes.map((node) => node.textContent || "")
    ).join("\n").trim();

    if (code) {
      return code;
    }
  }

  // Fallback: try textarea (some GFG pages use a plain textarea)
  const textarea = document.querySelector("textarea");
  if (textarea?.value?.trim()) {
    return textarea.value.trim();
  }

  // Fallback: pre code block
  const preCode = document.querySelector("pre code");
  if (preCode?.textContent?.trim()) {
    return preCode.textContent.trim();
  }

  // Last resort: ace_content textContent (may lose newlines, but captures code)
  const aceContent = document.querySelector(".ace_content");
  if (aceContent?.textContent?.trim()) {
    return aceContent.textContent.trim();
  }

  return "";
}

function readDifficulty() {
  const direct = findDifficultyFromSelectors(GFG_DIFFICULTY_SELECTORS);
  if (direct !== "unknown") {
    return direct;
  }

  const bodyDifficulty = extractDifficultyFromText(document.body?.innerText || "");
  if (bodyDifficulty !== "unknown") {
    return bodyDifficulty;
  }

  const metaCandidates = [
    readMeta("difficulty"),
    readMetaProperty("og:description"),
    readMeta("description")
  ];

  for (const candidate of metaCandidates) {
    const difficulty = extractDifficultyFromText(candidate);
    if (difficulty !== "unknown") {
      return difficulty;
    }
  }

  return extractDifficultyFromText(document.body?.innerText || "");
}

function readLanguage() {
  const inferredLanguage = inferLanguageFromCode(readCode());
  if (inferredLanguage) {
    return inferredLanguage;
  }

  const explicitLanguage = findLanguageFromSelectors(GFG_LANGUAGE_SELECTORS);
  if (explicitLanguage) {
    return explicitLanguage;
  }

  const bodyText = document.body?.innerText || "";
  return matchKnownLanguage(bodyText) || "Unknown";
}

export function detectGfgSolution() {
  const title = cleanTitle(
    document.querySelector("h1")?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      document.title
  );
  const difficulty = readDifficulty();
  const code = readCode();
  const language = readLanguage();

  return {
    platform: PLATFORMS.GFG,
    title,
    difficulty,
    link: window.location.href,
    code,
    language,
    tags: readTags()
  };
}
