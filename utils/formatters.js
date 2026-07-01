import { DIFFICULTIES } from "./constants.js";

function titleCase(value = "") {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function normalizeDifficulty(difficulty) {
  const value = String(difficulty || "").toLowerCase();
  if (value.includes("easy")) return "Easy";
  if (value.includes("medium")) return "Medium";
  if (value.includes("hard")) return "Hard";
  return titleCase(difficulty || DIFFICULTIES.UNKNOWN);
}

function formatTags(tags = []) {
  return tags.filter(Boolean).join(", ");
}

function sanitizeSegment(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeLanguage(language = "") {
  const value = String(language).trim().toLowerCase();
  if (/^(c\+\+|cpp|g\+\+)(\d+)?$/.test(value) || value.includes("c++")) return "cpp";
  if (value === "c") return "c";
  if (value === "c#" || value === "csharp") return "cs";
  if (value === "java") return "java";
  if (value === "javascript" || value === "js" || value === "node") return "js";
  if (value === "typescript" || value === "ts") return "ts";
  if (value === "python" || value === "python3" || value === "py" || value === "pypy") return "py";
  if (value === "go" || value === "golang") return "go";
  if (value === "rust" || value === "rs") return "rs";
  if (value === "kotlin" || value === "kt") return "kt";
  if (value === "swift") return "swift";
  if (value === "ruby" || value === "rb") return "rb";
  if (value === "php") return "php";
  return sanitizeSegment(language) || "txt";
}

function inferLanguageFromCode(code = "") {
  const source = String(code || "").trim();
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

function resolveLanguage(solution = {}) {
  const inferredCodeLanguage = inferLanguageFromCode(solution.code);
  const reportedLanguage = String(solution.language || "").trim();

  if (!reportedLanguage || reportedLanguage.toLowerCase() === "unknown") {
    return inferredCodeLanguage || reportedLanguage;
  }

  if (solution.platform === "gfg" && inferredCodeLanguage === "C++") {
    return inferredCodeLanguage;
  }

  return reportedLanguage;
}

function getCommentStyle(language = "") {
  const extension = normalizeLanguage(language);
  if (["py", "rb"].includes(extension)) {
    return {
      open: '"""',
      prefix: "",
      close: '"""'
    };
  }

  if (extension === "hs") {
    return {
      open: "{-",
      prefix: "",
      close: "-}"
    };
  }

  return {
    open: "/**",
    prefix: " *",
    close: " */"
  };
}

export function getFileExtension(language = "") {
  return normalizeLanguage(language);
}

export function slugifyTitle(title = "", namingConvention = "kebab-case") {
  const kebab = sanitizeSegment(title) || "untitled-problem";
  return namingConvention === "snake_case" ? kebab.replace(/-/g, "_") : kebab;
}

export function buildSolutionPath(solution, settings = {}) {
  const namingConvention = settings.namingConvention || "kebab-case";
  const resolvedLanguage = resolveLanguage(solution);
  const extension = getFileExtension(resolvedLanguage);
  const fileName = `${slugifyTitle(solution.title, namingConvention)}.${extension}`;
  const platform = sanitizeSegment(solution.platform || "misc");
  return ["CODE", platform, fileName].join("/");
}

export function appendVersionSuffix(filePath, version) {
  const suffixVersion = Number(version);
  if (!Number.isInteger(suffixVersion) || suffixVersion < 2) {
    return filePath;
  }

  const lastSlashIndex = filePath.lastIndexOf("/");
  const directory = lastSlashIndex >= 0 ? filePath.slice(0, lastSlashIndex + 1) : "";
  const fileName = lastSlashIndex >= 0 ? filePath.slice(lastSlashIndex + 1) : filePath;
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return `${directory}${fileName}-v${suffixVersion}`;
  }

  const baseName = fileName.slice(0, lastDotIndex);
  const extension = fileName.slice(lastDotIndex);
  return `${directory}${baseName}-v${suffixVersion}${extension}`;
}

export function buildHeader(solution) {
  const resolvedLanguage = resolveLanguage(solution);
  const commentStyle = getCommentStyle(resolvedLanguage);
  const lines = [
    commentStyle.open,
    `${commentStyle.prefix} Problem: ${solution.title || "Unknown Problem"}`.trimEnd(),
    `${commentStyle.prefix} Link: ${solution.link || "N/A"}`.trimEnd(),
    `${commentStyle.prefix} Difficulty: ${normalizeDifficulty(solution.difficulty)}`.trimEnd(),
    `${commentStyle.prefix} Platform: ${titleCase(solution.platform || "unknown")}`.trimEnd(),
    `${commentStyle.prefix} Language: ${resolvedLanguage || "Unknown"}`.trimEnd(),
    `${commentStyle.prefix} Tags: ${formatTags(solution.tags || []) || "N/A"}`.trimEnd(),
    `${commentStyle.prefix} Status: ${solution.status || "Accepted"}`.trimEnd(),
    commentStyle.close
  ];

  return lines.join("\n");
}

export function formatSolution(solution) {
  const header = buildHeader(solution);
  const code = (solution.code || "").trimEnd();
  return `${header}\n\n${code}\n`;
}
