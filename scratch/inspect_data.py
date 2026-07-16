import json
from supabase import create_client

with open(r'c:\Users\Dhanush\Music\aviatorsclaude\.env', 'r') as f:
    env_content = f.read()

supabase_url = ""
supabase_key = ""
for line in env_content.splitlines():
    if line.startswith("VITE_SUPABASE_URL"):
        supabase_url = line.split("=")[1].strip().strip('"').strip("'")
    if line.startswith("VITE_SUPABASE_ANON_KEY"):
        supabase_key = line.split("=")[1].strip().strip('"').strip("'")

supabase = create_client(supabase_url, supabase_key)
res = supabase.table('candidates').select('*').execute()
candidates = res.data

locations = []
rubrics = []
for c in candidates:
    r1 = c.get('round_1_evaluation') or {}
    if isinstance(r1, list):
        r1 = r1[0] if r1 else {}
        
    r2 = c.get('round_2_evaluation') or {}
    if isinstance(r2, list):
        r2 = r2[0] if r2 else {}
        
    # check location
    loc = c.get('location') or c.get('Location') or r1.get('location') or r1.get('Location')
    locations.append(loc)
    
    # check rubrics
    # is there a rubric field in c, r1, or r2?
    keys = list(c.keys()) + list(r1.keys()) + list(r2.keys())
    rubric_keys = [k for k in keys if 'rubric' in k.lower()]
    for rk in rubric_keys:
        if rk in c: rubrics.append(c[rk])
        if rk in r1: rubrics.append(r1[rk])
        if rk in r2: rubrics.append(r2[rk])
        
    # Maybe "feedback" or "reason"?
    reason = r1.get('reason_for_status') or r1.get('reason')
    if reason:
        rubrics.append(reason)

from collections import Counter
print("Locations:")
for k, v in Counter(locations).most_common(20):
    print(f"{k}: {v}")
    
print("\nRubrics/Reasons:")
for k, v in Counter(rubrics).most_common(20):
    print(f"{k}: {v}")
