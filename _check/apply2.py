"""Apply targeted data fixes to the JS challenge/lesson files."""
import pathlib

def rd(p): return pathlib.Path(p).read_text(encoding="utf-8")
def wr(p, s): pathlib.Path(p).write_text(s, encoding="utf-8")

def replace1(path, old, new):
    s = rd(path)
    assert s.count(old) == 1, f"{path}: {old[:50]!r} count={s.count(old)}"
    wr(path, s.replace(old, new))
    print("OK  1", path, old[:40].replace("\n", "\\n"))

NL = "\\n"

# ---- intermediate i20: def-only solution + updated brief/starter ----
replace1("src/challenges/intermediate.js",
         ", then print greet(\"Maria\") and greet(\"John\", \"Hi\").`,",
         ". The tests will call it with a few names and check the returned text.`,")
replace1("src/challenges/intermediate.js",
         "starter: `# define greet here, then:" + NL + "# print(greet(\"Maria\"))" + NL + "# print(greet(\"John\", \"Hi\"))" + NL + "`,",
         "starter: `def greet(name, greeting=\"Hello\"):" + NL + "    pass  # return the greeting string`,")
replace1("src/challenges/intermediate.js",
         NL + NL + "print(greet(\"Maria\"))" + NL + "print(greet(\"John\", \"Hi\"))`,",
         "`,")

# ---- advanced a02: def-only solution + updated starter ----
replace1("src/challenges/advanced.js",
         "starter: `# def factorial(n): ..." + NL + "# def sum_to(n): ..." + NL + NL + "# print(factorial(5))" + NL + "# print(sum_to(10))" + NL + "`,",
         "starter: `# Write recursive functions factorial(n) and sum_to(n)." + NL + "# The tests will call them with a few values." + NL + "`,")
replace1("src/challenges/advanced.js",
         NL + NL + "print(factorial(5))" + NL + "print(sum_to(10))`,",
         "`,")

# ---- advanced a19: add solution + starter ----
a19_start = ("starter: `# Shift each letter of text forward by shift (wrap z" + "\u2192" + "a)." + NL +
             "# Keep case and non-letters unchanged." + NL + "`,")
a19_sol = ("solution: `result = \"\"" + NL +
           "for ch in text:" + NL +
           "    if ch.islower():" + NL +
           "        result += chr((ord(ch) - 97 + shift) % 26 + 97)" + NL +
           "    elif ch.isupper():" + NL +
           "        result += chr((ord(ch) - 65 + shift) % 26 + 65)" + NL +
           "    else:" + NL +
           "        result += ch" + NL +
           "print(result)`,")
replace1("src/challenges/advanced.js", "starter: ``,", a19_start)
replace1("src/challenges/advanced.js",
         "defaultInputs: {\"text\": \"abc xyz\", \"shift\": 3},",
         a19_sol + "\n  defaultInputs: {\"text\": \"abc xyz\", \"shift\": 3},")

# ---- advanced a20: add solution + starter ----
a20_start = ("starter: `# Compute each student's average, print each Name: avg," + NL +
             "# then print the Top: line.`,")
a20_sol = ("solution: `averages = {}" + NL +
           "for s in students:" + NL +
           "    averages[s[\"name\"]] = sum(s[\"grades\"]) / len(s[\"grades\"])" + NL +
           NL +
           "for name, avg in averages.items():" + NL +
           "    print(f\"{name}: {avg:.1f}\")" + NL +
           "print(f\"Top: {max(averages, key=averages.get)}\")`,")
replace1("src/challenges/advanced.js", "starter: ``,", a20_start)
replace1("src/challenges/advanced.js",
         "defaultInputs: {\"students\":",
         a20_sol + "\n  defaultInputs: {\"students\":")

# ---- lesson output fixes ----
replace1("src/lessons/lessons.js", "Vowels: 2`,", "Vowels: 1`,")
replace1("src/lessons/lessons.js",
         "Hello, Maria!" + NL + "Hi, John`,`,",
         "Hello, Maria!" + NL + "Hi, John!`,")

print("ALL DONE")