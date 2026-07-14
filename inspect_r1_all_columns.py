import requests

SUPABASE_URL = "https://mujqmdmzloizqhglayxe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=*&limit=1"
resp = requests.get(url, headers=headers)
if resp.status_code == 200:
    rows = resp.json()
    if rows:
        print("Columns in round_1_evaluation:")
        for k in sorted(rows[0].keys()):
            print(f"  {k}: {rows[0][k]}")
else:
    print("Error:", resp.text)
