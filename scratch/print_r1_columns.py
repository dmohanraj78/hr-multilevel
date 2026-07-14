import requests
import json

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?limit=1"
r = requests.get(url, headers=headers)
if r.status_code == 200:
    data = r.json()
    if data:
        print("Round 1 Evaluation Columns & Types:")
        print(json.dumps(data[0], indent=2))
    else:
        print("No rows found")
else:
    print("Error:", r.status_code, r.text)
