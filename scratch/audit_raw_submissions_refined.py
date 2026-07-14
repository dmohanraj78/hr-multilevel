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
    # Ignore placeholders like all zeros or all nines
    if val in ['', '0000000000', '9999999999', '1234567890']:
        return ''
    return val

def norm_github(g):
    if not g: return ''
    g = str(g).lower().strip().rstrip('/')
    # Remove leading protocols
    g = re.sub(r'^https?://(www\.)?github\.com/', '', g)
    g = re.sub(r'^https?://(www\.)?', '', g)
    g = g.split('?')[0].rstrip('/')
    # Ignore placeholders
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

def audit():
    print("Fetching raw_submissions records from Supabase...")
    url = f"{SUPABASE_URL}/rest/v1/raw_submissions?select=id,full_name,email,phone,github_url,submission_date&limit=3000"
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        return
    rows = resp.json()
    total_raw = len(rows)
    print(f"Total raw submissions fetched: {total_raw}")

    # Build duplicate groups
    groups = {}  # leader_id -> list of rows
    row_by_id = {r['id']: r for r in rows}
    
    for row in rows:
        rid = row['id']
        email = norm_email(row.get('email'))
        phone = norm_phone(row.get('phone'))
        github = norm_github(row.get('github_url'))
        name = norm_name(row.get('full_name'))
        
        found_leader = None
        for leader_id, group_rows in groups.items():
            for gr in group_rows:
                ge = norm_email(gr.get('email'))
                gp = norm_phone(gr.get('phone'))
                gg = norm_github(gr.get('github_url'))
                gn = norm_name(gr.get('full_name'))
                
                # Matching conditions (only matching if the normalized values are not empty)
                if (email and ge and email == ge) or \
                   (phone and gp and len(phone) >= 10 and phone == gp) or \
                   (github and gg and len(github) > 2 and github == gg) or \
                   (name and gn and name == gn):
                    found_leader = leader_id
                    break
            if found_leader:
                break
                
        if found_leader:
            groups[found_leader].append(row)
        else:
            groups[rid] = [row]

    # Analyze duplicate groups
    dup_groups = {k: v for k, v in groups.items() if len(v) > 1}
    unique_applicants = len(groups)
    total_duplicates = sum(len(v) - 1 for v in dup_groups.values())

    print("\n==================================================")
    print("             RAW SUBMISSIONS AUDIT REPORT          ")
    print("==================================================")
    print(f"Total Raw Submissions:         {total_raw}")
    print(f"Unique Applicants:             {unique_applicants}")
    print(f"Total Duplicate Rows:          {total_duplicates}")
    print(f"Number of Duplicate Groups:    {len(dup_groups)}")
    print("==================================================\n")

    print("List of Duplicate Groups:")
    group_num = 1
    for leader_id, group_rows in sorted(dup_groups.items(), key=lambda x: len(x[1]), reverse=True):
        leader_row = row_by_id[leader_id]
        print(f"\nGroup #{group_num} (Leader ID: {leader_id}, Count: {len(group_rows)} submissions):")
        for i, gr in enumerate(group_rows):
            print(f"  {i+1}. ID: {gr['id']} | Name: {gr['full_name']} | Email: {gr['email']} | Phone: {gr.get('phone')} | GitHub: {gr.get('github_url')} | Date: {gr.get('submission_date')}")
        group_num += 1

if __name__ == '__main__':
    audit()
