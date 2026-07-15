import subprocess
import os

portals = ['master-portal', 'recruiter-portal', 'evaluator-portal', 'executive-portal']
base_path = r'c:\Users\Dhanush\Music\aviatorsclaude'

for p in portals:
    path = os.path.join(base_path, p)
    print(f"Building {p}...")
    res = subprocess.run('npm run build', shell=True, cwd=path, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"FAILED to build {p}")
        print("Stdout:", res.stdout[:500])
        print("Stderr:", res.stderr[:500])
    else:
        print(f"SUCCESS building {p}")
