import glob
import os

files_to_check = []
for root, dirs, files in os.walk(r'c:\Users\Dhanush\Music\aviatorsclaude'):
    if 'node_modules' in root or '.git' in root or '.next' in root or 'dist' in root:
        continue
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js') or file.endswith('.py'):
            files_to_check.append(os.path.join(root, file))

for f in files_to_check:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'verdict' in content or 'Verdict' in content:
        # For python scripts like send_eod_report
        new_content = content.replace('"id,verdict"', '"id,final_status"')
        new_content = new_content.replace('.get("verdict")', '.get("final_status")')
        new_content = new_content.replace('r3.verdict', 'r3.final_status')
        new_content = new_content.replace('r3Data.verdict', 'r3Data.final_status')
        new_content = new_content.replace('verdict: ', 'final_status: ')
        new_content = new_content.replace('forceVerdict', 'forceFinalStatus')
        new_content = new_content.replace('setVerdict', 'setFinalStatus')
        
        # UI string replacements
        new_content = new_content.replace('Pending Verdict:', 'Pending Final Status:')
        new_content = new_content.replace('Declined (Verdict):', 'Declined (Final Status):')
        new_content = new_content.replace('Round 3: Executive Verdict', 'Round 3: Final Status')
        
        if content != new_content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print("Updated", f)
