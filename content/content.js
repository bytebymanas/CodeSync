const PLATFORMS = Object.freeze({
  LEETCODE: "leetcode",
  GFG: "gfg"
});

// All supported languages and their common DOM display names
const LANGUAGE_ALIASES = Object.freeze({
  "c++": "C++", "cpp": "C++", "g++": "C++", "c++14": "C++", "c++17": "C++", "c++20": "C++",
  "c": "C",
  "c#": "C#", "csharp": "C#", "c sharp": "C#",
  "java": "Java",
  "python": "Python", "python3": "Python3", "py": "Python", "python 3": "Python3", "pypy": "Python", "pypy3": "Python3",
  "javascript": "JavaScript", "js": "JavaScript", "node": "JavaScript", "nodejs": "JavaScript", "node.js": "JavaScript",
  "typescript": "TypeScript", "ts": "TypeScript",
  "go": "Go", "golang": "Go",
  "rust": "Rust", "rs": "Rust",
  "kotlin": "Kotlin", "kt": "Kotlin",
  "swift": "Swift",
  "php": "PHP",
  "ruby": "Ruby", "rb": "Ruby",
  "scala": "Scala", "sc": "Scala",
  "r": "R",
  "dart": "Dart",
  "erlang": "Erlang",
  "elixir": "Elixir",
  "perl": "Perl",
  "mysql": "MySQL", "sql": "SQL",
  "bash": "Bash", "shell": "Bash", "sh": "Bash"
});

// --------------------------------------------------------------------------
// SCORE-BASED CODE INFERENCE — covers all major languages
// --------------------------------------------------------------------------
function inferLanguageFromCode(code = "") {
  const s = String(code || "").trim();
  if (!s) return null;

  const scores = {};
  const hit = (lang, pts) => { scores[lang] = (scores[lang] || 0) + pts; };

  // ─── C++ ───────────────────────────────────────────────────────────────
  if (/#include\s*[<"]/i.test(s))                          hit("C++", 10);
  if (/\busing\s+namespace\s+std\b/.test(s))               hit("C++", 10);
  if (/\bstd::/.test(s))                                   hit("C++", 8);
  if (/\bcout\b|\bcin\b|\bcerr\b/.test(s))                 hit("C++", 8);
  if (/\bvector\s*</.test(s))                              hit("C++", 7);
  if (/\bunordered_(map|set)\s*</.test(s))                 hit("C++", 7);
  if (/\bstack\s*<|\bqueue\s*<|\bdeque\s*<|\bpriority_queue\s*</.test(s)) hit("C++", 6);
  if (/\bmap\s*<|set\s*<|pair\s*</.test(s))               hit("C++", 5);
  if (/\bnullptr\b/.test(s))                               hit("C++", 6);
  if (/\bios_base::sync_with_stdio\b|\bios::sync_with_stdio\b/.test(s)) hit("C++", 8);
  if (/\bcin\.tie\b/.test(s))                              hit("C++", 7);
  if (/\bpush_back\b|\bemplace_back\b|\bpop_back\b/.test(s)) hit("C++", 6);
  if (/\bbegin\(\)|\bend\(\)/.test(s))                     hit("C++", 3);
  if (/\bsort\s*\(/.test(s) && /\.begin\(\)/.test(s))     hit("C++", 5);
  if (/\bstring\s+\w+/.test(s) && !/public\s+class/.test(s)) hit("C++", 2);
  if (/\bint\s+main\s*\(/.test(s) && /#include/.test(s))  hit("C++", 5);
  if (/\btemplate\s*</.test(s))                            hit("C++", 8);
  if (/\bstruct\s+\w+\s*{/.test(s) && /\bstd::/.test(s)) hit("C++", 4);
  if (/::iterator\b|::const_iterator\b/.test(s))           hit("C++", 7);
  if (/\bGCD\b|\b__gcd\b|\b__builtin_/.test(s))           hit("C++", 6);

  // ─── C (not C++) ──────────────────────────────────────────────────────
  if (/#include\s*<stdio\.h>/i.test(s))                    hit("C", 9);
  if (/#include\s*<stdlib\.h>/i.test(s))                   hit("C", 7);
  if (/#include\s*<string\.h>/i.test(s))                   hit("C", 7);
  if (/\bprintf\s*\(/.test(s) && !/#include\s*<iostream>/.test(s) && !/\bcout\b/.test(s)) hit("C", 6);
  if (/\bscanf\s*\(/.test(s))                              hit("C", 7);
  if (/\bmalloc\s*\(|\bfree\s*\(|\bcalloc\s*\(|\brealloc\s*\(/.test(s)) hit("C", 8);
  if (/\bNULL\b/.test(s) && !/\bnullptr\b/.test(s) && !/\busing\s+namespace/.test(s)) hit("C", 4);
  if (/\btypedef\s+struct\b/.test(s))                      hit("C", 8);
  if (/\bvoid\s*\*/.test(s))                               hit("C", 5);

  // ─── Java ─────────────────────────────────────────────────────────────
  if (/\bpublic\s+class\b/.test(s))                        hit("Java", 10);
  if (/\bSystem\.out\.print/.test(s))                      hit("Java", 10);
  if (/\bimport\s+java\./.test(s))                         hit("Java", 10);
  if (/\bArrayList\b|\bHashMap\b|\bHashSet\b|\bLinkedList\b|\bTreeMap\b/.test(s)) hit("Java", 7);
  if (/\bpublic\s+static\s+void\s+main/.test(s))          hit("Java", 10);
  if (/\bInteger\.parseInt\b|\bString\.valueOf\b|\bString\.format\b/.test(s)) hit("Java", 8);
  if (/@Override\b/.test(s))                               hit("Java", 8);
  if (/\bthrows\s+\w+Exception/.test(s))                   hit("Java", 8);
  if (/\bnew\s+\w+\s*</.test(s) && /\bpublic\b/.test(s)) hit("Java", 5);
  if (/\bCollections\.\w+/.test(s))                        hit("Java", 7);
  if (/\bArrays\.\w+/.test(s))                             hit("Java", 6);
  if (/\bList<|\bMap<|\bSet<|\bQueue</.test(s) && /\bpublic\b/.test(s)) hit("Java", 5);
  if (/\bStream\b|\b\.stream\(\)/.test(s) && /\bpublic\b/.test(s)) hit("Java", 6);

  // ─── Python / Python3 ─────────────────────────────────────────────────
  if (/^\s*def\s+\w+\s*\(/m.test(s))                       hit("Python", 8);
  if (/^\s*class\s+\w+\s*[:(]/m.test(s))                   hit("Python", 6);
  if (/\bprint\s*\(/.test(s) && !/System\.out/.test(s))   hit("Python", 5);
  if (/\bfrom\s+\w[\w.]*\s+import\b/.test(s))              hit("Python", 8);
  if (/\bimport\s+\w+/.test(s) && !/import\s+java/.test(s) && !/\busing\b/.test(s) && !/from\s+\w/.test(s)) hit("Python", 3);
  if (/\blen\s*\(/.test(s))                                hit("Python", 5);
  if (/\brange\s*\(/.test(s))                              hit("Python", 6);
  if (/\bList\[|\bDict\[|\bTuple\[|\bOptional\[|\bSet\[/.test(s)) hit("Python", 7);
  if (/\bNone\b/.test(s) && /\bTrue\b|\bFalse\b/.test(s)) hit("Python", 5);
  if (/->\s*(int|str|bool|List|None|Optional|Dict|Tuple|Set)\b/.test(s)) hit("Python", 6);
  if (/\bself\b/.test(s))                                  hit("Python", 8);
  if (/\belif\b/.test(s))                                  hit("Python", 9);
  if (/\b(collections|itertools|heapq|bisect)\b/.test(s))  hit("Python", 7);
  if (/\bappend\s*\(/.test(s) && /\bself\b|\bdef\b/.test(s)) hit("Python", 3);
  if (/:\s*$/.test(s) && /^\s+/m.test(s) && /\bdef\b|\bfor\b|\bif\b/.test(s)) hit("Python", 2);

  // ─── JavaScript ────────────────────────────────────────────────────────
  if (/\bconsole\.log\b/.test(s))                          hit("JavaScript", 9);
  if (/\bconst\s+\w+\s*=/.test(s) || /\blet\s+\w+\s*=/.test(s)) hit("JavaScript", 4);
  if (/\bfunction\s+\w+\s*\(/.test(s))                    hit("JavaScript", 5);
  if (/\b=>\s*[{(]/.test(s))                               hit("JavaScript", 5);
  if (/\brequire\s*\(/.test(s))                            hit("JavaScript", 7);
  if (/\bmodule\.exports\b/.test(s))                       hit("JavaScript", 9);
  if (/\.forEach\s*\(|\.map\s*\(|\.filter\s*\(|\.reduce\s*\(/.test(s)) hit("JavaScript", 4);
  if (/\bPromise\b|\basync\s+function\b/.test(s))          hit("JavaScript", 4);
  if (/\btypeof\b/.test(s))                                hit("JavaScript", 5);
  if (/\b===\b|\b!==\b/.test(s))                           hit("JavaScript", 3);
  if (/\bdocument\.\w+/.test(s))                           hit("JavaScript", 6);

  // ─── TypeScript ────────────────────────────────────────────────────────
  if (/:\s*(number|string|boolean|void|any|never|unknown|object)\b/.test(s)) hit("TypeScript", 7);
  if (/\binterface\s+\w+\s*{/.test(s))                    hit("TypeScript", 10);
  if (/\btype\s+\w+\s*=/.test(s))                         hit("TypeScript", 8);
  if (/\benum\s+\w+\s*{/.test(s) && !/#include/.test(s)) hit("TypeScript", 7);
  if (/<\w+>/.test(s) && !/std::/.test(s) && !/import\s+java/.test(s)) hit("TypeScript", 3);
  if (/\bReadonly\b|\bPartial\b|\bRequired\b|\bPick\b|\bOmit\b/.test(s)) hit("TypeScript", 8);
  if (/\bas\s+\w+\b/.test(s) && /:\s*\w+/.test(s))       hit("TypeScript", 5);
  if (/!\s*\.\s*\w+/.test(s) && /:\s*\w+/.test(s))       hit("TypeScript", 4);

  // ─── Go ────────────────────────────────────────────────────────────────
  if (/^package\s+main\b/m.test(s))                        hit("Go", 12);
  if (/\bfmt\.Print|\bfmt\.Println|\bfmt\.Sprintf/.test(s)) hit("Go", 10);
  if (/\bfunc\s+\w+\s*\(/.test(s) && !/\bdef\s/.test(s)) hit("Go", 6);
  if (/:=\s/.test(s))                                      hit("Go", 9);
  if (/\bimport\s+"fmt"|\bimport\s+"strings"|\bimport\s+"sort"/.test(s)) hit("Go", 10);
  if (/\bmap\[\w+\]/.test(s) && !/std::map/.test(s))      hit("Go", 7);
  if (/\bgoroutine\b|\bchan\b/.test(s))                    hit("Go", 10);
  if (/\bdefer\s+/.test(s))                                hit("Go", 9);
  if (/\bslice\b|\bmake\s*\(/.test(s) && /\bfunc\b/.test(s)) hit("Go", 5);
  if (/\bfor\s+\w+,\s*\w+\s*:=\s*range\b/.test(s))        hit("Go", 10);
  if (/\bvar\s+\w+\s+\[\]/.test(s))                        hit("Go", 7);

  // ─── Rust ──────────────────────────────────────────────────────────────
  if (/\bfn\s+main\s*\(\)/.test(s))                        hit("Rust", 10);
  if (/\bprintln!\s*\(/.test(s))                           hit("Rust", 10);
  if (/\buse\s+std::/.test(s))                             hit("Rust", 10);
  if (/\bimpl\s+\w+/.test(s) && !/#include/.test(s) && !/\bpublic\s+class/.test(s)) hit("Rust", 7);
  if (/\blet\s+mut\b/.test(s))                             hit("Rust", 10);
  if (/\bvec!\s*\[/.test(s))                               hit("Rust", 10);
  if (/\bSome\s*\(|\bNone\b/.test(s) && /\bfn\b/.test(s)) hit("Rust", 6);
  if (/\bmatch\b/.test(s) && /\bfn\b/.test(s) && /=>\s*/.test(s)) hit("Rust", 7);
  if (/\b->\s*\w+/.test(s) && /\bfn\b/.test(s) && !/\bJava\b/.test(s)) hit("Rust", 5);
  if (/&mut\b|&str\b/.test(s))                             hit("Rust", 9);
  if (/\b#\[derive\(/.test(s))                             hit("Rust", 10);
  if (/\bOwned\b|\bBorrowed\b|\blifetime\b|\bBox<|\bRc<|\bArc</.test(s)) hit("Rust", 8);

  // ─── Kotlin ────────────────────────────────────────────────────────────
  if (/\bfun\s+main\s*\(/.test(s))                         hit("Kotlin", 9);
  if (/\bprintln\s*\(/.test(s) && !/#include/.test(s) && !/System\.out/.test(s) && !/fmt\./.test(s)) hit("Kotlin", 7);
  if (/\bval\s+\w+\s*(:|=)/.test(s) && /\bfun\b/.test(s)) hit("Kotlin", 7);
  if (/\bvar\s+\w+\s*:/.test(s) && /\bfun\b/.test(s))     hit("Kotlin", 5);
  if (/\bfun\s+\w+\s*\(/.test(s))                         hit("Kotlin", 6);
  if (/\bdata\s+class\b/.test(s))                          hit("Kotlin", 10);
  if (/\blistOf\s*\(|\barrayOf\s*\(|\bmapOf\s*\(|\bmutableListOf\s*\(/.test(s)) hit("Kotlin", 9);
  if (/\b\w+\?./.test(s) && /\bfun\b/.test(s))            hit("Kotlin", 5);
  if (/\bcompanion\s+object\b/.test(s))                    hit("Kotlin", 10);
  if (/\blambda\b|\b\.let\s*{|\b\.also\s*{|\b\.apply\s*{/.test(s)) hit("Kotlin", 6);

  // ─── Swift ─────────────────────────────────────────────────────────────
  if (/\bimport\s+Foundation\b|\bimport\s+UIKit\b|\bimport\s+SwiftUI\b/.test(s)) hit("Swift", 10);
  if (/\bguard\s+let\b|\bguard\s+var\b/.test(s))           hit("Swift", 10);
  if (/\bif\s+let\b|\bif\s+var\b/.test(s))                hit("Swift", 8);
  if (/\bfunc\s+\w+\s*\(/.test(s) && !/\bfn\b/.test(s) && !/\bfun\b/.test(s)) hit("Swift", 4);
  if (/\bvar\s+\w+\s*:\s*\[|\blet\s+\w+\s*:\s*\[/.test(s)) hit("Swift", 5);
  if (/\bArray<\w+>|\bDictionary<|\bSet<\w+>/.test(s) && !/std::/.test(s) && !/\bpublic\b/.test(s)) hit("Swift", 6);
  if (/\boptional\b/i.test(s) && /\bfunc\b/.test(s))      hit("Swift", 5);
  if (/\bswitch\s+\w+\s*{/.test(s) && /\bcase\s+.+:/.test(s) && /\bfunc\b/.test(s)) hit("Swift", 4);
  if (/\b@escaping\b|\b@discardableResult\b/.test(s))      hit("Swift", 10);
  if (/\bweak\s+var\b|\bunowned\b/.test(s))                 hit("Swift", 9);

  // ─── C# ────────────────────────────────────────────────────────────────
  if (/\busing\s+System\b/.test(s))                        hit("C#", 10);
  if (/\bConsole\.Write|\bConsole\.Read/.test(s))           hit("C#", 10);
  if (/\bnamespace\s+\w+/.test(s))                         hit("C#", 9);
  if (/\bpublic\s+class\b/.test(s) && /\busing\s+System\b/.test(s)) hit("C#", 8);
  if (/\bList<|\bDictionary<|\bHashSet<|\bStack<|\bQueue</.test(s) && /\busing\b/.test(s)) hit("C#", 7);
  if (/\bforeach\s*\(/.test(s) && !/\bpublic\s+class\b/.test(s)) hit("C#", 4);
  if (/\bstatic\s+void\s+Main\b/.test(s))                  hit("C#", 10);
  if (/\bLINQ\b|\.Where\s*\(|\.Select\s*\(|\.OrderBy\s*\(/.test(s)) hit("C#", 8);
  if (/\bproperty\b|\bget;\s*set;/.test(s))                hit("C#", 8);
  if (/\bvar\s+\w+\s*=\s*new\b/.test(s) && /\busing\b/.test(s)) hit("C#", 5);

  // ─── PHP ───────────────────────────────────────────────────────────────
  if (/<\?php/i.test(s))                                   hit("PHP", 15);
  if (/\$\w+\s*=/.test(s))                                 hit("PHP", 8);
  if (/\becho\s+/.test(s))                                 hit("PHP", 7);
  if (/\barray\s*\(/.test(s) && /\$/.test(s))             hit("PHP", 7);
  if (/\bfunction\s+\w+\s*\(/.test(s) && /\$\w+/.test(s)) hit("PHP", 6);
  if (/\$_GET\b|\$_POST\b|\$_SESSION\b/.test(s))           hit("PHP", 10);

  // ─── Ruby ──────────────────────────────────────────────────────────────
  if (/^\s*def\s+\w+/m.test(s) && /\bend\b/.test(s) && !/#include/.test(s)) hit("Ruby", 9);
  if (/\bputs\s+/.test(s))                                 hit("Ruby", 9);
  if (/\brequire\s+['"]/.test(s) && !/\bNode/.test(s))    hit("Ruby", 8);
  if (/\battr_(reader|writer|accessor)\b/.test(s))         hit("Ruby", 10);
  if (/\bdo\s*\|\w+\|/.test(s))                            hit("Ruby", 8);
  if (/\b\.each\s+do\b|\b\.each\s*{/.test(s))             hit("Ruby", 8);
  if (/\bnil\b/.test(s) && /\bend\b/.test(s) && !/#include/.test(s)) hit("Ruby", 5);

  // ─── Pick winner (minimum threshold of 5) ─────────────────────────────
  let best = null;
  let bestScore = 0;
  for (const [lang, pts] of Object.entries(scores)) {
    if (pts > bestScore) {
      bestScore = pts;
      best = lang;
    }
  }

  // Disambiguate C vs C++ — prefer C++ when both have scores but C++ has >= C
  if (best === "C" && (scores["C++"] || 0) >= (scores["C"] || 0)) {
    best = "C++";
    bestScore = scores["C++"];
  }

  // Disambiguate JavaScript vs TypeScript — TS wins if it has TS-specific markers
  if (best === "JavaScript" && (scores["TypeScript"] || 0) >= 7) {
    best = "TypeScript";
  }

  return bestScore >= 5 ? best : null;
}

// --------------------------------------------------------------------------
// DOM LANGUAGE DETECTION — exhaustive selectors + page scanning
// --------------------------------------------------------------------------
function resolveKnownLanguage(text = "") {
  if (!text) return null;
  const normalized = text.trim().toLowerCase().replace(/\s+/g, " ");
  return LANGUAGE_ALIASES[normalized] || null;
}

function findLanguageInText(text = "") {
  if (!text) return null;
  const lower = text.trim().toLowerCase();

  // Exact alias match first
  const alias = resolveKnownLanguage(lower);
  if (alias) return alias;

  // Partial match — check if any known alias is contained in the text
  // Sort by length descending so "python3" matches before "python"
  const sorted = Object.keys(LANGUAGE_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of sorted) {
    const re = new RegExp(`\\b${alias.replace(/[+#]/g, "\\$&")}\\b`, "i");
    if (re.test(lower)) {
      return LANGUAGE_ALIASES[alias];
    }
  }
  return null;
}

// Scan a DOM node and its common attribute values for a language name
function extractLangFromNode(node) {
  const candidates = [
    node.value,
    node.textContent,
    node.getAttribute?.("aria-label"),
    node.getAttribute?.("title"),
    node.getAttribute?.("data-language"),
    node.getAttribute?.("data-lang"),
    node.getAttribute?.("data-value"),
    node.getAttribute?.("data-cy"),
    node.getAttribute?.("placeholder")
  ].filter(Boolean);

  for (const c of candidates) {
    const lang = findLanguageInText(String(c).trim());
    if (lang) return lang;
  }
  return null;
}

// Scan a list of CSS selectors, return first language found
function findLanguageFromSelectors(selectors) {
  for (const sel of selectors) {
    try {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const node of nodes) {
        const lang = extractLangFromNode(node);
        if (lang) return lang;
      }
    } catch (_) { /* invalid selector — skip */ }
  }
  return null;
}

// LeetCode language button selectors — covers legacy and current React UI
const LEETCODE_LANG_SELECTORS = [
  // Modern headlessui listbox button (most reliable)
  '[data-cy="lang-select"]',
  '[data-cy="language-name"]',
  'button[id*="headlessui-listbox-button"]',
  // Toolbar buttons near the editor
  '[class*="action__"][class*="lang"]',
  '[class*="lang"][class*="selector"]',
  '[class*="langSelector"]',
  '[class*="language-select"]',
  '[class*="languageSelect"]',
  // React-based dropdown items (currently selected option)
  '[data-e2e-locator="code-editor-language"]',
  '[data-track-load*="lang"]',
  // Generic — any button near the editor area
  '#editor-wrapper button',
  '#codeEditor button',
  '.view-lines ~ * button',
  '[class*="editor"] button',
  // select elements
  'select[name*="lang" i]',
  'select[aria-label*="lang" i]',
];

// GFG language selectors
const GFG_LANG_SELECTORS = [
  'select[name*="lang" i]',
  'select[id*="lang" i]',
  'select[class*="lang" i]',
  '[aria-label*="language" i]',
  '[class*="language"]',
  '[class*="lang-"]',
  '[data-lang]',
  'button[id*="language" i]',
  'button[class*="language" i]',
  '.select-language',
  '#languageDropdown',
  'select',
];

// Extract language from LeetCode URL params (?lang=cpp, ?language=python3)
function extractLangFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("lang") || params.get("language") || params.get("l");
  if (raw) {
    const lang = findLanguageInText(raw);
    if (lang) return lang;
  }
  return null;
}

// Walk page body text looking for a "Language: <X>" or "Selected: <X>" pattern
function scanBodyForLanguage() {
  const bodyText = document.body?.innerText || "";
  const patterns = [
    /selected\s+language[:\s]+(\w[\w+#. ]*)/i,
    /language[:\s]+(\w[\w+#. ]*)/i,
    /lang[:\s]+(\w[\w+#. ]*)/i,
  ];
  for (const re of patterns) {
    const m = bodyText.match(re);
    if (m) {
      const lang = findLanguageInText(m[1]);
      if (lang) return lang;
    }
  }
  return null;
}

// Scan ALL interactive/text elements on the page for a language name that
// appears near words like "language", "lang", or "solution"
function deepScanPageForLanguage() {
  const candidates = Array.from(
    document.querySelectorAll("button, option, [role='option'], [role='menuitem'], [role='button'], select, span, p, label")
  );

  for (const node of candidates) {
    const text = (node.textContent || "").trim();
    if (!text || text.length > 50) continue;
    const lang = findLanguageInText(text);
    if (lang) return lang;
  }
  return null;
}

// --------------------------------------------------------------------------
// PLATFORM DETECTION
// --------------------------------------------------------------------------
function detectPlatform() {
  const host = window.location.hostname;
  if (host.includes("leetcode.com")) return PLATFORMS.LEETCODE;
  if (host.includes("geeksforgeeks.org")) return PLATFORMS.GFG;
  return "unknown";
}

// --------------------------------------------------------------------------
// GENERIC HELPERS
// --------------------------------------------------------------------------
function readMeta(name) {
  const tag = document.querySelector(`meta[name="${name}"]`);
  return tag?.content?.trim() || "";
}

function readJsonLd() {
  const node = document.querySelector('script[type="application/ld+json"]');
  if (!node?.textContent) return null;
  try { return JSON.parse(node.textContent); } catch { return null; }
}

function readMetaProperty(name) {
  const tag = document.querySelector(`meta[property="${name}"]`);
  return tag?.content?.trim() || "";
}

function uniqueLines(lines) {
  const output = [];
  for (const line of lines) {
    const normalized = line.replace(/\u00a0/g, " ").trimEnd();
    if (!normalized.trim()) { output.push(""); continue; }
    if (output[output.length - 1] !== normalized) output.push(normalized);
  }
  return output;
}

function findFirstText(selectors) {
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    const value = "value" in (node || {}) ? node.value : node?.textContent;
    if (value?.trim()) return value.trim();
  }
  return "";
}

function extractCodeFromLines(selectors) {
  for (const selector of selectors) {
    const nodes = Array.from(document.querySelectorAll(selector));
    if (!nodes.length) continue;
    const lines = uniqueLines(
      nodes.map(n => n.textContent || "").map(v => v.replace(/^\s*\d+\s+/, ""))
    ).join("\n");
    if (lines.trim()) return lines.trim();
  }
  return "";
}

function extractTags(selectors) {
  const selectorList = [".tag-card", ".problemTopic", "a[href*='/tag/']", "a[href*='/tag-list/']", selectors];
  const isValidTag = (v = "") => {
    const t = String(v).trim();
    if (!t) return false;
    if (/^(company tags|topic tags|expected complexities|difficulty|examples|constraints|problem description|related tags)$/i.test(t)) return false;
    if (/time complexity|auxiliary space|expected complexities|interview experience|related articles/i.test(t)) return false;
    if (t.length > 30) return false;
    return /^[a-z0-9][a-z0-9\s&+\-]*$/i.test(t);
  };

  const selectorTags = [];
  for (const sel of selectorList) {
    const nodes = Array.from(document.querySelectorAll(sel));
    for (const node of nodes) {
      const children = node.querySelectorAll?.("a, span") || [];
      if (children.length > 1) {
        for (const ch of children) { const t = ch.textContent?.trim(); if (t && isValidTag(t)) selectorTags.push(t); }
        continue;
      }
      const v = node.textContent?.trim();
      if (isValidTag(v)) selectorTags.push(v);
    }
  }
  if (selectorTags.length) return [...new Set(selectorTags)].slice(0, 8);

  const bodyText = document.body?.innerText || "";
  const lines = bodyText.split(/\n+/).map(l => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const collected = [];
  let activeSection = null;
  for (const line of lines) {
    if (/^company tags$/i.test(line)) { activeSection = "company"; continue; }
    if (/^topic tags$/i.test(line)) { activeSection = "topic"; continue; }
    if (/^(report an issue|start timer|difficulty|examples|constraints|expected complexities|problem description|related tags|submissions|comments|editor)$/i.test(line)) { activeSection = null; continue; }
    if (!activeSection) continue;
    const lineTags = line.split(/\s{2,}|\s-\s|,|\u2022|\|/).map(t => t.trim()).filter(isValidTag);
    if (lineTags.length) collected.push(...lineTags); else if (isValidTag(line)) collected.push(line);
  }
  return [...new Set(collected)].slice(0, 8);
}

function extractDifficultyFromText(text = "") {
  const m = text.match(/\b(easy|medium|hard)\b/i);
  return m?.[1] || "unknown";
}

// --------------------------------------------------------------------------
// LEETCODE-SPECIFIC
// --------------------------------------------------------------------------
function extractLeetCodeTitle(jsonLd) {
  const candidates = [
    document.querySelector('meta[property="og:title"]')?.content,
    jsonLd?.name,
    document.querySelector("div.text-title-large a")?.textContent,
    document.querySelector("h1")?.textContent,
    document.title
  ];
  for (const c of candidates) {
    const v = c?.replace(/\s+-\s+LeetCode$/, "").trim();
    if (v) return v;
  }
  const pm = window.location.pathname.match(/\/problems\/([^/]+)/);
  if (!pm) return "";
  return pm[1].split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function extractLeetCodeCode() {
  const textareaSelectors = [
    'textarea[aria-roledescription="editor"]',
    '[data-track-load="code_editor"] textarea',
    'div[data-cy="code-editor"] textarea',
    'textarea'
  ];
  for (const sel of textareaSelectors) {
    const el = document.querySelector(sel);
    if (el?.value?.trim()) return el.value.trim();
  }
  const preCode = document.querySelector('div[data-track-load="description_content"] pre code');
  if (preCode?.textContent?.trim()) return preCode.textContent.trim();
  return extractCodeFromLines([
    ".view-line", '[class*="view-line"]', '[class*="code-line"]',
    "pre code span", "[class*='CodeMirror'] pre"
  ]);
}

function extractLeetCodeDifficulty() {
  const direct = [
    readMeta("difficulty"),
    document.querySelector('[diff]')?.getAttribute("diff"),
    document.querySelector('[class*="difficulty"]')?.textContent,
    document.querySelector('div[class*="text-difficulty"]')?.textContent
  ].find(v => v?.trim())?.trim();
  if (direct) return extractDifficultyFromText(direct);
  return extractDifficultyFromText(document.body?.innerText || "");
}

function extractLeetCodeLanguage(code = "") {
  // 1. URL parameter (very reliable — LeetCode persists this)
  const urlLang = extractLangFromUrl();
  if (urlLang) return urlLang;

  // 2. Infer from actual code content (most accurate for what's actually written)
  const codeLang = inferLanguageFromCode(code);
  if (codeLang) return codeLang;

  // 3. Dedicated DOM selectors for LeetCode's language button/dropdown
  const selectorLang = findLanguageFromSelectors(LEETCODE_LANG_SELECTORS);
  if (selectorLang) return selectorLang;

  // 4. Meta tags
  const metaLang = findLanguageInText(readMeta("language"));
  if (metaLang) return metaLang;

  // 5. Deep scan of entire page
  const deepLang = deepScanPageForLanguage();
  if (deepLang) return deepLang;

  // 6. Body text pattern scan
  const bodyLang = scanBodyForLanguage();
  if (bodyLang) return bodyLang;

  return "Unknown";
}

// --------------------------------------------------------------------------
// GFG-SPECIFIC
// --------------------------------------------------------------------------
function cleanGfgTitle(v = "") {
  return v.replace(/\|\s*Practice\s*\|\s*GeeksforGeeks/gi, "")
           .replace(/\|\s*GeeksforGeeks/gi, "")
           .replace(/\s+-\s+GeeksforGeeks$/i, "").trim();
}

function extractGfgCode() {
  const editorSelectors = [".ace_line", ".ace-line", ".monaco-editor .view-line", "[class*='CodeMirror'] pre"];
  for (const sel of editorSelectors) {
    const nodes = Array.from(document.querySelectorAll(sel));
    if (!nodes.length) continue;
    const code = uniqueLines(nodes.map(n => n.textContent || "")).join("\n").trim();
    if (code) return code;
  }
  const ta = document.querySelector("textarea");
  if (ta?.value?.trim()) return ta.value.trim();
  const preCode = document.querySelector("pre code");
  if (preCode?.textContent?.trim()) return preCode.textContent.trim();
  const aceContent = document.querySelector(".ace_content");
  if (aceContent?.textContent?.trim()) return aceContent.textContent.trim();
  return "";
}

function extractGfgDifficulty() {
  const gfgSelectors = [
    '[data-difficulty]', '[class*="difficulty"]', '[class*="Difficulty"]',
    '[class*="tag"]', '[class*="header"]', '.problems_header_content', '.problem-tab', 'span', 'div'
  ];

  for (const sel of gfgSelectors) {
    const nodes = Array.from(document.querySelectorAll(sel));
    for (const node of nodes) {
      const candidates = [
        node.getAttribute?.("data-difficulty"), node.getAttribute?.("aria-label"),
        node.getAttribute?.("title"), node.textContent,
        node.parentElement?.textContent, node.nextElementSibling?.textContent
      ].filter(Boolean);
      for (const t of candidates) {
        const d = extractDifficultyFromText(t);
        if (d !== "unknown") return d;
      }
    }
  }

  const meta = [readMeta("difficulty"), readMetaProperty("og:description"), readMeta("description")];
  for (const m of meta) { const d = extractDifficultyFromText(m); if (d !== "unknown") return d; }
  return extractDifficultyFromText(document.body?.innerText || "");
}

function extractGfgLanguage(code = "") {
  // 1. Infer from code content
  const codeLang = inferLanguageFromCode(code);
  if (codeLang) return codeLang;

  // 2. DOM selectors for GFG
  const selectorLang = findLanguageFromSelectors(GFG_LANG_SELECTORS);
  if (selectorLang) return selectorLang;

  // 3. Deep page scan
  const deepLang = deepScanPageForLanguage();
  if (deepLang) return deepLang;

  // 4. Body text scan
  const bodyLang = scanBodyForLanguage();
  if (bodyLang) return bodyLang;

  return "Unknown";
}

// --------------------------------------------------------------------------
// SOLUTION DETECTORS
// --------------------------------------------------------------------------
function detectLeetCodeSolution() {
  const jsonLd = readJsonLd();
  const code = extractLeetCodeCode();
  return {
    platform: PLATFORMS.LEETCODE,
    title: extractLeetCodeTitle(jsonLd),
    difficulty: extractLeetCodeDifficulty(),
    link: document.querySelector('link[rel="canonical"]')?.href || window.location.href,
    code,
    language: extractLeetCodeLanguage(code),
    tags: extractTags('a[href*="/tag/"], a[href*="/problem-list/"]')
  };
}

function detectGfgSolution() {
  const code = extractGfgCode();
  return {
    platform: PLATFORMS.GFG,
    title: cleanGfgTitle(
      document.querySelector("h1")?.textContent?.trim() ||
      document.querySelector('meta[property="og:title"]')?.content ||
      document.title
    ),
    difficulty: extractGfgDifficulty(),
    link: window.location.href,
    code,
    language: extractGfgLanguage(code),
    tags: extractTags(".tag-card, .problemTopic, a[href*='/tag/'], a[href*='/tag-list/']")
  };
}

// --------------------------------------------------------------------------
// EDITOR BRIDGE (Monaco / Ace API access)
// --------------------------------------------------------------------------
function injectEditorBridge() {
  return new Promise((resolve) => {
    const eventName = "__codesync_editor_code__";
    let resolved = false;
    const handler = (e) => {
      if (resolved) return;
      resolved = true;
      document.removeEventListener(eventName, handler);
      resolve(e.detail?.code || null);
    };
    document.addEventListener(eventName, handler);
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("content/editor-bridge.js");
    script.onload = () => script.remove();
    script.onerror = () => { if (!resolved) { resolved = true; document.removeEventListener(eventName, handler); resolve(null); } script.remove(); };
    (document.head || document.documentElement).appendChild(script);
    setTimeout(() => { if (!resolved) { resolved = true; document.removeEventListener(eventName, handler); resolve(null); } }, 1500);
  });
}

// --------------------------------------------------------------------------
// MAIN CAPTURE
// --------------------------------------------------------------------------
async function captureCurrentSolution() {
  const platform = detectPlatform();
  if (platform !== PLATFORMS.LEETCODE && platform !== PLATFORMS.GFG) return null;

  // Try editor API bridge first (gets full code from Monaco/Ace)
  const bridgeCode = await injectEditorBridge();

  let solution;
  if (platform === PLATFORMS.LEETCODE) {
    solution = detectLeetCodeSolution();
  } else {
    solution = detectGfgSolution();
  }

  // If bridge captured full code, use it (and re-infer language from it)
  if (bridgeCode?.trim()) {
    solution.code = bridgeCode.trim();
    // Re-run language detection with the full code from the editor
    if (solution.language === "Unknown") {
      const inferred = inferLanguageFromCode(solution.code);
      if (inferred) solution.language = inferred;
    }
  }

  return solution;
}

// --------------------------------------------------------------------------
// MESSAGE LISTENER
// --------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "CAPTURE_CURRENT_SOLUTION") {
    captureCurrentSolution().then((solution) => {
      const valid = solution?.title && solution?.code ? solution : null;
      sendResponse({ ok: Boolean(valid), solution: valid });
    });
    return true;
  }
  return false;
});
