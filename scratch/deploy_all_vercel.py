import subprocess
import os
import json

base_path = r'c:\Users\Dhanush\Music\aviatorsclaude'

portals = [
    {'name': 'master-portal',    'alias': 'aviators-master.vercel.app'},
    {'name': 'recruiter-portal', 'alias': 'aviators-recruiter.vercel.app'},
    {'name': 'evaluator-portal', 'alias': 'aviators-evaluator.vercel.app'},
    {'name': 'executive-portal', 'alias': 'aviators-executive.vercel.app'},
]

for p in portals:
    path = os.path.join(base_path, p['name'])
    print(f"\n======================================")
    print(f"Deploying {p['name']}...")
    print(f"======================================")

    res = subprocess.run('npx vercel --prod --yes', shell=True, cwd=path, capture_output=True, text=True)

    if res.returncode != 0:
        print(f"FAILED to deploy {p['name']}.")
        print("Stdout:", res.stdout)
        print("Stderr:", res.stderr)
        continue

    # Parse deployment URL from JSON output
    try:
        data = json.loads(res.stdout)
        deploy_url = data['deployment']['url']
        print(f"Deployed to: {deploy_url}")
    except Exception:
        print("Could not parse deploy URL, skipping alias step.")
        print(res.stdout)
        continue

    # Set clean alias
    print(f"Setting alias: {p['alias']} -> {deploy_url}")
    alias_res = subprocess.run(
        f'npx vercel alias set {deploy_url} {p["alias"]}',
        shell=True, cwd=path, capture_output=True, text=True
    )
    if alias_res.returncode == 0:
        print(f"[OK] https://{p['alias']} is live!")
    else:
        print(f"[WARN] Alias failed: {alias_res.stderr}")

print("\n\n=== All done! Clean URLs: ===")
for p in portals:
    print(f"  https://{p['alias']}")
