import requests

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Fetch all raw_submissions
r_raw = requests.get(f"{SUPABASE_URL}/rest/v1/raw_submissions?select=id,full_name,email,phone,github_url", headers=headers)
raw_list = r_raw.json()

# Fetch all round_1_evaluation with their raw submissions
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

print("Analyzing 41 missing raw submissions:")
duplicates_count = 0
uniques = []
for row in raw_list:
    mid = row['id']
    # Check if this ID is in r1
    if any(r1['id'] == mid for r1 in r1_list):
        continue
        
    # Check if this candidate is a duplicate of someone already in r1
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
        
    if is_dup:
        duplicates_count += 1
    else:
        uniques.append(row)

print(f"Total missing: {len(raw_list) - len(r1_list)}")
print(f"  Duplicates of already-evaluated candidates: {duplicates_count}")
print(f"  Actual unique new candidates missing from round_1_evaluation: {len(uniques)}")

if uniques:
    print("\nUnique missing candidates details:")
    for cand in uniques:
        print(f"  ID: {cand['id']}, Name: {cand['full_name']}, Email: {cand['email']}")
