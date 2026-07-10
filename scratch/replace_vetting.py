import os
import re

def update_loading_and_wording(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Update loading conditional
    if 'master-portal' in filepath:
        content = content.replace("loading ? (", "loading && globalData.length === 0 ? (")
    else:
        content = content.replace("loading ? (", "loading && candidates.length === 0 ? (")

    # 2. Case-sensitive replacements for wording
    # Case 1: Vetted -> Reviewed
    content = content.replace("Vetted", "Reviewed")
    content = content.replace("vetted", "reviewed")

    # Case 2: Vetting -> Review
    content = content.replace("Vetting", "Review")
    content = content.replace("vetting", "review")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

# Walk all portals
portals = ['master-portal', 'recruiter-portal', 'evaluator-portal', 'executive-portal']
for portal in portals:
    for root, dirs, files in os.walk(os.path.join(portal, 'src')):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                update_loading_and_wording(os.path.join(root, file))

# Also check root files like index.html
html_path = 'index.html'
if os.path.exists(html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("Vetted", "Reviewed")
    content = content.replace("vetted", "reviewed")
    content = content.replace("Vetting", "Review")
    content = content.replace("vetting", "review")
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated root {html_path}")
