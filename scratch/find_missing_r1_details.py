import requests

SUPABASE_URL = "https://mujqmdmzloizqhglayxe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Fetch all raw submissions
r_raw = requests.get(f"{SUPABASE_URL}/rest/v1/raw_submissions?select=id,full_name,email,phone,github_url&limit=3000", headers=headers)
raw_list = r_raw.json()

# Fetch all round_1_evaluation records
r_r1 = requests.get(f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=id&limit=3000", headers=headers)
r1_ids = {r["id"] for r in r_r1.json()}

missing_r1 = [raw for raw in raw_list if raw["id"] not in r1_ids]

print(f"Total raw submissions lacking R1 record: {len(missing_r1)}")
print("\nFirst 10 missing R1 submissions:")
for gr in missing_r1[:20]:
    print(f"  ID: {gr['id']} | Name: {gr['full_name']} | Email: {gr['email']}")

# Let's count how many of these missing R1 submissions have ANOTHER raw submission that DOES have an R1 record
# (i.e. they are duplicate submissions whose R1 record was deleted, but the main submission was kept)
duplicate_deleted = 0
not_a_duplicate = 0
for m in missing_r1:
    # Search for other raw submissions with same email or phone or github
    others = [r for r in raw_list if r["id"] != m["id"] and r["id"] in r1_ids and (
        (m["email"] and r["email"] and m["email"].lower() == r["email"].lower()) or
        (m["full_name"] and r["full_name"] and m["full_name"].lower() == r["full_name"].lower())
    )]
    if others:
        duplicate_deleted += 1
    else:
        not_a_duplicate += 1
        print(f"  NOT A DUPLICATE missing R1: ID {m['id']} | Name: {m['full_name']} | Email: {m['email']}")

print(f"\nOf the {len(missing_r1)} missing R1 submissions:")
print(f"  - Duplicate submissions of evaluated candidates: {duplicate_deleted}")
print(f"  - True missing R1 records (not duplicates): {not_a_duplicate}")
