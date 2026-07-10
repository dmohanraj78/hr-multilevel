import os

def update_overall_dashboard(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace the return statement starting from return ( down to the end of the file.
    # Let's locate the return ( ... ) block.
    # To do this safely, we can replace the return block string representation directly.
    
    old_return_block = """  return (
    <div className="flex flex-col gap-8">
      
      {/* Title & Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">
            AI Builder Intern — Applicant Funnel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <strong className="text-[#800020]">{stats.total} applicants</strong> processed · v2 evaluation rubric (max score 30)
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-[#800020] hover:bg-[#800020]/90 text-white rounded-xl shadow-md shrink-0">
          <Download className="mr-2 h-4 w-4 stroke-[1.5]" /> Export Filtered ({sortedAndFiltered.length}) Records (CSV)
        </Button>
      </div>

      {/* Tiles Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Tile */}
        <Card 
          onClick={() => handleTileClick('ALL')}
          className={`rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'ALL' ? 'ring-2 ring-[#800020] border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">Applicants</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-foreground">{stats.total}</span>
              <Users className="h-5 w-5 text-slate-400 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-muted-foreground">Total submissions</span>
          </CardContent>
        </Card>

        {/* Hired Tile */}
        <Card 
          onClick={() => handleTileClick('Hired')}
          className={`rounded-2xl border border-green-500/20 bg-green-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Hired' ? 'ring-2 ring-green-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-green-700 dark:text-green-400 uppercase tracking-wider block">Hired</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-green-600 dark:text-green-400">{stats.hired}</span>
              <CheckCircle className="h-5 w-5 text-green-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-green-600/80">Approved for offer</span>
          </CardContent>
        </Card>

        {/* In Review Tile */}
        <Card 
          onClick={() => handleTileClick('Vetting')}
          className={`rounded-2xl border border-blue-500/20 bg-blue-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Vetting' ? 'ring-2 ring-blue-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase tracking-wider block">In Review</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">{stats.vetting}</span>
              <Flame className="h-5 w-5 text-blue-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-blue-600/80">Review passed</span>
          </CardContent>
        </Card>

        {/* Rejected Tile */}
        <Card 
          onClick={() => handleTileClick('Declined')}
          className={`rounded-2xl border border-red-500/20 bg-red-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Declined' ? 'ring-2 ring-red-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-red-700 dark:text-red-400 uppercase tracking-wider block">Declined</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-red-600 dark:text-red-400">{stats.rejected}</span>
              <XOctagon className="h-5 w-5 text-red-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-red-600/80">Any funnel stage</span>
          </CardContent>
        </Card>

        {/* Pending Review Tile */}
        <Card 
          onClick={() => handleTileClick('Pending')}
          className={`rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Pending' ? 'ring-2 ring-amber-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Pending Review</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">{stats.pendingScreening}</span>
              <HelpCircle className="h-5 w-5 text-amber-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-amber-600/80">Waiting evaluation</span>
          </CardContent>
        </Card>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Funnel Conversion Chart */}
        <Card className="rounded-[1.5rem] border shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-[#800020]" /> Funnel Conversion Rates
            </CardTitle>
            <CardDescription className="text-xs">Candidate dropoff rates by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
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
            ].map((stage, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span className="font-mono text-foreground">{stage.count} ({stage.percent}%)</span>
                </div>
                <div className="h-3.5 bg-muted rounded-full overflow-hidden border">
                  <div 
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Clan workload workload bar chart */}
        <Card className="rounded-[1.5rem] border shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-[#800020]" /> Technical Reviewer Workloads
            </CardTitle>
            <CardDescription className="text-xs">Candidates assigned to technical evaluators</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex items-end justify-between gap-2 h-44">
            {Object.entries(chartData.clans).map(([clan, count]) => {
              const max = Math.max(...Object.values(chartData.clans), 1);
              const heightPercent = Math.round((count / max) * 100);
              return (
                <div key={clan} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="text-[10px] font-mono font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-muted px-1 rounded">
                    {count}
                  </div>
                  <div className="w-full bg-muted rounded-md h-28 flex items-end overflow-hidden border">
                    <div 
                      className="w-full bg-[#800020] rounded-b-sm group-hover:bg-[#800020]/80 transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground font-semibold truncate max-w-[50px]">
                    {clan}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Tier & score distribution stack */}
        <Card className="rounded-[1.5rem] border shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LayoutGrid className="h-4.5 w-4.5 text-[#800020]" /> Candidate Tiers
            </CardTitle>
            <CardDescription className="text-xs">Evaluator-assigned tier counts</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3">
            {Object.entries(chartData.tiers).map(([tier, count]) => {
              const max = Math.max(...Object.values(chartData.tiers), 1);
              const percent = Math.round((count / (globalData.length || 1)) * 100);
              return (
                <div key={tier} className="flex items-center justify-between text-xs gap-3">
                  <Badge variant="outline" className="font-mono w-14 shrink-0 font-bold justify-center border-primary/20 text-[#800020] bg-primary/5">
                    {tier}
                  </Badge>
                  <div className="flex-1 bg-muted h-3 rounded-full overflow-hidden border">
                    <div 
                      className="bg-[#800020] h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="font-mono text-muted-foreground text-right w-12 shrink-0">{count} ({percent}%)</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>

    </div>
  );"""

    new_return_block = """  return (
    <div className="flex flex-col gap-8">
      
      {/* Title & Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">
            AI Builder Intern — Applicant Funnel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <strong className="text-[#800020]">{sortedAndFiltered.length} applicants</strong> processed · v2 evaluation rubric (max score 30)
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-[#800020] hover:bg-[#800020]/90 text-white rounded-xl shadow-md shrink-0">
          <Download className="mr-2 h-4 w-4 stroke-[1.5]" /> Export Filtered ({sortedAndFiltered.length}) Records (CSV)
        </Button>
      </div>

      {/* Tiles Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Total Tile */}
        <Card 
          onClick={() => handleTileClick('ALL')}
          className={`rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'ALL' ? 'ring-2 ring-[#800020] border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">Applicants</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-foreground">{sortedAndFiltered.length}</span>
              <Users className="h-5 w-5 text-slate-400 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-muted-foreground">Total submissions</span>
          </CardContent>
        </Card>

        {/* Hired Tile */}
        <Card 
          onClick={() => handleTileClick('Hired')}
          className={`rounded-2xl border border-green-500/20 bg-green-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Hired' ? 'ring-2 ring-green-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-green-700 dark:text-green-400 uppercase tracking-wider block">Hired</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-green-600 dark:text-green-400">{stats.hired}</span>
              <CheckCircle className="h-5 w-5 text-green-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-green-600/80">Approved for offer</span>
          </CardContent>
        </Card>

        {/* In Review Tile */}
        <Card 
          onClick={() => handleTileClick('Vetting')}
          className={`rounded-2xl border border-blue-500/20 bg-blue-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Vetting' ? 'ring-2 ring-blue-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase tracking-wider block">In Review</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">{stats.vetting}</span>
              <Flame className="h-5 w-5 text-blue-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-blue-600/80">Review passed</span>
          </CardContent>
        </Card>

        {/* Pending Review Tile */}
        <Card 
          onClick={() => handleTileClick('Pending')}
          className={`rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Pending' ? 'ring-2 ring-amber-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Pending Review</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">{stats.pendingScreening}</span>
              <HelpCircle className="h-5 w-5 text-amber-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-amber-600/80">Waiting evaluation</span>
          </CardContent>
        </Card>

        {/* Rejected Tile */}
        <Card 
          onClick={() => handleTileClick('Declined')}
          className={`rounded-2xl border border-red-500/20 bg-red-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Declined' ? 'ring-2 ring-red-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-red-700 dark:text-red-400 uppercase tracking-wider block">Declined</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-red-600 dark:text-red-400">{stats.rejected}</span>
              <XOctagon className="h-5 w-5 text-red-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-red-600/80">Any funnel stage</span>
          </CardContent>
        </Card>

      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tier & score distribution stack (Candidate Tiers first) */}
        <Card className="rounded-[1.5rem] border shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <LayoutGrid className="h-4.5 w-4.5 text-[#800020]" /> Candidate Tiers
            </CardTitle>
            <CardDescription className="text-xs">Evaluator-assigned tier counts</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3">
            {Object.entries(chartData.tiers).map(([tier, count]) => {
              const max = Math.max(...Object.values(chartData.tiers), 1);
              const percent = Math.round((count / (globalData.length || 1)) * 100);
              return (
                <div key={tier} className="flex items-center justify-between text-xs gap-3">
                  <Badge variant="outline" className="font-mono w-14 shrink-0 font-bold justify-center border-primary/20 text-[#800020] bg-primary/5">
                    {tier}
                  </Badge>
                  <div className="flex-1 bg-muted h-3 rounded-full overflow-hidden border">
                    <div 
                      className="bg-[#800020] h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="font-mono text-muted-foreground text-right w-12 shrink-0">{count} ({percent}%)</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Technical Reviewer Workloads table (Middle) */}
        <Card className="rounded-[1.5rem] border shadow-sm lg:col-span-1 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-[#800020]" /> Technical Reviewer Workloads
            </CardTitle>
            <CardDescription className="text-xs">Candidates assigned to technical reviewers</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 overflow-y-auto flex-1 px-4 max-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="py-2 px-1 font-bold text-muted-foreground">Technical Reviewer</th>
                  <th className="py-2 px-1 font-bold text-muted-foreground text-right w-[80px]">Candidates</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono">
                {Object.entries(chartData.clans)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([clan, count]) => (
                    <tr key={clan} className="hover:bg-muted/10">
                      <td className="py-2 px-1 font-sans font-semibold text-foreground">{clan}</td>
                      <td className="py-2 px-1 text-right text-foreground font-extrabold">{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Funnel Conversion Chart (Last) */}
        <Card className="rounded-[1.5rem] border shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-[#800020]" /> Funnel Conversion Rates
            </CardTitle>
            <CardDescription className="text-xs">Candidate dropoff rates by pipeline stage</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-4">
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
            ].map((stage, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span className="font-mono text-foreground">{stage.count} ({stage.percent}%)</span>
                </div>
                <div className="h-3.5 bg-muted rounded-full overflow-hidden border">
                  <div 
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

    </div>
  );"""

    content = content.replace(old_return_block, new_return_block)

    # Let's check if the recruiter-portal's data explorer needs to be deleted as well.
    # Note: recruiter-portal's OverallFunnelDashboard was not yet modified, so it might have the table at the bottom.
    # Let's strip the table if it's recruiter-portal.
    if 'recruiter-portal' in filepath:
        # If there's the long Data Explorer table section in recruiter dashboard, let's truncate it.
        content = content.split('      {/* Main Filterable Data Explorer Table */}')[0]
        # Clean closing tags
        if not content.strip().endswith('}'):
            # Make sure we close correctly
            content = content.rstrip()
            if not content.endswith('}'):
                content = content + "\n    </div>\n  );\n}"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated OverallFunnelDashboard layout in {filepath}")

# Update the dashboard components
update_overall_dashboard('master-portal/src/components/OverallFunnelDashboard.jsx')
update_overall_dashboard('recruiter-portal/src/components/OverallFunnelDashboard.jsx')

# Now let's update redirect URLs in master-portal/src/App.jsx
master_app = 'master-portal/src/App.jsx'
with open(master_app, 'r', encoding='utf-8') as f:
    master_content = f.read()

master_content = master_content.replace("'https://recruiter-portal-one.vercel.app'", "'https://hr-round.vercel.app'")
master_content = master_content.replace("'https://executive-portal-nine.vercel.app'", "'https://executive-portal.vercel.app'")

with open(master_app, 'w', encoding='utf-8') as f:
    f.write(master_content)
print("Updated Vercel redirection URLs in master App.jsx")
