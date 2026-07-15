import urllib.request
import json
from collections import Counter

url = 'https://mujqmdmzloizqhglayxe.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

req = urllib.request.Request(
    f"{url}/rest/v1/round_1_evaluation?select=id,app_status,tier,review_comments",
    headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    }
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))

print("Total rows in round_1_evaluation:", len(data))

# Distribution of app_status
status_counter = Counter(row.get('app_status') for row in data)
print("\napp_status distribution:")
for status, count in status_counter.items():
    print(f"  {status}: {count}")

# Distribution of tier
tier_counter = Counter(row.get('tier') for row in data)
print("\ntier distribution:")
for tier, count in tier_counter.items():
    print(f"  {tier}: {count}")

# Check comments status
comment_not_empty = sum(1 for row in data if row.get('review_comments') and str(row.get('review_comments')).strip())
print("\ncomment_not_empty count:", comment_not_empty)
