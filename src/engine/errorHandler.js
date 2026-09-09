/* PYTHON·LAB — beginner-friendly Python error explanations. */

const RULES = [
  {
    test: (msg, code) => /SyntaxError/.test(msg) && /expected ['"]:['"]|invalid syntax/i.test(msg) && /if|elif|else|while|for|def|class|try/.test(code || ""),
    title: "SyntaxError — a colon (:) is probably missing",
    explain: "Python needs a colon <code>:</code> at the end of <code>if</code>, <code>elif</code>, <code>else</code>, <code>for</code>, <code>while</code>, <code>def</code>, <code>class</code>, <code>try</code> and <code>except</code> lines.",
    fix: 'if age >= 18:\n    print("Adult")',
  },
  {
    test: (msg) => /IndentationError|unexpected indent|expected an indented block/i.test(msg),
    title: "IndentationError — check your spacing",
    explain: "Python uses indentation to decide which lines belong together. Lines inside an <code>if</code>, loop or function must be indented (usually 4 spaces). Never mix tabs and spaces.",
    fix: 'if age >= 18:\n    print("Adult")   # indented 4 spaces',
  },
  {
    test: (msg) => /NameError/i.test(msg),
    title: "NameError — a name is not defined",
    explain: "You used a variable or function before creating it, or there is a typo. Python is case-sensitive: <code>Name</code> and <code>name</code> are different variables.",
    fix: '# Create the variable BEFORE using it\nname = "Maria"\nprint(name)',
  },
  {
    test: (msg) => /TypeError.*concatenate|sequence item|can only concatenate/i.test(msg),
    title: "TypeError — mixing text and numbers",
    explain: "You tried to join a number with a string using <code>+</code>. Convert the number first with <code>str()</code>, or better, use an f-string.",
    fix: 'age = 20\nprint("Age: " + str(age))\n# or even better:\nprint(f"Age: {age}")',
  },
  {
    test: (msg) => /TypeError.*unsupported operand|TypeError.*int.*str/i.test(msg),
    title: "TypeError — wrong type for this operation",
    explain: "You are using an operator on values of the wrong type (for example adding a string to a number). Convert with <code>int()</code>, <code>float()</code> or <code>str()</code> first.",
    fix: 'age = input()        # input() gives a string!\nage = int(age)       # convert to a number\nprint(age + 1)',
  },
  {
    test: (msg) => /ZeroDivisionError/i.test(msg),
    title: "ZeroDivisionError — division by zero",
    explain: "You divided a number by zero, which Python cannot do. Check the divisor before dividing.",
    fix: 'if divisor != 0:\n    result = total / divisor',
  },
  {
    test: (msg) => /IndexError/i.test(msg),
    title: "IndexError — position does not exist",
    explain: "You asked for an index that is outside the list. Indexes start at <code>0</code>, so a list with 3 items has indexes 0, 1 and 2. Negative indexes count from the end: <code>-1</code> is the last item.",
    fix: 'items = ["a", "b", "c"]\nprint(items[-1])   # last item',
  },
  {
    test: (msg) => /KeyError/i.test(msg),
    title: "KeyError — key not found in dictionary",
    explain: "The dictionary has no entry with that key. Check the spelling, or use <code>.get()</code> which returns a default value instead of crashing.",
    fix: 'student = {"name": "John"}\nprint(student.get("age", "not set"))',
  },
  {
    test: (msg) => /ValueError.*invalid literal/i.test(msg),
    title: "ValueError — invalid conversion",
    explain: "You tried to convert something that cannot become a number, like <code>int(\"abc\")</code>. Check what the string really contains.",
    fix: 'text = "12a"\nif text.isdigit():\n    number = int(text)',
  },
  {
    test: (msg) => /AttributeError|has no attribute/i.test(msg),
    title: "AttributeError — that object has no such method",
    explain: "You called a method that does not exist for this type. Strings have no <code>.append()</code> (lists do); lists have no <code>.upper()</code> (strings do).",
    fix: 'items = []\nitems.append("hi")   # lists can .append()\ntext = "hi"\nprint(text.upper())  # strings can .upper()',
  },
  {
    test: (msg) => /infinite/i.test(msg),
    title: "Execution stopped — infinite loop",
    explain: "The program ran longer than allowed. A <code>while</code> loop probably never becomes False. Make sure something inside the loop changes (e.g. a counter grows).",
    fix: 'count = 1\nwhile count <= 5:\n    print(count)\n    count += 1   # without this the loop never ends!',
  },
  {
    test: (msg) => /RuntimeError.*input/i.test(msg),
    title: "input() is not available here",
    explain: "This sandbox runs in the background, so it cannot pause and wait for typing. Assign a value directly; the User Input lesson shows how real input works.",
    fix: 'name = "Maria"   # instead of: name = input()\nprint(f"Hello {name}")',
  },
  {
    test: (msg) => /SyntaxError/i.test(msg),
    title: "SyntaxError — Python cannot read this line",
    explain: "Something breaks Python's grammar: an unclosed bracket or quote, a missing comma, or a keyword used in the wrong place. Check the line number in the traceback.",
    fix: 'print("Hello")   # check brackets and quotes are closed',
  },
];
export function explainError(rawError, code = "") {
  if (!rawError) return null;
  const raw = String(rawError);
  const lines = raw.split("\n").filter((l) => l.trim());
  let type = "", message = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/^([\w.]+(?:Error|Exception|Interrupt))\s*(?:\(.*\)?)?:\s*(.*)$/);
    if (m) { type = m[1]; message = m[2]; break; }
  }
  const lineMatch = raw.match(/line\s+(\d+)/i);
  const lineNo = lineMatch ? parseInt(lineMatch[1], 10) : null;
  const rule = RULES.find((r) => r.test(raw, code));
  const friendly = rule ? { title: rule.title, explain: rule.explain, fix: rule.fix } : null;
  const codeLine = lineNo && code ? (code.split("\n")[lineNo - 1] || "").trim() : null;
  return { raw, type: type || "Error", message: message || lines[lines.length - 1] || "", lineNo, codeLine, friendly };
}

/** Render an explained error into friendly terminal HTML. */
export function renderErrorHTML(ex) {
  let html = "";
  if (ex.output) html += `<span class="out">${escapeHtml(ex.output)}\n</span>`;
  html += `<span class="err-t">✗ ${escapeHtml(ex.type)}</span>\n`;
  if (ex.message) html += `<span class="err-b">${escapeHtml(ex.message)}</span>\n`;
  if (ex.lineNo) html += `<span class="err-line">Line ${ex.lineNo}:${ex.codeLine ? " " + escapeHtml(ex.codeLine) : ""}</span>\n`;
  if (ex.friendly) {
    html += `<span class="err-b">Hint — ${ex.friendly.title}</span>\n`;
    html += `<span class="err-b">${ex.friendly.explain}</span>\n`;
    if (ex.friendly.fix) html += `\n<span class="err-try">Try:</span>\n<span class="out">${escapeHtml(ex.friendly.fix)}</span>\n`;
  }
  return html;
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
