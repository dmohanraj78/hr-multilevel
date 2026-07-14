import requests
import json

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?app_status=eq.Pending&limit=3"
r = requests.get(url, headers=headers)
if r.status_code == 200:
    data = r.json()
    print("Sample Pending Candidates from DB:")
    for row in data:
        print(f"\nID: {row.get('id')}")
        print(f"  Gender: {row.get('gender')}")
        print(f"  Graduation: {row.get('graduation')}")
        print(f"  College: {row.get('college')}")
        print(f"  Review Comments: {row.get('review_comments')}")
        print(f"  Total Score: {row.get('total')}")
else:
    print("Error:", r.status_code, r.text)
