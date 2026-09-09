# 🐍 PYTHON·LAB

**The In-Browser Python Learning Workbench**

PYTHON·LAB is a complete, production-quality interactive Python learning platform that runs **entirely in the browser** — no backend, no PHP, no Node.js server, no database. It uses **Pyodide (CPython compiled to WebAssembly)** to execute real Python code locally, combined with a professional CodeMirror editor, structured lessons, auto-graded challenges, debugging practice, gamification and learning analytics.

> 🔒 **Privacy-first:** your Python code executes on your device inside a Web Worker, is never sent to any server, and all progress is stored in your browser's `localStorage`. No signup, no tracking, no personal data.

## ✨ Features

| Area | What you get |
| --- | --- |
| **Workspace** | VS Code-style editor (syntax highlighting, autocomplete, bracket matching, Ctrl+Enter to run), **Variable Explorer** with expandable inspection of int/float/str/bool/list/tuple/set/dict/None/custom objects, friendly Output terminal with execution time and **beginner-oriented error explanations** |
| **Real Python** | Pyodide/WebAssembly in a Web Worker — real imports (`math`, `random`, `json`), f-strings, classes, recursion |
| **Lessons** | 44 structured lessons across 5 tracks, each with explanation, syntax, example, expected output, common mistakes and a live mini editor |
| **Challenges** | 60 challenges (20 Beginner / 20 Intermediate / 20 Advanced) |
| **Auto-grading** | Behaviour-based validation: normalized output comparison + multiple hidden test cases + optional structural checks. Different valid solutions all pass — source code is never text-compared |
| **Hints** | 3 progressive hints per challenge + optional full solution (tracked, affects XP) |
| **Debugging Mode** | 15 broken programs: syntax, logical, runtime, indentation and variable errors |
| **Cheat Sheet** | 50+ interactive topics with syntax, when-to-use, example and common mistake |
| **History** | Last 50 executed programs with search, reopen, delete, clear |
| **Gamification** | XP, 6 levels (Beginner → Master), 12 badges, daily streaks |
| **Analytics** | XP, success rate, average attempts, per-track progress bars, weakest-topic detection and **smart recommendations** |
| **UX** | Dark/light themes (system detection), responsive layouts, keyboard shortcuts, ARIA labels |

## 🧰 Technologies

- **Pyodide** (CPython → WebAssembly) via jsDelivr CDN
- **CodeMirror 5**
- Vanilla **HTML / CSS / JavaScript ES modules** — zero build step
- `localStorage` with versioned keys (`pythonLab_v1_*`)
- Web Worker isolation + execution timeouts + Stop button
## 🚀 Installation / Local development

Any static file server works:

```bash
# Python
python -m http.server 8080

# Node
npx serve . -l 8080

# XAMPP: copy the folder into htdocs, then open http://localhost/pyProf/
```

Open <http://localhost:8080>. The first load downloads Pyodide (~10 MB) from the CDN.

> Note: ES modules require HTTP(S). Opening `index.html` via `file://` will not work.

Run the built-in smoke tests at <http://localhost:8080/tests/test.html>.

## 🌍 Deployment

### GitHub Pages
1. Push the project to a GitHub repository.
2. **Settings → Pages → Deploy from a branch** → `main` / root.
3. Live at `https://<user>.github.io/<repo>/`.

### Vercel
1. Import the repository at [vercel.com](https://vercel.com).
2. Framework preset: **Other** (no build command, output directory = `.`). Deploy.

### Netlify
1. Drag-and-drop the folder at [app.netlify.com](https://app.netlify.com) or connect the repo.
2. Build command: *(empty)* — Publish directory: `.`. Deploy.

No environment variables, build process or server configuration required.
## 📁 Project structure

```
pythonLab/
├── index.html
├── package.json
├── README.md
├── src/
│   ├── main.js                 # router, theme, shortcuts, boot
│   ├── engine/
│   │   ├── pythonEngine.js     # worker lifecycle, timeouts, Stop, reset
│   │   ├── pyodideWorker.js    # Pyodide runtime + variable extraction
│   │   └── errorHandler.js     # beginner-friendly error explanations
│   ├── editor/editor.js        # CodeMirror factory
│   ├── lessons/lessons.js      # 44 lessons
│   ├── challenges/
│   │   ├── beginner.js / intermediate.js / advanced.js   # 20 + 20 + 20
│   │   ├── debugging.js        # 15 debug exercises
│   │   └── index.js
│   ├── validation/
│   │   ├── validator.js        # output normalization, hidden tests, structure
│   │   └── testRunner.js
│   ├── cheatsheet/cheatsheet.js
│   ├── progress/
│   │   ├── store.js            # versioned localStorage
│   │   ├── progress.js         # XP, levels, streaks, topic stats
│   │   ├── analytics.js        # dashboard + recommendations
│   │   └── badges.js           # 12 badges
│   ├── history/history.js
│   ├── ui/                     # workspace, lessons, challenge, debugging,
│   │   └── ...                 # analytics, cheatsheet, history views + helpers
│   └── styles/main.css
└── tests/test.html             # smoke tests
```

## ⌨ Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl` + `Enter` | Run code |
| `Ctrl` + `Space` | Autocomplete |
| `Ctrl` + `/` | Comment / uncomment |
| `Ctrl` + `S` | Save code locally |
| `Esc` | Close dialogs |
| `1` … `7` | Switch views |

## 🔒 Privacy

- Python code executes **locally** inside your browser (Pyodide/WebAssembly in a Web Worker).
- **No user code is sent to a server** — there is no server.
- Progress, XP, badges, history and settings are stored in `localStorage` on your device.
- No signup, no accounts, no trackers, no personal data collection.

## ⚠ Sandbox notes

- `input()` cannot pause a background worker, so it is intercepted with a friendly explanation; lessons and challenges use pre-defined variables instead. On a real computer `input()` works normally.
- The file system is virtual; use `json.dumps/loads` for persistence patterns.
- Infinite loops are stopped by the execution timeout, and **■ Stop** terminates the Python worker instantly.

## 🧪 Testing

Open `/tests/test.html` while serving over HTTP. It verifies content integrity (44 lessons / 60 challenges / 15 bugs / 50+ cheat topics / 12 badges), validation logic, error explanations, localStorage round-trips, progress/XP, engine boot, execution, output capture, variable extraction and error detection.

## 📸 Screenshots

*(placeholders)*

| Workspace | Lessons | Analytics |
| --- | --- | --- |
| ![Workspace](docs/screenshot-workspace.png) | ![Lessons](docs/screenshot-lessons.png) | ![Analytics](docs/screenshot-analytics.png) |

## 📄 License

MIT — free to use, modify and distribute.
