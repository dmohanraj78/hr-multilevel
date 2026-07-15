import asyncio
from supabase import create_client

url = 'https://mujqmdmzloizqhglayxe.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

supabase = create_client(url, key)

res = supabase.table('round_1_evaluation').select('*').eq('app_status', 'Yes').execute()
data = res.data

print("Total R2 candidates count:", len(data))
eval_groups = {}
for r in data:
    g = r.get('eval_group')
    eval_groups[g] = eval_groups.get(g, 0) + 1

print("eval_group distribution:")
for g, count in eval_groups.items():
    print(f"  {g}: {count}")
