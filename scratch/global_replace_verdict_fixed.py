import glob
import os

files_to_check = []
folders = ['master-portal/src', 'recruiter-portal/src', 'executive-portal/src', 'evaluator-portal/src']
for folder in folders:
    for root, dirs, files in os.walk(os.path.join(r'c:\Users\Dhanush\Music\aviatorsclaude', folder)):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                files_to_check.append(os.path.join(root, file))

files_to_check.append(r'c:\Users\Dhanush\Music\aviatorsclaude\send_eod_report.py')

for f in files_to_check:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if 'verdict' in content or 'Verdict' in content:
            new_content = content.replace('"id,verdict"', '"id,final_status"')
            new_content = new_content.replace('.get("verdict")', '.get("final_status")')
            new_content = new_content.replace('r3.verdict', 'r3.final_status')
            new_content = new_content.replace('r3Data.verdict', 'r3Data.final_status')
            new_content = new_content.replace('verdict: ', 'final_status: ')
            new_content = new_content.replace('forceVerdict', 'forceFinalStatus')
            new_content = new_content.replace('setVerdict', 'setFinalStatus')
            
            # UI text changes
            new_content = new_content.replace('Pending Verdict:', 'Pending Final Status:')
            new_content = new_content.replace('Declined (Verdict):', 'Declined (Final Status):')
            new_content = new_content.replace('Round 3: Executive Verdict', 'Round 3: Final Status')
            
            if content != new_content:
                with open(f, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print('Updated', f)
    except Exception as e:
        print('Skipped', f, 'error:', e)
