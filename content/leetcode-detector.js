const PLATFORMS = Object.freeze({
  LEETCODE: "leetcode"
});

const KNOWN_LANGUAGES = ["C++", "Java", "Python", "Python3", "JavaScript", "TypeScript", "C", "C#", "Go", "Rust", "Kotlin", "Swift", "PHP"];

const LEETCODE_LANGUAGE_SELECTORS = [
  '[data-cy="lang-select"]',
  '[data-cy="language-name"]',
  '[data-cy="code-area"] button',
  '[data-cy="code-editor"] button',
  '.monaco-editor ~ div button',
  'button[id*="headlessui-listbox-button"]'
];

function matchKnownLanguage(value = "") {
  const normalized = value.trim().toLowerCase();
  const sortedLanguages = [...KNOWN_LANGUAGES].sort((left, right) => right.length - left.length);
  return sortedLanguages.find((item) => normalized.includes(item.toLowerCase())) || null;
}

function readMeta(name) {
  const tag = document.querySelector(`meta[name="${name}"]`);
  return tag?.content?.trim() || "";
}

function readJsonLd() {
  const node = document.querySelector('script[type="application/ld+json"]');
  if (!node?.textContent) return null;

  try {
    return JSON.parse(node.textContent);
  } catch {
    return null;
  }
}

function readMetaProperty(name) {
  const tag = document.querySelector(`meta[property="${name}"]`);
  return tag?.content?.trim() || "";
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

function readTags() {
  return Array.from(document.querySelectorAll('a[href*="/tag/"], a[href*="/problem-list/"]'))
    .map((tag) => tag.textContent?.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function extractDifficultyFromText(text = "") {
  const match = text.match(/\b(easy|medium|hard)\b/i);
  return match?.[1] || "unknown";
}

function findExactLanguageInText(value = "") {
  const normalized = value.trim().toLowerCase();
  const exactAliases = new Map([
    ["c++", "C++"],
    ["cpp", "C++"],
    ["c#", "C#"],
    ["c", "C"],
    ["java", "Java"],
    ["python", "Python"],
    ["python3", "Python3"],
    ["javascript", "JavaScript"],
    ["js", "JavaScript"],
    ["typescript", "TypeScript"],
    ["ts", "TypeScript"],
    ["go", "Go"],
    ["golang", "Go"],
    ["rust", "Rust"],
    ["kotlin", "Kotlin"],
    ["swift", "Swift"],
    ["php", "PHP"]
  ]);

  return exactAliases.get(normalized) || null;
}

function findLanguageFromSelectors(selectors) {
  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    const singleNode = document.querySelector(selector);
    if (singleNode && !nodes.includes(singleNode)) {
      nodes.unshift(singleNode);
    }
    for (const node of nodes) {
      const text = node.textContent?.trim();
      const language = findExactLanguageInText(text || "");
      if (language) {
        return language;
      }
    }
  }

  return null;
}

function extractCodeFromLines(selectors) {
  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) continue;

    const lines = uniqueLines(
      nodes
        .map((node) => node.textContent || "")
        .map((value) => value.replace(/^\s*\d+\s+/, ""))
    ).join("\n");

    if (lines.trim()) {
      return lines.trim();
    }
  }

  return "";
}

function readCode() {
  const candidates = [
    document.querySelector("textarea")?.value,
    document.querySelector('[data-track-load="code_editor"] textarea')?.value,
    document.querySelector('div[data-cy="code-editor"] textarea')?.value,
    document.querySelector('div[data-track-load="description_content"] pre code')?.textContent,
    document.querySelector(".ace_content")?.textContent,
    Array.from(document.querySelectorAll(".view-line, [class*='view-line'], [class*='code-line'], pre code span, [class*='CodeMirror'] pre"))
      .map((node) => node.textContent || "")
      .join("\n")
  ];

  const direct = candidates.find((value) => value?.trim())?.trim();
  if (direct) {
    return direct;
  }

  return extractCodeFromLines([
    ".view-line",
    '[class*="view-line"]',
    '[class*="code-line"]',
    "pre code span"
  ]);
}

function readTitle(jsonLd) {
  const candidates = [
    document.querySelector('meta[property="og:title"]')?.content,
    jsonLd?.name,
    document.querySelector("div.text-title-large a")?.textContent,
    document.querySelector("h1")?.textContent,
    document.title
  ];

  for (const candidate of candidates) {
    const value = candidate?.replace(/\s+-\s+LeetCode$/, "").trim();
    if (value) {
      return value;
    }
  }

  const pathMatch = window.location.pathname.match(/\/problems\/([^/]+)/);
  if (!pathMatch) {
    return "";
  }

  return pathMatch[1]
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readDifficulty() {
  const directCandidates = [
    readMeta("difficulty"),
    document.querySelector('[diff]')?.getAttribute("diff"),
    document.querySelector('[class*="difficulty"]')?.textContent,
    document.querySelector('div[class*="text-difficulty"]')?.textContent
  ];

  const direct = directCandidates.find((value) => value?.trim())?.trim();
  if (direct) {
    return extractDifficultyFromText(direct);
  }

  const metaCandidates = [readMetaProperty("og:description"), readMeta("description"), document.body?.innerText || ""];
  for (const candidate of metaCandidates) {
    const difficulty = extractDifficultyFromText(candidate);
    if (difficulty !== "unknown") {
      return difficulty;
    }
  }

  return "unknown";
}

function readLanguage() {
  const codeLanguage = inferLanguageFromCode(readCode());
  if (codeLanguage) {
    return codeLanguage;
  }

  const metaLanguage = findExactLanguageInText(readMeta("language"));
  if (metaLanguage) {
    return metaLanguage;
  }

  return findLanguageFromSelectors(LEETCODE_LANGUAGE_SELECTORS) || "Unknown";
}

export function detectLeetCodeSolution() {
  const jsonLd = readJsonLd();
  const title = readTitle(jsonLd);

  const difficulty = readDifficulty();
  const canonicalLink = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
  const code = readCode();
  const language = readLanguage();

  return {
    platform: PLATFORMS.LEETCODE,
    title,
    difficulty,
    link: canonicalLink,
    code,
    language,
    tags: readTags()
  };
}
