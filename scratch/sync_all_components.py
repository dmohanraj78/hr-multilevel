import shutil
import os

files = ['CandidateListTable.jsx', 'StatsBanner.jsx']
source_dir = r'c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components'
dest_dirs = [
    r'c:\Users\Dhanush\Music\aviatorsclaude\recruiter-portal\src\components',
    r'c:\Users\Dhanush\Music\aviatorsclaude\evaluator-portal\src\components',
    r'c:\Users\Dhanush\Music\aviatorsclaude\executive-portal\src\components'
]

for filename in files:
    src_file = os.path.join(source_dir, filename)
    if not os.path.exists(src_file):
        print(f"Source file {src_file} not found!")
        exit(1)
    
    for dest_dir in dest_dirs:
        os.makedirs(dest_dir, exist_ok=True)
        dest_file = os.path.join(dest_dir, filename)
        shutil.copy2(src_file, dest_file)
        print(f"Copied {filename} to {dest_dir}")
