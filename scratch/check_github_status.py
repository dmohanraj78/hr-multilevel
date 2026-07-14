import requests

sha = '5f05beda8e542ea2588faa69e0b920d2130e2f41'

print("Checking check-runs:")
url = f'https://api.github.com/repos/dmohanraj78/hr-multilevel/commits/{sha}/check-runs'
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
if r.status_code == 200:
    runs = r.json().get('check_runs', [])
    for run in runs:
        print(f"Name: {run.get('name')}")
        print(f"Status: {run.get('status')}")
        print(f"Conclusion: {run.get('conclusion')}")
        print(f"URL: {run.get('details_url')}")
else:
    print('Failed check-runs:', r.status_code, r.text)

print("\nChecking statuses:")
url = f'https://api.github.com/repos/dmohanraj78/hr-multilevel/statuses/{sha}'
r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
if r.status_code == 200:
    statuses = r.json()
    for status in statuses:
        print(f"Context: {status.get('context')}")
        print(f"State: {status.get('state')}")
        print(f"Desc: {status.get('description')}")
        print(f"URL: {status.get('target_url')}")
else:
    print('Failed statuses:', r.status_code, r.text)
