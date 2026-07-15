import difflib

def diff_files(file1, file2, name):
    with open(file1, 'r', encoding='utf-8') as f:
        f1_lines = f.readlines()
    with open(file2, 'r', encoding='utf-8') as f:
        f2_lines = f.readlines()
    
    diff = list(difflib.unified_diff(f1_lines, f2_lines, fromfile=file1, tofile=file2, n=1))
    print(f"\n=== DIFF FOR {name} ===")
    for line in diff[:30]:
        print(line.strip())
    if len(diff) > 30:
        print(f"... ({len(diff) - 30} lines truncated) ...")

master = r'c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\CandidateListTable.jsx'
evaluator = r'c:\Users\Dhanush\Music\aviatorsclaude\evaluator-portal\src\components\CandidateListTable.jsx'
executive = r'c:\Users\Dhanush\Music\aviatorsclaude\executive-portal\src\components\CandidateListTable.jsx'

diff_files(master, evaluator, 'EVALUATOR')
diff_files(master, executive, 'EXECUTIVE')
