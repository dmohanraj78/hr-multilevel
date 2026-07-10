import glob

files = glob.glob('*-portal/src/components/CandidateListTable.jsx')
reviewers = [
    'Tejaswini', 'Sohan', 'Basvaraj', 'Pushkaraj', 'Akash', 'Anmol',
    'Sachin', 'Akhil L', 'Vedant', 'Akhil M', 'Samit', 'Snehanshu',
    'Ankita', 'Kaushik'
]

options_lines = ['<option value="None">None</option>']
for name in reviewers:
    options_lines.append(f'                            <option value="{name}">{name}</option>')
options_str = '\n'.join(options_lines)

old_options = """                            <option value="None">None</option>
                            <option value="Dharti">Dharti</option>
                            <option value="Jal">Jal</option>
                            <option value="Agni">Agni</option>
                            <option value="Vayu">Vayu</option>
                            <option value="Akash">Akash</option>
                            <option value="Bijli">Bijli</option>"""

new_options = options_str

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    
    # Replace onUpdateClan parameter and handler
    content = content.replace('onUpdateClan', 'onUpdateTechEvaluator')
    
    # Replace options
    content = content.replace(old_options, '                            ' + new_options)
    
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
    else:
        print(f'No changes for {filepath}')
