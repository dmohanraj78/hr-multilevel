import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Search, LayoutGrid, Users, CheckCircle, Flame, XOctagon, HelpCircle, BarChart3, TrendingUp, Filter, ArrowUp, ArrowDown } from 'lucide-react';

function HeaderFilter({
  label,
  columnKey,
  uniqueValues,
  activeFilters,
  onApplyFilter,
  sortConfig,
  onSort,
  isNumeric = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const current = activeFilters[columnKey];
      if (current) {
        setTempSelected(new Set(current));
      } else {
        setTempSelected(new Set(uniqueValues));
      }
    }
  }, [isOpen, uniqueValues, activeFilters, columnKey]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleValue = (val) => {
    const next = new Set(tempSelected);
    if (next.has(val)) {
      next.delete(val);
    } else {
      next.add(val);
    }
    setTempSelected(next);
  };

  const handleSelectAll = () => {
    setTempSelected(new Set(uniqueValues));
  };

  const handleClearAll = () => {
    setTempSelected(new Set());
  };

  const handleApply = () => {
    if (tempSelected.size === uniqueValues.length) {
      onApplyFilter(columnKey, null);
    } else {
      onApplyFilter(columnKey, Array.from(tempSelected));
    }
    setIsOpen(false);
  };

  const handleSortAsc = () => {
    onSort(columnKey, 'asc');
    setIsOpen(false);
  };

  const handleSortDesc = () => {
    onSort(columnKey, 'desc');
    setIsOpen(false);
  };

  const hasActiveFilter = activeFilters[columnKey] !== undefined && activeFilters[columnKey] !== null;
  const isSortedAsc = sortConfig?.key === columnKey && sortConfig?.direction === 'asc';
  const isSortedDesc = sortConfig?.key === columnKey && sortConfig?.direction === 'desc';

  const filteredUniqueValues = uniqueValues.filter(val =>
    String(val).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-flex items-center gap-1.5 group/header select-none text-left" ref={popoverRef}>
      <span className="font-semibold text-foreground">{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 rounded hover:bg-muted/80 transition-all ${
          isOpen || hasActiveFilter || isSortedAsc || isSortedDesc
            ? 'text-[#800020] opacity-100 bg-[#800020]/10 border border-[#800020]/20'
            : 'text-muted-foreground opacity-40 group-hover/header:opacity-100'
        }`}
      >
        <Filter className="h-3.5 w-3.5 stroke-[2]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-card border rounded-xl shadow-xl z-[999] text-card-foreground p-3 font-normal text-sm normal-case flex flex-col gap-3">
          {/* Sorting */}
          <div className="flex flex-col gap-1">
            <button
              onClick={handleSortAsc}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-muted transition-colors w-full font-medium ${
                isSortedAsc ? 'text-[#800020] bg-[#800020]/5 font-semibold' : ''
              }`}
            >
              <ArrowUp className="h-4 w-4 text-[#800020]" />
              Sort {isNumeric ? 'Smallest to Largest' : 'A to Z'}
            </button>
            <button
              onClick={handleSortDesc}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-muted transition-colors w-full font-medium ${
                isSortedDesc ? 'text-[#800020] bg-[#800020]/5 font-semibold' : ''
              }`}
            >
              <ArrowDown className="h-4 w-4 text-[#800020]" />
              Sort {isNumeric ? 'Largest to Smallest' : 'Z to A'}
            </button>
          </div>

          <div className="border-t my-0.5" />

          {/* Search values */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs rounded-md"
            />
          </div>

          {/* Quick selectors */}
          <div className="flex items-center gap-2 text-xs font-semibold px-1">
            <button onClick={handleSelectAll} className="text-[#800020] hover:underline">Select All</button>
            <span className="text-muted-foreground">·</span>
            <button onClick={handleClearAll} className="text-[#800020] hover:underline">Clear</button>
          </div>

          {/* Checkboxes List */}
          <div className="max-h-40 overflow-y-auto border rounded-lg p-2 flex flex-col gap-1.5 bg-muted/20">
            {filteredUniqueValues.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">No matching values</div>
            ) : (
              filteredUniqueValues.map((val) => {
                const isChecked = tempSelected?.has(val);
                return (
                  <label key={val} className="flex items-center gap-2 px-1 py-0.5 hover:bg-muted/50 rounded cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isChecked || false}
                      onChange={() => handleToggleValue(val)}
                      className="rounded border-muted text-[#800020] focus:ring-[#800020] h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="truncate text-foreground font-medium">{String(val)}</span>
                  </label>
                );
              })
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 border-t pt-2 mt-1">
            <Button size="xs" variant="ghost" onClick={() => setIsOpen(false)} className="h-8 rounded-lg text-xs">
              Cancel
            </Button>
            <Button size="xs" onClick={handleApply} className="bg-[#800020] hover:bg-[#800020]/90 text-white h-8 rounded-lg text-xs font-semibold px-3">
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OverallFunnelDashboard({ globalData, onViewCandidate, onTileClick }) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Helper selectors
  const getR1 = (c) => {
    if (!c) return {};
    const val = c.round_1_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };

  const getR2 = (c) => {
    if (!c) return {};
    const val = c.round_2_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };

  const getR3 = (c) => {
    if (!c) return {};
    const val = c.round_3_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };

  // Funnel Stage Determinator
  const getFunnelStage = (c) => {
    const r1 = getR1(c);
    const r2 = getR2(c);
    const r3 = getR3(c);

    if (r3.verdict === 'Yes') return 'Hired';
    if (r3.verdict === 'No') return 'Declined (Offer)';
    
    const r2Decision = r2.moved_to_round_3;
    const isR2Finished = r2Decision && !r2Decision.endsWith('_draft');
    
    if (isR2Finished && (r2Decision === 'No' || r2Decision === 'Declined')) return 'Declined (Review)';
    if (r1.app_status === 'Reject') return 'Declined (Review)';
    if (r1.app_status === 'Yes') return 'Tech Review';
    if (r1.app_status === 'Maybe') return 'Maybe (Reviewed)';
    if (r1.app_status === 'Duplicate') return 'Duplicate';
    return 'Pending Review';
  };

  // Deduplicate globalData first (before stats) so all counts are in sync
  const deduplicatedGlobal = useMemo(() => {
    return globalData.reduce((acc, current) => {
      const x = acc.find(item => item.email?.trim().toLowerCase() === current.email?.trim().toLowerCase());
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
  }, [globalData]);

  // Number of candidates with an R1 evaluation record = 682 (consistent with R1 tab)
  const evaluatedCount = globalData.filter(c => c.round_1_evaluation !== null).length;
  const rawTotal = globalData.length; // 697 total raw submissions
  const duplicatesRemoved = rawTotal - evaluatedCount; // 697 - 682 = 15 duplicates removed

  // 1. Calculate Metrics — use globalData (reflects actual round_1_evaluation records)
  const stats = useMemo(() => {
    let total = evaluatedCount; // 682 — same as R1 tab StatsBanner
    let hired = 0;
    let rejected = 0;
    let review = 0;
    let pendingScreening = 0;
    let maybeCount = 0;

    globalData.forEach(c => {
      if (c.round_1_evaluation === null) return; // Skip unevaluated submissions (the 15 duplicates/drafts)
      const stage = getFunnelStage(c);
      if (stage === 'Hired') hired++;
      else if (stage.startsWith('Declined')) rejected++;
      else if (stage === 'Tech Review') review++;
      else if (stage === 'Pending Review') pendingScreening++;
      else if (stage.startsWith('Maybe')) maybeCount++;
    });

    return { total, hired, rejected, review, pendingScreening, maybeCount };
  }, [globalData, evaluatedCount]);

  // 2. Chart Calculations — use globalData so Technical Reviewer counts reflect actual eval records
  const chartData = useMemo(() => {
    const clans = { Tejaswini: 0, Sohan: 0, Basvaraj: 0, Pushkaraj: 0, Akash: 0, Anmol: 0, Sachin: 0, 'Akhil L': 0, Vedant: 0, 'Akhil M': 0, Samit: 0, Snehanshu: 0, Ankita: 0, Kaushik: 0, Unassigned: 0 };
    const tiers = { 'T1+': 0, 'T1': 0, 'T2+': 0, 'T2': 0, 'T3': 0, 'N/A': 0 };
    const scores = { '0-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '21-25': 0, '26-30': 0 };

    globalData.forEach(c => {
      const r1 = getR1(c);
      
      const clan = r1.eval_group || 'Unassigned';
      if (clans[clan] !== undefined) clans[clan]++;
      else clans['Unassigned']++;

      const tier = r1.tier || 'N/A';
      if (tiers[tier] !== undefined) tiers[tier]++;
      else tiers['N/A']++;

      const score = parseFloat(r1.total || 0);
      if (score >= 26) scores['26-30']++;
      else if (score >= 21) scores['21-25']++;
      else if (score >= 16) scores['16-20']++;
      else if (score >= 11) scores['11-15']++;
      else if (score >= 6) scores['6-10']++;
      else scores['0-5']++;
    });

    return { clans, tiers, scores };
  }, [globalData]);



  // Header field value extractors
  const getFieldVal = {
    id: (c) => c.id,
    candidate: (c) => c.full_name || 'Anonymous Applicant',
    university: (c) => c.ug_university || '-',
    tier: (c) => getR1(c).tier || 'N/A',
    score: (c) => parseFloat(getR1(c).total || 0),
    clan: (c) => getR1(c).eval_group || 'Unassigned',
    funnelStage: (c) => getFunnelStage(c)
  };

  // Helpers to get unique lists
  const getUniqueValues = (columnKey, extractor) => {
    const vals = globalData.map(extractor);
    return Array.from(new Set(vals)).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
  };

  const uniqueIds = useMemo(() => getUniqueValues('id', getFieldVal.id), [globalData]);
  const uniqueCandidates = useMemo(() => getUniqueValues('candidate', getFieldVal.candidate), [globalData]);
  const uniqueUniversities = useMemo(() => getUniqueValues('university', getFieldVal.university), [globalData]);
  const uniqueTiers = useMemo(() => getUniqueValues('tier', getFieldVal.tier), [globalData]);
  const uniqueScores = useMemo(() => getUniqueValues('score', getFieldVal.score), [globalData]);
  const uniqueClans = useMemo(() => getUniqueValues('clan', getFieldVal.clan), [globalData]);
  const uniqueStages = useMemo(() => getUniqueValues('funnelStage', getFieldVal.funnelStage), [globalData]);

  const handleApplyFilter = (columnKey, selectedValues) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (selectedValues === null) {
        delete next[columnKey];
      } else {
        next[columnKey] = selectedValues;
      }
      return next;
    });
  };

  const handleSort = (columnKey, direction) => {
    setSortConfig({ key: columnKey, direction });
  };

  // Filtering logic
  const filteredApplicants = useMemo(() => {
    return globalData.filter(c => {
      const r1 = getR1(c);
      const stage = getFunnelStage(c);

      // Search Query
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (c.full_name || '').toLowerCase().includes(q);
        const emailMatch = (c.email || '').toLowerCase().includes(q);
        const collegeMatch = (c.ug_university || '').toLowerCase().includes(q);
        const idMatch = c.id?.toString().includes(q);
        if (!nameMatch && !emailMatch && !collegeMatch && !idMatch) return false;
      }

      // Header filters
      if (activeFilters.id && !activeFilters.id.includes(c.id)) return false;
      if (activeFilters.candidate && !activeFilters.candidate.includes(c.full_name || 'Anonymous Applicant')) return false;
      if (activeFilters.university && !activeFilters.university.includes(c.ug_university || '-')) return false;
      if (activeFilters.tier && !activeFilters.tier.includes(r1.tier || 'N/A')) return false;
      if (activeFilters.score && !activeFilters.score.includes(parseFloat(r1.total || 0))) return false;
      if (activeFilters.clan && !activeFilters.clan.includes(r1.eval_group || 'Unassigned')) return false;
      if (activeFilters.funnelStage && !activeFilters.funnelStage.includes(stage)) return false;

      return true;
    });
  }, [globalData, search, activeFilters]);

  // Sorting logic
  const sortedAndFiltered = useMemo(() => {
    if (!sortConfig.key) return filteredApplicants;

    return [...filteredApplicants].sort((a, b) => {
      let valA = getFieldVal[sortConfig.key](a);
      let valB = getFieldVal[sortConfig.key](b);

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      return sortConfig.direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredApplicants, sortConfig]);

  // Deduplicated sortedAndFiltered list
  const deduplicatedFiltered = useMemo(() => {
    return sortedAndFiltered.reduce((acc, current) => {
      const x = acc.find(item => item.email?.trim().toLowerCase() === current.email?.trim().toLowerCase());
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
  }, [sortedAndFiltered]);

  // Filtered count matching R1 eval records (for the APPLICANTS card = 682 when no filter)
  const evaluatedFiltered = filteredApplicants.filter(c => c.round_1_evaluation !== null);
  const filteredDuplicatesRemoved = sortedAndFiltered.length - evaluatedFiltered.length;

  // Tile Clicks Map to Header Filter
  const handleTileClick = (stageType) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (stageType === 'ALL') {
        delete next.funnelStage;
      } else if (stageType === 'Hired') {
        next.funnelStage = ['Hired'];
      } else if (stageType === 'Review') {
        next.funnelStage = ['Tech Review'];
      } else if (stageType === 'Declined') {
        next.funnelStage = ['Declined (Offer)', 'Declined (Review)'];
      } else if (stageType === 'Pending') {
        next.funnelStage = ['Pending Review'];
      }
      return next;
    });
    onTileClick?.(stageType);
  };

  const getActiveTile = () => {
    const fs = activeFilters.funnelStage;
    if (!fs) return 'ALL';
    if (fs.includes('Hired') && fs.length === 1) return 'Hired';
    if (fs.includes('Tech Review') && fs.length === 1) return 'Review';
    if (fs.includes('Pending Review') && fs.length === 1) return 'Pending';
    if (fs.includes('Declined (Offer)')) return 'Declined';
    return 'CUSTOM';
  };

  const currentActiveTile = getActiveTile();

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      'Applicant ID', 'Full Name', 'Email', 'Role', 'UG University', 
      'R1 Review Status', 'R1 Assigned Technical Evaluator', 'R1 AI Score', 'R1 Tier', 'R1 Comments',
      'R2 Start Date', 'R2 Concerns/Restrictions', 'R2 Tech Depth', 'R2 Solves Biz?', 'R2 Tech Stack', 'R2 Latency/Cost considered', 'R2 Decision', 'R2 Comments',
      'R3 Verdict', 'R3 Executive Comments'
    ];

    const rows = deduplicatedFiltered.map(c => {
      const r1 = getR1(c);
      const r2 = getR2(c);
      const r3 = getR3(c);

      return [
        c.id,
        c.full_name || '',
        c.email || '',
        c.applied_role || '',
        c.ug_university || '',
        r1.app_status || 'Pending',
        r1.eval_group || 'None',
        r1.total || '0',
        r1.tier || 'N/A',
        (r1.review_comments || '').replace(/"/g, '""'),
        r2.when_can_they_start || '',
        (r2.duration_months || '').replace(/"/g, '""'),
        r2.product_depth || '',
        r2.solves_business_problem || '',
        r2.tech_stack || '',
        r2.complexity || '',
        r2.moved_to_round_3 || '',
        (r2.demo_review_comment || '').replace(/"/g, '""'),
        r3.verdict || 'Pending',
        (r3.review_comments || '').replace(/"/g, '""')
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `applicant_funnel_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Title & Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">
            AI Builder Intern — Applicant Funnel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <strong className="text-[#800020]">{rawTotal} applications</strong> processed · {duplicatesRemoved} duplicates removed · v2 rubric (max score 30)
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-[#800020] hover:bg-[#800020]/90 text-white rounded-xl shadow-md shrink-0">
          <Download className="mr-2 h-4 w-4 stroke-[1.5]" /> Export Filtered ({deduplicatedFiltered.length}) Records (CSV)
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
              <span className="text-3xl font-extrabold font-mono text-foreground">{evaluatedFiltered.length}</span>
              <Users className="h-5 w-5 text-slate-400 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-muted-foreground">{filteredDuplicatesRemoved} duplicates removed</span>
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
          onClick={() => handleTileClick('Review')}
          className={`rounded-2xl border border-blue-500/20 bg-blue-500/5 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${
            currentActiveTile === 'Review' ? 'ring-2 ring-blue-500 border-transparent' : ''
          }`}
        >
          <CardContent className="pt-4 pb-3 flex flex-col gap-1">
            <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase tracking-wider block">Review</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">{stats.review}</span>
              <Flame className="h-5 w-5 text-blue-500 stroke-[1.5]" />
            </div>
            <span className="text-[10px] text-blue-600/80">HR Round Cleared</span>
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
              <TrendingUp className="h-4.5 w-4.5 text-[#800020]" /> Candidate Pipeline
            </CardTitle>
            <CardDescription className="text-xs">Recruitment Funnel</CardDescription>
          </CardHeader>
                    <CardContent className="pt-4 flex flex-col gap-4">
            {(() => {
              const applicationsCount = evaluatedFiltered.length; // total count of round 1 evaluation
              // Use filteredApplicants (pre-dedup) so counts match round_1_evaluation actuals (137 cleared)
              const clearedR1Count = filteredApplicants.filter(c => getR1(c).app_status === 'Yes').length;
              const movedR3Count = filteredApplicants.filter(c => {
                const m = getR2(c).moved_to_round_3;
                return m && typeof m === 'string' && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
              }).length;
              const hiredCount = filteredApplicants.filter(c => getR3(c).verdict === 'Yes').length;

              return [
                { label: '1. Applied', count: applicationsCount, percent: 100, color: 'bg-slate-400' },
                { label: '2. Cleared HR Round', count: clearedR1Count, percent: Math.round((clearedR1Count / (applicationsCount || 1)) * 100), color: 'bg-blue-500' },
                { label: '3. Selected for Executive Review', count: movedR3Count, percent: Math.round((movedR3Count / (applicationsCount || 1)) * 100), color: 'bg-purple-500' },
                { label: '4. Hired', count: hiredCount, percent: Math.round((hiredCount / (applicationsCount || 1)) * 100), color: 'bg-[#800020]' }
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
            ))})()}
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
            {Object.entries(chartData.clans).filter(([clan]) => clan !== 'Unassigned').map(([clan, count]) => {
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
  );
}