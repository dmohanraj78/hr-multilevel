import requests
import json

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Fetch the first candidate
r = requests.get(f'{SUPABASE_URL}/rest/v1/raw_submissions?limit=1', headers=headers)
if r.status_code == 200:
    row = r.json()[0]
    print("Database columns and values:")
    for k, v in sorted(row.items()):
        print(f"  {k}: {repr(v)}")
else:
    print("Error:", r.status_code, r.text)
