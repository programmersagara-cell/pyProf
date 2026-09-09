import re, os
root = r"c:\xampp\htdocs\pyProf"
files = [os.path.join(root, "index.html")]
for d in ("src",):
    for dp, _, fn in os.walk(os.path.join(root, d)):
        for f in fn:
            if f.endswith((".js", ".html")):
                files.append(os.path.join(dp, f))
pat = re.compile(u"[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u25A0-\u25FF\u2190-\u21FF]")
for fp in files:
    t = open(fp, encoding="utf-8").read()
    hits = set(m.group(0) for m in pat.finditer(t))
    if hits:
        print(os.path.relpath(fp, root), "->", " ".join(sorted(hits)))
print("scan done")
