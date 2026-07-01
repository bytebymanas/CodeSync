import assert from "node:assert/strict";
import test from "node:test";

function createDocument(stubs) {
  return {
    title: stubs.title || "",
    body: stubs.body || { innerText: "" },
    querySelector(selector) {
      return stubs.querySelector?.[selector] ?? null;
    },
    querySelectorAll(selector) {
      return stubs.querySelectorAll?.[selector] ?? [];
    }
  };
}

test("detectLeetCodeSolution reads title, tags, and code", async () => {
  globalThis.window = {
    location: {
      href: "https://leetcode.com/problems/two-sum/"
    }
  };

  globalThis.document = createDocument({
    title: "Two Sum - LeetCode",
    querySelector: {
      'meta[property="og:title"]': { content: "Two Sum - LeetCode" },
      'meta[name="difficulty"]': { content: "Medium" },
      'link[rel="canonical"]': { href: "https://leetcode.com/problems/two-sum/" },
      textarea: { value: "function twoSum() {}" },
      '[data-cy="language-name"]': { textContent: "JavaScript" }
    },
    querySelectorAll: {
      'a[href*="/tag/"], a[href*="/problem-list/"]': [{ textContent: "Array" }, { textContent: "Hash Table" }]
    }
  });

  const { detectLeetCodeSolution } = await import("../content/leetcode-detector.js");
  const result = detectLeetCodeSolution();

  assert.equal(result.title, "Two Sum");
  assert.equal(result.language, "JavaScript");
  assert.deepEqual(result.tags, ["Array", "Hash Table"]);
});

test("detectLeetCodeSolution reads Monaco-style editor lines", async () => {
  globalThis.window = {
    location: {
      href: "https://leetcode.com/problems/find-the-k-th-positive-integer/",
      pathname: "/problems/find-the-k-th-positive-integer/"
    }
  };

  globalThis.document = createDocument({
    title: "Find the K-th Positive Integer - LeetCode",
    body: {
      innerText: "Kth Missing Positive Number Medium C++"
    },
    querySelector: {
      'link[rel="canonical"]': { href: "https://leetcode.com/problems/find-the-k-th-positive-integer/" },
      '[data-cy="language-name"]': { textContent: "C++" }
    },
    querySelectorAll: {
      ".view-line": [
        { textContent: "1 class Solution {" },
        { textContent: "2 public:" },
        { textContent: "3     int findKthPositive(vector<int>& arr, int k) {" }
      ],
      'a[href*="/tag/"], a[href*="/problem-list/"]': []
    }
  });

  const { detectLeetCodeSolution } = await import("../content/leetcode-detector.js");
  const result = detectLeetCodeSolution();

  assert.equal(result.title, "Find the K-th Positive Integer");
  assert.equal(result.difficulty.toLowerCase(), "medium");
  assert.equal(result.language, "C++");
  assert.match(result.code, /class Solution/);
  assert.match(result.code, /findKthPositive/);
});

test("detectLeetCodeSolution infers C++ from code when language selector is misleading", async () => {
  globalThis.window = {
    location: {
      href: "https://leetcode.com/problems/find-target-indices-after-sorting-array/",
      pathname: "/problems/find-target-indices-after-sorting-array/"
    }
  };

  globalThis.document = createDocument({
    title: "Find Target Indices After Sorting Array - LeetCode",
    body: {
      innerText: "Medium C++"
    },
    querySelector: {
      'link[rel="canonical"]': { href: "https://leetcode.com/problems/find-target-indices-after-sorting-array/" },
      '[data-cy="language-name"]': { textContent: "Unknown" }
    },
    querySelectorAll: {
      ".view-line": [
        { textContent: "1 class Solution {" },
        { textContent: "2 public:" },
        { textContent: "3     vector<int> targetIndices(vector<int>& nums, int target) {" },
        { textContent: "4         sort(nums.begin(), nums.end());" },
        { textContent: "5         vector<int> ans;" },
        { textContent: "6         return ans;" },
        { textContent: "7     }" },
        { textContent: "8 };" }
      ],
      'a[href*="/tag/"], a[href*="/problem-list/"]': []
    }
  });

  const { detectLeetCodeSolution } = await import("../content/leetcode-detector.js");
  const result = detectLeetCodeSolution();

  assert.equal(result.language, "C++");
  assert.match(result.code, /vector<int>/);
});

test("detectGfgSolution reads title, tags, and editor content", async () => {
  globalThis.window = {
    location: {
      href: "https://www.geeksforgeeks.org/problems/example"
    }
  };

  globalThis.document = createDocument({
    title: "Example - GeeksforGeeks",
    querySelector: {
      h1: { textContent: "Example Problem" },
      '[data-difficulty]': { getAttribute: () => "easy" },
      ".ace_content": { textContent: "class Solution {}" },
      select: { value: "Java" }
    },
    querySelectorAll: {
      ".tag-card": [{ textContent: "arrays" }],
      ".problemTopic": [],
      "a[href*='/tag/']": []
    }
  });

  const { detectGfgSolution } = await import("../content/gfg-detector.js");
  const result = detectGfgSolution();

  assert.equal(result.title, "Example Problem");
  assert.equal(result.language, "Java");
  assert.deepEqual(result.tags, ["arrays"]);
});

test("detectGfgSolution cleans title and preserves multiline ace code", async () => {
  globalThis.window = {
    location: {
      href: "https://www.geeksforgeeks.org/problems/find-nth-root-of-m5843/1"
    }
  };

  globalThis.document = createDocument({
    title: "Find nth root of m | Practice | GeeksforGeeks",
    body: {
      innerText: "Difficulty: Medium Code C++"
    },
    querySelector: {
      h1: { textContent: "Find nth root of m | Practice | GeeksforGeeks" }
    },
    querySelectorAll: {
      ".ace_line": [
        { textContent: "class Solution {" },
        { textContent: "  public:" },
        { textContent: "    int nthRoot(int n, int m) {" },
        { textContent: "      return -1;" },
        { textContent: "    }" },
        { textContent: "};" }
      ],
      ".tag-card, .problemTopic, a[href*='/tag/']": []
    }
  });

  const { detectGfgSolution } = await import("../content/gfg-detector.js");
  const result = detectGfgSolution();

  assert.equal(result.title, "Find nth root of m");
  assert.equal(result.difficulty.toLowerCase(), "medium");
  assert.equal(result.language, "C++");
  assert.match(result.code, /class Solution \{\n  public:/);
  assert.match(result.code, /int nthRoot/);
});

test("detectGfgSolution prefers code-based C++ detection over a misleading selector", async () => {
  globalThis.window = {
    location: {
      href: "https://www.geeksforgeeks.org/problems/sample"
    }
  };

  globalThis.document = createDocument({
    title: "Sample - GeeksforGeeks",
    body: {
      innerText: "Difficulty: Medium"
    },
    querySelector: {
      h1: { textContent: "Sample Problem" },
      select: { value: "JavaScript" }
    },
    querySelectorAll: {
      ".ace_line": [
        { textContent: "#include <bits/stdc++.h>" },
        { textContent: "using namespace std;" },
        { textContent: "class Solution {" },
        { textContent: "  public:" },
        { textContent: "    vector<int> solve() {" },
        { textContent: "      return {};" },
        { textContent: "    }" },
        { textContent: "};" }
      ],
      ".tag-card, .problemTopic, a[href*='/tag/']": []
    }
  });

  const { detectGfgSolution } = await import("../content/gfg-detector.js");
  const result = detectGfgSolution();

  assert.equal(result.language, "C++");
  assert.equal(result.difficulty.toLowerCase(), "medium");
  assert.match(result.code, /#include <bits\/stdc\+\+\.h>/);
});

test("detectGfgSolution reads difficulty and tags from body text when selectors are missing", async () => {
  globalThis.window = {
    location: {
      href: "https://www.geeksforgeeks.org/problems/body-text-fallback"
    }
  };

  globalThis.document = createDocument({
    title: "Body Text Fallback - GeeksforGeeks",
    body: {
      innerText: [
        "Difficulty: Easy",
        "Company Tags",
        "Flipkart",
        "Amazon",
        "Topic Tags",
        "Binary Search",
        "Greedy"
      ].join("\n")
    },
    querySelector: {
      h1: { textContent: "Body Text Fallback" }
    },
    querySelectorAll: {
      ".ace_line": [
        { textContent: "#include <bits/stdc++.h>" },
        { textContent: "using namespace std;" },
        { textContent: "class Solution {};" }
      ]
    }
  });

  const { detectGfgSolution } = await import("../content/gfg-detector.js");
  const result = detectGfgSolution();

  assert.equal(result.difficulty.toLowerCase(), "easy");
  assert.equal(result.language, "C++");
  assert.deepEqual(result.tags, ["Flipkart", "Amazon", "Binary Search", "Greedy"]);
});
