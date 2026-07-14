import requests

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. Fetch all raw_submissions
r_raw = requests.get(f"{SUPABASE_URL}/rest/v1/raw_submissions?select=id,full_name,email,phone,github_url", headers=headers)
raw_list = r_raw.json()

# 2. Fetch all round_1_evaluation with their raw submissions
r_r1 = requests.get(f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=id,raw_submissions(id,full_name,email,phone,github_url)", headers=headers)
r1_list = r_r1.json()

# Get set of all emails, phones, githubs that exist in round_1_evaluation
r1_emails = set()
r1_phones = set()
r1_githubs = set()
for r1 in r1_list:
    raw = r1.get('raw_submissions')
    if raw:
        raw_parsed = raw[0] if isinstance(raw, list) else raw
        if raw_parsed.get('email'):
            r1_emails.add(str(raw_parsed['email']).strip().lower())
        if raw_parsed.get('phone'):
            r1_phones.add(str(raw_parsed['phone']).strip().replace(' ', '').replace('+', ''))
        if raw_parsed.get('github_url'):
            r1_githubs.add(str(raw_parsed['github_url']).strip().lower())

# Identify unique candidates missing from round_1_evaluation
to_insert = []
for row in raw_list:
    mid = row['id']
    if any(r1['id'] == mid for r1 in r1_list):
        continue
        
    email = str(row.get('email') or '').strip().lower()
    phone = str(row.get('phone') or '').strip().replace(' ', '').replace('+', '')
    github = str(row.get('github_url') or '').strip().lower()
    
    is_dup = False
    if email and email in r1_emails:
        is_dup = True
    elif phone and phone in r1_phones:
        is_dup = True
    elif github and github in r1_githubs:
        is_dup = True
        
    if not is_dup:
        to_insert.append(row)

print(f"Found {len(to_insert)} unique missing candidates to sync into round_1_evaluation.")

for cand in to_insert:
    # Prepare basic pending record
    payload = {
        "id": cand["id"],
        "app_status": "Pending",
        "eval_group": "Unassigned"
    }
    
    insert_url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation"
    resp = requests.post(insert_url, headers=headers, json=payload)
    if resp.status_code in [200, 201]:
        print(f"  Successfully synced ID: {cand['id']}, Name: {cand['full_name']}")
    else:
        print(f"  Failed to sync ID: {cand['id']}, Name: {cand['full_name']}. Error: {resp.text}")

print("Sync completed!")
