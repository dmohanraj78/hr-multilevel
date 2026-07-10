import os
import re

app_path = 'master-portal/src/App.jsx'

with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Define the uniDataList and sortedUnis memos in the component body
# Let's insert them right before the return statement:
body_memos = """  // Helper to get distinctive words for adaptive merging
  const getDistinctiveWords = (str) => {
    const noise = new Set([
      'india', 'university', 'univ', 'college', 'institute', 'technology', 'tech', 
      'engineering', 'school', 'of', 'and', 'ap', 'chennai', 'hyderabad', 'pune', 
      'jaipur', 'bhopal', 'nagpur', 'kottayam', 'kurnool', 'manipur', 'jabalpur',
      'science', 'sciences', 'education', 'foundation', 'management', 'development',
      'designed', 'manufacturing', 'research', 'other', 'unspecified'
    ]);
    
    return str.toLowerCase()
      .replace(/[,.-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !noise.has(w));
  };

  const shouldMerge = (name1, name2) => {
    const words1 = getDistinctiveWords(name1);
    const words2 = getDistinctiveWords(name2);
    if (words1.length === 0 || words2.length === 0) return false;
    return words1.some(w => words2.includes(w));
  };

  // Construct presentation data with tier counts
  const uniDataList = useMemo(() => {
    const rawGroups = {};
    r1Candidates.forEach(cand => {
      const rawUniv = cand.raw_submissions?.ug_university || cand.ug_university || 'Other/Unspecified';
      const name = normalizeUniversity(rawUniv);
      
      if (!rawGroups[name]) {
        rawGroups[name] = {
          name,
          candidates: []
        };
      }
      rawGroups[name].candidates.push(cand);
    });

    const mergedGroups = [];
    Object.values(rawGroups).forEach(group => {
      let merged = false;
      for (let target of mergedGroups) {
        if (shouldMerge(group.name, target.name)) {
          target.candidates.push(...group.candidates);
          merged = true;
          break;
        }
      }
      if (!merged) {
        mergedGroups.push(group);
      }
    });

    return mergedGroups.map(group => {
      const tiers = { 'Tier 1+': 0, 'Tier 1': 0, 'Tier 2+': 0, 'Tier 2': 0, 'Tier 3': 0, 'T4': 0, 'N/A': 0 };
      
      group.candidates.forEach(cand => {
        let tier = cand.tier || 'N/A';
        if (tier === 'T1+') tier = 'Tier 1+';
        else if (tier === 'T1') tier = 'Tier 1';
        else if (tier === 'T2+') tier = 'Tier 2+';
        else if (tier === 'T2') tier = 'Tier 2';
        else if (tier === 'T3') tier = 'Tier 3';
        else if (tier === 'T4') tier = 'T4';
        else if (tier === 'N/A') tier = 'N/A';
        
        tiers[tier] = (tiers[tier] || 0) + 1;
      });

      return {
        name: group.name,
        total: group.candidates.length,
        tiers,
        candidates: group.candidates
      };
    });
  }, [r1Candidates]);

  const sortedUnis = useMemo(() => {
    let list = uniDataList;
    if (univSearch) {
      list = list.filter(u => u.name.toLowerCase().includes(univSearch.toLowerCase()));
    }
    return [...list].sort((a, b) => b.total - a.total);
  }, [uniDataList, univSearch]);
"""

# Let's clean up the old definitions inside the activeTab === 'university' block
# In the original file we had getDistinctiveWords, shouldMerge, rawGroups, mergedGroups, uniDataList, sortedUnis defined.
# Let's replace the whole top half of the university tab IIFE.
# Let's see if we can just define these body memos right before the main return statement.
content = content.replace("  return (\n    <div className=\"min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200\">", body_memos + "\n  return (\n    <div className=\"min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200\">")

# Now let's remove duplicate declarations in the activeTab === 'university' tab
# Let's look for "activeTab === 'university' && (() => {"
# In university tab:
content = re.sub(
    r'\{activeTab === \'university\' && \(\(\) => \{\s*// Helper to get distinctive words for adaptive merging[\s\S]*?let sortedUnis = uniDataList\.sort\(\(a, b\) => b\.total - a\.total\);[\s\S]*?if \(univSearch\) \{[\s\S]*?sortedUnis = sortedUnis\.filter\(u => u\.name\.toLowerCase\(\)\.includes\(univSearch\.toLowerCase\(\)\)\);[\s\S]*?\}',
    "{activeTab === 'university' && (() => {",
    content
)

# 2. Modify overview tab content
# Let's see: we want to render the university cards if selectedUnivName is falsy,
# and if selectedUnivName is truthy, render the candidates list table for the target university.
# Let's prepare the university detail candidate table JSX:
uni_detail_table_jsx = """            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              selectedUnivName ? (() => {
                const targetUni = uniDataList.find(u => u.name === selectedUnivName);
                if (!targetUni) return null;
                return (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUnivName(null)}
                          className="rounded-lg h-9 px-3 border-[#800020] text-[#800020] hover:bg-[#800020]/10 hover:text-[#800020] font-bold"
                        >
                          &larr; Back to Dashboard
                        </Button>
                        <div>
                          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Building className="h-5 w-5 text-[#800020]" /> {targetUni.name}
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Candidate roster for {targetUni.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono font-bold text-xs bg-[#800020]/10 text-[#800020] px-3 py-1.5 rounded-full">
                        {targetUni.total} {targetUni.total === 1 ? 'candidate' : 'candidates'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {Object.entries(targetUni.tiers).map(([tierName, count]) => {
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
                          <div key={tierName} className={`flex flex-col items-center p-3 rounded-xl border text-center font-semibold ${colors[tierName] || 'bg-muted text-muted-foreground'}`}>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider mb-1">{tierName}</span>
                            <span className="font-mono text-xl font-black">{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    <Card className="rounded-[1.25rem] overflow-hidden border shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted/40 border-b">
                              <th className="p-3.5 font-bold font-mono text-[10px] uppercase text-muted-foreground w-[80px]">ID</th>
                              <th className="p-3.5 font-bold text-muted-foreground">Candidate Name</th>
                              <th className="p-3.5 font-bold text-muted-foreground">Applied Role</th>
                              <th className="p-3.5 font-bold text-muted-foreground w-[100px]">Tier</th>
                              <th className="p-3.5 font-bold text-muted-foreground w-[120px] text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {targetUni.candidates.map((cand) => (
                              <tr key={cand.id} className="border-b hover:bg-muted/20 last:border-0">
                                <td className="p-3.5 font-mono text-muted-foreground font-semibold">{cand.id}</td>
                                <td className="p-3.5">
                                  <div className="font-bold text-foreground text-sm">{cand.raw_submissions?.full_name || cand.full_name}</div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">{cand.raw_submissions?.email || cand.email}</div>
                                </td>
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 rounded-full bg-muted border font-semibold text-muted-foreground">
                                    {cand.raw_submissions?.applied_role || cand.applied_role}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-background font-bold">{cand.tier || 'N/A'}</Badge>
                                </td>
                                <td className="p-3.5 text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      window.open(getCandidatePortalUrl(cand), '_blank');
                                    }}
                                    className="h-8 px-3 text-xs font-bold border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white rounded-lg shadow-sm"
                                  >
                                    Screen Candidate
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                );
              })() : (
                <div className="animate-in fade-in duration-300 flex flex-col gap-8">
                  <OverallFunnelDashboard
                    globalData={globalData}
                    onViewCandidate={(c) => {
                      setSelectedRound(1); // Default to review view
                      setSelectedCandidate(c);
                    }}
                    onTileClick={(stage) => {
                      if (stage === 'Hired' || stage === 'Declined') {
                        setActiveTab('r3');
                      } else if (stage === 'Review') {
                        setActiveTab('r2');
                      } else if (stage === 'Pending') {
                        setActiveTab('r1');
                      } else if (stage === 'ALL') {
                        setActiveTab('r1');
                      }
                    }}
                  />

                  {/* University Overview Cards Section */}
                  <div className="flex flex-col gap-1 mt-2">
                    <h3 className="text-base font-bold text-foreground font-heading">University Distribution Cards</h3>
                    <p className="text-xs text-muted-foreground">Real-time candidate volumes and tier configurations across colleges.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {uniDataList.length === 0 ? (
                      <div className="col-span-full text-center py-12 border border-dashed rounded-2xl text-muted-foreground font-mono text-sm">
                        No universities found.
                      </div>
                    ) : (
                      uniDataList.slice(0, 4).map((uni) => {
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

# Let's search for the old overview tab content block and replace it
# The old overview tab content block is:
#             {/* Overview Tab Content */}
#             {activeTab === 'overview' && (
#               <div className="animate-in fade-in duration-300 flex flex-col gap-8">
#                 <OverallFunnelDashboard
# ...
#                 />
#
#                 
#
#                 {/* Technical Reviewer Workload Status Snapshots */}
content = re.sub(
    r'\{\/\* Overview Tab Content \*\/\}\s*\{activeTab === \'overview\' && \(\s*<div className="animate-in fade-in duration-300 flex flex-col gap-8">\s*<OverallFunnelDashboard[\s\S]*?\/>\s*',
    uni_detail_table_jsx + "\n\n",
    content
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated App.jsx successfully.")
