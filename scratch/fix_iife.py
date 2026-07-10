import os

portals = ['master-portal', 'recruiter-portal']

for portal in portals:
    filepath = os.path.join(portal, 'src', 'components', 'OverallFunnelDashboard.jsx')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the mapping end with closed IIFE syntax
        target = """              </div>
            ))}"""
        
        replacement = """              </div>
            ))})()}"""
        
        content = content.replace(target, replacement)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed IIFE syntax in {filepath}")
