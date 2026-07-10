import urllib.request
import json

url = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/round_1_evaluation?select=*'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

req = urllib.request.Request(
    url,
    headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    }
)

with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode())

eval_groups = {}
for item in data:
    status = item.get('app_status')
    if status == 'Yes':
        grp = item.get('eval_group') or 'Unassigned'
        eval_groups[grp] = eval_groups.get(grp, 0) + 1

print("Active R2 Candidate Counts by Evaluator:")
for grp, count in sorted(eval_groups.items()):
    print(f"  {grp}: {count}")
