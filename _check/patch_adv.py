"""Patch advanced.js a19/a20 by object id (safer than global matches)."""
import pathlib
import verify as V

p = pathlib.Path("src/challenges/advanced.js")
s = p.read_text(encoding="utf-8")
NL = "\\n"

a19_start = ("starter: `# Shift each letter of text forward by shift (wrap z" + "\u2192" + "a)." + NL +
             "# Keep case and non-letters unchanged." + NL + "`,")
a19_sol = ("solution: `result = \"\"" + NL +
           "for ch in text:" + NL +
           "    if ch.islower(): result += chr((ord(ch) - 97 + shift) % 26 + 97)" + NL +
           "    elif ch.isupper(): result += chr((ord(ch) - 65 + shift) % 26 + 65)" + NL +
           "    else: result += ch" + NL +
           "print(result)`,")
a20_start = ("starter: `# Compute each student's average, print each Name: avg," + NL +
             "# then print the Top: line.`,")
a20_sol = ("solution: `averages = {}" + NL +
           "for s in students:" + NL +
           "    averages[s[\"name\"]] = sum(s[\"grades\"]) / len(s[\"grades\"])" + NL +
           NL +
           "for name, avg in averages.items(): print(f\"{name}: {avg:.1f}\")" + NL +
           "print(f\"Top: {max(averages, key=averages.get)}\")`,")

objs = V.top_level_objects(s)
for obj in objs:
    m = V.dq(obj, "id")
    if m == "a19":
        assert "starter: ``, " in obj.replace("\n", "") or "starter: ``," in obj, "a19 starter not empty"
        obj2 = obj.replace("starter: ``, ", a19_start + "\n") if "starter: ``, " in obj else obj.replace("starter: ``,", a19_start)
        obj2 = obj2.replace("defaultInputs: {\"text\": \"abc xyz\", \"shift\": 3},",
                            a19_sol + "\n  defaultInputs: {\"text\": \"abc xyz\", \"shift\": 3},")
        assert obj2 != obj
        s = s.replace(obj, obj2, 1)
        print("patched a19")
    elif m == "a20":
        assert "starter: ``," in obj, "a20 starter not empty"
        obj2 = obj.replace("starter: ``, ", a20_start + "\n") if "starter: ``, " in obj else obj.replace("starter: ``,", a20_start)
        obj2 = obj2.replace("defaultInputs: {\"students\":",
                            a20_sol + "\n  defaultInputs: {\"students\":")
        assert obj2 != obj
        s = s.replace(obj, obj2, 1)
        print("patched a20")

p.write_text(s, encoding="utf-8")
print("DONE")