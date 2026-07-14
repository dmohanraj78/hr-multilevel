import requests
import re
from collections import Counter

SUPABASE_URL = "https://mujqmdmzloizqhglayxe.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

def norm_phone(p):
    if not p: return ''
    p = re.sub(r'[^0-9]', '', str(p))
    if p.startswith('91') and len(p) > 10: p = p[2:]
    if p.startswith('0') and len(p) > 10: p = p[1:]
    val = p[-10:] if len(p) >= 10 else p
    if val in ['', '0000000000', '9999999999', '1234567890']:
        return ''
    return val

def norm_github(g):
    if not g: return ''
    g = str(g).lower().strip().rstrip('/')
    g = re.sub(r'^https?://(www\.)?github\.com/', '', g)
    g = re.sub(r'^https?://(www\.)?', '', g)
    g = g.split('?')[0].rstrip('/')
    if g in ['', 'github.com', 'na', 'none', 'url.com', 'http', 'https']:
        return ''
    return g

def norm_email(e):
    if not e: return ''
    e = str(e).strip().lower()
    if e in ['', 'na', 'none', 'email@email.com']:
        return ''
    return e

def norm_name(n):
    if not n: return ''
    return re.sub(r'\s+', ' ', str(n).strip().lower())

def audit_r1():
    print("Fetching round_1_evaluation records from Supabase...")
    url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=*,raw_submissions(*)&limit=3000"
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return
    rows = resp.json()
    print(f"Total round_1_evaluation records fetched: {len(rows)}")

    # Group by candidates details
    groups = {}  # leader_id -> list of rows
    row_by_id = {r['id']: r for r in rows}
    
    for r1 in rows:
        rid = r1['id']
        raw = r1.get('raw_submissions') or {}
        if isinstance(raw, list):
            raw = raw[0] if raw else {}
            
        email = norm_email(raw.get('email'))
        phone = norm_phone(raw.get('phone'))
        github = norm_github(raw.get('github_url'))
        name = norm_name(raw.get('full_name'))
        
        found_leader = None
        for leader_id, group_rows in groups.items():
            for gr1 in group_rows:
                graw = gr1.get('raw_submissions') or {}
                if isinstance(graw, list):
                    graw = graw[0] if graw else {}
                ge = norm_email(graw.get('email'))
                gp = norm_phone(graw.get('phone'))
                gg = norm_github(graw.get('github_url'))
                gn = norm_name(graw.get('full_name'))
                
                # Matching conditions
                if (email and ge and email == ge) or \
                   (phone and gp and len(phone) >= 10 and phone == gp) or \
                   (github and gg and len(github) > 2 and github == gg) or \
                   (name and gn and name == gn):
                    found_leader = leader_id
                    break
            if found_leader:
                break
                
        if found_leader:
            groups[found_leader].append(r1)
        else:
            groups[rid] = [r1]

    # Analyze duplicate groups
    dup_groups = {k: v for k, v in groups.items() if len(v) > 1}
    total_duplicates = sum(len(v) - 1 for v in dup_groups.values())

    print("\n==================================================")
    print("      ROUND 1 EVALUATION DUPLICATE AUDIT REPORT    ")
    print("==================================================")
    print(f"Total Evaluation Records:      {len(rows)}")
    print(f"Unique Evaluated Candidates:   {len(groups)}")
    print(f"Total Duplicate Rows in R1:    {total_duplicates}")
    print(f"Number of Duplicate Groups:    {len(dup_groups)}")
    print("==================================================\n")

    if dup_groups:
        print("List of Duplicate Groups in round_1_evaluation:")
        group_num = 1
        for leader_id, group_rows in sorted(dup_groups.items(), key=lambda x: len(x[1]), reverse=True):
            print(f"\nGroup #{group_num} (Leader ID: {leader_id}, Count: {len(group_rows)}):")
            for i, r1 in enumerate(group_rows):
                raw = r1.get('raw_submissions') or {}
                if isinstance(raw, list): raw = raw[0] if raw else {}
                print(f"  {i+1}. ID: {r1['id']} | Name: {raw.get('full_name')} | Email: {raw.get('email')} | Tier: {r1.get('tier')} | Total Score: {r1.get('total')} | Status: {r1.get('app_status')}")
            group_num += 1
    else:
        print("No duplicate evaluated candidates found in round_1_evaluation!")

if __name__ == '__main__':
    audit_r1()
