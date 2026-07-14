import glob
import re

# Update send_eod_report.py
with open(r'c:\Users\Dhanush\Music\aviatorsclaude\send_eod_report.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"id,verdict"', '"id,final_status"')
content = content.replace('.get("verdict")', '.get("final_status")')

with open(r'c:\Users\Dhanush\Music\aviatorsclaude\send_eod_report.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated send_eod_report.py")

# Update supabase.js files
js_files = glob.glob(r'c:\Users\Dhanush\Music\aviatorsclaude\*\src\lib\supabase.js')
for jf in js_files:
    with open(jf, 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # replace r3Data.verdict with r3Data.final_status
    js_content = js_content.replace('verdict: r3Data.verdict', 'final_status: r3Data.final_status')
    # wait, the candidate object being returned to the frontend should probably also map it?
    # Actually, changing the frontend entirely from .verdict to .final_status everywhere is safer.
    
    with open(jf, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("Updated", jf)
