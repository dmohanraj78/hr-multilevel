import os

files = {
    'master': r'c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\CandidateListTable.jsx',
    'evaluator': r'c:\Users\Dhanush\Music\aviatorsclaude\evaluator-portal\src\components\CandidateListTable.jsx',
    'executive': r'c:\Users\Dhanush\Music\aviatorsclaude\executive-portal\src\components\CandidateListTable.jsx',
    'recruiter': r'c:\Users\Dhanush\Music\aviatorsclaude\recruiter-portal\src\components\CandidateListTable.jsx'
}

for name, path in files.items():
    if not os.path.exists(path):
        print(f"{name} does not exist!")
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    print(f"=== {name} ({len(content)} bytes) ===")
    # Print imports
    imports = [line.strip() for line in content.split('\n') if line.startswith('import ')][:5]
    print("  Imports:", ", ".join(imports))
    # Print export signature
    sig = [line.strip() for line in content.split('\n') if 'export default function' in line]
    print("  Signature:", sig)
    # Check theme color (search for primary vs #800020)
    has_wine = '#800020' in content
    has_primary = 'primary' in content
    print(f"  Theme: Wine={has_wine}, Primary={has_primary}")
