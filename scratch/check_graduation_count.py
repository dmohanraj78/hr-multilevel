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

# Deduplicate
map_candidates = {}
for c in candidates:
    pk = c.get('id') or c.get('Applicant_ID') or c.get('applicant_id') or c.get('email')
    
    r1 = c.get('round_1_evaluation') or {}
    if isinstance(r1, list):
        r1 = r1[0] if r1 else {}
        
    is_duplicate = r1.get('app_status') == 'Duplicate'
    
    if pk not in map_candidates:
        map_candidates[pk] = c
    else:
        existing_r1 = map_candidates[pk].get('round_1_evaluation') or {}
        if isinstance(existing_r1, list):
            existing_r1 = existing_r1[0] if existing_r1 else {}
        if not is_duplicate and existing_r1.get('app_status') == 'Duplicate':
            map_candidates[pk] = c

deduped = list(map_candidates.values())

total_all = 0
for c in deduped:
    r1 = c.get('round_1_evaluation') or {}
    if isinstance(r1, list):
        r1 = r1[0] if r1 else {}
        
    app_status = r1.get('app_status')
    
    if app_status == 'Duplicate':
        continue
        
    reviewer = r1.get('eval_group')
    if reviewer == 'None' or not reviewer:
        reviewer = 'Unassigned'
        
    if reviewer == 'Unassigned':
        continue
        
    r2 = c.get('round_2_evaluation') or {}
    if isinstance(r2, list):
        r2 = r2[0] if r2 else {}
        
    moved = r2.get('moved_to_round_3', '')
    if moved.endswith('_draft'):
        continue
        
    total_all += 1

print(f"Total deduplicated candidates: {len(deduped)}")
print(f"Total after duplicate and unassigned filter (Decision=All): {total_all}")
