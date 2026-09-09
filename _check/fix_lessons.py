import pathlib
p = "src/lessons/lessons.js"
s = pathlib.Path(p).read_text(encoding="utf-8")
BT = "`"
a = s.count("Vowels: 2" + BT + ",")
b = s.count("Hi, John" + BT + ",")
print("counts", a, b)
assert a == 1 and b == 1, (a, b)
s = s.replace("Vowels: 2" + BT + ",", "Vowels: 1" + BT + ",")
s = s.replace("Hi, John" + BT + ",", "Hi, John!" + BT + ",")
pathlib.Path(p).write_text(s, encoding="utf-8")
print("lessons fixed")