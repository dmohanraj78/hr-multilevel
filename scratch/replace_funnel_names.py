import glob

files = glob.glob('*-portal/src/components/OverallFunnelDashboard.jsx')

old_clans = 'const clans = { Dharti: 0, Jal: 0, Agni: 0, Vayu: 0, Akash: 0, Bijli: 0, Unassigned: 0 };'
new_clans = "const clans = { Tejaswini: 0, Sohan: 0, Basvaraj: 0, Pushkaraj: 0, Akash: 0, Anmol: 0, Sachin: 0, 'Akhil L': 0, Vedant: 0, 'Akhil M': 0, Samit: 0, Snehanshu: 0, Ankita: 0, Kaushik: 0, Unassigned: 0 };"

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    content = content.replace(old_clans, new_clans)
    
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
    else:
        print(f'No changes for {filepath}')
