/* PYTHON·LAB — lesson library (Level 1: Fundamentals). */

export const lessons = [
{
  id: "intro", num: 1, track: "Fundamentals", title: "Introduction to Python",
  explanation: `<p>Python is one of the most popular programming languages in the world. It is used for websites, data science, artificial intelligence, games and automation. Python is famous for looking almost like plain English, which makes it a perfect first language.</p>
  <p>In this course you will <b>write and run real Python right in your browser</b>. Nothing is installed and nothing is sent to a server.</p>`,
  syntax: `# This is a comment: notes for humans, ignored by Python
print("Hello, Python!")`,
  example: `# My very first Python program
print("Hello, World!")
print("I am learning Python.")`,
  expectedOutput: `Hello, World!\nI am learning Python.`,
  mistakes: [{ wrong: `print "Hello"`, right: `print("Hello")`, note: "Python 3 always needs parentheses around print." }],
  starter: `# Change the text between the quotes and press ▶ Run\nprint("Hello, Python!")\nprint("My name is ...")`,
},
{
  id: "print", num: 2, track: "Fundamentals", title: "print()",
  explanation: `<p><code>print()</code> displays text or values in the output area. You can print several things at once by separating them with commas, and you can repeat text with <code>*</code>.</p>`,
  syntax: `print(value1, value2, ...)
print("text")
print("repeated " * 3)`,
  example: `print("Hello!")
print("Age:", 21)
print("-" * 10)
print("A", "B", "C", sep="-")`,
  expectedOutput: `Hello!\nAge: 21\n----------\nA-B-C`,
  mistakes: [
    { wrong: `Print("hello")`, right: `print("hello")`, note: "Python is case-sensitive: it is print, not Print." },
    { wrong: `print(Hello)`, right: `print("Hello")`, note: "Text needs quotes; without them Python thinks it is a variable." },
  ],
  starter: `print("Learning print()")\nprint(3 + 4)\nprint("=" * 20)`,
},
{
  id: "variables", num: 3, track: "Fundamentals", title: "Variables",
  explanation: `<p>A variable is a named box that stores a value. You create it with <code>=</code>. The name goes on the left, the value on the right. Variable names should be lowercase_with_underscores and cannot start with a digit.</p>`,
  syntax: `name = value
age = 21
full_name = "Maria Santos"`,
  example: `name = "Maria"
age = 21
city = "Manila"

print(name)
print(age)
print(city)`,
  expectedOutput: `Maria\n21\nManila`,
  mistakes: [
    { wrong: `21 = age`, right: `age = 21`, note: "The variable name must be on the left of =." },
    { wrong: `2name = "Ana"`, right: `name2 = "Ana"`, note: "Names cannot start with a number." },
  ],
  starter: `# Create 3 variables about you and print them\nname = "Your Name"\nhobby = "coding"\nprint(name, "loves", hobby)`,
},
{
  id: "data-types", num: 4, track: "Fundamentals", title: "Data Types",
  explanation: `<p>Every value has a type: <code>int</code> (whole numbers), <code>float</code> (decimals), <code>str</code> (text in quotes), <code>bool</code> (<code>True</code>/<code>False</code>) and <code>NoneType</code> (<code>None</code> = "nothing here"). Use <code>type()</code> to check a value's type.</p>`,
  syntax: `age = 25          # int
height = 1.68     # float
name = "Ana"      # str
is_student = True # bool`,
  example: `age = 25
height = 1.68
name = "Ana"
is_student = True

print(type(age))
print(type(height))
print(type(name))
print(type(is_student))`,
  expectedOutput: `<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>`,
  mistakes: [{ wrong: `age = "25"  # text, not a number!`, right: `age = 25`, note: "\"25\" with quotes is text: age + 1 would fail." }],
  starter: `value1 = 10\nvalue2 = 3.5\nvalue3 = "ten"\nvalue4 = False\n\nprint(type(value1), type(value2), type(value3), type(value4))`,
},
{
  id: "numbers", num: 5, track: "Fundamentals", title: "Numbers & Math",
  explanation: `<p>Python is a powerful calculator: <code>+</code> add, <code>-</code> subtract, <code>*</code> multiply, <code>/</code> divide (always float), <code>//</code> floor divide, <code>%</code> remainder, <code>**</code> power. <code>round()</code> rounds a float.</p>`,
  syntax: `total = a + b
remainder = 7 % 2   # 1
power = 2 ** 8      # 256`,
  example: `a = 17
b = 5

print(a + b)
print(a - b)
print(a * b)
print(a / b)
print(a // b)
print(a % b)
print(a ** 2)
print(round(3.14159, 2))`,
  expectedOutput: `22\n12\n85\n3.4\n3\n2\n289\n3.14`,
  mistakes: [{ wrong: `average = total / count  # ZeroDivisionError if count is 0`, right: `if count != 0:\n    average = total / count`, note: "Always check the divisor." }],
  starter: `price = 4.99\nquantity = 3\n\ntotal = price * quantity\nprint("Total:", total)\nprint("Change from 20:", 20 - total)`,
},
{
  id: "strings", num: 6, track: "Fundamentals", title: "Strings",
  explanation: `<p>Strings are text in quotes. Join with <code>+</code>, repeat with <code>*</code>, measure with <code>len()</code>, change case with <code>.upper()</code>/<code>.lower()</code>/<code>.title()</code>, clean with <code>.strip()</code>, search with <code>.find()</code>, replace with <code>.replace()</code>.</p>`,
  syntax: `full = first + " " + last
shout = text.upper()
length = len(text)`,
  example: `first = "Maria"
last = "Santos"

full = first + " " + last
print(full)
print(len(full))
print(full.upper())
print(full.lower())
print(full.replace("Maria", "Ana"))
print(full.find("Santos"))
print("PHP" .strip())`,
  expectedOutput: `Maria Santos\n12\nMARIA SANTOS\nmaria santos\nAna Santos\n6\nPHP`,
  mistakes: [
    { wrong: `"Age: " + 21`, right: `"Age: " + str(21)`, note: "Cannot add text and a number. Convert with str()." },
    { wrong: `name.append("!")`, right: `name = name + "!"`, note: "Strings cannot change; .append() is for lists. Build a new string instead." },
  ],
  starter: `name = "Maria"  # try .upper(), .title(), len(), * 2\nprint(name.title())\nprint(name * 2)`,
},
{
  id: "fstrings", num: 7, track: "Fundamentals", title: "Formatted Strings",
  explanation: `<p>f-strings are the modern way to build text with variables: put <code>f</code> before the quotes and variables inside <code>{ }</code>. They can even do math inside the braces and format numbers like <code>{price:.2f}</code>.</p>`,
  syntax: `print(f"Hello {name}")
print(f"Total: {price:.2f}")`,
  example: `name = "Maria"
age = 21
balance = 1234.5

print(f"Hello {name}, you are {age}")
print(f"In 10 years you will be {age + 10}")
print(f"Balance: ₱{balance:.2f}")
print(f"{name} has {len(name)} letters")`,
  expectedOutput: `Hello Maria, you are 21\nIn 10 years you will be 31\nBalance: ₱1234.50\nMaria has 5 letters`,
  mistakes: [{ wrong: `"Hello " + name + ", you are " + age`, right: `f"Hello {name}, you are {age}"`, note: "TypeError: 21 is a number. Use an f-string." }],
  starter: `product = "coffee"\nprice = 4.5\n\nprint(f"One {product} costs {price:.2f}")\nprint(f"3 cost {price * 3:.2f}")`,
},
{
  id: "user-input", num: 8, track: "Fundamentals", title: "User Input",
  explanation: `<p><code>input()</code> pauses the program and waits for the user to type something, returning it as a <b>string</b>. Convert with <code>int()</code>/<code>float()</code> before doing math.</p>
  <p><b>Sandbox note:</b> background programs here cannot pause, so this demo uses a fixed value instead of real typing. On your own computer, <code>name = input("Your name: ")</code> works exactly the same.</p>`,
  syntax: `name = input("Your name: ")
age = int(input("Your age: "))`,
  example: `# Simulated input (real: name = input("Your name: "))
name = "Maria"
age = 21

print(f"Hello {name}!")
print(f"Next year you will be {age + 1}")`,
  expectedOutput: `Hello Maria!\nNext year you will be 22`,
  mistakes: [{ wrong: `age = input()  # "21" is text!\nprint(age + 1)`, right: `age = int(input())\nprint(age + 1)`, note: "input() returns a string: convert before math." }],
  starter: `# Simulated user input\nname = "Maria"\nage = "21"  # comes back as text!\n\nprint(f"Hello {name}")\nprint(f"Age next year: {int(age) + 1}")`,
},
{
  id: "boolean", num: 9, track: "Fundamentals", title: "Booleans & None",
  explanation: `<p><code>bool</code> has only two values: <code>True</code> and <code>False</code>. Comparisons like <code>age >= 18</code> produce booleans. <code>None</code> means "no value yet" — useful as a placeholder. Truthy values: non-empty strings, non-zero numbers, non-empty lists. Falsy: <code>0</code>, <code>""</code>, <code>[]</code>, <code>None</code>, <code>False</code>.</p>`,
  syntax: `is_adult = age >= 18
result = None   # no value yet`,
  example: `age = 21
name = "Ana"
empty = ""

is_adult = age >= 18
print(is_adult)
print(bool(name))
print(bool(empty))
print(bool(0))

result = None
print(result is None)`,
  expectedOutput: `True\nTrue\nFalse\nFalse\nTrue`,
  mistakes: [{ wrong: `if is_adult == True:`, right: `if is_adult:`, note: "The boolean already is True/False; == True is redundant." }],
  starter: `score = 75\npassed = score >= 60\n\nprint(f"Score: {score}, Passed: {passed}")\nprint(bool(score), bool(None))`,
},
{
  id: "type-conversion", num: 10, track: "Fundamentals", title: "Type Conversion",
  explanation: `<p>Convert between types: <code>int("21")</code> text→number, <code>float("3.5")</code>, <code>str(21)</code> number→text, <code>bool(0)</code> → <code>False</code>. Converting fails with <code>ValueError</code> if the text is not a valid number.</p>`,
  syntax: `age = int("21")
price = float("3.5")
text = str(21)`,
  example: `text_number = "21"
real_number = int(text_number)

print(real_number + 1)
print(float("3.5") * 2)
print("Age: " + str(21))
print(int("7") + int("3"))
print(int(3.9))`,
  expectedOutput: `22\n7.0\nAge: 21\n10\n3`,
  mistakes: [
    { wrong: `int("abc")`, right: `text = "abc"\nif text.isdigit():\n    number = int(text)`, note: "ValueError: \"abc\" is not a number. Check with .isdigit()." },
    { wrong: `print(21 + "")`, right: `print(str(21) + "")`, note: "Cannot add a number to a string; convert first." },
  ],
  starter: `price_text = "19.99"\nquantity_text = "3"\n\ntotal = float(price_text) * int(quantity_text)\nprint(f"Total: {total:.2f}")`,
},
{
  id: "operators-comparison", num: 11, track: "Control Flow", title: "Comparison Operators",
  explanation: `<p>Compare values: <code>==</code> equal, <code>!=</code> not equal, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>. The result is a boolean. One <code>=</code> assigns; two <code>==</code> compares — the most common beginner bug!</p>`,
  syntax: `a == b    # equal?
a != b    # different?
a >= b    # greater or equal?`,
  example: `age = 21
score = 75

print(age == 21)
print(age != 21)
print(score > 60)
print(score < 60)
print(age >= 18)
print("abc" == "abc")`,
  expectedOutput: `True\nFalse\nTrue\nFalse\nTrue\nTrue`,
  mistakes: [{ wrong: `if age = 18:`, right: `if age == 18:`, note: "SyntaxError: = assigns, == compares." }],
  starter: `password = "python123"\n\ncorrect = password == "python123"\nprint("Access granted:", correct)`,
},
{
  id: "if", num: 12, track: "Control Flow", title: "if Statements",
  explanation: `<p><code>if</code> runs a block only when a condition is True. The block must be <b>indented 4 spaces</b> and end with a colon <code>:</code>. Everything at the same indentation belongs to the same block.</p>`,
  syntax: `if condition:
    # runs only when True
    print("Yes")`,
  example: `age = 21

if age >= 18:
    print("You are an adult")
    print("You can vote")

print("This always runs")`,
  expectedOutput: `You are an adult\nYou can vote\nThis always runs`,
  mistakes: [
    { wrong: `if age >= 18\n    print("Yes")`, right: `if age >= 18:\n    print("Yes")`, note: "Colon : missing after the condition." },
    { wrong: `if age >= 18:\nprint("Yes")`, right: `if age >= 18:\n    print("Yes")`, note: "The block must be indented 4 spaces." },
  ],
  starter: `temperature = 35  # try other values\n\nif temperature > 30:\n    print("It is hot today")\n    print("Drink water!")`,
},
{
  id: "if-else", num: 13, track: "Control Flow", title: "if / else",
  explanation: `<p><code>else</code> catches everything the <code>if</code> did not. Only one of the two blocks ever runs — never both.</p>`,
  syntax: `if condition:
    # True path
else:
    # False path`,
  example: `age = 15

if age >= 18:
    print("Adult")
else:
    print("Minor")

print("Done")`,
  expectedOutput: `Minor\nDone`,
  mistakes: [{ wrong: `if age >= 18:\n    print("Adult")\nelse\n    print("Minor")`, right: `if age >= 18:\n    print("Adult")\nelse:\n    print("Minor")`, note: "else needs a colon too." }],
  starter: `score = 55  # try other values\n\nif score >= 60:\n    print("Passed")\nelse:\n    print("Failed")`,
},
{
  id: "elif", num: 14, track: "Control Flow", title: "elif Chains",
  explanation: `<p><code>elif</code> ("else if") tests more conditions in order. Python checks from top to bottom and runs the <b>first</b> True block, skipping the rest. A final <code>else</code> is the fallback.</p>`,
  syntax: `if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "F"`,
  example: `score = 83

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")`,
  expectedOutput: `Grade: B`,
  mistakes: [{ wrong: `if score >= 90:\n    print("A")\nelif score >= 80:\n    print("A")  # unreachable!`, right: `if score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")`, note: "elif runs only when earlier ifs were False, so order matters." }],
  starter: `temperature = 25\n\nif temperature > 30:\n    print("Hot")\nelif temperature > 20:\n    print("Warm")\nelif temperature > 10:\n    print("Cool")\nelse:\n    print("Cold")`,
},
{
  id: "nested-if", num: 15, track: "Control Flow", title: "Nested Conditions",
  explanation: `<p>An <code>if</code> inside another <code>if</code> is <b>nested</b>. The inner block runs only when both conditions are True. Deep nesting gets hard to read — combine with <code>and</code> when possible.</p>`,
  syntax: `if age >= 18:
    if has_id:
        print("Entry allowed")`,
  example: `age = 21
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Enjoy the movie!")
    else:
        print("Buy a ticket first")
else:
    print("Sorry, adults only")`,
  expectedOutput: `Enjoy the movie!`,
  mistakes: [{ wrong: `if age >= 18:\nif has_ticket:\n    print("Yes")`, right: `if age >= 18:\n    if has_ticket:\n        print("Yes")`, note: "Inner if must be indented one more level." }],
  starter: `username = "Maria"\npassword = "python123"\n\nif username == "Maria":\n    if password == "python123":\n        print("Welcome, Maria!")\n    else:\n        print("Wrong password")\nelse:\n    print("Unknown user")`,
},
{
  id: "logical", num: 16, track: "Control Flow", title: "and / or / not",
  explanation: `<p>Combine conditions: <code>and</code> needs both True, <code>or</code> needs at least one True, <code>not</code> flips. They avoid deep nesting: <code>if age >= 18 and has_id:</code>.</p>`,
  syntax: `if a and b: ...
if a or b:  ...
if not a:   ...`,
  example: `age = 21
has_id = True
is_weekend = False

print(age >= 18 and has_id)
print(is_weekend or has_id)
print(not is_weekend)

if age >= 18 and has_id:
    print("Entry allowed")

if is_weekend or age < 12:
    print("Discount!")`,
  expectedOutput: `True\nTrue\nTrue\nEntry allowed`,
  mistakes: [{ wrong: `if age >= 18 or < 12:`, right: `if age >= 18 or age < 12:`, note: "Each side of or needs a full condition." }],
  starter: `score = 82\nattendance = 95\n\nif score >= 60 and attendance >= 80:\n    print("Certificate awarded")\nelif score >= 60 or attendance >= 80:\n    print("Partial pass")\nelse:\n    print("Not passed")`,
},
{
  id: "for-range", num: 17, track: "Control Flow", title: "for Loops & range()",
  explanation: `<p>A <code>for</code> loop repeats a block for each value. <code>range(n)</code> counts 0…n-1, <code>range(a, b)</code> from a to b-1, <code>range(a, b, step)</code> with a step. <code>range</code> ends <b>before</b> its stop value!</p>`,
  syntax: `for i in range(n):
    print(i)`,
  example: `for i in range(5):
    print(i)

print("---")

for i in range(1, 6):
    print(i)

print("---")

for i in range(10, 0, -2):
    print(i)`,
  expectedOutput: `0\n1\n2\n3\n4\n---\n1\n2\n3\n4\n5\n---\n10\n8\n6\n4\n2`,
  mistakes: [
    { wrong: `for i in range(5):\nprint(i)`, right: `for i in range(5):\n    print(i)`, note: "The loop body must be indented." },
    { wrong: `for i in range(5)\n    print(i)`, right: `for i in range(5):\n    print(i)`, note: "Colon : missing after range(5)." },
  ],
  starter: `for i in range(1, 11):\n    print(f"{i} x 7 = {i * 7}")`,
},
{
  id: "for-strings", num: 18, track: "Control Flow", title: "Looping over Strings",
  explanation: `<p>A <code>for</code> loop can walk over any sequence. Over a string it visits one character per turn — great for counting or checking letters.</p>`,
  syntax: `for ch in word:
    print(ch)`,
  example: `word = "Python"

for ch in word:
    print(ch)

count = 0
for ch in word:
    if ch in "aeiou":
        count += 1
print(f"Vowels: {count}")`,
  expectedOutput: `P\ny\nt\nh\no\nn\nVowels: 1`,
  mistakes: [{ wrong: `for ch in "Python":\n    print(word)  # always prints the whole word`, right: `for ch in "Python":\n    print(ch)`, note: "Use the loop variable, not the original." }],
  starter: `name = "Maria"\n\ncounter = 0\nfor ch in name:\n    counter += 1\nprint(f"{name} has {counter} letters")`,
},
{
  id: "while", num: 19, track: "Control Flow", title: "while Loops",
  explanation: `<p>A <code>while</code> loop repeats as long as its condition is True. <b>Something inside the loop must make the condition False</b> (e.g. a counter grows) — otherwise you get an infinite loop, which the sandbox stops automatically.</p>`,
  syntax: `count = 1
while count <= 5:
    print(count)
    count += 1`,
  example: `count = 1

while count <= 5:
    print(f"Count is {count}")
    count += 1

print("Loop finished")`,
  expectedOutput: `Count is 1\nCount is 2\nCount is 3\nCount is 4\nCount is 5\nLoop finished`,
  mistakes: [{ wrong: `count = 1\nwhile count <= 5:\n    print(count)  # infinite: count never changes!`, right: `count = 1\nwhile count <= 5:\n    print(count)\n    count += 1`, note: "Always update the counter inside the loop." }],
  starter: `total = 0\nnumber = 1\n\nwhile number <= 10:\n    total += number\n    number += 1\nprint(f"Sum 1..10 = {total}")`,
},
{
  id: "break-continue", num: 20, track: "Control Flow", title: "break & continue",
  explanation: `<p><code>break</code> exits a loop immediately; <code>continue</code> skips to the next turn. A <code>while True:</code> + <code>break</code> pattern is common when the exit depends on a test inside the loop.</p>`,
  syntax: `for i in items:
    if i == stop_value:
        break
    if i == skip_value:
        continue`,
  example: `for i in range(10):
    if i == 3:
        continue   # skip 3
    if i == 7:
        break      # stop at 7
    print(i)

secret = 7
tries = 0
while True:
    tries += 1
    if tries == secret:
        print(f"Found it after {tries} turns")
        break`,
  expectedOutput: `0\n1\n2\n4\n5\n6\nFound it after 7 turns`,
  mistakes: [{ wrong: `while True:\n    print("hi")  # break missing → infinite loop!`, right: `while True:\n    print("hi")\n    break  # or some condition that breaks`, note: "while True always needs a break somewhere." }],
  starter: `for i in range(1, 21):\n    if i % 2 != 0:\n        continue\n    print(i)`,
},
{
  id: "lists", num: 21, track: "Data Structures", title: "Lists",
  explanation: `<p>A list stores many values in order: <code>fruits = ["apple", "banana"]</code>. Read by index (starting at <b>0</b>), change with <code>fruits[0] = ...</code>, grow with <code>.append()</code>/<code>.insert()</code>, shrink with <code>.remove()</code>/<code>.pop()</code>, sort with <code>.sort()</code>. Negative indexes count from the end: <code>fruits[-1]</code> is the last.</p>`,
  syntax: `fruits = ["apple", "banana", "cherry"]
fruits.append("mango")
first = fruits[0]`,
  example: `fruits = ["apple", "banana", "cherry"]

print(fruits)
print(fruits[0])
print(fruits[2])
print(fruits[-1])
print(len(fruits))

fruits.append("mango")
print(fruits)

fruits[0] = "avocado"
print(fruits)`,
  expectedOutput: `['apple', 'banana', 'cherry']\napple\ncherry\ncherry\n3\n['apple', 'banana', 'cherry', 'mango']\n['avocado', 'banana', 'cherry', 'mango']`,
  mistakes: [
    { wrong: `fruits = ["apple" "banana"]`, right: `fruits = ["apple", "banana"]`, note: "Missing comma: the two strings get glued together." },
    { wrong: `fruits(0)`, right: `fruits[0]`, note: "Indexing uses square brackets, not parentheses." },
  ],
  starter: `scores = [75, 82, 59, 91]\n\nprint(scores)\nprint("First:", scores[0])\nprint("Last:", scores[-1])\nprint("Count:", len(scores))`,
},
{
  id: "list-slices", num: 22, track: "Data Structures", title: "List Slicing",
  explanation: `<p>Slices take a section of a list: <code>items[a:b]</code> from index a up to (not including) b, <code>items[:3]</code> first three, <code>items[2:]</code> from index 2 to the end, <code>items[::-1]</code> reversed. Slices never crash: out-of-range just gives fewer items.</p>`,
  syntax: `items[1:4]   # indexes 1,2,3
items[:2]    # first two
items[::-1]  # reversed`,
  example: `numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(numbers[2:5])
print(numbers[:3])
print(numbers[7:])
print(numbers[::2])
print(numbers[::-1])
print(numbers[20:30])`,
  expectedOutput: `[2, 3, 4]\n[0, 1, 2]\n[7, 8, 9]\n[0, 2, 4, 6, 8]\n[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]\n[]`,
  mistakes: [{ wrong: `numbers[2:5] = [2, 3, 4]  # thinking it includes index 5`, right: `numbers[2:6]`, note: "The end index is NOT included: 2:5 gives indexes 2,3,4." }],
  starter: `letters = ["a", "b", "c", "d", "e"]\n\nprint(letters[1:4])\nprint(letters[:2])\nprint(letters[3:])\nprint(letters[::-1])`,
},
{
  id: "list-methods", num: 23, track: "Data Structures", title: "List Methods",
  explanation: `<p>Lists come with useful methods: <code>.append(x)</code> add at the end, <code>.insert(i, x)</code> add at position i, <code>.remove(x)</code> delete first x, <code>.pop()</code> remove &amp; return last, <code>.sort()</code> order, <code>.reverse()</code> flip, <code>in</code> test membership, <code>.count(x)</code>/<code>.index(x)</code> search.</p>`,
  syntax: `items.append("x")
items.sort()
if "x" in items: ...`,
  example: `items = ["banana", "apple", "cherry"]

items.sort()
print(items)

items.append("mango")
items.insert(1, "kiwi")
print(items)

items.remove("apple")
print(items)

last = items.pop()
print(items, "| removed:", last)

print("kiwi" in items)
print(items.count("banana"))`,
  expectedOutput: `['apple', 'banana', 'cherry']\n['apple', 'kiwi', 'banana', 'cherry', 'mango']\n['kiwi', 'banana', 'cherry', 'mango']\n['kiwi', 'banana', 'cherry'] | removed: mango\nTrue\n1`,
  mistakes: [{ wrong: `items = items.sort()`, right: `items.sort()`, note: ".sort() changes the list in place and returns None; do not reassign." }],
  starter: `scores = [88, 92, 79, 93, 85]\n\nscores.append(100)\nscores.sort()\nprint(scores)\nprint("Highest:", scores[-1], "Lowest:", scores[0])`,
},
{
  id: "loop-lists", num: 24, track: "Data Structures", title: "Looping over Lists",
  explanation: `<p><code>for item in items:</code> visits every list value. Use <code>enumerate(items)</code> when you also need the index. Build results with an accumulator pattern.</p>`,
  syntax: `for item in items:
    print(item)

for i, item in enumerate(items):
    print(i, item)`,
  example: `fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(f"I like {fruit}")

total = 0
for score in [75, 82, 59, 91]:
    total += score
print(f"Average: {total / 4}")

for i, fruit in enumerate(fruits):
    print(i, fruit)`,
  expectedOutput: `I like apple\nI like banana\nI like cherry\nAverage: 76.75\n0 apple\n1 banana\n2 cherry`,
  mistakes: [{ wrong: `for i in range(len(items)):\n    print(items)  # prints the whole list n times`, right: `for i in range(len(items)):\n    print(items[i])`, note: "Index into the list, or simply loop over items directly." }],
  starter: `names = ["Maria", "John", "Ana"]\n\nfor name in names:\n    print(f"Hello, {name}!")`,
},
{
  id: "tuples", num: 25, track: "Data Structures", title: "Tuples",
  explanation: `<p>A tuple is like a list but <b>unchangeable</b>: <code>point = (3, 5)</code>. Read by index, but <code>.append()</code> or assignment fail with <code>TypeError</code>. Use tuples for fixed groups of values, and to return several values from a function.</p>`,
  syntax: `point = (3, 5)
x, y = point   # unpacking`,
  example: `point = (3, 5)
colors = ("red", "green", "blue")

print(point)
print(colors[0])
print(colors[-1])
print(len(colors))

x, y = point
print(f"x={x}, y={y}")

print(point in [(3, 5), (1, 2)])`,
  expectedOutput: `(3, 5)\nred\nblue\n3\nx=3, y=5\nTrue`,
  mistakes: [{ wrong: `point = (3, 5)\npoint[0] = 10`, right: `point = (3, 5)\npoint = (10, 5)`, note: "TypeError: tuples are immutable; assign a new tuple instead." }],
  starter: `student = ("Maria", 21, "BSIT")\n\nname, age, course = student\nprint(f"{name} is {age}, studying {course}")`,
},
{
  id: "dictionaries", num: 26, track: "Data Structures", title: "Dictionaries",
  explanation: `<p>A dictionary stores <b>key → value</b> pairs: <code>student = {"name": "John"}</code>. Read with <code>student["name"]</code>, test with <code>in</code>, safe read with <code>.get(key, default)</code>, add/update by assignment, delete with <code>del</code>. Loop over <code>.keys()</code>, <code>.values()</code> or <code>.items()</code>.</p>`,
  syntax: `student = {"name": "John", "age": 20}
print(student["name"])
student["course"] = "BSIT"`,
  example: `student = {"name": "John", "age": 20, "course": "BSIT"}

print(student["name"])
print(student.get("grade", "not set"))
print("age" in student)

student["grade"] = 88
print(student)

for key, value in student.items():
    print(f"{key}: {value}")`,
  expectedOutput: `John\nnot set\nTrue\n{'name': 'John', 'age': 20, 'course': 'BSIT', 'grade': 88}\nname: John\nage: 20\ncourse: BSIT\ngrade: 88`,
  mistakes: [
    { wrong: `student["grade"]  # when grade does not exist`, right: `student.get("grade", 0)`, note: "KeyError: use .get() with a default." },
    { wrong: `student{name: "John"}`, right: `student = {"name": "John"}`, note: "Syntax: braces, quoted keys, colon." },
  ],
  starter: `prices = {"coffee": 3.5, "tea": 2.75}\n\nprint(prices["coffee"])\nprint(prices.get("juice", 0))\n\nfor item, price in prices.items():\n    print(f"{item}: {price:.2f}")`,
},
{
  id: "nested-data", num: 27, track: "Data Structures", title: "Nested Data",
  explanation: `<p>Data structures nest freely: a list of dictionaries is how real apps model records (students, products, contacts). Chain the accesses: <code>students[0]["name"]</code>.</p>`,
  syntax: `students = [
    {"name": "John", "grade": 88},
    {"name": "Ana", "grade": 92},
]`,
  example: `students = [
    {"name": "John", "grade": 88},
    {"name": "Ana", "grade": 92},
    {"name": "Mark", "grade": 75},
]

for student in students:
    print(f"{student['name']}: {student['grade']}")

total = 0
for s in students:
    total += s["grade"]
print(f"Class average: {total / len(students):.1f}")`,
  expectedOutput: `John: 88\nAna: 92\nMark: 75\nClass average: 85.0`,
  mistakes: [{ wrong: `for s in students:\n    print(s["name"])\nprint(s["grade"])  # outside the loop!`, right: `for s in students:\n    print(s["name"], s["grade"])`, note: "Indent both accesses inside the loop." }],
  starter: `inventory = [\n    {"item": "coffee", "price": 3.5},\n    {"item": "tea", "price": 2.75},\n]\n\nfor record in inventory:\n    print(f"{record['item']}: {record['price']:.2f}")`,
},
{
  id: "comprehensions", num: 28, track: "Data Structures", title: "List Comprehensions",
  explanation: `<p>A list comprehension builds a list in one line: <code>[expression for item in items if condition]</code>. It replaces the loop+append pattern and is the Pythonic way to transform data.</p>`,
  syntax: `squares = [x * x for x in range(5)]
evens = [x for x in range(10) if x % 2 == 0]`,
  example: `squares = [x * x for x in range(5)]
print(squares)

evens = [x for x in range(10) if x % 2 == 0]
print(evens)

names = ["maria", "john", "ana"]
upper = [name.title() for name in names]
print(upper)

grades = [88, 92, 75]
passed = [grade for grade in grades if grade >= 60]
print(passed)`,
  expectedOutput: `[0, 1, 4, 9, 16]\n[0, 2, 4, 6, 8]\n['Maria', 'John', 'Ana']\n[88, 92, 75]`,
  mistakes: [{ wrong: `squares = [x * x for x in range(5)]:`, right: `squares = [x * x for x in range(5)]`, note: "No colon in a comprehension." }],
  starter: `words = ["python", "java", "rust", "go"]\n\nlengths = [len(w) for w in words]\nprint(lengths)\n\nlong = [w for w in words if len(w) > 3]\nprint(long)`,
},
{
  id: "functions", num: 29, track: "Functions", title: "Defining Functions",
  explanation: `<p>A function is a named, reusable block: <code>def greet():</code> defines it, <code>greet()</code> calls it. Code inside only runs when called. Functions keep programs organized — define once, call many times.</p>`,
  syntax: `def function_name():
    # code
    return value

function_name()`,
  example: `def greet():
    print("Hello there!")

def show_sum():
    a, b = 3, 4
    print(f"Sum: {a + b}")

greet()
greet()
show_sum()`,
  expectedOutput: `Hello there!\nHello there!\nSum: 7`,
  mistakes: [
    { wrong: `def greet():\nprint("Hello")`, right: `def greet():\n    print("Hello")`, note: "Body must be indented." },
    { wrong: `def greet()\n    print("Hello")`, right: `def greet():\n    print("Hello")`, note: "Colon : after the name." },
  ],
  starter: `def welcome():\n    print("Welcome to Python functions!")\n\ndef goodbye():\n    print("Goodbye!")\n\nwelcome()\ngoodbye()`,
},
{
  id: "function-params", num: 30, track: "Functions", title: "Parameters & Arguments",
  explanation: `<p>Parameters let you pass data in: <code>def greet(name):</code>. Call with arguments: <code>greet("Maria")</code>. Multiple parameters are separated by commas and can have defaults: <code>def greet(name, greeting="Hello")</code>.</p>`,
  syntax: `def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Maria")
greet("John", "Hi")`,
  example: `def area(width, height):
    result = width * height
    print(f"Area: {result}")

area(4, 5)
area(3, 7)

def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Maria")
greet("John", "Hi")`,
  expectedOutput: `Area: 20\nArea: 21\nHello, Maria!\nHi, John!`,
  mistakes: [{ wrong: `def area(width, height):\n    print(f"Area: {result}")`, right: `def area(width, height):\n    result = width * height\n    print(f"Area: {result}")`, note: "result does not exist yet — create it first." }],
  starter: `def describe(name, age):\n    print(f"{name} is {age} years old")\n\ndescribe("Maria", 21)\ndescribe("John", 20)`,
},
{
  id: "return", num: 31, track: "Functions", title: "return Values",
  explanation: `<p><code>return</code> sends a value back to the caller: <code>result = add(3, 4)</code>. A function without <code>return</code> gives back <code>None</code>. <code>return</code> also exits the function immediately, and can return several values as a tuple.</p>`,
  syntax: `def add(a, b):
    return a + b

result = add(3, 4)`,
  example: `def add(a, b):
    return a + b

def min_max(numbers):
    return min(numbers), max(numbers)

result = add(3, 4)
print(result)
print(add(10, 5) * 2)

low, high = min_max([4, 9, 2, 7])
print(low, high)`,
  expectedOutput: `7\n30\n2 9`,
  mistakes: [
    { wrong: `def add(a, b):\n    print(a + b)\n\nresult = add(3, 4)\nprint(result + 1)`, right: `def add(a, b):\n    return a + b\n\nresult = add(3, 4)\nprint(result + 1)`, note: "print shows text but returns None; use return when you need the value." },
    { wrong: `def add(a, b):\n    return\n    a + b  # unreachable`, right: `def add(a, b):\n    return a + b`, note: "return exits immediately — code after it never runs." },
  ],
  starter: `def celsius_to_f(c):\n    return c * 9 / 5 + 32\n\nprint(celsius_to_f(0))\nprint(celsius_to_f(100))\nprint(celsius_to_f(37))`,
},
{
  id: "function-scope", num: 32, track: "Functions", title: "Function Scope",
  explanation: `<p>Variables created inside a function are <b>local</b>: they exist only there. Outside variables can be read inside, but to reassign a global you need <code>global name</code> (rarely a good idea — pass values in and return results instead).</p>`,
  syntax: `def demo():
    local_value = 10   # exists only here
    return local_value`,
  example: `school = "Python High"

def show_school():
    print(school)   # reading a global works

show_school()

def make_student():
    name = "Ana"    # local
    return name

student = make_student()
print(student)`,
  expectedOutput: `Python High\nAna`,
  mistakes: [{ wrong: `def demo():\n    counter = 0\ncounter += 1`, right: `counter = 0\ndef demo():\n    global counter\n    counter += 1\ndemo()\nprint(counter)`, note: "NameError: a local variable cannot be used outside; return it instead." }],
  starter: `rate = 0.12\n\ndef tax(amount):\n    return amount * rate\n\nprint(tax(100))\nprint(tax(250))`,
},
{
  id: "built-in-functions", num: 33, track: "Functions", title: "Built-in Functions",
  explanation: `<p>Python ships with many built-in functions: <code>len()</code>, <code>sum()</code>, <code>min()</code>, <code>max()</code>, <code>sorted()</code>, <code>abs()</code>, <code>round()</code>, <code>type()</code>, <code>isinstance()</code>, <code>enumerate()</code>, <code>zip()</code> and more. Check the official list at docs.python.org.</p>`,
  syntax: `total = sum(numbers)
biggest = max(numbers)
ordered = sorted(numbers)`,
  example: `numbers = [42, 7, 19, 88, 3]

print(len(numbers))
print(sum(numbers))
print(min(numbers), max(numbers))
print(sorted(numbers))
print(sorted(numbers, reverse=True))
print(abs(-15))
print(round(3.7))
print(isinstance(numbers, list))`,
  expectedOutput: `5\n159\n3 88\n[3, 7, 19, 42, 88]\n[88, 42, 19, 7, 3]\n15\n4\nTrue`,
  mistakes: [{ wrong: `numbers.sort = sorted(numbers)`, right: `ordered = sorted(numbers)`, note: "sorted() returns a NEW list; .sort() orders in place." }],
  starter: `grades = [88, 92, 75, 100, 60]\n\nprint("Count:", len(grades))\nprint("Sum:", sum(grades))\nprint("Average:", round(sum(grades) / len(grades), 1))\nprint("Best:", max(grades), "Worst:", min(grades))`,
},
{
  id: "modules", num: 34, track: "Advanced", title: "Modules & import",
  explanation: `<p><code>import</code> brings in extra functionality: <code>import math</code> then <code>math.sqrt(16)</code>. <code>from math import sqrt</code> imports one thing directly. Python's standard library has modules for dates (<code>datetime</code>), random numbers (<code>random</code>), files, JSON and much more.</p>`,
  syntax: `import math
print(math.sqrt(16))

from math import pi
print(pi)`,
  example: `import math

print(math.sqrt(16))
print(math.floor(3.7))
print(math.pi)

from math import ceil
print(ceil(3.2))

import random
random.seed(1)
print(random.randint(1, 10))`,
  expectedOutput: `4.0\n3\n3.141592653589793\n4\n3`,
  mistakes: [{ wrong: `import math\nprint(sqrt(16))`, right: `import math\nprint(math.sqrt(16))`, note: "With import math you must write math.sqrt — or use from math import sqrt." }],
  starter: `import math\n\nside = 5\narea = side * side\nprint(f"Area: {area}, sqrt: {math.sqrt(area)}")\nprint(f"Circle with radius 3: {math.pi * 9:.2f}")`,
},
{
  id: "errors", num: 35, track: "Advanced", title: "try / except Errors",
  explanation: `<p>Programs crash with errors like <code>ValueError</code> or <code>ZeroDivisionError</code>. Wrap risky code in <code>try / except</code> to handle the failure gracefully instead of crashing.</p>`,
  syntax: `try:
    risky_code()
except ValueError:
    print("That was not a number")`,
  example: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "Cannot divide by zero"

print(safe_divide(10, 2))
print(safe_divide(10, 0))

text = "abc"
try:
    number = int(text)
except ValueError:
    print(f"'{text}' is not a number")`,
  expectedOutput: `5.0\nCannot divide by zero\n'abc' is not a number`,
  mistakes: [{ wrong: `try:\n    int("abc")\nprint("handled")`, right: `try:\n    int("abc")\nexcept ValueError:\n    print("handled")`, note: "try must be followed by at least one except block." }],
  starter: `values = ["10", "5", "abc", "3"]\n\nfor text in values:\n    try:\n        print(int(text) * 2)\n    except ValueError:\n        print(f"Skipped '{text}'")`,
},
{
  id: "string-formatting", num: 36, track: "Advanced", title: "String Formatting",
  explanation: `<p>Format text like a pro: f-strings with <code>{value:.2f}</code> (2 decimals), <code>{value:>10}</code> (right align, width 10), <code>{value:^10}</code> (center), plus <code>.zfill()</code>, <code>.ljust()</code>, <code>.rjust()</code> and f-string dates.</p>`,
  syntax: `print(f"{price:.2f}")
print(f"{name:>10}")
print(f"{code:0>4}")`,
  example: `name = "Ana"
score = 91.5678
code = 42

print(f"{name:>8} | {score:.1f}")
print(f"{name:<8} | {score:.2f}")
print(f"{name:^8} |")
print(f"Code: {code:0>4}")
print(f"{code:05d}")
print("7".zfill(3))`,
  expectedOutput: `     Ana | 91.6\nAna      | 91.57\n  Ana    |\nCode: 0042\n00042\n007`,
  mistakes: [{ wrong: `print(f"{score:2f}")`, right: `print(f"{score:.2f}")`, note: "Missing dot: it is .2f — dot then digits." }],
  starter: `students = [("Maria", 88.5), ("John", 92.25)]\n\nprint(f"{'Name':<10}{'Score':>8}")\nfor name, score in students:\n    print(f"{name:<10}{score:>8.2f}")`,
},
{
  id: "classes", num: 37, track: "Advanced", title: "Classes & Objects",
  explanation: `<p>A class is a blueprint for objects: <code>class Student:</code> with an <code>__init__(self, ...)</code> constructor that sets attributes. Create objects by calling the class: <code>s = Student("Maria")</code>. <code>self</code> refers to the object being built.</p>`,
  syntax: `class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade`,
  example: `class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade

    def introduce(self):
        print(f"Hi, I am {self.name} ({self.grade})")

s1 = Student("Maria", 88)
s2 = Student("John", 92)

s1.introduce()
s2.introduce()
print(s1.name, s1.grade)`,
  expectedOutput: `Hi, I am Maria (88)\nHi, I am John (92)\nMaria 88`,
  mistakes: [
    { wrong: `class Student\n    def __init__(self):`, right: `class Student:\n    def __init__(self):`, note: "Class definition needs a colon." },
    { wrong: `def __init__(name, grade):`, right: `def __init__(self, name, grade):`, note: "The first parameter is always self." },
  ],
  starter: `class Book:\n    def __init__(self, title, pages):\n        self.title = title\n        self.pages = pages\n\n    def describe(self):\n        print(f"'{self.title}' has {self.pages} pages")\n\nb = Book("Python Basics", 250)\nb.describe()`,
},
{
  id: "inheritance", num: 38, track: "Advanced", title: "Inheritance",
  explanation: `<p>A class can extend another: <code>class Animal:</code> → <code>class Dog(Animal):</code>. The child inherits the parent's attributes and methods, can add its own, and can <b>override</b> them. <code>super().__init__(...)</code> calls the parent constructor.</p>`,
  syntax: `class Animal:
    def __init__(self, name):
        self.name = name

class Dog(Animal):
    def speak(self):
        return f"{self.name}: woof!"`,
  example: `class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says woof!"

class Cat(Animal):
    def __init__(self, name, indoor):
        super().__init__(name)
        self.indoor = indoor

pets = [Dog("Rex"), Cat("Mia", True)]
for pet in pets:
    print(pet.speak())`,
  expectedOutput: `Rex says woof!\nMia makes a sound`,
  mistakes: [{ wrong: `class Dog(Animal)\n    def speak(self):`, right: `class Dog(Animal):\n    def speak(self):`, note: "Colon after the parent class name." }],
  starter: `class Vehicle:\n    def __init__(self, brand):\n        self.brand = brand\n\nclass Car(Vehicle):\n    def horn(self):\n        return f"{self.brand}: beep!"\n\nc = Car("Toyota")\nprint(c.horn())`,
},
{
  id: "recursion", num: 39, track: "Advanced", title: "Recursion",
  explanation: `<p>A recursive function calls itself with a smaller problem and stops at a <b>base case</b>. Without a base case it recurses forever. Classic examples: countdown, factorial, summing a list.</p>`,
  syntax: `def countdown(n):
    if n == 0:          # base case
        print("Done")
        return
    print(n)
    countdown(n - 1)    # smaller problem`,
  example: `def countdown(n):
    if n == 0:
        print("Lift off!")
        return
    print(n)
    countdown(n - 1)

countdown(3)

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))`,
  expectedOutput: `3\n2\n1\nLift off!\n120`,
  mistakes: [{ wrong: `def countdown(n):\n    print(n)\n    countdown(n - 1)  # no base case!`, right: `def countdown(n):\n    if n == 0:\n        return\n    print(n)\n    countdown(n - 1)`, note: "Recursion without a base case never stops." }],
  starter: `def sum_to(n):\n    if n == 0:\n        return 0\n    return n + sum_to(n - 1)\n\nprint(sum_to(5))\nprint(sum_to(10))`,
},
{
  id: "lambda-map", num: 40, track: "Advanced", title: "lambda, map & filter",
  explanation: `<p><code>lambda</code> is a tiny anonymous function: <code>lambda x: x * 2</code>. Use with <code>map(fn, items)</code> (transform) and <code>filter(fn, items)</code> (keep True), or as a <code>sorted(key=...)</code> rule.</p>`,
  syntax: `doubled = list(map(lambda x: x * 2, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))`,
  example: `numbers = [1, 2, 3, 4, 5]

doubled = list(map(lambda x: x * 2, numbers))
print(doubled)

evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)

students = [("Maria", 88), ("John", 92)]
by_grade = sorted(students, key=lambda s: s[1], reverse=True)
print(by_grade)

add = lambda a, b: a + b
print(add(3, 4))`,
  expectedOutput: `[2, 4, 6, 8, 10]\n[2, 4]\n[('John', 92), ('Maria', 88)]\n7`,
  mistakes: [{ wrong: `map(lambda x: x * 2, numbers)\nprint(result)  # result is not defined`, right: `doubled = list(map(lambda x: x * 2, numbers))\nprint(doubled)`, note: "map returns an iterator; wrap it in list() and assign." }],
  starter: `words = ["python", "java", "go", "rust"]\n\nlengths = list(map(len, words))\nprint(lengths)\n\nlong = list(filter(lambda w: len(w) >= 4, words))\nprint(long)`,
},
{
  id: "decorators", num: 41, track: "Advanced", title: "Decorators",
  explanation: `<p>A decorator is a function that wraps another function to add behaviour. Apply it with <code>@decorator_name</code> above the function. Great for logging, timing, or access checks without changing the original code.</p>`,
  syntax: `def announce(func):
    def wrapper():
        print("Before")
        func()
        print("After")
    return wrapper

@announce
def task():
    print("Working...")`,
  example: `def announce(func):
    def wrapper():
        print("— start —")
        func()
        print("— end —")
    return wrapper

@announce
def task():
    print("Doing important work")

task()

def twice(func):
    def wrapper():
        func()
        func()
    return wrapper

@twice
def hello():
    print("Hello!")

hello()`,
  expectedOutput: `— start —\nDoing important work\n— end —\nHello!\nHello!`,
  mistakes: [{ wrong: `@announce\ndef task():\n...  # forgot to return wrapper inside decorator`, right: `def announce(func):\n    def wrapper():\n        func()\n    return wrapper`, note: "The decorator must return the wrapper function." }],
  starter: `def shout(func):\n    def wrapper():\n        print(">>>")\n        func()\n        print("<<<")\n    return wrapper\n\n@shout\ndef greet():\n    print("Hello decorators!")\n\ngreet()`,
},
{
  id: "generators", num: 42, track: "Advanced", title: "Generators & yield",
  explanation: `<p>A generator produces values one at a time with <code>yield</code> instead of building a whole list in memory. Each call to <code>next()</code> resumes where it paused. Loop over it like any sequence — perfect for big or infinite sequences.</p>`,
  syntax: `def counter(n):
    i = 1
    while i <= n:
        yield i
        i += 1`,
  example: `def counter(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for number in counter(5):
    print(number)

gen = counter(3)
print(next(gen))
print(next(gen))

def squares(n):
    for x in range(1, n + 1):
        yield x * x

print(list(squares(4)))`,
  expectedOutput: `1\n2\n3\n4\n5\n1\n2\n[1, 4, 9, 16]`,
  mistakes: [{ wrong: `def gen():\n    return 1  # not a generator`, right: `def gen():\n    yield 1`, note: "yield makes it a generator; return just ends it." }],
  starter: `def countdown(n):\n    while n > 0:\n        yield n\n        n -= 1\n    yield "Lift off!"\n\nfor value in countdown(3):\n    print(value)`,
},
{
  id: "json-data", num: 43, track: "Advanced", title: "File & JSON Handling",
  explanation: `<p>In normal Python, <code>open("data.txt", "w")</code> reads/writes files with a <code>with</code> block. In this browser sandbox the file system is virtual, but <b>JSON strings work fully</b>: <code>json.dumps()</code> converts Python → JSON text, <code>json.loads()</code> converts JSON → Python. That is exactly how apps save data to files or APIs.</p>`,
  syntax: `import json
text = json.dumps(student)
back = json.loads(text)`,
  example: `import json

student = {"name": "Maria", "grades": [88, 92, 75]}

text = json.dumps(student)
print(text)

copy = json.loads(text)
print(copy["name"])
print(copy["grades"][1])

products = [
    {"item": "coffee", "price": 3.5},
    {"item": "tea", "price": 2.75},
]
print(json.dumps(products, indent=2))`,
  expectedOutput: `{"name": "Maria", "grades": [88, 92, 75]}\nMaria\n92\n[\n  {\n    "item": "coffee",\n    "price": 3.5\n  },\n  {\n    "item": "tea",\n    "price": 2.75\n  }\n]`,
  mistakes: [{ wrong: `json.load("text")`, right: `json.loads(text)`, note: "loads() parses a string; load() reads a real file object." }],
  starter: `import json\n\ninventory = {"coffee": 25, "tea": 40, "juice": 12}\n\ntext = json.dumps(inventory)\nprint("Saved:", text)\n\nrestored = json.loads(text)\nprint("Tea stock:", restored["tea"])`,
},
{
  id: "algorithms", num: 44, track: "Advanced", title: "Thinking in Algorithms",
  explanation: `<p>An algorithm is a step-by-step plan. Classic patterns: find the largest (track a champion), search (check each item), sort (compare &amp; swap), count, and accumulate. Breaking a problem into steps is the core skill of programming.</p>`,
  syntax: `largest = numbers[0]
for n in numbers:
    if n > largest:
        largest = n`,
  example: `numbers = [42, 7, 19, 88, 3]

# find largest
largest = numbers[0]
for n in numbers:
    if n > largest:
        largest = n
print("Largest:", largest)

# linear search
target = 19
found_at = -1
for i, n in enumerate(numbers):
    if n == target:
        found_at = i
        break
print(f"{target} at index {found_at}")

# bubble sort
data = [5, 2, 9, 1]
for i in range(len(data)):
    for j in range(len(data) - 1):
        if data[j] > data[j + 1]:
            data[j], data[j + 1] = data[j + 1], data[j]
print("Sorted:", data)`,
  expectedOutput: `Largest: 88\n19 at index 2\nSorted: [1, 2, 5, 9]`,
  mistakes: [{ wrong: `largest = 0  # fails when all numbers are negative`, right: `largest = numbers[0]`, note: "Start from a real value, not 0." }],
  starter: `scores = [72, 95, 88, 60, 91]\n\nbest = scores[0]\nfor s in scores:\n    if s > best:\n        best = s\nprint("Best score:", best)\nprint("Passing:", [s for s in scores if s >= 75])`,
},
/*APPEND*/
]
