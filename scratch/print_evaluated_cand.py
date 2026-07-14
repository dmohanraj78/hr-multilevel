import requests

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Fetch candidates with Yes or Reject from round_1_evaluation
url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?app_status=in.(Yes,Reject)&limit=5"
r = requests.get(url, headers=headers)
if r.status_code == 200:
    data = r.json()
    print(f"Sample evaluated candidates from DB (count={len(data)}):")
    for row in data:
        print(f"\nID: {row.get('id')}")
        print(f"  Status: {row.get('app_status')}")
        print(f"  Review Comments: {row.get('review_comments')}")
        print(f"  Interview Priority: {row.get('r1_interview_priority')}")
        print(f"  Eval Group (Screener): {row.get('eval_group')}")
else:
    print("Error:", r.status_code, r.text)
