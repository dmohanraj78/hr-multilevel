import glob

files = glob.glob(r'c:\Users\Dhanush\Music\aviatorsclaude\*\src\components\OverallFunnelDashboard.jsx')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Update tiers object
    content = content.replace(
        "const tiers = { 'Tier 1-': 0, 'Tier 1': 0, 'Tier 2-': 0, 'Tier 2': 0, 'Tier 3': 0, 'Tier 4': 0 };",
        "const tiers = { 'Tier 1': 0, 'Tier 1-': 0, 'Tier 2': 0, 'Tier 2-': 0, 'Tier 3': 0, 'Tier 4': 0 };"
    )
    
    # 2. Update TIER_FULL object
    content = content.replace(
        "const TIER_FULL = { 'T1-': 'Tier 1-', 'T1': 'Tier 1', 'T2-': 'Tier 2-', 'T2': 'Tier 2', 'T3': 'Tier 3', 'T4': 'Tier 4' };",
        "const TIER_FULL = { 'T1': 'Tier 1', 'T1-': 'Tier 1-', 'T2': 'Tier 2', 'T2-': 'Tier 2-', 'T3': 'Tier 3', 'T4': 'Tier 4' };"
    )

    # 3. We also need to check the statsLabels array in case it is misordered there (Wait, we checked and it was correct: "Tier 1", "Tier 1-").
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print('Updated', f)

# Also check CandidateListTable headers, dropdowns, etc?
# The user specifically mentioned "Candidate Tiers on Overview and stats of master portal and Recruiter portal"
