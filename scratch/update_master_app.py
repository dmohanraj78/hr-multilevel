import os

filepath = 'master-portal/src/App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Calculate deduplicated count and tier counts for all deduplicated candidates
dedup_logic = """
  // Deduplicated applicant stats
  const deduplicatedCandidates = globalData.reduce((acc, current) => {
    const x = acc.find(item => item.email?.trim().lower() === current.email?.trim().lower());
    if (!x) return acc.concat([current]);
    return acc;
  }, []);
  const deduplicatedCount = deduplicatedCandidates.length;

  const overallTiers = { 'Tier 1+': 0, 'Tier 1': 0, 'Tier 2+': 0, 'Tier 2': 0, 'Tier 3': 0, 'T4': 0, 'N/A': 0 };
  deduplicatedCandidates.forEach(cand => {
    let tier = getR1(cand).tier || 'N/A';
    if (tier === 'T1+') tier = 'Tier 1+';
    else if (tier === 'T1') tier = 'Tier 1';
    else if (tier === 'T2+') tier = 'Tier 2+';
    else if (tier === 'T2') tier = 'Tier 2';
    else if (tier === 'T3') tier = 'Tier 3';
    else if (tier === 'T4') tier = 'T4';
    overallTiers[tier] = (overallTiers[tier] || 0) + 1;
  });
"""

# Inject this deduction logic right before r1Stats definition
content = content.replace("  const r1Stats = {", dedup_logic + "\n  const r1Stats = {")

# Swap total: globalData.length with deduplicatedCount
content = content.replace("total: globalData.length,", "total: deduplicatedCount,")

# Replace Snapshots Section block
old_snapshots = """                {/* Snapshots Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Round 1 Card */}
                  <Card className="rounded-[1.5rem] border shadow-sm bg-card text-card-foreground">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>Round 1: HR Review</span>
                        <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-[#800020]/30 text-[#800020] bg-[#800020]/5">R1 Queue</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col gap-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Total Applicants:</span>
                        <strong className="font-mono text-foreground font-extrabold">{r1Stats.total}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Unscreened:</span>
                        <strong className="font-mono text-amber-600 font-extrabold">{r1Stats.pending}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Passed (Promoted to R2):</span>
                        <strong className="font-mono text-green-600 font-extrabold">{r1Stats.passed}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rejected (Review):</span>
                        <strong className="font-mono text-red-600 font-extrabold">{r1Stats.rejected}</strong>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Round 2 Card */}
                  <Card className="rounded-[1.5rem] border shadow-sm bg-card text-card-foreground">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>Round 2: Tech Technical Evaluator Review</span>
                        <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-blue-500/30 text-blue-600 bg-blue-500/5">R2 Queue</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col gap-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Total in Review:</span>
                        <strong className="font-mono text-foreground font-extrabold">{r2Stats.total}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Pending Review:</span>
                        <strong className="font-mono text-amber-600 font-extrabold">{r2Stats.pending}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Promoted to R3:</span>
                        <strong className="font-mono text-green-600 font-extrabold">{r2Stats.promoted}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Declined (Review):</span>
                        <strong className="font-mono text-red-600 font-extrabold">{r2Stats.declined}</strong>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Round 3 Card */}
                  <Card className="rounded-[1.5rem] border shadow-sm bg-card text-card-foreground">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>Round 3: Executive Verdict</span>
                        <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-purple-500/30 text-purple-600 bg-purple-500/5">R3 Queue</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col gap-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Total Promoted:</span>
                        <strong className="font-mono text-foreground font-extrabold">{r3Stats.total}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Pending Verdict:</span>
                        <strong className="font-mono text-amber-600 font-extrabold">{r3Stats.pending}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Hired (Approved Offer):</span>
                        <strong className="font-mono text-green-600 font-extrabold">{r3Stats.hired}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Declined (Verdict):</span>
                        <strong className="font-mono text-red-600 font-extrabold">{r3Stats.declined}</strong>
                      </div>
                    </CardContent>
                  </Card>
                </div>"""

new_snapshots = """                {/* Snapshots Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Round 1 Card */}
                  <Card className="rounded-[1.5rem] border shadow-sm bg-card text-card-foreground flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base font-bold flex items-center justify-between">
                          <span>Round 1: HR Review</span>
                          <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-[#800020]/30 text-[#800020] bg-[#800020]/5">HR Queue</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 flex flex-col gap-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Total Applicants (Deduplicated):</span>
                          <strong className="font-mono text-foreground font-extrabold">{r1Stats.total}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Unscreened:</span>
                          <strong className="font-mono text-amber-600 font-extrabold">{r1Stats.pending}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Passed (Promoted to R2):</span>
                          <strong className="font-mono text-green-600 font-extrabold">{r1Stats.passed}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Rejected (Review):</span>
                          <strong className="font-mono text-red-600 font-extrabold">{r1Stats.rejected}</strong>
                        </div>

                        {/* Candidate Tiers Breakdown moved here */}
                        <div className="pt-2 flex flex-col gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">Candidate Tiers</span>
                          <div className="grid grid-cols-4 gap-1">
                            {Object.entries(overallTiers).map(([tierName, count]) => {
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
                                <div key={tierName} className={`flex flex-col items-center py-1 px-0.5 rounded-lg border text-center ${colors[tierName] || 'bg-muted text-muted-foreground'}`}>
                                  <span className="text-[8px] font-bold uppercase tracking-wider">{tierName === 'Tier 1+' ? '1+' : tierName === 'Tier 1' ? '1' : tierName === 'Tier 2+' ? '2+' : tierName === 'Tier 2' ? '2' : tierName === 'Tier 3' ? '3' : tierName}</span>
                                  <span className="font-mono text-xs font-bold">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                    <div className="p-4 pt-0">
                      <Button variant="outline" size="sm" className="text-[#800020] border-[#800020]/30 hover:bg-[#800020]/10 rounded-lg w-full font-bold" onClick={() => window.open('https://recruiter-portal-one.vercel.app', '_blank')}>
                        Go to HR Workspace ↗
                      </Button>
                    </div>
                  </Card>

                  {/* Round 2 Card */}
                  <Card className="rounded-[1.5rem] border shadow-sm bg-card text-card-foreground flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base font-bold flex items-center justify-between">
                          <span>Round 2: Technical Review</span>
                          <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-blue-500/30 text-blue-600 bg-blue-500/5">R2 Queue</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 flex flex-col gap-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Total in Review:</span>
                          <strong className="font-mono text-foreground font-extrabold">{r2Stats.total}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Pending Review:</span>
                          <strong className="font-mono text-amber-600 font-extrabold">{r2Stats.pending}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Promoted to R3:</span>
                          <strong className="font-mono text-green-600 font-extrabold">{r2Stats.promoted}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Declined (Review):</span>
                          <strong className="font-mono text-red-600 font-extrabold">{r2Stats.declined}</strong>
                        </div>
                      </CardContent>
                    </div>
                    <div className="p-4 pt-0">
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-500/30 hover:bg-blue-500/10 rounded-lg w-full font-bold" onClick={() => window.open('https://technical-review.vercel.app', '_blank')}>
                        Go to Technical Review Hub ↗
                      </Button>
                    </div>
                  </Card>

                  {/* Round 3 Card */}
                  <Card className="rounded-[1.5rem] border shadow-sm bg-card text-card-foreground flex flex-col justify-between">
                    <div>
                      <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base font-bold flex items-center justify-between">
                          <span>Round 3: Executive Verdicts</span>
                          <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-purple-500/30 text-purple-600 bg-purple-500/5">R3 Queue</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 flex flex-col gap-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Total Promoted:</span>
                          <strong className="font-mono text-foreground font-extrabold">{r3Stats.total}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Pending Verdict:</span>
                          <strong className="font-mono text-amber-600 font-extrabold">{r3Stats.pending}</strong>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground font-medium">Hired (Approved Offer):</span>
                          <strong className="font-mono text-green-600 font-extrabold">{r3Stats.hired}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Declined (Verdict):</span>
                          <strong className="font-mono text-red-600 font-extrabold">{r3Stats.declined}</strong>
                        </div>
                      </CardContent>
                    </div>
                    <div className="p-4 pt-0">
                      <Button variant="outline" size="sm" className="text-purple-600 border-purple-500/30 hover:bg-purple-500/10 rounded-lg w-full font-bold" onClick={() => window.open('https://executive-portal-nine.vercel.app', '_blank')}>
                        Go to Executive Portal ↗
                      </Button>
                    </div>
                  </Card>
                </div>"""

content = content.replace(old_snapshots, new_snapshots)

# Replace Workloads Grid Cards with Table
old_workloads = """                {/* Technical Evaluator Workload Status Snapshots */}
                <div className="flex flex-col gap-1 mt-2">
                  <h3 className="text-base font-bold text-foreground">Technical Evaluator Review Workload Snapshots</h3>
                  <p className="text-xs text-muted-foreground">Real-time workloads and status breakdowns for each technical review techEvaluator.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {techEvaluatorsSnapshot.map(techEvaluator => {
                    const colors = techEvaluatorColors[techEvaluator.name] || { border: 'border-t-slate-500', text: 'text-slate-600', bg: 'bg-slate-500/5' };
                    return (
                      <Card key={techEvaluator.name} className={`rounded-xl border border-t-4 ${colors.border} shadow-sm bg-card text-card-foreground hover:scale-[1.02] transition-all duration-300`}>
                        <CardHeader className="pb-2 pt-3 px-3 border-b bg-muted/15">
                          <CardTitle className="text-sm font-bold flex items-center justify-between">
                            <span className={colors.text}>{techEvaluator.name}</span>
                            <Badge variant="outline" className={`font-mono text-[9px] px-1.5 py-0 border-transparent ${colors.text} ${colors.bg}`}>
                              Technical Evaluator
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3 px-3 pb-3 flex flex-col gap-2 text-xs">
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground">Total:</span>
                            <strong className="font-mono text-foreground font-extrabold">{techEvaluator.total}</strong>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground text-amber-600">Pending:</span>
                            <strong className="font-mono text-amber-600 font-extrabold">{techEvaluator.pending}</strong>
                          </div>
                          <div className="flex justify-between border-b pb-1">
                            <span className="text-muted-foreground text-green-600 font-medium">Promoted:</span>
                            <strong className="font-mono text-green-600 font-extrabold">{techEvaluator.promoted}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-red-600 font-medium">Declined:</span>
                            <strong className="font-mono text-red-600 font-extrabold">{techEvaluator.declined}</strong>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>"""

new_workloads = """                {/* Technical Reviewer Workload Status Snapshots */}
                <div className="flex flex-col gap-1 mt-2">
                  <h3 className="text-base font-bold text-foreground font-heading">Technical Reviewer Workload Snapshots</h3>
                  <p className="text-xs text-muted-foreground">Real-time workloads and status breakdowns for each technical review technical evaluator.</p>
                </div>

                <div className="border rounded-xl bg-card text-card-foreground overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b">
                          <th className="p-3.5 font-bold text-muted-foreground font-mono uppercase tracking-wider text-[10px]">Technical Reviewer</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Total Assigned</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Pending Review</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Promoted</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Declined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-mono">
                        {techEvaluatorsSnapshot.map((evaluator) => (
                          <tr key={evaluator.name} className="hover:bg-muted/10 transition-colors">
                            <td className="p-3.5 font-sans font-bold text-foreground">{evaluator.name}</td>
                            <td className="p-3.5 text-center text-foreground font-extrabold">{evaluator.total}</td>
                            <td className="p-3.5 text-center text-amber-600 font-extrabold">{evaluator.pending}</td>
                            <td className="p-3.5 text-center text-green-600 font-extrabold">{evaluator.promoted}</td>
                            <td className="p-3.5 text-center text-red-600 font-extrabold">{evaluator.declined}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>"""

content = content.replace(old_workloads, new_workloads)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated master App.jsx with snapshots, deduplication, and workloads table successfully!")
