import re

filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if "import RubricsView" not in content:
    content = content.replace("import { Card, CardContent, CardHeader, CardTitle } from './ui/card';", "import { Card, CardContent, CardHeader, CardTitle } from './ui/card';\nimport RubricsView from './RubricsView';")

# 2. Add activeTab state
if "const [activeTab, setActiveTab] = useState('dashboard');" not in content:
    content = content.replace("const [isExporting, setIsExporting] = useState(false);", "const [isExporting, setIsExporting] = useState(false);\n  const [activeTab, setActiveTab] = useState('dashboard');")

# 3. Add Location Logic
location_logic = """  const normalizeLocation = (loc) => {
    if (!loc) return 'Unknown';
    loc = loc.toString().toLowerCase().trim();
    if (loc.includes('bangalore') || loc.includes('bengaluru')) return 'Bengaluru';
    if (loc.includes('pune')) return 'Pune';
    if (loc.includes('mumbai') || loc.includes('bombay') || loc.includes('navi mumbai')) return 'Mumbai';
    if (loc.includes('delhi') || loc.includes('ncr') || loc.includes('noida') || loc.includes('gurugram') || loc.includes('gurgaon')) return 'Delhi NCR';
    if (loc.includes('hyderabad')) return 'Hyderabad';
    if (loc.includes('chennai')) return 'Chennai';
    if (loc.includes('remote') || loc.includes('anywhere') || loc.includes('wfh')) return 'Remote';
    return loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const locationPivotData = useMemo(() => {
    const filteredCandidates = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      return (r1.app_status || 'Pending') === 'Yes';
    });
    const counts = {};
    let total = 0;
    filteredCandidates.forEach(c => {
      const r1 = getR1(c);
      const reviewer = r1.eval_group && r1.eval_group !== 'None' ? r1.eval_group : 'Unassigned';
      if (reviewer === 'Unassigned') return;
      const loc = c.location || c.Location || r1.location || r1.Location || c.current_location;
      const normalized = normalizeLocation(loc);
      if (!counts[normalized]) counts[normalized] = 0;
      counts[normalized]++;
      total++;
    });
    return { data: Object.entries(counts).sort((a,b) => b[1] - a[1]), total };
  }, [uniqueDeduplicatedCandidates]);
"""

if "const normalizeLocation" not in content:
    # Insert before r1ReviewerPivotData
    content = content.replace("const r1ReviewerPivotData = useMemo(() => {", location_logic + "\n  const r1ReviewerPivotData = useMemo(() => {")

# 4. Remove Tier 1+ mapping & fix tiersList
# Replaces 'Tier 1+' with 'Tier 1-'
content = content.replace("['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+', 'Tier 3', 'Tier 4', 'Other']", "['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-', 'Tier 3', 'Tier 4', 'Other']")
content = content.replace("['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-']", "['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-']") # In StatsBanner, it's already using 1- and 2- !
# Remove the + replacements
content = content.replace("if (tier === 'Tier 1-') tier = 'Tier 1+';\n      if (tier === 'Tier 2-') tier = 'Tier 2+';", "")
content = content.replace("if (tier === 'Tier 1-') tier = 'Tier 1+';\n        if (tier === 'Tier 2-') tier = 'Tier 2+';", "")

# 5. JSX - Tabs UI
tabs_ui = """      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6 w-full max-w-7xl mx-auto px-4 md:px-8">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'dashboard' ? 'border-[#800020] text-[#800020] dark:text-red-400 dark:border-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('rubrics')}
          className={`py-3 px-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'rubrics' ? 'border-[#800020] text-[#800020] dark:text-red-400 dark:border-red-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Evaluation Rubric
        </button>
      </div>

      {activeTab === 'rubrics' ? (
        <RubricsView />
      ) : (
        <div className="flex flex-col items-center w-full px-4 md:px-8 pb-12 animate-in fade-in duration-500">
"""

if "{/* Tabs */}" not in content:
    content = content.replace("      {/* Summary Stats Banner */}", tabs_ui + "\n      {/* Summary Stats Banner */}")
    # We need to close the div added by tabs_ui.
    # The end of the component return is:
    #       </div>
    #     </div>
    #   );
    # }
    
    # We replace the final `</div>\n    </div>\n  );\n}` with closing the activeTab div
    end_pattern = r"<\/div>\s*<\/div>\s*\);\s*\}\s*export default OverallFunnelDashboard;"
    content = re.sub(end_pattern, "</div>\n        </div>\n      )}\n    </div>\n  );\n}\n\nexport default OverallFunnelDashboard;", content)


# 6. JSX - Add Location Pivot Table
location_table_jsx = """          {/* Table 3: Location Wise Table */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> LOCATION WISE TABLE (ROUND 1 YES)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">Location</th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">Candidates Passed</th>
                  </tr>
                </thead>
                <tbody>
                  {locationPivotData.data.map(([loc, count]) => (
                    <tr key={loc} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{loc}</td>
                      <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{count}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{locationPivotData.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
"""

if "{/* Table 3: Location Wise Table */}" not in content:
    # Insert it right before {/* Graduation Wise Table */} which is now {/* Graduation Wise Table (ROUND 1) */}
    content = content.replace("{/* Graduation Wise Table", location_table_jsx + "\n\n          {/* Graduation Wise Table")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied successfully.")
