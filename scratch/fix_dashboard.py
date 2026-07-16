import sys

filepath = r"c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to extract the renderMatrixTable function from where it was wrongly injected
render_table_code = """  const renderMatrixTable = (title, pivotData, rowLabel) => {
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
  };"""

# Remove it from the current location
if render_table_code in content:
    content = content.replace(render_table_code + "\n  ", "")
    print("Removed from wrong location")
else:
    print("Could not find exact block to remove, will try a relaxed match")
    # Relaxed match just in case indentation was weird
    import re
    # Match the block
    pattern = re.compile(r'\s*const renderMatrixTable = .*?return \(\s*<Card.*?</Card>\s*\);\s*};\s*', re.DOTALL)
    if pattern.search(content):
        content = pattern.sub('\n', content, count=1)
        print("Removed using regex")
    else:
        print("Still could not find it. It might already be gone?")

# Inject it right before "export default function OverallFunnelDashboard"
target = "export default function OverallFunnelDashboard"
if target in content:
    content = content.replace(target, render_table_code + "\n\n" + target)
    print("Injected at the correct location")
else:
    print("Could not find the export default function")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
