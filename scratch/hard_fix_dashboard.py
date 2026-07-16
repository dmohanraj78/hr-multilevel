import re
import sys

filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. We need Location Normalize Function
location_logic = """  const normalizeLocation = (loc) => {
    if (!loc) return 'Unknown';
    let s = loc.toString().toLowerCase().trim();
    if (s.includes('bangalore') || s.includes('bengaluru')) return 'Bengaluru';
    if (s.includes('pune')) return 'Pune';
    if (s.includes('mumbai') || s.includes('bombay') || s.includes('navi mumbai')) return 'Mumbai';
    if (s.includes('delhi') || s.includes('ncr') || s.includes('noida') || s.includes('gurugram') || s.includes('gurgaon')) return 'Delhi NCR';
    if (s.includes('hyderabad')) return 'Hyderabad';
    if (s.includes('chennai')) return 'Chennai';
    if (s.includes('remote') || s.includes('anywhere') || s.includes('wfh')) return 'Remote';
    return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };"""

if "const normalizeLocation" not in content:
    content = content.replace("const r1ReviewerPivotData = useMemo(() => {", location_logic + "\n\n  const r1ReviewerPivotData = useMemo(() => {")

# 2. Add Location R1 Data Hook
loc_r1_hook = """  const locationPivotDataR1 = useMemo(() => {
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
  }, [uniqueDeduplicatedCandidates]);"""

if "const locationPivotDataR1 =" not in content:
    content = content.replace("const graduationPivotDataR1 = useMemo(() => {", loc_r1_hook + "\n\n  const graduationPivotDataR1 = useMemo(() => {")

# 3. Add Location R2 Data Hook
loc_r2_hook = """  const locationPivotDataR2 = useMemo(() => {
    const filteredCandidates = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      const moved = getR2(c).moved_to_round_3 || '';
      return moved === 'Yes';
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
  }, [uniqueDeduplicatedCandidates]);"""

if "const locationPivotDataR2 =" not in content:
    content = content.replace("const graduationPivotDataR2 = useMemo(() => {", loc_r2_hook + "\n\n  const graduationPivotDataR2 = useMemo(() => {")


# 4. We must completely replace the Dashboard JSX return portion to ensure tables are ordered perfectly and NO duplicates!
# We will find everything from `{/* Summary Stats Banner */}` to `</div>\n    </div>\n  );\n}` and replace it with a clean structure.

# Let's write the complete JSX string for all tables in the exact order requested:
# - SCREENED BY DECISION (ROUND 2)
# - GRADUATION WISE TABLE (ROUND 1)
# - LOCATION WISE TABLE (ROUND 1 YES)
# - GRADUATION WISE TABLE (ROUND 2)
# - LOCATION WISE TABLE (ROUND 2 YES)
# - DEPLOY STAGE TABLE
tables_jsx = """
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 mt-8 px-4 md:px-8">
          {/* Table: SCREENED BY DECISION (ROUND 2) */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> SCREENED BY DECISION (ROUND 2)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">Evaluator Name</th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-[#059669] dark:text-emerald-400 text-center">Yes</th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-[#d97706] dark:text-amber-500 text-center">Maybe</th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-[#dc2626] dark:text-red-500 text-center">No</th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">Pending / Draft</th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 text-center">Overall Total</th>
                  </tr>
                </thead>
                <tbody>
                  {r2ReviewerPivotData.data.map((row) => (
                    <tr key={row.name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{row.name}</td>
                      <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{row.counts.Yes}</td>
                      <td className="py-3 px-6 text-center font-bold text-[#d97706] dark:text-amber-500">{row.counts.Maybe}</td>
                      <td className="py-3 px-6 text-center font-bold text-[#dc2626] dark:text-red-400">{row.counts.No}</td>
                      <td className="py-3 px-6 text-center font-bold text-blue-500">{row.counts.Pending}</td>
                      <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-100 border-l border-slate-100 dark:border-slate-700">{row.counts.Total}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{r2ReviewerPivotData.grandTotal.Yes}</td>
                    <td className="py-3 px-6 text-center text-[#d97706] dark:text-amber-500">{r2ReviewerPivotData.grandTotal.Maybe}</td>
                    <td className="py-3 px-6 text-center text-[#dc2626] dark:text-red-400">{r2ReviewerPivotData.grandTotal.No}</td>
                    <td className="py-3 px-6 text-center text-blue-500">{r2ReviewerPivotData.grandTotal.Pending}</td>
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-100">{r2ReviewerPivotData.grandTotal.Total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Table: GRADUATION WISE TABLE (ROUND 1) */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
                <Users className="w-4 h-4" /> GRADUATION WISE TABLE (ROUND 1)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Decision Filter:</span>
                <select
                  className="text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  value={graduationDecisionFilterR1}
                  onChange={(e) => setGraduationDecisionFilterR1(e.target.value)}
                >
                  <option value="All">All ▼</option>
                  <option value="Yes">Yes ▼</option>
                  <option value="No">No ▼</option>
                  <option value="Pending">Pending ▼</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">Decision</th>
                    <th colSpan={graduationPivotDataR1.years.length + 1} className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 text-center">
                      Graduation ▼
                    </th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-400 border-r border-slate-200 dark:border-slate-700">TIER</th>
                    {graduationPivotDataR1.years.map(y => (
                      <th key={y} className="py-2 px-6 font-semibold text-xs text-center text-slate-600 dark:text-slate-400">{y}</th>
                    ))}
                    <th className="py-2 px-6 font-semibold text-xs text-center text-slate-800 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700">GRAND TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const dynamicReviewers = Object.keys(graduationPivotDataR1.counts)
                      .filter(k => k !== 'Unassigned' && k !== 'None');
                    
                    return dynamicReviewers.map((reviewer) => {
                      const data = graduationPivotDataR1.counts[reviewer];
                      return (
                        <tr key={reviewer} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{reviewer}</td>
                          {graduationPivotDataR1.years.map(y => (
                            <td key={y} className="py-3 px-6 text-center font-bold text-blue-600 dark:text-blue-400">{data[y] || 0}</td>
                          ))}
                          <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-100 border-l border-slate-100 dark:border-slate-700">{data.total}</td>
                        </tr>
                      );
                    });
                  })()}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    {graduationPivotDataR1.years.map(y => (
                      <td key={y} className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR1.grandTotal[y] || 0}</td>
                    ))}
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR1.grandTotal.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Table: LOCATION WISE TABLE (ROUND 1 YES) */}
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
                  {locationPivotDataR1.data.map(([loc, count]) => (
                    <tr key={loc} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{loc}</td>
                      <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{count}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{locationPivotDataR1.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Table: GRADUATION WISE TABLE (ROUND 2) */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
                <Users className="w-4 h-4" /> GRADUATION WISE TABLE (ROUND 2)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Decision Filter:</span>
                <select
                  className="text-sm border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1 px-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#800020]"
                  value={graduationDecisionFilterR2}
                  onChange={(e) => setGraduationDecisionFilterR2(e.target.value)}
                >
                  <option value="All">All ▼</option>
                  <option value="Yes">Yes ▼</option>
                  <option value="Maybe">Maybe ▼</option>
                  <option value="No">No ▼</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">Decision</th>
                    <th colSpan={graduationPivotDataR2.years.length + 1} className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 text-center">
                      Graduation ▼
                    </th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-400 border-r border-slate-200 dark:border-slate-700">TIER</th>
                    {graduationPivotDataR2.years.map(y => (
                      <th key={y} className="py-2 px-6 font-semibold text-xs text-center text-slate-600 dark:text-slate-400">{y}</th>
                    ))}
                    <th className="py-2 px-6 font-semibold text-xs text-center text-slate-800 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700">GRAND TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const dynamicReviewers = Object.keys(graduationPivotDataR2.counts)
                      .filter(k => k !== 'Unassigned' && k !== 'None');
                    
                    return dynamicReviewers.map((reviewer) => {
                      const data = graduationPivotDataR2.counts[reviewer];
                      return (
                        <tr key={reviewer} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{reviewer}</td>
                          {graduationPivotDataR2.years.map(y => (
                            <td key={y} className="py-3 px-6 text-center font-bold text-blue-600 dark:text-blue-400">{data[y] || 0}</td>
                          ))}
                          <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-100 border-l border-slate-100 dark:border-slate-700">{data.total}</td>
                        </tr>
                      );
                    });
                  })()}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    {graduationPivotDataR2.years.map(y => (
                      <td key={y} className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR2.grandTotal[y] || 0}</td>
                    ))}
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR2.grandTotal.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Table: LOCATION WISE TABLE (ROUND 2 YES) */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> LOCATION WISE TABLE (ROUND 2 YES)
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
                  {locationPivotDataR2.data.map(([loc, count]) => (
                    <tr key={loc} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{loc}</td>
                      <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{count}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{locationPivotDataR2.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Table: DEPLOY STAGE TABLE */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <CheckCircle className="w-4 h-4" /> DEPLOY STAGE TABLE
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">DEPLOY STAGE</th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-[#059669] dark:text-emerald-400 text-center">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {deployStagePivotData.data.map(([stage, count]) => (
                    <tr key={stage} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700">{stage}</td>
                      <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-100">{count}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{deployStagePivotData.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
"""

# Let's strip away everything from `{/* Table 1: Screened By Decision (Status = Yes) */}` onwards OR just find the start and end of the tables block.
start_tables_index = content.find("{/* Table 1: Screened By Decision (Status = Yes) */}")
if start_tables_index == -1:
    # If not found, maybe I deleted it in the previous commit.
    # Where does StatsBanner end?
    start_tables_index = content.find("      <div className=\"mt-8\">\n        <h3 className=\"text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2\">\n          <School className=\"w-5 h-5 text-indigo-600 dark:text-indigo-400\" />\n          University Distribution\n        </h3>")
    if start_tables_index != -1:
        # We need to insert the tables before University Distribution!
        # Find where StatsBanner ends:
        stats_banner_end = content.find("      {/* University Distribution (Cards) */}")
        if stats_banner_end != -1:
            content = content[:stats_banner_end] + tables_jsx + "\n\n" + content[stats_banner_end:]
        else:
            print("ERROR: Could not find insertion point for tables!")
            sys.exit(1)
else:
    end_tables_index = content.find("{/* University Distribution (Cards) */}")
    if end_tables_index != -1:
        content = content[:start_tables_index] + tables_jsx + "\n\n      " + content[end_tables_index:]
    else:
        print("ERROR: Could not find end of tables block.")
        sys.exit(1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated OverallFunnelDashboard.jsx")

# Fix App.jsx
app_filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\App.jsx"
with open(app_filepath, 'r', encoding='utf-8') as f:
    app_content = f.read()

if "import RubricsView" not in app_content:
    # insert after import OverallFunnelDashboard
    app_content = app_content.replace("import OverallFunnelDashboard from './components/OverallFunnelDashboard';", "import OverallFunnelDashboard from './components/OverallFunnelDashboard';\nimport RubricsView from './components/RubricsView';")

if "ListChecks" not in app_content:
    app_content = app_content.replace("FileEdit,", "FileEdit, ListChecks,")
elif "ListChecks" in app_content and "import { ShieldAlert, BarChart, Users, CheckCircle, Search, LayoutGrid, FileEdit, ListChecks, LogOut, ChevronDown, Check, Activity, Clock, FileSpreadsheet, Download, RefreshCw, XCircle, Filter, Maximize2, AlertCircle, Eye, ChevronLeft, Building, School } from 'lucide-react';" not in app_content:
    pass # already there

if "Rubrics" not in app_content:
    rubric_btn = """
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
    app_content = app_content.replace("<School className=\"mr-2 h-4 w-4 stroke-[1.5]\" /> University Overview\n                </Button>", "<School className=\"mr-2 h-4 w-4 stroke-[1.5]\" /> University Overview\n                </Button>" + rubric_btn)

if "{activeTab === 'rubrics'" not in app_content:
    rubric_render = """
              {activeTab === 'rubrics' && (
                <RubricsView />
              )}
"""
    app_content = app_content.replace("{activeTab === 'university' && (() => {", rubric_render + "\n              {activeTab === 'university' && (() => {")

with open(app_filepath, 'w', encoding='utf-8') as f:
    f.write(app_content)
print("Updated App.jsx")

