import re, pathlib
ns = {"__file__": str(pathlib.Path("_check/harness.py").resolve())}
exec(pathlib.Path('_check/harness.py').read_text(encoding='utf-8').split('fails, warn = [], []')[0], ns)
for f in ['src/challenges/beginner.js', 'src/challenges/intermediate.js', 'src/challenges/advanced.js', 'src/challenges/debugging.js', 'src/lessons/lessons.js']:
    src = pathlib.Path(f).read_text(encoding='utf-8')
    objs = ns['top_level_objects'](src)
    print(f, 'objects:', len(objs), 'first id:', re.search(r'id:\s*"(.*?)"', objs[0]).group(1) if objs else None)
    miss = [re.search(r'id:\s*"(.*?)"', o).group(1) for o in objs if not ns['bt'](o, 'solution') and 'lessons' not in f and not ns['bt'](o, 'broken')]
    print('  objects missing solution field:', miss)
