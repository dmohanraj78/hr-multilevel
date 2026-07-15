import subprocess
import os

portals = ['master-portal', 'recruiter-portal', 'evaluator-portal', 'executive-portal']
base_path = r'c:\Users\Dhanush\Music\aviatorsclaude'

for p in portals:
    path = os.path.join(base_path, p)
    print(f"\n======================================")
    print(f"Deploying {p} directly to Vercel...")
    print(f"======================================")
    
    # We use --prod to deploy to production and --yes to skip prompts
    res = subprocess.run('npx vercel --prod --yes', shell=True, cwd=path, capture_output=True, text=True)
    
    if res.returncode != 0:
        print(f"FAILED to deploy {p} to Vercel.")
        print("Stdout:", res.stdout)
        print("Stderr:", res.stderr)
    else:
        print(f"SUCCESS deploying {p}!")
        print("Deploy output:")
        print(res.stdout)
