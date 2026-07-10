with open('temp_old_app.jsx', 'r', encoding='utf-16') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'getR1' in line:
        print(f"Line {i+1}: {line.strip()}")
