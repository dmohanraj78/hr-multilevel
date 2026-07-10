import difflib

with open('temp_old_app.jsx', 'r', encoding='utf-16') as f:
    old_lines = f.readlines()

with open('master-portal/src/App.jsx', 'r', encoding='utf-8') as f:
    new_lines = f.readlines()

diff = list(difflib.unified_diff(old_lines, new_lines, fromfile='temp_old_app.jsx', tofile='master-portal/src/App.jsx', n=5))

for line in diff:
    print(line, end='')
