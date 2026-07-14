import glob

files = glob.glob(r'c:\Users\Dhanush\Music\aviatorsclaude\*\src\components\OverallFunnelDashboard.jsx')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Fix the broken syntax
    content = content.replace("r1.app_(status === 'Reject' || status === 'No')", "(r1.app_status === 'Reject' || r1.app_status === 'No')")
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print('Fixed', f)
