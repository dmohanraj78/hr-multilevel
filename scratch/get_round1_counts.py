import requests
from collections import Counter

SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}'
}

# Fetch all records from round_1_evaluation
url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation"
r = requests.get(url, headers=headers)
if r.status_code == 200:
    data = r.json()
    print(f"Total round_1_evaluation records in database: {len(data)}")
    
    statuses = [str(row.get('app_status') or 'Pending/Empty').strip() for row in data]
    counts = Counter(statuses)
    
    print("\nStatus counts:")
    for status, count in sorted(counts.items()):
        print(f"  {status}: {count}")
        
    # Also fetch all raw_submissions to see how many total applications we have
    r_raw = requests.get(f"{SUPABASE_URL}/rest/v1/raw_submissions?select=id", headers=headers)
    if r_raw.status_code == 200:
        total_raw = len(r_raw.json())
        print(f"\nTotal raw submissions (applications): {total_raw}")
        print(f"Pending initial screening (not yet in round_1_evaluation): {total_raw - len(data)}")
    else:
        print("Failed to fetch raw submissions:", r_raw.status_code)
else:
    print("Failed to fetch round_1_evaluation:", r_status_code, r.text)
