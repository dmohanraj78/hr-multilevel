import os
import re

# ----------------------------------------------------
# 1. Update OverallFunnelDashboard.jsx in both portals
# ----------------------------------------------------
portals = ['master-portal', 'recruiter-portal']
for portal in portals:
    filepath = os.path.join(portal, 'src', 'components', 'OverallFunnelDashboard.jsx')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We need to replace the entire array of stages in OverallFunnelDashboard.jsx
        # Let's target the card content block for Funnel Conversion Chart
        old_block = """          <CardContent className="pt-4 flex flex-col gap-4">
            {[
              { label: '1. Total Submissions', count: stats.total, percent: 100, color: 'bg-slate-400' },
              { label: '2. Passed Review', count: stats.total - stats.pendingScreening - stats.rejected, percent: Math.round(((stats.total - stats.pendingScreening - stats.rejected) / (stats.total || 1)) * 100), color: 'bg-blue-500' },
              { label: '3. Promoted to R3', count: globalData.filter(c => {
                  const r2 = getR2(c);
                  const m = r2.moved_to_round_3;
                  return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
                }).length, percent: Math.round((globalData.filter(c => {
                  const r2 = getR2(c);
                  const m = r2.moved_to_round_3;
                  return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
                }).length / (stats.total || 1)) * 100), color: 'bg-purple-500' },
              { label: '4. Final Hire Offers', count: stats.hired, percent: Math.round((stats.hired / (stats.total || 1)) * 100), color: 'bg-[#800020]' }
            ].map((stage, idx) => ("""

        # Or target the newly updated block from previous step (which might reference deduplicatedFiltered)
        # Let's inspect what lines 650 to 665 contain in OverallFunnelDashboard.jsx.
        # To be safe, we can regex-replace the array inside CardContent.
        # Let's define the new block:
        new_block = """          <CardContent className="pt-4 flex flex-col gap-4">
            {(() => {
              const applicationsCount = deduplicatedFiltered.length;
              const clearedR1Count = deduplicatedFiltered.filter(c => getR1(c).app_status === 'Yes').length;
              const movedR3Count = deduplicatedFiltered.filter(c => {
                const m = getR2(c).moved_to_round_3;
                return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
              }).length;
              const hiredCount = deduplicatedFiltered.filter(c => getR3(c).verdict === 'Yes').length;

              return [
                { label: '1. Applications', count: applicationsCount, percent: 100, color: 'bg-slate-400' },
                { label: '2. Cleared Round 1', count: clearedR1Count, percent: Math.round((clearedR1Count / (applicationsCount || 1)) * 100), color: 'bg-blue-500' },
                { label: '3. Moved to Round 3', count: movedR3Count, percent: Math.round((movedR3Count / (applicationsCount || 1)) * 100), color: 'bg-purple-500' },
                { label: '4. Hired', count: hiredCount, percent: Math.round((hiredCount / (applicationsCount || 1)) * 100), color: 'bg-[#800020]' }
              ].map((stage, idx) => ("""
        
        # Let's do a search and replace using regex to capture whatever is inside the array
        content = re.sub(
            r'<CardContent className="pt-4 flex flex-col gap-4">\s*\{\[\s*.*?\s*\.map\(\(stage, idx\) => \(',
            new_block,
            content,
            flags=re.DOTALL
        )

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated conversion rates in {filepath}")

# ----------------------------------------------------
# 2. Update master-portal App.jsx
# ----------------------------------------------------
app_path = 'master-portal/src/App.jsx'
if os.path.exists(app_path):
    with open(app_path, 'r', encoding='utf-8') as f:
        app_content = f.read()

    # A. Remove snapshots section (lines 534 to 664 in the previous step)
    # We will locate:
    # {/* Snapshots Section */}
    # ... up to ...
    # </div> (which ends the snapshots grid)
    # Let's replace the whole Snapshots Section block with empty string.
    snapshots_pattern = r'\{\/\* Snapshots Section \*\/\}[\s\S]*?Go to Executive Portal ↗\s*<\/Button>\s*<\/div>\s*<\/Card>\s*<\/div>'
    app_content = re.sub(snapshots_pattern, '', app_content)

    # B. Change search placeholder to "Search universities..."
    app_content = app_content.replace('placeholder="Search normalized universities..."', 'placeholder="Search universities..."')

    # C. Replace University cards grid with a beautiful styled table representation
    old_grid_block = """                  {/* University Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedUnis.length === 0 ? (
                      <div className="col-span-full text-center py-12 border border-dashed rounded-2xl text-muted-foreground font-mono text-sm">
                        No universities found matching your search.
                      </div>
                    ) : (
                      sortedUnis.map((uni) => {
                        return (
                          <Card key={uni.name} className="border rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader className="pb-3 bg-muted/20 border-b">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-2.5 items-center">
                                  <div className="p-2 bg-[#800020]/10 rounded-lg text-[#800020]">
                                    <Building className="h-4 w-4 stroke-[1.5]" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base font-bold leading-none">{uni.name}</CardTitle>
                                    <span className="text-[10px] text-muted-foreground mt-1.5 block">Normalized from variations</span>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="font-mono font-bold text-xs bg-[#800020]/10 text-[#800020] px-2 py-0.5 rounded-full">
                                  {uni.total} {uni.total === 1 ? 'candidate' : 'candidates'}
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-4 flex flex-col gap-4">
                              {/* Tier Breakdown Bars */}
                              <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">Tier Distribution</span>
                                <div className="grid grid-cols-3 gap-2">
                                  {Object.entries(uni.tiers).map(([tierName, count]) => {
                                    const colors = {
                                      'Tier 1+': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
                                      'Tier 1': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
                                      'Tier 2+': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
                                      'Tier 2': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
                                      'Tier 3': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/25',
                                      'T4': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25',
                                      'N/A': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25'
                                    };
                                    return (
                                      <div key={tierName} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${colors[tierName] || 'bg-muted text-muted-foreground'}`}>
                                        <span className="font-sans">{tierName}</span>
                                        <span className="font-mono font-bold">{count}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* View Candidates List Button */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUnivName(uni.name)}
                                className="w-full flex items-center justify-center gap-1.5 text-xs text-[#800020] border-[#800020]/30 hover:border-[#800020] hover:bg-[#800020]/10 font-bold py-2 rounded-xl mt-1"
                              >
                                View Candidates ({uni.total}) &rarr;
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>"""

    new_grid_block = """                  {/* University Table */}
                  <Card className="rounded-[1.25rem] overflow-hidden border shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#1B365D] text-white">
                            <th className="p-3.5 font-bold text-sm">University</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[100px] border-l border-white/10">Total</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 1</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 1+</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 2</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 2+</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 3</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 4</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedUnis.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-12 text-muted-foreground font-mono text-sm bg-muted/20">
                                No universities found matching your search.
                              </td>
                            </tr>
                          ) : (
                            sortedUnis.map((uni) => {
                              const t1 = uni.tiers['Tier 1'] || 0;
                              const t1p = uni.tiers['Tier 1+'] || 0;
                              const t2 = uni.tiers['Tier 2'] || 0;
                              const t2p = uni.tiers['Tier 2+'] || 0;
                              const t3 = uni.tiers['Tier 3'] || 0;
                              const t4 = uni.tiers['T4'] || 0;

                              return (
                                <tr key={uni.name} className="border-b hover:bg-muted/10 transition-colors last:border-0">
                                  <td className="p-3.5 font-semibold text-foreground text-sm">
                                    <button 
                                      onClick={() => setSelectedUnivName(uni.name)}
                                      className="text-[#800020] hover:underline font-bold text-left focus:outline-none"
                                    >
                                      {uni.name}
                                    </button>
                                  </td>
                                  <td className="p-3.5 text-center font-bold text-sm border-l border-muted bg-muted/20 text-foreground">
                                    {uni.total}
                                  </td>
                                  
                                  {/* Tier 1 - light green */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t1 > 0 
                                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t1}
                                  </td>
                                  
                                  {/* Tier 1+ - light green */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t1p > 0 
                                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t1p}
                                  </td>
                                  
                                  {/* Tier 2 - light blue */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t2 > 0 
                                      ? 'bg-blue-500/10 text-blue-800 dark:text-blue-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t2}
                                  </td>
                                  
                                  {/* Tier 2+ - light blue */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t2p > 0 
                                      ? 'bg-blue-500/15 text-blue-800 dark:text-blue-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t2p}
                                  </td>
                                  
                                  {/* Tier 3 - light yellow */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t3 > 0 
                                      ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t3}
                                  </td>
                                  
                                  {/* Tier 4 - light orange */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t4 > 0 
                                      ? 'bg-orange-500/10 text-orange-800 dark:text-orange-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t4}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>"""

    # We do a direct string replace if it exists
    if old_grid_block in app_content:
        app_content = app_content.replace(old_grid_block, new_grid_block)
    else:
        # Fallback regex replace for university grid block
        app_content = re.sub(
            r'\{\/\* University Grid \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}\)\(\)\}',
            new_grid_block + '\n            })()}',
            app_content
        )

    with open(app_path, 'w', encoding='utf-8') as f:
        f.write(app_content)
    print(f"Successfully updated master {app_path}")
