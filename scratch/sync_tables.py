import shutil
import os

source = r'c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\CandidateListTable.jsx'
destinations = [
    r'c:\Users\Dhanush\Music\aviatorsclaude\recruiter-portal\src\components\CandidateListTable.jsx',
    r'c:\Users\Dhanush\Music\aviatorsclaude\evaluator-portal\src\components\CandidateListTable.jsx',
    r'c:\Users\Dhanush\Music\aviatorsclaude\executive-portal\src\components\CandidateListTable.jsx'
]

if not os.path.exists(source):
    print("Source file not found!")
    exit(1)

for dest in destinations:
    # Ensure destination directory exists
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(source, dest)
    print(f"Copied to {dest}")
