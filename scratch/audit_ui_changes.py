import os
import glob
import re

PORTALS = ['master-portal', 'recruiter-portal', 'evaluator-portal', 'executive-portal']
BASE_DIR = r'c:\Users\Dhanush\Music\aviatorsclaude'

def check_string_in_file(filepath, strings_to_find, strings_to_not_find=[]):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for s in strings_to_find:
        if s not in content:
            print(f"MISSING '{s[:30]}...' in {filepath}")
    
    for s in strings_to_not_find:
        if s in content:
            print(f"FOUND PROHIBITED '{s}' in {filepath}")

print("--- AUDIT START ---")

# 1. Tier Relabelling & 2. Subtitle Update & 3. 5-Card Dashboard & 4. Overview Cards & 8. Database References
for p in PORTALS:
    dashboard = os.path.join(BASE_DIR, p, 'src', 'components', 'OverallFunnelDashboard.jsx')
    if os.path.exists(dashboard):
        # Tiers
        check_string_in_file(dashboard, ["Tier 1-", "Tier 2-"], ["Tier 1+", "Tier 2+", "TIER 1+", "TIER 2+"])
        
        # Subtitle
        check_string_in_file(dashboard, ["Application Pending review rubric"])
        
        # Overview Cards: HR Approved / Moved to round 2
        # It should be in master and executive portals that have the overview dashboard
        if p == 'master-portal':
            check_string_in_file(dashboard, ["HR Approved", "Moved to round 2"])

    stats_banner = os.path.join(BASE_DIR, p, 'src', 'components', 'StatsBanner.jsx')
    if os.path.exists(stats_banner):
        # 5-card dashboard is only for round 1.
        if p in ['master-portal', 'recruiter-portal']:
            check_string_in_file(stats_banner, [
                "Applications Reviewed",
                "HR Round Cleared",
                "Pending for manual review from Tier 1, Tier 1-, Tier 2 and Tier 2-",
                "Rejected",
                "Pending Applications from Tier 3 and Tier 4"
            ])

# 5. Round 2 Tables (Contact Status, Decision)
for p in ['master-portal', 'evaluator-portal', 'executive-portal']: # Executive portal has R2 table?
    table = os.path.join(BASE_DIR, p, 'src', 'components', 'CandidateListTable.jsx')
    if os.path.exists(table):
        # In master portal, check if contact_status is in R2
        with open(table, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'Contact Status' not in content:
                print(f"MISSING 'Contact Status' in {table}")
            
# 6. Round 3 Tables (TR Decision, Final Status, tighter spacing)
for p in ['master-portal', 'executive-portal']:
    table = os.path.join(BASE_DIR, p, 'src', 'components', 'CandidateListTable.jsx')
    if os.path.exists(table):
        check_string_in_file(table, ["TR Decision", "Final Status"], ["verdict"])
        
# 7. Dropdown Fix: "Declined" option removed
for p in PORTALS:
    dossier = os.path.join(BASE_DIR, p, 'src', 'components', 'CandidateProfileDossier.jsx')
    if os.path.exists(dossier):
        with open(dossier, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'value="Declined"' in content or 'value="declined"' in content:
                print(f"FOUND PROHIBITED 'Declined' option in {dossier}")

# 8. Database References (final_status instead of verdict)
backend_files = [
    'send_eod_report.py', 
    'master-portal/src/lib/supabase.js',
    'executive-portal/src/lib/supabase.js',
    'evaluator-portal/src/lib/supabase.js'
]
for bf in backend_files:
    filepath = os.path.join(BASE_DIR, bf)
    if os.path.exists(filepath):
        check_string_in_file(filepath, ["final_status"], ["verdict"])

print("--- AUDIT END ---")
