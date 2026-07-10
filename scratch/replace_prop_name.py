import glob

files = glob.glob('*-portal/src/components/CandidateListTable.jsx')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    
    content = content.replace('showClanFilter', 'showTechEvaluatorFilter')
    
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
    else:
        print(f'No changes for {filepath}')
