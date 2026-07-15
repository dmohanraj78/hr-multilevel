import os
import re
import shutil

portals = ['master-portal', 'recruiter-portal', 'executive-portal', 'evaluator-portal', 'sso-portal']
base_dir = r"c:\Users\Dhanush\Music\aviatorsclaude"

# 1. Remove Dhanush from access.js
for portal in portals:
    file_path = os.path.join(base_dir, portal, "src", "lib", "access.js")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        if "'dmohanraj@mondee.com': 'Dhanush'" in content:
            content = content.replace("\n  'dmohanraj@mondee.com': 'Dhanush',", "")
            with open(file_path, "w") as f:
                f.write(content)

# 2. Remove Dhanush from CandidateListTable.jsx
for portal in portals:
    file_path = os.path.join(base_dir, portal, "src", "components", "CandidateListTable.jsx")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        if 'value="Dhanush"' in content:
            content = content.replace('\n                          <option value="Dhanush">Dhanush</option>', '')
            with open(file_path, "w") as f:
                f.write(content)

# 3. Remove Dhanush from CandidateProfileDossier.jsx
for portal in portals:
    file_path = os.path.join(base_dir, portal, "src", "components", "CandidateProfileDossier.jsx")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        if "'Dhanush'" in content:
            content = content.replace(", 'Dhanush'", "")
            with open(file_path, "w") as f:
                f.write(content)

# 4. Remove Dhanush from master and recruiter OverallFunnelDashboard.jsx
for portal in ['master-portal', 'recruiter-portal']:
    file_path = os.path.join(base_dir, portal, "src", "components", "OverallFunnelDashboard.jsx")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
        # Reviewers array (only in master-portal)
        content = content.replace(", 'Dhanush'", "")
        # Clans object
        content = content.replace(" Dhanush: 0,", "")
        
        with open(file_path, "w") as f:
            f.write(content)

# 5. Remove Dhanush from evaluator App.jsx
eval_app = os.path.join(base_dir, "evaluator-portal", "src", "App.jsx")
if os.path.exists(eval_app):
    with open(eval_app, "r") as f:
        content = f.read()
    if "'Dhanush'" in content:
        dhanush_clan = ",\n  { id: 'Dhanush', name: 'Dhanush', desc: 'Dhanush\\'s Queue', color: 'border-blue-500/20 hover:border-blue-500/80 bg-blue-500/5' }"
        content = content.replace(dhanush_clan, "")
        with open(eval_app, "w") as f:
            f.write(content)

# 6. Remove Dhanush from master App.jsx
master_app = os.path.join(base_dir, "master-portal", "src", "App.jsx")
if os.path.exists(master_app):
    with open(master_app, "r") as f:
        content = f.read()
    if "'Dhanush'" in content:
        content = content.replace(", 'Dhanush'", "")
        dhanush_style = ",\n    Dhanush: { border: 'border-t-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/5' }"
        content = content.replace(dhanush_style, "")
        with open(master_app, "w") as f:
            f.write(content)

print("Done removing Dhanush from the codebase.")
