import glob

files = glob.glob(r'c:\Users\Dhanush\Music\aviatorsclaude\*\src\components\CandidateListTable.jsx')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace .verdict with .final_status in JS property accesses
    content = content.replace("r3A.verdict", "r3A.final_status")
    content = content.replace("r3B.verdict", "r3B.final_status")
    # r3Parsed?.final_status || r3Parsed?.verdict is already there, but we can just simplify it
    content = content.replace("r3Parsed?.final_status || r3Parsed?.verdict", "r3Parsed?.final_status")
    
    # Replace column header "Status" to "Final Status" for round 3
    # Wait, the user said "Status" column is now called "Final Status".
    # In round 3 table headers:
    content = content.replace("header: 'Status', key: 'verdict'", "header: 'Final Status', key: 'final_status'")
    content = content.replace("header: 'Final Verdict', key: 'final_status'", "header: 'Final Status', key: 'final_status'")
    content = content.replace("header: 'Status', key: 'final_status'", "header: 'Final Status', key: 'final_status'")

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

# Now fix the missing Contact Status in executive portal R2 table
exec_table = r'c:\Users\Dhanush\Music\aviatorsclaude\executive-portal\src\components\CandidateListTable.jsx'
with open(exec_table, 'r', encoding='utf-8') as file:
    content = file.read()

# Check if Contact Status is missing in R2 columns
if "header: 'Contact Status'" not in content:
    content = content.replace(
        "{ header: 'Decision', key: 'r2decision', width: 14 }",
        "{ header: 'Contact Status', key: 'contact_status', width: 15 },\n      { header: 'Decision', key: 'r2decision', width: 14 }"
    )
    with open(exec_table, 'w', encoding='utf-8') as file:
        file.write(content)
