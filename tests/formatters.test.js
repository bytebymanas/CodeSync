import assert from "node:assert/strict";
import test from "node:test";

import { appendVersionSuffix, buildSolutionPath, formatSolution, getFileExtension, slugifyTitle } from "../utils/formatters.js";

test("formatSolution builds a metadata header", () => {
  const output = formatSolution({
    title: "Two Sum",
    link: "https://leetcode.com/problems/two-sum/",
    difficulty: "medium",
    platform: "leetcode",
    language: "JavaScript",
    tags: ["array", "hash-table"],
    code: "function twoSum(nums, target) {\n  return [];\n}"
  });

  assert.match(output, /Problem: Two Sum/);
  assert.match(output, /Difficulty: Medium/);
  assert.match(output, /Tags: array, hash-table/);
  assert.match(output, /function twoSum/);
});

test("formatSolution uses triple quotes for python", () => {
  const output = formatSolution({
    title: "Valid Parentheses",
    platform: "leetcode",
    language: "Python3",
    code: "class Solution:\n    pass"
  });

  assert.ok(output.startsWith('"""'));
  assert.match(output, /Language: Python3/);
});

test("buildSolutionPath stores files under CODE/platform", () => {
  const path = buildSolutionPath(
    {
      title: "Best Time to Buy and Sell Stock",
      platform: "leetcode",
      difficulty: "easy",
      language: "C++",
      tags: ["array", "dynamic-programming"]
    },
    {
      organizeByTopic: true,
      organizeByDifficulty: true,
      namingConvention: "kebab-case"
    }
  );

  assert.equal(path, "CODE/leetcode/best-time-to-buy-and-sell-stock.cpp");
});

test("buildSolutionPath respects snake_case naming", () => {
  const path = buildSolutionPath(
    {
      title: "Find Peak Element",
      platform: "leetcode",
      difficulty: "medium",
      language: "Python",
      tags: []
    },
    {
      organizeByTopic: false,
      organizeByDifficulty: true,
      namingConvention: "snake_case"
    }
  );

  assert.equal(path, "CODE/leetcode/find_peak_element.py");
});

test("buildSolutionPath stores gfg files in CODE/gfg", () => {
  const path = buildSolutionPath(
    {
      title: "Find nth root of m",
      platform: "gfg",
      difficulty: "unknown",
      language: "C++",
      tags: []
    },
    {
      organizeByTopic: true,
      organizeByDifficulty: true,
      namingConvention: "kebab-case"
    }
  );

  assert.equal(path, "CODE/gfg/find-nth-root-of-m.cpp");
});

test("buildSolutionPath infers cpp from code when language is unknown", () => {
  const path = buildSolutionPath(
    {
      title: "Find Kth Rotation",
      platform: "gfg",
      difficulty: "medium",
      language: "Unknown",
      code: "#include <bits/stdc++.h>\nusing namespace std;\nclass Solution {};"
    },
    {
      namingConvention: "kebab-case"
    }
  );

  assert.equal(path, "CODE/gfg/find-kth-rotation.cpp");
});

test("buildSolutionPath prefers cpp code over a wrong GFG language label", () => {
  const path = buildSolutionPath(
    {
      title: "Number of occurrence",
      platform: "gfg",
      difficulty: "easy",
      language: "JavaScript",
      code: "#include <bits/stdc++.h>\nusing namespace std;\nclass Solution {};"
    },
    {
      namingConvention: "kebab-case"
    }
  );

  assert.equal(path, "CODE/gfg/number-of-occurrence.cpp");
});

test("formatSolution keeps header language aligned with inferred cpp code", () => {
  const output = formatSolution({
    title: "Number of occurrence",
    link: "https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1",
    difficulty: "easy",
    platform: "gfg",
    language: "JavaScript",
    tags: ["Arrays"],
    code: "#include <bits/stdc++.h>\nusing namespace std;\nclass Solution {};"
  });

  assert.match(output, /Language: C\+\+/);
  assert.match(output, /#include <bits\/stdc\+\+\.h>/);
});

test("slugifyTitle and getFileExtension normalize inputs", () => {
  assert.equal(slugifyTitle(" 3Sum Closest "), "3sum-closest");
  assert.equal(slugifyTitle("Binary Tree Paths", "snake_case"), "binary_tree_paths");
  assert.equal(getFileExtension("JavaScript"), "js");
  assert.equal(getFileExtension("C++"), "cpp");
});

test("getFileExtension keeps cpp variants as cpp", () => {
  assert.equal(getFileExtension("CPP"), "cpp");
  assert.equal(getFileExtension("C++17"), "cpp");
});

test("appendVersionSuffix adds numbered suffix before extension", () => {
  assert.equal(appendVersionSuffix("CODE/gfg/sample.cpp", 2), "CODE/gfg/sample-v2.cpp");
  assert.equal(appendVersionSuffix("CODE/gfg/sample.cpp", 3), "CODE/gfg/sample-v3.cpp");
});
