import requests

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Fetch all from round_1_evaluation joined with raw_submissions
url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=*,raw_submissions(*)"
r = requests.get(url, headers=headers)
data = r.json()

# Search for Piyush Kumar
for row in data:
    raw = row.get('raw_submissions')
    if raw:
        raw_parsed = raw[0] if isinstance(raw, list) else raw
        name = raw_parsed.get('full_name')
        if name and 'piyush kumar' in name.lower():
            print(f"ID: {row['id']}, Name: {name}")
            print(f"  DB app_status: {row['app_status']}")
            print(f"  DB eval_group: {row['eval_group']}")
            print(f"  DB review_comments: {row['review_comments']}")
            print(f"  DB gender: {row['gender']}")
            print(f"  DB college: {row['college']}")
            print(f"  Full Row JSON:")
            import json
            print(json.dumps(row, indent=2))
