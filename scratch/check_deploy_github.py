import urllib.request
import json

sha = 'adbf4461cf47b6ef8827d89359165eecaf4a1e18'

def get_json(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print("Error fetching", url, ":", e)
        return None

print("Checking statuses for commit", sha)
statuses_url = f'https://api.github.com/repos/dmohanraj78/hr-multilevel/statuses/{sha}'
statuses = get_json(statuses_url)
if statuses:
    for status in statuses:
        print(f"Context: {status.get('context')}")
        print(f"State: {status.get('state')}")
        print(f"Desc: {status.get('description')}")
        print(f"URL: {status.get('target_url')}")
        print("-" * 40)
else:
    print("No statuses found.")

print("\nChecking check-runs:")
checkruns_url = f'https://api.github.com/repos/dmohanraj78/hr-multilevel/commits/{sha}/check-runs'
checkruns_data = get_json(checkruns_url)
if checkruns_data:
    runs = checkruns_data.get('check_runs', [])
    for run in runs:
        print(f"Name: {run.get('name')}")
        print(f"Status: {run.get('status')}")
        print(f"Conclusion: {run.get('conclusion')}")
        print(f"URL: {run.get('details_url')}")
        print("-" * 40)
else:
    print("No check-runs found.")
