import os

portals = ['master-portal', 'recruiter-portal', 'evaluator-portal', 'executive-portal']
target_line = '<div className="text-xs text-muted-foreground">{getBio(cand, \'applied_role\') || \'ML Engineer Intern\'}</div>'

for portal in portals:
    table_path = os.path.join(portal, 'src', 'components', 'CandidateListTable.jsx')
    if os.path.exists(table_path):
        with open(table_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove the line (and any leading whitespace/newlines around it)
        new_content = content.replace(target_line, '')
        
        if new_content != content:
            with open(table_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Removed job title from {table_path}")
        else:
            print(f"Could not find target line in {table_path}")
