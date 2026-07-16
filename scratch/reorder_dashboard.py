import re
import os

filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Tabs in Dashboard
content = content.replace("const [activeTab, setActiveTab] = useState('dashboard');\n  ", "")
content = content.replace("import RubricsView from './RubricsView';\n", "")

tabs_jsx_pattern = r"\{\/\* Tabs \*\/\}.*?<\/div>.*?\{\/\* Summary Stats Banner \*\/\}"
content = re.sub(tabs_jsx_pattern, "{/* Summary Stats Banner */}", content, flags=re.DOTALL)

active_tab_cond_start = r"\{activeTab === 'rubrics' \? \(\s*<RubricsView \/>\s*\) : \(\s*<div className=\"flex flex-col items-center w-full px-4 md:px-8 pb-12 animate-in fade-in duration-500\">"
content = re.sub(active_tab_cond_start, "<div className=\"flex flex-col items-center w-full px-4 md:px-8 pb-12 animate-in fade-in duration-500\">", content, flags=re.DOTALL)

end_pattern = r"<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}\s*export default OverallFunnelDashboard;"
content = re.sub(end_pattern, "</div>\n    </div>\n  );\n}\n\nexport default OverallFunnelDashboard;", content, flags=re.DOTALL)


# 2. Extract and Fix Tables
# We need to find the JSX blocks for all the tables and reorder them.

# Let's extract the blocks. They usually start with `{/* ... */}` and end with `</Card>`
def extract_block(pattern):
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        return match.group(0)
    return ""

def remove_block(pattern, text):
    return re.sub(pattern, "", text, flags=re.DOTALL)

grad_r1_pattern = r"\{\/\* Graduation Wise Table \(ROUND 1\) \*\/\}.*?<\/table>\s*<\/div>\s*<\/Card>"
grad_r2_pattern = r"\{\/\* Graduation Wise Table \(ROUND 2\) \*\/\}.*?<\/table>\s*<\/div>\s*<\/Card>"
loc_r1_pattern = r"\{\/\* Table 3: Location Wise Table \*\/\}.*?<\/table>\s*<\/div>\s*<\/Card>"
deploy_pattern = r"\{\/\* Table 4: Deploy Stage \*\/\}.*?<\/table>\s*<\/div>\s*<\/Card>"
screened_r2_pattern = r"\{\/\* Table 1: Screened By Decision \(Status = Yes\) \*\/\}.*?<\/table>\s*<\/div>\s*<\/Card>"

grad_r1_jsx = extract_block(grad_r1_pattern)
grad_r2_jsx = extract_block(grad_r2_pattern)
loc_r1_jsx = extract_block(loc_r1_pattern)
deploy_jsx = extract_block(deploy_pattern)
screened_r2_jsx = extract_block(screened_r2_pattern)

# We need a Location Wise R2 table. We'll duplicate Location R1 and change references.
loc_r2_jsx = loc_r1_jsx.replace("ROUND 1 YES", "ROUND 2 YES").replace("locationPivotData", "locationPivotDataR2")
loc_r1_jsx = loc_r1_jsx.replace("locationPivotData", "locationPivotDataR1")

# Let's completely strip these tables from the content first so there's no duplicates.
content = remove_block(grad_r1_pattern, content)
content = remove_block(grad_r2_pattern, content)
content = remove_block(loc_r1_pattern, content)
content = remove_block(deploy_pattern, content)
content = remove_block(screened_r2_pattern, content)

# Now we need to insert them in the correct order:
# - SCREENED BY DECISION (ROUND 2)
# - GRADUATION WISE TABLE (ROUND 1)
# - LOCATION WISE TABLE (ROUND 1 YES)
# - GRADUATION WISE TABLE (ROUND 2)
# - LOCATION WISE TABLE (ROUND 2 YES)
# - DEPLOY STAGE TABLE

ordered_tables_jsx = f"""
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 mt-8">
          {screened_r2_jsx}
          
          {grad_r1_jsx}
          
          {loc_r1_jsx}
          
          {grad_r2_jsx}
          
          {loc_r2_jsx}
          
          {deploy_jsx}
        </div>
"""

# We'll insert this right before the last closing </div> that we have.
# The content currently ends with:
#       <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 mt-8">
#       </div>
# Let's replace the empty container or whatever is left over.
# It seems there is a `<div className="w-full max-w-7xl mx-auto flex flex-col gap-6 mt-8">`
# Let's find and replace it.
content = re.sub(r'<div className="w-full max-w-7xl mx-auto flex flex-col gap-6 mt-8">\s*<\/div>', ordered_tables_jsx, content, flags=re.DOTALL)


# 3. Create Location Data Hooks
# Currently we have `locationPivotData`. We need to rename to R1 and create R2.
old_loc_hook_pattern = r"const locationPivotData = useMemo\(\(\) => \{.*?\n  \}, \[uniqueDeduplicatedCandidates\]\);"
match = re.search(old_loc_hook_pattern, content, flags=re.DOTALL)
if match:
    old_loc_hook = match.group(0)
    loc_r1_hook = old_loc_hook.replace("const locationPivotData =", "const locationPivotDataR1 =")
    
    # R2 hook
    loc_r2_hook = old_loc_hook.replace("const locationPivotData =", "const locationPivotDataR2 =")
    loc_r2_hook = loc_r2_hook.replace("return (r1.app_status || 'Pending') === 'Yes';", "const moved = getR2(c).moved_to_round_3 || '';\n      return moved === 'Yes';")
    
    content = content.replace(old_loc_hook, f"{loc_r1_hook}\n\n  {loc_r2_hook}")


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# ----------------- APP.JSX -----------------
app_filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\App.jsx"
with open(app_filepath, 'r', encoding='utf-8') as f:
    app_content = f.read()

if "import RubricsView" not in app_content:
    app_content = app_content.replace("import OverallFunnelDashboard from './components/OverallFunnelDashboard';", "import OverallFunnelDashboard from './components/OverallFunnelDashboard';\nimport RubricsView from './components/RubricsView';")

# Add Tab Button
rubric_tab_btn = """
                <Button
                  variant={activeTab === 'rubrics' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('rubrics')}
                  className={`rounded-lg px-4 font-bold text-xs transition-all ${
                    activeTab === 'rubrics' 
                      ? 'bg-[#800020] text-white hover:bg-[#800020]/90 border-transparent' 
                      : 'border border-[#800020]/30 text-[#800020] hover:bg-[#800020]/5 hover:text-[#800020]'
                  }`}
                >
                  <ListChecks className="mr-2 h-4 w-4 stroke-[1.5]" /> Rubrics
                </Button>
"""
if "Rubrics" not in app_content:
    app_content = app_content.replace("<School className=\"mr-2 h-4 w-4 stroke-[1.5]\" /> University Overview\n                </Button>", "<School className=\"mr-2 h-4 w-4 stroke-[1.5]\" /> University Overview\n                </Button>" + rubric_tab_btn)

if "ListChecks" not in app_content:
    app_content = app_content.replace("FileEdit,", "FileEdit, ListChecks,")

# Render Tab Content
rubric_tab_render = """
              {activeTab === 'rubrics' && (
                <RubricsView />
              )}
"""
if "activeTab === 'rubrics'" not in app_content:
    app_content = app_content.replace("{activeTab === 'university' && (", rubric_tab_render + "\n              {activeTab === 'university' && (")

with open(app_filepath, 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Reorganization complete.")
