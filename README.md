<p align="center">
  <img src="assets/banner.png?v=2" alt="CodeSync Banner" width="100%" />
</p>

<p align="center">
  <strong>A Manifest V3 Chrome extension that captures accepted solutions from LeetCode and GeeksforGeeks, formats them with metadata, and syncs them into a GitHub repository.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/manifest-v3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/platform-chrome-green?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome" />
  <img src="https://img.shields.io/badge/license-MIT-orange?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/version-0.1.0-teal?style=flat-square" alt="Version" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Step 1 -- Clone the Repository](#step-1----clone-the-repository)
  - [Step 2 -- Load the Extension in Chrome](#step-2----load-the-extension-in-chrome)
  - [Step 3 -- Generate a GitHub Personal Access Token](#step-3----generate-a-github-personal-access-token)
  - [Step 4 -- Configure the Extension](#step-4----configure-the-extension)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Supported Languages](#supported-languages)
- [File Organization](#file-organization)
- [Running Tests](#running-tests)
- [Technical Notes](#technical-notes)
- [Contributing](#contributing)
- [Author](#author)

---

## Overview

CodeSync eliminates the manual work of maintaining a solutions repository. It detects accepted submissions directly from your browser, extracts the code along with metadata (title, difficulty, tags, platform, language), and pushes formatted files to your GitHub repository -- all with a single click.

No copy-pasting. No manual file creation. No context switching.

---

## Features

| Capability | Description |
|:---|:---|
| **One-Click Capture** | Extract accepted code from the active LeetCode or GFG problem tab |
| **Queue-First Workflow** | Solutions are queued locally so nothing is lost, even without internet |
| **Auto-Sync to GitHub** | Automatically push solutions when repository settings are configured |
| **Smart File Organization** | Files organized by platform with clean kebab-case or snake_case naming |
| **Language Detection** | Regex-based heuristics infer the language from code content (C++, Java, Python, etc.) |
| **Full Code Capture** | Injects into the editor API (Monaco / Ace) to capture the complete code, not just visible lines |
| **Metadata Headers** | Each file includes a structured comment header with problem title, link, difficulty, tags, and status |
| **Duplicate Handling** | Automatically appends version suffixes (`-v2`, `-v3`) when a file already exists |
| **Connection Testing** | Verify your GitHub credentials directly from the settings page |
| **Desktop Notifications** | Optional notifications on successful captures and syncs |

---

## Architecture

```
                                                    
    LeetCode / GFG                 CodeSync Extension                    GitHub
  +-----------------+         +------------------------+         +------------------+
  |                 |         |                        |         |                  |
  |  Problem Page   | ------> |  Content Script        |         |  Your Repo       |
  |  (Monaco / Ace) |         |  + Editor Bridge       |         |  /CODE/          |
  |                 |         |    (MAIN world inject) |         |    /leetcode/    |
  +-----------------+         +----------+-------------+         |    /gfg/         |
                                         |                       |                  |
                                         v                       +--------^---------+
                              +----------+-------------+                  |
                              |                        |                  |
                              |  Background Service    +------------------+
                              |  Worker                |   GitHub Contents
                              |  + GitHub API Module   |   API (PUT)
                              |  + Queue Manager       |
                              |                        |
                              +------------------------+
```

**Data Flow:**

1. The **content script** runs on LeetCode and GFG pages, detecting problem metadata from the DOM.
2. The **editor bridge** is injected into the page's main JavaScript context to access the Monaco or Ace editor API for full code extraction.
3. Captured solutions are sent to the **background service worker**, which queues them and optionally syncs to GitHub.
4. The **GitHub API module** writes formatted files via the GitHub Contents API.

---

## Project Structure

```
CodeSync/
|-- manifest.json              # Chrome extension manifest (MV3)
|-- package.json               # Node.js config for test runner
|-- .gitignore
|
|-- background/
|   |-- background.js          # Service worker: queue management, sync orchestration
|   |-- github-api.js          # GitHub Contents API wrapper (read, create, update)
|
|-- content/
|   |-- content.js             # Main content script: platform detection, DOM extraction
|   |-- editor-bridge.js       # Injected into page context for Monaco/Ace API access
|   |-- leetcode-detector.js   # Standalone LeetCode solution detector (modular)
|   |-- gfg-detector.js        # Standalone GFG solution detector (modular)
|
|-- popup/
|   |-- popup.html             # Extension popup interface
|   |-- popup.css              # Popup styling
|   |-- popup.js               # Popup logic: capture, push, queue status
|
|-- options/
|   |-- options.html           # Settings page
|   |-- options.css            # Settings page styling
|   |-- options.js             # Settings persistence and connection testing
|
|-- utils/
|   |-- constants.js           # Platform enums, default settings, storage keys
|   |-- formatters.js          # File path generation, code formatting, metadata headers
|   |-- storage.js             # Chrome storage abstraction (settings, queue, history)
|   |-- logger.js              # Lightweight logging utility
|
|-- tests/
|   |-- detector.test.js       # Unit tests for LeetCode and GFG detectors
|   |-- formatters.test.js     # Unit tests for formatters and path builders
|
|-- icons/
|   |-- icon16.png
|   |-- icon48.png
|   |-- icon128.png
|
|-- assets/
    |-- banner.png             # Repository banner image
```

---

## Installation

### Prerequisites

- **Google Chrome** (or any Chromium-based browser such as Brave, Edge, or Arc)
- **A GitHub account** with a repository to store your solutions
- **Node.js** (optional, only required for running tests)

---

### Step 1 -- Clone the Repository

```bash
git clone https://github.com/bytebymanas/CodeSync.git
cd CodeSync
```

---

### Step 2 -- Load the Extension in Chrome

1. Open Chrome and navigate to:
   ```
   chrome://extensions
   ```

2. Enable **Developer mode** using the toggle in the top-right corner.

3. Click **Load unpacked**.

4. Select the `CodeSync` folder you just cloned.

5. The CodeSync extension icon will appear in your browser toolbar. Pin it for quick access.

---

### Step 3 -- Generate a GitHub Personal Access Token

CodeSync uses a GitHub Personal Access Token (PAT) to push files to your repository. Follow these steps to generate one:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens) (or navigate to **Settings > Developer settings > Personal access tokens > Tokens (classic)**).

2. Click **Generate new token** and select **Generate new token (classic)**.

3. Configure the token:

   | Field | Value |
   |:---|:---|
   | **Note** | `CodeSync` (or any descriptive name) |
   | **Expiration** | Choose a duration (90 days recommended, or "No expiration") |
   | **Scopes** | Check **`repo`** (this grants full access to public and private repositories) |

4. Click **Generate token**.

5. **Copy the token immediately.** It will only be shown once. The token starts with `ghp_`.

> **Important:** Store your token securely. If you lose it, you will need to generate a new one. Never commit tokens to version control.

---

### Step 4 -- Configure the Extension

1. Click the CodeSync icon in your toolbar, then click **Settings** (or right-click the icon and select **Options**).

2. Fill in the following fields:

   | Field | Description | Example |
   |:---|:---|:---|
   | **GitHub Token** | The PAT you generated in Step 3 | `ghp_xxxxxxxxxxxx` |
   | **GitHub Owner** | Your GitHub username | `bytebymanas` |
   | **Repository Name** | The repo where solutions will be stored | `my-dsa-solutions` |
   | **Branch** | The branch to push to | `main` |

3. (Optional) Configure additional settings:

   | Setting | Default | Description |
   |:---|:---|:---|
   | **Auto-commit solutions** | Off | Automatically push solutions on capture |
   | **Organize by topic** | On | Group files by topic tags |
   | **Organize by difficulty** | On | Group files by difficulty level |
   | **Notify on capture** | On | Show desktop notifications |
   | **Naming convention** | kebab-case | File naming style (`kebab-case` or `snake_case`) |

4. Click **Save settings**.

5. Click **Test connection** to verify your credentials. A success message confirms that CodeSync can access your GitHub account.

---

## Usage

1. **Navigate** to a LeetCode or GeeksforGeeks problem page where you have an accepted solution.

2. **Click the CodeSync icon** in the toolbar.

3. Click **Capture and queue** to extract the solution from the editor.

4. If auto-commit is enabled, the solution is pushed immediately. Otherwise, click **Push queued solutions** to sync all queued solutions to GitHub.

5. View the latest capture details in the popup, including the problem title, language, and difficulty.

**Workflow Summary:**

```
Open problem page  -->  Click "Capture and queue"  -->  Solution is extracted
                                                            |
                                            +---------------+---------------+
                                            |                               |
                                      Auto-commit ON                  Auto-commit OFF
                                            |                               |
                                     Pushed to GitHub              Stored in local queue
                                                                            |
                                                                Click "Push queued solutions"
                                                                            |
                                                                     Pushed to GitHub
```

---

## How It Works

### Code Extraction

CodeSync uses a two-layer strategy to extract the complete source code:

**Layer 1 -- Editor API Bridge (Primary)**
A bridge script (`editor-bridge.js`) is injected into the page's main JavaScript context. This script directly accesses the editor API:
- **LeetCode** uses Monaco Editor -- the bridge calls `monaco.editor.getModels()[0].getValue()` to retrieve the full code regardless of scroll position.
- **GFG** uses Ace Editor -- the bridge calls `ace.edit(element).getValue()` for complete code extraction.

**Layer 2 -- DOM Fallback**
If the editor API is unavailable, the content script falls back to DOM-based extraction:
- Iterates all `.ace_line` or `.view-line` elements and joins them with newlines.
- Checks textarea elements and pre/code blocks as additional fallbacks.

### Language Detection

Language is determined through a priority chain:
1. **Code heuristics** -- Regex patterns detect language-specific syntax (e.g., `#include`, `using namespace std`, `vector<` for C++).
2. **UI selectors** -- Reads the language dropdown or label elements on the page.
3. **Body text fallback** -- Scans the page body for known language names.

### File Generation

Each captured solution produces a file with:
- A structured metadata comment header (problem title, link, difficulty, platform, language, tags, status).
- The complete source code.
- A language-appropriate file extension.

---

## Supported Languages

| Language | Extension | Detection Method |
|:---|:---|:---|
| C++ | `.cpp` | `#include`, `std::`, `vector<`, `cout`, `nullptr` |
| C | `.c` | `printf`, `scanf` (without C++ markers) |
| Java | `.java` | `public class`, `System.out.println`, `static void main` |
| Python / Python3 | `.py` | `def`, `class :`, `print()` |
| JavaScript | `.js` | `console.log`, `function`, `let/const/var` |
| TypeScript | `.ts` | TypeScript-specific syntax |
| Go | `.go` | `golang` / `go` identifiers |
| Rust | `.rs` | Rust-specific syntax |
| Kotlin | `.kt` | Kotlin-specific syntax |
| Swift | `.swift` | Swift identifiers |
| C# | `.cs` | `csharp` / `c#` identifiers |
| PHP | `.php` | PHP identifiers |

---

## File Organization

Solutions are stored in a structured directory layout:

```
CODE/
|-- leetcode/
|   |-- two-sum.cpp
|   |-- find-peak-element.cpp
|   |-- valid-parentheses.py
|   |-- merge-intervals.java
|
|-- gfg/
    |-- find-nth-root-of-m.cpp
    |-- kadanes-algorithm.py
    |-- detect-cycle-in-directed-graph.java
```

When a solution for the same problem already exists, CodeSync appends a version suffix:

```
two-sum.cpp       # First submission
two-sum-v2.cpp    # Second submission
two-sum-v3.cpp    # Third submission
```

---

## Running Tests

```bash
# Install dependencies (if any)
npm install

# Run the test suite
npm test
```

Expected output:

```
  18 tests passed
  0 tests failed
```

Tests cover:
- LeetCode and GFG solution detection (title, tags, code, language, difficulty)
- Language inference from code content
- File path generation and naming conventions
- Metadata header formatting
- Version suffix logic

---

## Technical Notes

- **Manifest V3** -- Uses a service worker instead of a persistent background page, following Chrome's latest extension architecture.
- **Token-Based Auth** -- Uses a GitHub Personal Access Token rather than full OAuth. The token is stored in Chrome's local extension storage and never leaves the browser except for GitHub API calls.
- **Content Security Policy** -- The editor bridge is loaded as a `web_accessible_resource` to work within strict CSP environments on LeetCode and GFG.
- **Selector Resilience** -- The detector logic uses multiple fallback selectors. As LeetCode and GFG update their UI, selectors may need periodic updates.
- **GitHub Contents API** -- Sync writes directly through the [Contents API](https://docs.github.com/en/rest/repos/contents), creating or updating files with a single PUT request.

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add your feature"`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request.

Please ensure all tests pass before submitting.

---

## Author

**Manas Chhabra**
GitHub: [@bytebymanas](https://github.com/bytebymanas)

---

<p align="center">
  <sub>Built with precision. No solutions left behind.</sub>
</p>
