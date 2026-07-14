import requests

SUPABASE_URL = "https://mujqmdmzloizqhglayxe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Fetch all round_1_evaluation records
print("Fetching round_1_evaluation records from Supabase...")
r_r1 = requests.get(f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=*&limit=3000", headers=headers)
r1_list = r_r1.json()

placeholders = [r for r in r1_list if r.get("total") is None and r.get("tier") is None and r.get("review_cat") is None]
print(f"Found {len(placeholders)} unprocessed placeholder records in round_1_evaluation.")

deleted_count = 0
for p in placeholders:
    del_url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?id=eq.{p['id']}"
    res = requests.delete(del_url, headers=headers)
    if res.status_code in [200, 204]:
        print(f"  Successfully deleted placeholder ID: {p['id']}")
        deleted_count += 1
    else:
        print(f"  Failed to delete ID {p['id']}: {res.text}")

print(f"\nCompleted! Deleted {deleted_count} placeholder records from round_1_evaluation.")
