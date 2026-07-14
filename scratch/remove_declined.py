import glob

files = glob.glob(r'c:\Users\Dhanush\Music\aviatorsclaude\*\src\components\CandidateProfileDossier.jsx')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    target = '<SelectItem value="Declined">Declined</SelectItem>'
    if target in content:
        print('Found in', f)
        new_content = content.replace(target, '')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print('Removed from', f)
