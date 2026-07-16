import re
import os

filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update State
content = content.replace(
    "const [graduationDecisionFilter, setGraduationDecisionFilter] = useState('Yes');",
    "const [graduationDecisionFilterR1, setGraduationDecisionFilterR1] = useState('Yes');\n  const [graduationDecisionFilterR2, setGraduationDecisionFilterR2] = useState('Yes');"
)

# 2. Update Pivot Data functions
old_pivot_data = """  const graduationPivotData = useMemo(() => {
    const tiersList = ['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+', 'Tier 3', 'Tier 4', 'Other'];
    
    // Deduplicated list of candidates filtered by decision
    const filteredCandidates = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      
      const moved = getR2(c).moved_to_round_3 || '';
      if (moved.endsWith('_draft')) return false;
      if (graduationDecisionFilter === 'All') return true;
      if (graduationDecisionFilter === 'Maybe') return moved === 'Maybe';
      if (graduationDecisionFilter === 'No') return moved === 'No';
      return moved === 'Yes';
    });

    const years = [];
    const counts = tiersList.reduce((acc, name) => {
      acc[name] = { total: 0 };
      return acc;
    }, {});

    filteredCandidates.forEach(c => {
      const r1 = getR1(c);
      
      // Restore the check to exclude unassigned candidates (which brings total to 737)
      const reviewer = r1.eval_group && r1.eval_group !== 'None' ? r1.eval_group : 'Unassigned';
      if (reviewer === 'Unassigned') return;
      
      let tier = (r1.tier || '').trim();
      if (tier === 'Tier 1-') tier = 'Tier 1+';
      if (tier === 'Tier 2-') tier = 'Tier 2+';
      if (!tiersList.includes(tier)) tier = 'Other';
      
      const grad = r1.graduation || '-';
      const year = grad.match(/\d{4}/)?.[0] || '-';

      if (!years.includes(year) && year !== '-') {
        years.push(year);
      }
      years.sort();

      const target = counts[tier];
      if (target) {
        if (!target[year]) target[year] = 0;
        if (year !== '-') {
          target[year]++;
        }
        target.total++;
      }
    });

    const grandTotal = { total: 0 };
    Object.values(counts).forEach(val => {
      grandTotal.total += val.total;
      years.forEach(y => {
        if (!grandTotal[y]) grandTotal[y] = 0;
        grandTotal[y] += (val[y] || 0);
      });
    });

    return { counts, years, grandTotal };
  }, [uniqueDeduplicatedCandidates, graduationDecisionFilter]);"""

new_pivot_data = """  const graduationPivotDataR1 = useMemo(() => {
    const tiersList = ['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+', 'Tier 3', 'Tier 4', 'Other'];
    
    // Deduplicated list of candidates filtered by decision
    const filteredCandidates = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      
      const appStatus = r1.app_status || 'Pending';
      if (graduationDecisionFilterR1 === 'All') return true;
      if (graduationDecisionFilterR1 === 'Yes') return appStatus === 'Yes';
      if (graduationDecisionFilterR1 === 'No') return ['No', 'Reject', 'Rejected', 'Invalid'].includes(appStatus);
      if (graduationDecisionFilterR1 === 'Pending') return appStatus === 'Pending' || appStatus.toLowerCase() === 'access requested';
      return false;
    });

    const years = [];
    const counts = tiersList.reduce((acc, name) => {
      acc[name] = { total: 0 };
      return acc;
    }, {});

    filteredCandidates.forEach(c => {
      const r1 = getR1(c);
      
      // Restore the check to exclude unassigned candidates
      const reviewer = r1.eval_group && r1.eval_group !== 'None' ? r1.eval_group : 'Unassigned';
      if (reviewer === 'Unassigned') return;
      
      let tier = (r1.tier || '').trim();
      if (tier === 'Tier 1-') tier = 'Tier 1+';
      if (tier === 'Tier 2-') tier = 'Tier 2+';
      if (!tiersList.includes(tier)) tier = 'Other';
      
      const grad = r1.graduation || '-';
      const year = grad.match(/\\d{4}/)?.[0] || '-';

      if (!years.includes(year) && year !== '-') {
        years.push(year);
      }
      years.sort();

      const target = counts[tier];
      if (target) {
        if (!target[year]) target[year] = 0;
        if (year !== '-') {
          target[year]++;
        }
        target.total++;
      }
    });

    const grandTotal = { total: 0 };
    Object.values(counts).forEach(val => {
      grandTotal.total += val.total;
      years.forEach(y => {
        if (!grandTotal[y]) grandTotal[y] = 0;
        grandTotal[y] += (val[y] || 0);
      });
    });

    return { counts, years, grandTotal };
  }, [uniqueDeduplicatedCandidates, graduationDecisionFilterR1]);

  const graduationPivotDataR2 = useMemo(() => {
    const tiersList = ['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+', 'Tier 3', 'Tier 4', 'Other'];
    
    // Deduplicated list of candidates filtered by decision
    const filteredCandidates = uniqueDeduplicatedCandidates.filter(c => {
      const r1 = getR1(c);
      if (r1.app_status === 'Duplicate') return false;
      
      const moved = getR2(c).moved_to_round_3 || '';
      if (moved.endsWith('_draft')) return false;
      if (graduationDecisionFilterR2 === 'All') return true;
      if (graduationDecisionFilterR2 === 'Maybe') return moved === 'Maybe';
      if (graduationDecisionFilterR2 === 'No') return moved === 'No';
      return moved === 'Yes';
    });

    const years = [];
    const counts = tiersList.reduce((acc, name) => {
      acc[name] = { total: 0 };
      return acc;
    }, {});

    filteredCandidates.forEach(c => {
      const r1 = getR1(c);
      
      // Restore the check to exclude unassigned candidates
      const reviewer = r1.eval_group && r1.eval_group !== 'None' ? r1.eval_group : 'Unassigned';
      if (reviewer === 'Unassigned') return;
      
      let tier = (r1.tier || '').trim();
      if (tier === 'Tier 1-') tier = 'Tier 1+';
      if (tier === 'Tier 2-') tier = 'Tier 2+';
      if (!tiersList.includes(tier)) tier = 'Other';
      
      const grad = r1.graduation || '-';
      const year = grad.match(/\\d{4}/)?.[0] || '-';

      if (!years.includes(year) && year !== '-') {
        years.push(year);
      }
      years.sort();

      const target = counts[tier];
      if (target) {
        if (!target[year]) target[year] = 0;
        if (year !== '-') {
          target[year]++;
        }
        target.total++;
      }
    });

    const grandTotal = { total: 0 };
    Object.values(counts).forEach(val => {
      grandTotal.total += val.total;
      years.forEach(y => {
        if (!grandTotal[y]) grandTotal[y] = 0;
        grandTotal[y] += (val[y] || 0);
      });
    });

    return { counts, years, grandTotal };
  }, [uniqueDeduplicatedCandidates, graduationDecisionFilterR2]);"""

if old_pivot_data in content:
    content = content.replace(old_pivot_data, new_pivot_data)
else:
    print("Warning: old pivot data not found!")

# 3. Remove Screened By (YES) Table
# It starts with {/* Table 2: Screened By (Status = Yes) */} and ends with </table>\n            </div>\n          </Card>
pattern_screened_by = r"\{\/\* Table 2: Screened By \(Status = Yes\) \*\/\}.*?<\/table>\s*<\/div>\s*<\/Card>"
content = re.sub(pattern_screened_by, "", content, flags=re.DOTALL)


# 4. Duplicate Graduation Table JSX
old_grad_jsx_pattern = r"\{\/\* Graduation Wise Table \*\/\}.*?<\/table>\s*<\/div>\s*<\/Card>"
match = re.search(old_grad_jsx_pattern, content, flags=re.DOTALL)

if match:
    old_grad_jsx = match.group(0)
    
    grad_r1_jsx = old_grad_jsx.replace("GRADUATION WISE TABLE", "GRADUATION WISE TABLE (ROUND 1)")
    grad_r1_jsx = grad_r1_jsx.replace("graduationDecisionFilter", "graduationDecisionFilterR1")
    grad_r1_jsx = grad_r1_jsx.replace("setGraduationDecisionFilter", "setGraduationDecisionFilterR1")
    grad_r1_jsx = grad_r1_jsx.replace("graduationPivotData", "graduationPivotDataR1")
    grad_r1_jsx = grad_r1_jsx.replace('<option value="Maybe">Maybe ▼</option>', '<option value="Pending">Pending ▼</option>')
    
    grad_r2_jsx = old_grad_jsx.replace("GRADUATION WISE TABLE", "GRADUATION WISE TABLE (ROUND 2)")
    grad_r2_jsx = grad_r2_jsx.replace("graduationDecisionFilter", "graduationDecisionFilterR2")
    grad_r2_jsx = grad_r2_jsx.replace("setGraduationDecisionFilter", "setGraduationDecisionFilterR2")
    grad_r2_jsx = grad_r2_jsx.replace("graduationPivotData", "graduationPivotDataR2")
    
    content = content.replace(old_grad_jsx, f"{grad_r1_jsx}\n\n          {grad_r2_jsx}")
else:
    print("Warning: old grad jsx not found!")
    
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
