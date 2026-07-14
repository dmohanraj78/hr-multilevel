import requests

SUPABASE_URL = "https://mujqmdmzloizqhglayxe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Fetch many rows to find all keys
url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=*&limit=100"
resp = requests.get(url, headers=headers)
rows = resp.json()
all_keys = set()
for r in rows:
    all_keys.update(r.keys())

print("All keys in round_1_evaluation database table:")
for k in sorted(all_keys):
    print(f"  {k}")
