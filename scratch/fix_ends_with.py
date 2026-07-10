import os

portals = ['master-portal', 'recruiter-portal']

for portal in portals:
    filepath = os.path.join(portal, 'src', 'components', 'OverallFunnelDashboard.jsx')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Add typeof check
        target = "return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');"
        replacement = "return m && typeof m === 'string' && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');"
        
        content = content.replace(target, replacement)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed endsWith check in {filepath}")
