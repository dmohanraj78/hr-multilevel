import glob

files = glob.glob(r'c:\Users\Dhanush\Music\aviatorsclaude\*\src\components\OverallFunnelDashboard.jsx')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Update status === 'Reject'
    content = content.replace("status === 'Reject'", "(status === 'Reject' || status === 'No')")
    
    # 2. Update r1.app_status === 'Reject'
    content = content.replace("r1.app_status === 'Reject'", "(r1.app_status === 'Reject' || r1.app_status === 'No')")

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print('Updated', f)

# Also check StatsBanner.jsx just in case (though we updated StatsBanner.jsx earlier to handle 'No')
