import urllib.request
import json

# Supabase details
url = 'https://mujqmdmzloizqhglayxe.supabase.co/rest/v1/round_1_evaluation'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'

# Step 1: Fetch candidates with app_status = 'Yes'
req_url = f"{url}?app_status=eq.Yes&select=id,eval_group"
req = urllib.request.Request(
    req_url,
    headers={
        'apikey': key,
        'Authorization': f'Bearer {key}'
    }
)

try:
    with urllib.request.urlopen(req) as response:
        candidates = json.loads(response.read().decode())
except Exception as e:
    print(f"Error fetching candidates: {e}")
    exit(1)

# Count current Sohan candidates
sohan_cands = [c for c in candidates if c.get('eval_group') == 'Sohan']
print(f"Current candidates assigned to Sohan: {len(sohan_cands)}")

if len(sohan_cands) >= 17:
    print("Sohan already has 17 or more candidates assigned!")
    exit(0)

needed = 17 - len(sohan_cands)
print(f"Need to assign {needed} more candidate(s) to Sohan...")

# Find candidates that are assigned to others (e.g. from groups with 17 or 16) or unassigned
other_cands = [c for c in candidates if c.get('eval_group') != 'Sohan']

if len(other_cands) < needed:
    print("Not enough candidates available to assign!")
    exit(1)

assigned_count = 0
for cand in other_cands:
    if assigned_count >= needed:
        break
    
    cand_id = cand['id']
    old_group = cand.get('eval_group')
    
    # Update candidate to Sohan
    update_url = f"{url}?id=eq.{cand_id}"
    update_data = json.dumps({'eval_group': 'Sohan'}).encode('utf-8')
    
    update_req = urllib.request.Request(
        update_url,
        data=update_data,
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        method='PATCH'
    )
    
    try:
        with urllib.request.urlopen(update_req) as resp:
            print(f"Successfully reassigned Candidate ID {cand_id} from '{old_group}' to 'Sohan'")
            assigned_count += 1
    except Exception as e:
        print(f"Failed to update candidate {cand_id}: {e}")

print(f"Successfully assigned {assigned_count} candidates to Sohan. Total should now be 17.")
