import requests

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Fetch all raw_submissions IDs
r_raw = requests.get(f"{SUPABASE_URL}/rest/v1/raw_submissions?select=id,full_name,email,submission_date", headers=headers)
raw_ids = {row['id']: row for row in r_raw.json()}

# Fetch all round_1_evaluation IDs
r_r1 = requests.get(f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=id", headers=headers)
r1_ids = {row['id'] for row in r_r1.json()}

missing_ids = sorted(list(set(raw_ids.keys()) - r1_ids))
print(f"Number of raw submissions missing from round_1_evaluation: {len(missing_ids)}")
print("\nFirst 10 missing candidates:")
for mid in missing_ids[:10]:
    cand = raw_ids[mid]
    print(f"  ID: {mid}, Name: {cand['full_name']}, Email: {cand['email']}, Date: {cand['submission_date']}")
