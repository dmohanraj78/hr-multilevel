import sys
import re

filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

hooks_replacement = """
  const TIERS_LIST = ['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-', 'Tier 3', 'Tier 4', 'Other'];

  const getTierMatrix = (filteredCandidates, locationKey) => {
    const map = {};
    const colTotals = { 'Tier 1': 0, 'Tier 1-': 0, 'Tier 2': 0, 'Tier 2-': 0, 'Tier 3': 0, 'Tier 4': 0, 'Other': 0, total: 0 };
    filteredCandidates.forEach(c => {
      const r1 = getR1(c);
      let loc = (r1[locationKey] || 'Unknown');
      loc = (typeof loc === 'string') ? loc.trim() : 'Unknown';
      let tier = (r1.tier || 'Other').trim();
      if (!TIERS_LIST.includes(tier)) tier = 'Other';
      
      if (!map[loc]) {
        map[loc] = { 'Tier 1': 0, 'Tier 1-': 0, 'Tier 2': 0, 'Tier 2-': 0, 'Tier 3': 0, 'Tier 4': 0, 'Other': 0, total: 0 };
      }
      map[loc][tier]++;
      map[loc].total++;
      colTotals[tier]++;
      colTotals.total++;
    });
    return {
      data: Object.entries(map).sort((a,b) => b[1].total - a[1].total),
      totals: colTotals
    };
  };

  const stateTierPivotR1 = useMemo(() => {
    const filtered = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      return (r1.app_status || 'Pending') === 'Yes';
    });
    return getTierMatrix(filtered, 'state');
  }, [uniqueDeduplicatedCandidates]);

  const stateTierPivotR2 = useMemo(() => {
    const filtered = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      return getR2(c).moved_to_round_3 === 'Yes';
    });
    return getTierMatrix(filtered, 'state');
  }, [uniqueDeduplicatedCandidates]);

  const cityTierPivotR2 = useMemo(() => {
    const filtered = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      return getR2(c).moved_to_round_3 === 'Yes';
    });
    return getTierMatrix(filtered, 'city');
  }, [uniqueDeduplicatedCandidates]);
"""

old_hooks = """  const locationPivotDataR1 = useMemo(() => {
    const filteredCandidates = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      return (r1.app_status || 'Pending') === 'Yes';
    });
    const counts = {};
    let total = 0;
    filteredCandidates.forEach(c => {
      const r1 = getR1(c);
      const loc = c.location || c.Location || r1.location || r1.Location || c.current_location;
      const normalized = normalizeLocation(loc);
      if (!counts[normalized]) counts[normalized] = 0;
      counts[normalized]++;
      total++;
    });
    return { data: Object.entries(counts).sort((a,b) => b[1] - a[1]), total };
  }, [uniqueDeduplicatedCandidates]);

  const locationPivotDataR2 = useMemo(() => {
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
      const loc = c.location || c.Location || r1.location || r1.Location || c.current_location;
      const normalized = normalizeLocation(loc);
      if (!counts[normalized]) counts[normalized] = 0;
      counts[normalized]++;
      total++;
    });
    return { data: Object.entries(counts).sort((a,b) => b[1] - a[1]), total };
  }, [uniqueDeduplicatedCandidates]);"""

if old_hooks in content:
    content = content.replace(old_hooks, hooks_replacement)
    print("Replaced hooks.")
else:
    print("Hooks not found!")

render_table = """
  const renderMatrixTable = (title, pivotData, rowLabel) => {
    const TIERS = ['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-', 'Tier 3', 'Tier 4', 'Other'];
    return (
      <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
          <Users className="w-4 h-4" /> {title}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300">{rowLabel}</th>
                {TIERS.map(t => (
                  <th key={t} className="py-2 px-4 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">{t}</th>
                ))}
                <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {pivotData.data.map(([name, counts]) => (
                <tr key={name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{name}</td>
                  {TIERS.map(t => (
                    <td key={t} className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                      {counts[t] > 0 ? counts[t] : '-'}
                    </td>
                  ))}
                  <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{counts.total}</td>
                </tr>
              ))}
              <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                {TIERS.map(t => (
                  <td key={t} className="py-3 px-4 text-center text-slate-800 dark:text-slate-200">{pivotData.totals[t]}</td>
                ))}
                <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{pivotData.totals.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    );
  };
"""

render_idx = content.find("return (")
if render_idx != -1 and "renderMatrixTable" not in content:
    content = content[:render_idx] + render_table + "\n  " + content[render_idx:]
    print("Injected render function.")

old_r1_jsx = """        {/* Location Wise Table (Round 1 Yes) */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> LOCATION WISE TABLE (ROUND 1 YES)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300">Location</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">Total ▼</th>
                  </tr>
                </thead>
                <tbody>
                  {locationPivotDataR1.data.map(([loc, count]) => (
                    <tr key={loc} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{loc}</td>
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
          </Card>"""

new_r1_jsx = """        {/* State Wise Table (Round 1 Yes) */}
          {renderMatrixTable('STATE WISE TABLE (ROUND 1 YES)', stateTierPivotR1, 'State')}"""
if old_r1_jsx in content:
    content = content.replace(old_r1_jsx, new_r1_jsx)
    print("Replaced R1 table.")
else:
    print("R1 table not found.")

old_r2_jsx = """        {/* Location Wise Table (Round 2 Yes) */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> LOCATION WISE TABLE (ROUND 2 YES)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300">Location</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">Total ▼</th>
                  </tr>
                </thead>
                <tbody>
                  {locationPivotDataR2.data.map(([loc, count]) => (
                    <tr key={loc} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{loc}</td>
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
          </Card>"""

new_r2_jsx = """        {/* State and City Wise Tables (Round 2 Yes) */}
          {renderMatrixTable('STATE WISE TABLE (ROUND 2 YES)', stateTierPivotR2, 'State')}
          {renderMatrixTable('CITY WISE TABLE (ROUND 2 YES)', cityTierPivotR2, 'City')}"""
if old_r2_jsx in content:
    content = content.replace(old_r2_jsx, new_r2_jsx)
    print("Replaced R2 tables.")
else:
    print("R2 table not found.")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Finished!")
