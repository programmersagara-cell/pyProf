/* PYTHON·LAB — CodeMirror editor factory. */

export function createPythonEditor(host, initialValue = "", opts = {}) {
  // GitHub Pages hardening: if the CodeMirror CDN was blocked/offline,
  // fall back to a plain <textarea> so the app still boots instead of
  // throwing `CodeMirror is not defined` and tripping the global fallback.
  if (typeof CodeMirror === "undefined") {
    console.warn("[python-lab] CodeMirror CDN unavailable — using textarea fallback.");
    const ta = document.createElement("textarea");
    ta.value = initialValue;
    ta.style.cssText = "width:100%;height:" + (typeof opts.height === "number" ? opts.height + "px" : (opts.height || "320px")) + ";background:var(--panel2);color:var(--text);border:1px solid var(--border2);border-radius:8px;padding:10px;font-family:Consolas,monospace;font-size:13px;resize:vertical;";
    host.appendChild(ta);
    return {
      getValue: () => ta.value,
      setValue: (v) => { ta.value = v; },
      focus: () => ta.focus(),
      refresh: () => {},
      setOption: () => {},
      setSize: () => {},
    };
  }
  const cm = CodeMirror(host, {
    value: initialValue,
    mode: "python",
    theme: document.documentElement.dataset.theme === "light" ? "neo" : "material-darker",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    autoCloseBrackets: true,
    matchBrackets: true,
    styleActiveLine: true,
    smartIndent: true,
    lineWrapping: !!opts.lineWrapping,
    extraKeys: {
      "Ctrl-Enter": () => opts.onRun && opts.onRun(),
      "Cmd-Enter": () => opts.onRun && opts.onRun(),
      "Ctrl-Space": "autocomplete",
      "Ctrl-/": (cmv) => cmv.toggleComment(),
      "Cmd-/": (cmv) => cmv.toggleComment(),
      Tab: (cmv) => {
        if (cmv.somethingSelected()) cmv.indentSelection("add");
        else cmv.replaceSelection("    ", "end");
      },
    },
  });
  cm.setSize("100%", opts.height || "100%");
  return cm;
}

export function editorThemeName() {
  return document.documentElement.dataset.theme === "light" ? "neo" : "material-darker";
}

/* Python keyword + builtin completion list used with Ctrl+Space */
export const PYTHON_COMPLETIONS = [
  "print(", "input(", "len(", "range(", "int(", "float(", "str(", "bool(",
  "list(", "dict(", "set(", "tuple(", "sum(", "min(", "max(", "abs(",
  "round(", "sorted(", "type(", "isinstance(", "enumerate(", "zip(",
  "map(", "filter(", "open(", "def ", "return", "if", "elif", "else",
  "for ", "while", "break", "continue", "import ", "from ", "as ", "in ",
  "not ", "and", "or", "True", "False", "None", "try", "except", "finally",
  "raise", "with ", "lambda", "class ", "pass", "global", "yield",
].map((w) => ({ text: w }));

export function showHint(cm) {
  CodeMirror.showHint(cm, CodeMirror.hint.python ? undefined : undefined, {
    completeSingle: false,
    extraWords: PYTHON_COMPLETIONS,
  });
}
