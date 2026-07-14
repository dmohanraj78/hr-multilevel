import requests

SUPABASE_URL = "https://mujqmdmzloizqhglayxe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Fetch all raw submissions count
r_raw = requests.get(f"{SUPABASE_URL}/rest/v1/raw_submissions?select=id&limit=3000", headers=headers)
raw_ids = [item["id"] for item in r_raw.json()]
total_raw = len(raw_ids)

# Fetch all round_1_evaluation records
r_r1 = requests.get(f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=*&limit=3000", headers=headers)
r1_list = r_r1.json()
total_r1 = len(r1_list)

# Unprocessed in r1
unprocessed_r1 = [r for r in r1_list if r.get("total") is None and r.get("tier") is None]
unprocessed_r1_count = len(unprocessed_r1)

# Let's check which raw submissions do NOT have any record in round_1_evaluation
r1_ids = {r["id"] for r in r1_list}
missing_r1 = [rid for rid in raw_ids if rid not in r1_ids]
missing_r1_count = len(missing_r1)

print(f"Total Raw Submissions: {total_raw}")
print(f"Total Round 1 Evaluation Records: {total_r1}")
print(f"Unprocessed Round 1 Evaluation Records (blank total and tier): {unprocessed_r1_count}")
print(f"Raw Submissions lacking any Round 1 Evaluation Record: {missing_r1_count}")
for u in unprocessed_r1:
    # Get applicant name from raw_submissions if available
    url = f"{SUPABASE_URL}/rest/v1/raw_submissions?id=eq.{u['id']}&select=full_name"
    name_resp = requests.get(url, headers=headers)
    name = name_resp.json()[0]["full_name"] if name_resp.json() else "Unknown"
    print(f"  Unprocessed R1 ID: {u['id']} | Name: {name}")
