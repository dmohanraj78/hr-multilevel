import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Search, LayoutGrid, Users, CheckCircle, Flame, XOctagon, XCircle, HelpCircle, BarChart3, TrendingUp, Filter, ArrowUp, ArrowDown, FileSpreadsheet, Info, ArrowRight, Flag } from 'lucide-react';
import ExcelJS from 'exceljs';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [graduationDecisionFilterR1, setGraduationDecisionFilterR1] = useState('Yes');
  const [graduationDecisionFilterR2, setGraduationDecisionFilterR2] = useState('Yes');

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

  const uniqueDeduplicatedCandidates = useMemo(() => {
    const map = new Map();
    globalData.forEach(c => {
      // Use primary key (c.id) to identify unique applications
      const pk = c.id || c.Applicant_ID || c.applicant_id || c.email;
      if (!pk) {
        map.set(Math.random(), c);
        return;
      }
      const r1 = getR1(c);
      const isDuplicate = r1.app_status === 'Duplicate';
      
      if (!map.has(pk) || (!isDuplicate && getR1(map.get(pk)).app_status === 'Duplicate')) {
        map.set(pk, c);
      }
    });
    return Array.from(map.values());
  }, [globalData]);

  const r1ReviewerPivotData = useMemo(() => {
    const reviewers = ['Akash', 'Aman', 'Ankita', 'Anmol', 'Basvaraj', 'Pushkaraj', 'Sachin', 'Sohan', 'Tejaswini', 'Vedant'];
    const counts = reviewers.reduce((acc, name) => {
      acc[name] = { yes: 0, no: 0, pending: 0, accessRequested: 0, total: 0, dedupTotal: 0 };
      return acc;
    }, {});

    uniqueDeduplicatedCandidates.forEach(c => {
      const r1 = getR1(c);
      const appStatus = r1.app_status || 'Pending';
      const reviewer = r1.eval_group && r1.eval_group !== 'None' ? r1.eval_group : 'Unassigned';
      if (reviewer === 'Unassigned') return;
      
      let cat = 'pending';
      if (appStatus === 'Yes') cat = 'yes';
      else if (['No', 'Reject', 'Rejected', 'Invalid'].includes(appStatus)) cat = 'no';
      else if (appStatus.toLowerCase() === 'access requested') cat = 'accessRequested';
      else cat = 'pending';

      const target = counts[reviewer];
      if (target) {
        target[cat]++;
        target.total++;
        target.dedupTotal++; // Since the dataset is now deduplicated, total is dedupTotal
      }
    });

    return counts;
  }, [uniqueDeduplicatedCandidates]);

  const tierPivotData = useMemo(() => {
    const tiers = ['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+', 'Tier 3', 'Tier 4'];
    const counts = tiers.reduce((acc, tier) => {
      acc[tier] = { yes: 0, pending: 0, reject: 0, total: 0 };
      return acc;
    }, {});

    uniqueDeduplicatedCandidates.forEach(c => {
      const r1 = getR1(c);
      let tier = (r1.tier || '').trim();
      // Keep the exact names requested by standardizing variants
      if (tier === 'Tier 1-') tier = 'Tier 1+';
      if (tier === 'Tier 2-') tier = 'Tier 2+';
      const appStatus = r1.app_status || 'Pending';
      
      if (counts[tier]) {
        if (appStatus === 'Yes') {
          counts[tier].yes++;
          counts[tier].total++;
        } else if (['No', 'Reject', 'Rejected', 'Invalid'].includes(appStatus)) {
          counts[tier].reject++;
          counts[tier].total++;
        } else if (appStatus && appStatus.toLowerCase() === 'access requested') {
          // Exclude "Access Requested" completely per user request
        } else {
          counts[tier].pending++;
          counts[tier].total++;
        }
      }
    });

    return counts;
  }, [uniqueDeduplicatedCandidates]);

  const tierGrandTotal = useMemo(() => {
    const total = { yes: 0, pending: 0, reject: 0, total: 0 };
    Object.values(tierPivotData).forEach(val => {
      total.yes += val.yes;
      total.pending += val.pending;
      total.reject += val.reject;
      total.total += val.total;
    });
    return total;
  }, [tierPivotData]);

  const reviewerPivotData = useMemo(() => {
    const reviewers = ['Akash', 'Aman', 'Ankita', 'Anmol', 'Basvaraj', 'Pushkaraj', 'Sachin', 'Sohan', 'Tejaswini', 'Vedant'];
    const counts = reviewers.reduce((acc, name) => {
      acc[name] = { yes: 0, maybe: 0, no: 0, pending: 0, rejectedR1: 0, total: 0 };
      return acc;
    }, {});

    uniqueDeduplicatedCandidates.forEach(c => {
      const r1 = getR1(c);
      const reviewer = r1.eval_group && r1.eval_group !== 'None' ? r1.eval_group : 'Unassigned';
      if (reviewer === 'Unassigned') return;

      const r2 = getR2(c);
      const appStatus = r1.app_status || 'Pending';
      const moved = r2.moved_to_round_3 || '';
      const isDraft = moved.endsWith('_draft');
      const isFinalized = moved && !isDraft;

      // Determine category
      let cat = 'pending';
      if (['No', 'Reject', 'Rejected', 'Invalid'].includes(appStatus)) {
        cat = 'rejectedR1';
      } else if (isFinalized) {
        if (moved === 'Yes') cat = 'yes';
        else if (moved === 'Maybe') cat = 'maybe';
        else if (moved === 'No' || moved === 'Declined' || moved === 'Reject') cat = 'no';
      } else {
        cat = 'pending';
      }

      const target = counts[reviewer];
      if (target) {
        target[cat]++;
        target.total++;
      }
    });

    return counts;
  }, [uniqueDeduplicatedCandidates]);

  const reviewerGrandTotal = useMemo(() => {
    const total = { yes: 0, maybe: 0, no: 0, pending: 0, rejectedR1: 0, total: 0 };
    Object.values(reviewerPivotData).forEach(val => {
      total.yes += val.yes;
      total.maybe += val.maybe;
      total.no += val.no;
      total.pending += val.pending;
      total.rejectedR1 += val.rejectedR1;
      total.total += val.total;
    });
    return total;
  }, [reviewerPivotData]);

  const graduationPivotDataR1 = useMemo(() => {
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
  }, [uniqueDeduplicatedCandidates, graduationDecisionFilterR2]);

  const deployStagePivotData = useMemo(() => {
    const yesCandidates = uniqueDeduplicatedCandidates.filter(c => {
      const moved = getR2(c).moved_to_round_3 || '';
      return moved === 'Yes' && !moved.endsWith('_draft');
    });

    const counts = {};
    yesCandidates.forEach(c => {
      const stage = getR1(c).deploy_stage || '-';
      if (stage && stage.trim() !== '') {
        if (!counts[stage]) counts[stage] = 0;
        counts[stage]++;
      }
    });
    
    // Sort stages alphabetically
    const stages = Object.keys(counts).sort();

    return { counts, stages, total: yesCandidates.length };
  }, [uniqueDeduplicatedCandidates]);

  // Funnel Stage Determinator
  const getFunnelStage = (c) => {
    const r1 = getR1(c);
    const r2 = getR2(c);
    const r3 = getR3(c);

    if (['Yes', 'Hired'].includes(r3.final_status)) return 'Hired';
    if (['No', 'Rejected'].includes(r3.final_status)) return 'Rejected';
    
    if (r2.moved_to_round_3 === 'Declined') return 'Declined';
    if (r2.moved_to_round_3 === 'No') return 'Rejected';
    
    if ((r1.app_status === 'Reject' || r1.app_status === 'No')) return 'Rejected';
    if (r1.app_status === 'Yes') return 'Tech Review';
    if (r1.app_status === 'Maybe') return 'Maybe (Reviewed)';
    if (r1.app_status === 'Duplicate') return 'Duplicate';
    return 'Pending Review';
  };

  // Base list containing only evaluated candidates (those with a round_1_evaluation record)
  // Every row in round_1_evaluation counts as an applicant — including rows the
  // import pipeline created that are not yet AI-scored (they surface as Pending).
  // This keeps this overview, the R1 worksheet tile, and the reports on the
  // exact same number: count(round_1_evaluation).
  const evaluatedCandidates = useMemo(() => {
    return globalData.filter(c => c.round_1_evaluation !== null);
  }, [globalData]);

  const evaluatedCount = evaluatedCandidates.length;
  const rawTotal = globalData.length; // total raw submissions

  // Raw submissions without an R1 record are NOT all duplicates — split them
  // using the backend's own Analysis_status field:
  //   'Duplicate' or 'Completed' but no R1 row  -> analyzed and excluded (duplicate/test entry)
  //   NULL                       -> genuinely awaiting evaluation
  const isDuplicateStatus = (status) => status === 'Duplicate' || status === 'Completed';
  const { duplicatesRemoved, awaitingEvaluation } = useMemo(() => {
    const notEvaluated = globalData.filter(c => !c.round_1_evaluation);
    const awaiting = notEvaluated.filter(c => !isDuplicateStatus(c.Analysis_status || '')).length;
    return { duplicatesRemoved: notEvaluated.length - awaiting, awaitingEvaluation: awaiting };
  }, [globalData]);

  // 1. Calculate Metrics — use evaluatedCandidates (reflects actual round_1_evaluation records)
  const stats = useMemo(() => {
    const total = evaluatedCount;
    let hired = 0;
    let rejected = 0;
    let review = 0;
    let pendingScreening = 0;
    let maybeCount = 0;

    evaluatedCandidates.forEach(c => {
      const r1 = getR1(c);
      const status = r1.app_status || 'Pending';
      if (status === 'Yes') review++;
      else if ((status === 'Reject' || status === 'No')) rejected++;
      else if (status === 'Maybe') maybeCount++;
      else pendingScreening++;
    });

    hired = evaluatedCandidates.filter(c => ['Yes', 'Hired'].includes(getR3(c).verdict)).length;
    const declinedCount = evaluatedCandidates.filter(c => getR2(c).moved_to_round_3 === 'Declined').length;

    return { total, hired, rejected, review, pendingScreening, maybeCount, declined: declinedCount };
  }, [evaluatedCandidates, evaluatedCount]);

  // 2. Chart Calculations — use evaluatedCandidates so Technical Reviewer counts reflect actual eval records
  const chartData = useMemo(() => {
    const clans = { Tejaswini: 0, Sohan: 0, Basvaraj: 0, Pushkaraj: 0, Akash: 0, Anmol: 0, Sachin: 0, 'Akhil L': 0, Vedant: 0, 'Akhil M': 0, Samit: 0, Snehanshu: 0, Ankita: 0, Kaushik: 0, Aman: 0, Unassigned: 0 };
    const tiers = { 'Tier 1': 0, 'Tier 1-': 0, 'Tier 2': 0, 'Tier 2-': 0, 'Tier 3': 0, 'Tier 4': 0 };
    const scores = { '0-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '21-25': 0, '26-30': 0 };

    evaluatedCandidates.forEach(c => {
      const r1 = getR1(c);
      
      const clan = r1.eval_group || 'Unassigned';
      if (clans[clan] !== undefined) clans[clan]++;
      else clans['Unassigned']++;

      let tier = (r1.tier || 'N/A').trim();
      // normalize any legacy short-form values to the full form
      const TIER_FULL = { 'T1': 'Tier 1', 'T1-': 'Tier 1-', 'T2': 'Tier 2', 'T2-': 'Tier 2-', 'T3': 'Tier 3', 'T4': 'Tier 4' };
      tier = TIER_FULL[tier] || tier;

      if (tiers[tier] !== undefined) tiers[tier]++;

      const score = parseFloat(r1.total || 0);
      if (score >= 26) scores['26-30']++;
      else if (score >= 21) scores['21-25']++;
      else if (score >= 16) scores['16-20']++;
      else if (score >= 11) scores['11-15']++;
      else if (score >= 6) scores['6-10']++;
      else scores['0-5']++;
    });

    return { clans, tiers, scores };
  }, [evaluatedCandidates]);



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
    const vals = evaluatedCandidates.map(extractor);
    return Array.from(new Set(vals)).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
  };

  const uniqueIds = useMemo(() => getUniqueValues('id', getFieldVal.id), [evaluatedCandidates]);
  const uniqueCandidates = useMemo(() => getUniqueValues('candidate', getFieldVal.candidate), [evaluatedCandidates]);
  const uniqueUniversities = useMemo(() => getUniqueValues('university', getFieldVal.university), [evaluatedCandidates]);
  const uniqueTiers = useMemo(() => getUniqueValues('tier', getFieldVal.tier), [evaluatedCandidates]);
  const uniqueScores = useMemo(() => getUniqueValues('score', getFieldVal.score), [evaluatedCandidates]);
  const uniqueClans = useMemo(() => getUniqueValues('clan', getFieldVal.clan), [evaluatedCandidates]);
  const uniqueStages = useMemo(() => getUniqueValues('funnelStage', getFieldVal.funnelStage), [evaluatedCandidates]);

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
    return evaluatedCandidates.filter(c => {
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
  }, [evaluatedCandidates, search, activeFilters]);

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

  // Direct mapping without email deduplication to ensure perfect alignment with Supabase table row counts
  const deduplicatedFiltered = sortedAndFiltered;

  // Filtered count matching R1 eval records (for the APPLICANTS card = 688 when no filter)
  const evaluatedFiltered = filteredApplicants;
  const filteredDuplicatesRemoved = duplicatesRemoved;

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
      } else if (stageType === 'Rejected') {
        next.funnelStage = ['Rejected'];
      } else if (stageType === 'Declined') {
        next.funnelStage = ['Declined'];
      } else if (stageType === 'Pending') {
        next.funnelStage = ['Pending Review'];
      }
      return next;
    });
    if (stageType === 'Rejected') {
      onTileClick?.('Declined');
    } else {
      onTileClick?.(stageType);
    }
  };

  const getActiveTile = () => {
    const fs = activeFilters.funnelStage;
    if (!fs) return 'ALL';
    if (fs.includes('Hired') && fs.length === 1) return 'Hired';
    if (fs.includes('Tech Review') && fs.length === 1) return 'Review';
    if (fs.includes('Pending Review') && fs.length === 1) return 'Pending';
    if (fs.includes('Rejected') && fs.length === 1) return 'Rejected';
    if (fs.includes('Declined') && fs.length === 1) return 'Declined';
    return 'CUSTOM';
  };

  const currentActiveTile = getActiveTile();

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      'Applicant ID', 'Full Name', 'Email', 'Role', 'UG University', 
      'R1 Review Status', 'R1 Assigned Technical Evaluator', 'R1 AI Score', 'R1 Tier', 'R1 Comments',
      'R2 Start Date', 'R2 Duration', 'R2 Concerns/Restrictions', 'R2 Contact Status', 'R2 Problem Fit', 'R2 Tech Depth', 'R2 Latency/Cost considered', 'R2 Tech Stack', 'R2 Decision', 'R2 Comments',
      'R3 Decision', 'R3 Executive Comments'
    ];

    const rows = deduplicatedFiltered.map(c => {
      const r1 = getR1(c);
      const r2 = getR2(c);
      const r3 = getR3(c);

      // Parse combined columns or use new separate fields
      const rawSolves = r2.solves_business_problem || '';
      const r2Solves = r2.contact_status || (rawSolves.includes('Contact: ') ? rawSolves.split('Contact: ')[1].split(' | ')[0] : (['Yet to Speak', 'Spoke', 'Scheduled', 'No response'].includes(rawSolves) ? rawSolves : ''));
      const r2ProblemFit = r2.problem_fit || (rawSolves.includes('Fit: ') ? rawSolves.split('Fit: ')[1] : (['Yes', 'Maybe', 'No'].includes(rawSolves) ? rawSolves : ''));

      const rawDepth = r2.product_depth || '';
      const r2ProductDepth = r2.tech_depth || (rawDepth.includes('Depth: ') ? rawDepth.split('Depth: ')[1].split(' | ')[0] : (['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));
      const r2Latency = r2.latency_considerations || (rawDepth.includes('Latency: ') ? rawDepth.split('Latency: ')[1] : (!['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));

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
        String(r1.review_comments || '').replace(/"/g, '""'),
        r2.when_can_they_start || '',
        String(r2.duration_months || '').replace(/"/g, '""'),
        String(r2.complexity || '').replace(/"/g, '""'),
        r2Solves || '',
        r2ProblemFit || '',
        r2ProductDepth || '',
        r2Latency || '',
        r2.tech_stack || '',
        r2.moved_to_round_3 || '',
        String(r2.demo_review_comment || '').replace(/"/g, '""'),
        r3.final_status || 'Pending',
        String(r3.review_comments || '').replace(/"/g, '""')
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

  const downloadExcelReport = async (roundType = 'combined') => {
    try {
      let workbook = new ExcelJS.Workbook();
    
    if (roundType === 'side-by-side') {
      try {
        const response = await fetch('/template.xlsx');
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          await workbook.xlsx.load(arrayBuffer);
        } else {
          console.warn('Failed to fetch /template.xlsx. Creating blank workbook.');
        }
      } catch (err) {
        console.error('Failed to load template.xlsx, falling back:', err);
      }
    }
    
    // Helper to filter candidates by date range
    const isWithinDateRange = (dateStr) => {
      if (!startDate && !endDate) return true;
      if (!dateStr || dateStr === '-') return false;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;
      
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (startDate) {
        const start = new Date(startDate);
        const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        if (checkDate < startOnly) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        if (checkDate > endOnly) return false;
      }
      return true;
    };

    // Helper to format cells and apply border/font/coloring
    const formatSheet = (sheet) => {
      // Style headers
      const headerRow = sheet.getRow(1);
      headerRow.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF800020' } // Mondee Maroon
      };
      headerRow.height = 24;
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // Style grid cells
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        row.height = 20;
        row.alignment = { vertical: 'middle' };
        row.eachCell((cell) => {
          cell.font = { name: 'Segoe UI', size: 9.5 };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };

          const val = String(cell.value || '').trim();
          const valLower = val.toLowerCase();
          
          // Green highlighting (Yes, Promoted, Approved, Strong, Hired)
          if (['yes', 'promoted', 'approved', 'strong', 'hired', 't1+', 't1'].includes(valLower)) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE2F0D9' } // Light Green
            };
            cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF385723' }, bold: true };
          } 
          // Amber highlighting (Maybe, Good)
          else if (['maybe', 'good', 't2+', 't2'].includes(valLower)) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFF3CD' } // Light Amber
            };
            cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF856404' }, bold: true };
          } 
          // Red highlighting (No, Reject, Declined, Invalid)
          else if (['no', 'reject', 'declined', 'invalid', 't3', 't4', 'duplicate'].includes(valLower)) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8D7DA' } // Light Red
            };
            cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF721C24' }, bold: true };
          }
        });
      });
    };

    // --- Tab 1: Daily Activity Summary ---
    const addSummaryTab = () => {
      const dailyStats = {};
      evaluatedCandidates.forEach(c => {
        const r1 = getR1(c);
        const r2 = getR2(c);
        const r3 = getR3(c);

        if (r1.app_status) {
          const dateStr = new Date(r1.updated_at || c.submission_date).toLocaleDateString('en-CA');
          if (isWithinDateRange(r1.updated_at || c.submission_date)) {
            if (!dailyStats[dateStr]) dailyStats[dateStr] = { r1: 0, r2: 0, r3: 0 };
            dailyStats[dateStr].r1++;
          }
        }
        if (r2.moved_to_round_3) {
          const dateStr = new Date(r2.updated_at || c.submission_date).toLocaleDateString('en-CA');
          if (isWithinDateRange(r2.updated_at || c.submission_date)) {
            if (!dailyStats[dateStr]) dailyStats[dateStr] = { r1: 0, r2: 0, r3: 0 };
            dailyStats[dateStr].r2++;
          }
        }
        if (r3.final_status) {
          const dateStr = new Date(r3.updated_at || c.submission_date).toLocaleDateString('en-CA');
          if (isWithinDateRange(r3.updated_at || c.submission_date)) {
            if (!dailyStats[dateStr]) dailyStats[dateStr] = { r1: 0, r2: 0, r3: 0 };
            dailyStats[dateStr].r3++;
          }
        }
      });

      const sheet = workbook.addWorksheet("Daily Summary");
      sheet.columns = [
        { header: 'Date', key: 'date', width: 18 },
        { header: 'Round 1 Screened', key: 'r1', width: 22 },
        { header: 'Round 2 Tech Vetting', key: 'r2', width: 22 },
        { header: 'Round 3 Executive Decisions', key: 'r3', width: 25 },
        { header: 'Total Daily Evaluations', key: 'total', width: 22 }
      ];

      Object.keys(dailyStats)
        .sort((a, b) => b.localeCompare(a))
        .forEach(date => {
          sheet.addRow({
            date: date,
            r1: dailyStats[date].r1,
            r2: dailyStats[date].r2,
            r3: dailyStats[date].r3,
            total: dailyStats[date].r1 + dailyStats[date].r2 + dailyStats[date].r3
          });
        });

      if (sheet.rowCount === 1) {
        sheet.addRow({ date: 'No activity found', r1: 0, r2: 0, r3: 0, total: 0 });
      }
      formatSheet(sheet);
    };

    // --- Tab 2: Round 1 Screening ---
    const addR1Tab = () => {
      const sheet = workbook.addWorksheet("Round 1 Screening");
      sheet.columns = [
        { header: 'Candidate ID', key: 'id', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 25 },
        { header: 'UG University', key: 'college', width: 35 },
        { header: 'Claude AI Score', key: 'score', width: 18 },
        { header: 'Recruiter Tier', key: 'tier', width: 15 },
        { header: 'Recruiter Status', key: 'status', width: 18 },
        { header: 'Technical Reviewer Assigned', key: 'evaluator', width: 28 },
        { header: 'Recruiter Screening Comments', key: 'comments', width: 45 },
        { header: 'Evaluation Date', key: 'date', width: 22 }
      ];

      evaluatedCandidates
        .filter(c => getR1(c).app_status)
        .filter(c => isWithinDateRange(getR1(c).updated_at || c.submission_date))
        .forEach(c => {
          const r1 = getR1(c);
          sheet.addRow({
            id: c.id,
            name: c.full_name,
            email: c.email,
            role: c.applied_role || '-',
            college: c.ug_university || '-',
            score: parseFloat(r1.total || 0),
            tier: r1.tier || 'N/A',
            status: r1.app_status,
            evaluator: r1.eval_group || 'Unassigned',
            comments: r1.review_comments || '',
            date: r1.updated_at ? new Date(r1.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date(c.submission_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          });
        });

      formatSheet(sheet);
    };

    // --- Tab 3: Round 2 Tech Vetting (Matches candidates_combined.xlsx Columns) ---
    const addR2Tab = () => {
      const sheet = workbook.addWorksheet(roundType === 2 ? "Candidates" : "Round 2 Tech Vetting");
      sheet.columns = [
        { header: 'Candidate ID', key: 'id', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Review Score', key: 'score', width: 15 },
        { header: 'Demo-AI Review', key: 'review_cat', width: 18 },
        { header: 'Review Status', key: 'status', width: 18 },
        { header: 'Technical Evaluator Assigned', key: 'evaluator', width: 28 },
        { header: 'Start Date', key: 'start_date', width: 15 },
        { header: 'Duration (Months)', key: 'duration', width: 18 },
        { header: 'College Commitment / Concerns', key: 'concerns', width: 35 },
        { header: 'Contact Status', key: 'contact_status', width: 18 },
        { header: 'Problem Fit', key: 'problem_fit', width: 15 },
        { header: 'Technical Depth', key: 'tech_depth', width: 15 },
        { header: 'Latency/Security/Cost', key: 'latency', width: 22 },
        { header: 'Tech Stack', key: 'tech_stack', width: 30 },
        { header: 'TR Status', key: 'tr_decision', width: 15 },
        { header: 'TR Comments', key: 'tr_comments', width: 45 }
      ];

      evaluatedCandidates
        .filter(c => getR1(c).app_status === 'Yes') // Cleared R1
        .filter(c => isWithinDateRange(getR2(c).updated_at || c.submission_date))
        .forEach(c => {
          const r1 = getR1(c);
          const r2 = getR2(c);
          const r3 = getR3(c);

          // Map overall Review Status
          let reviewStatus = 'Pending Review';
          if (['Yes', 'Hired'].includes(r3.final_status)) reviewStatus = 'Promoted';
          else if (['No', 'Rejected'].includes(r3.final_status)) reviewStatus = 'Rejected';
          else if (r2.moved_to_round_3 === 'No' || r2.moved_to_round_3 === 'Declined') reviewStatus = 'Declined';
          else if (r2.moved_to_round_3 === 'Yes' || r2.moved_to_round_3 === 'Maybe') reviewStatus = 'Promoted';
          else if ((r1.app_status === 'Reject' || r1.app_status === 'No')) reviewStatus = 'Declined';
          else if (r1.app_status === 'Maybe') reviewStatus = 'Maybe';

          const rawSolves = r2.solves_business_problem || '';
          const contactStatus = r2.contact_status || (rawSolves.includes('Contact: ') ? rawSolves.split('Contact: ')[1].split(' | ')[0] : (['Yet to Speak', 'Spoke', 'Scheduled', 'No response'].includes(rawSolves) ? rawSolves : ''));
          const problemFit = r2.problem_fit || (rawSolves.includes('Fit: ') ? rawSolves.split('Fit: ')[1] : (['Yes', 'Maybe', 'No'].includes(rawSolves) ? rawSolves : ''));

          const rawDepth = r2.product_depth || '';
          const techDepth = r2.tech_depth || (rawDepth.includes('Depth: ') ? rawDepth.split('Depth: ')[1].split(' | ')[0] : (['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));
          const latency = r2.latency_considerations || (rawDepth.includes('Latency: ') ? rawDepth.split('Latency: ')[1] : (!['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));

          sheet.addRow({
            id: c.id,
            name: c.full_name,
            email: c.email,
            score: parseFloat(r1.total || 0),
            review_cat: r1.review_cat || 'N/A',
            status: reviewStatus,
            evaluator: r1.eval_group || 'Unassigned',
            start_date: r2.when_can_they_start || '',
            duration: r2.duration_months || '',
            concerns: r2.complexity || '',
            contact_status: contactStatus || '',
            problem_fit: problemFit || '',
            tech_depth: techDepth || '',
            latency: latency || '',
            tech_stack: r2.tech_stack || '',
            tr_decision: r2.moved_to_round_3 || 'Pending',
            tr_comments: r2.demo_review_comment || ''
          });
        });

      formatSheet(sheet);
    };

    // --- Tab 4: Round 3 Executive Verdict ---
    const addR3Tab = () => {
      const sheet = workbook.addWorksheet("Round 3 Executive Decisions");
      sheet.columns = [
        { header: 'Candidate ID', key: 'id', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Tier', key: 'tier', width: 12 },
        { header: 'Review Score', key: 'score', width: 15 },
        { header: 'Technical Reviewer Assigned', key: 'evaluator', width: 28 },
        { header: 'TR Status', key: 'tr_decision', width: 15 },
        { header: 'TR Comments', key: 'tr_comments', width: 45 },
        { header: 'Status', key: 'verdict', width: 15 },
        { header: 'Executive Decision Comments', key: 'comments', width: 45 },
        { header: 'Decision Date', key: 'date', width: 22 }
      ];

      evaluatedCandidates
        .filter(c => getR2(c).moved_to_round_3 === 'Yes' || getR2(c).moved_to_round_3 === 'Maybe')
        .filter(c => isWithinDateRange(getR3(c).updated_at || c.submission_date))
        .forEach(c => {
          const r1 = getR1(c);
          const r2 = getR2(c);
          const r3 = getR3(c);

          sheet.addRow({
            id: c.id,
            name: c.full_name,
            email: c.email,
            tier: r1.tier || 'N/A',
            score: parseFloat(r1.total || 0),
            evaluator: r1.eval_group || 'Unassigned',
            tr_decision: r2.moved_to_round_3,
            tr_comments: r2.demo_review_comment || '',
            final_status: r3.final_status || 'Pending',
            comments: r3.review_comments || '',
            date: r3.updated_at ? new Date(r3.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date(c.submission_date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          });
        });

      formatSheet(sheet);
    };

    // --- Tab: R1 & R2 Side-by-Side ---
    const addSideBySideTab = () => {
      let sheet = workbook.getWorksheet("Analysis");
      if (!sheet) {
        sheet = workbook.addWorksheet("Analysis");
      } else {
        // Clear all rows starting from row 7 to end using spliceRows
        const rc = sheet.rowCount;
        if (rc >= 7) {
          sheet.spliceRows(7, rc - 6);
        }
        
        // Delete columns from template to match new structure
        try {
          // Delete "R1 Interview Priority" (Column 37)
          sheet.spliceColumns(37, 1);
          // Delete "Tier" under Round 2 Inputs (was Column 47, now Column 46 after deleting column 37)
          sheet.spliceColumns(46, 1);
        } catch (err) {
          console.error("Failed to delete columns from template:", err);
        }
      }
      sheet.views = [{ showGridLines: true }];

      // Cells loaded from the template SHARE style objects in exceljs, so
      // mutating cell.font/fill/border on one cell silently restyles every
      // other cell in the same shared group (this is what randomly wiped the
      // decision-column colors). Clone the style first to break the sharing.
      const unshareStyle = (cell) => {
        cell.style = { ...cell.style };
        return cell;
      };

      // Set up title lines
      sheet.getRow(1).height = 28;
      const cellA1 = unshareStyle(sheet.getCell('A1'));
      cellA1.value = "Scored Candidates — Analysis";
      cellA1.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF1F3864' } };

      sheet.getRow(2).height = 42;
      const cellA2 = unshareStyle(sheet.getCell('A2'));
      cellA2.value = "Demo Review Notes (AG): DARK GREEN = Industry problem + advanced AI + complex + not a student project · LIGHT GREEN = Function problem + advanced AI + complex + not common student project · PINK = unclear/unassessable · RED = everything else.   Demo cell (AE) RED = invalid/missing demo link.";
      cellA2.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF595959' } };
      cellA2.alignment = { wrapText: true, vertical: 'middle' };

      // Filter and prepare candidates
      const candidatesToExport = evaluatedCandidates
        .filter(c => getR1(c).id !== undefined)
        .filter(c => isWithinDateRange(getR2(c).updated_at || getR1(c).updated_at || c.submission_date));

      // Overwrite Raw Data tab if it exists
      let rawSheet = workbook.getWorksheet("Raw Data");
      if (rawSheet) {
        let rawRowIdx = 2;
        candidatesToExport.forEach(cand => {
          const c = cand;
          const r1 = getR1(c);
          const rowData = [
            c.id,
            c.submission_date,
            c.full_name,
            c.email,
            c.phone,
            c.linkedin,
            c.location,
            c.preferred_start_date,
            c.education_level,
            c.ug_university,
            c.masters_university,
            c.course_major,
            c.degree_status,
            c.completion_year,
            c.programming_languages,
            c.aiml_experience || r1.aiml_exp || '',
            c.claude_ecosystem || r1.claude_lvl || '',
            c.skill_python,
            c.skill_deep_learning,
            c.skill_nlp,
            c.skill_computer_vision,
            c.skill_reinforcement_learning,
            c.skill_multimodal_ai,
            c.skill_finetuning_lora_peft,
            c.skill_llm_orchestration,
            c.skill_agent_fundamentals,
            c.skill_mcp,
            c.skill_embeddings_vector_rag,
            c.skill_reasoning_models,
            c.skill_evals,
            c.skill_ai_coding_tools,
            c.skill_rag,
            c.demo_explanation || c.current_project || '',
            c.project_state || r1.deploy_stage || '',
            c.project_category || r1.domain || '',
            c.demo_link,
            c.github_url,
            c.preferred_industry || '',
            c.open_to_onsite || '',
            c.open_to_travel || '',
            c.anything_else || '',
            c.applied_role || '',
            c.job_id || '',
            c.rubric_id || '',
            c.screening_type || '',
            c.resume_drive_url,
            c.resume_filename || '',
            c.Analysis_status || ''
          ];
          rowData.forEach((val, colIdx) => {
            rawSheet.getCell(rawRowIdx, colIdx + 1).value = val;
          });
          rawRowIdx++;
        });
        // Clear any trailing/leftover rows from template
        const rrc = rawSheet.rowCount;
        if (rrc >= rawRowIdx) {
          rawSheet.spliceRows(rawRowIdx, rrc - rawRowIdx + 1);
        }
      }

      // Calculate stats
      const totalApplicants = candidatesToExport.length;
      let t1 = 0, t1Plus = 0, t2 = 0, t2Plus = 0, t3 = 0, t4 = 0;
      let scores = [];
      candidatesToExport.forEach(c => {
        const r1 = getR1(c);
        const tier = (r1.tier || '').trim().toUpperCase();
        if (['T1', 'TIER 1'].includes(tier)) t1++;
        else if (['T1-', 'TIER 1-'].includes(tier)) t1Plus++;
        else if (['T2', 'TIER 2'].includes(tier)) t2++;
        else if (['T2-', 'TIER 2-'].includes(tier)) t2Plus++;
        else if (['T3', 'TIER 3'].includes(tier)) t3++;
        else if (['T4', 'TIER 4'].includes(tier)) t4++;

        // Only scored rows feed the average/median — unprocessed Pending rows
        // have no total yet and would drag the stats down as zeros
        if (r1.total !== null && r1.total !== undefined) {
          scores.push(parseFloat(r1.total) || 0);
        }
      });

      scores.sort((a, b) => a - b);
      const avgScore = scores.length ? (scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
      const topScore = scores.length ? scores[scores.length - 1] : 0;
      let medianScore = 0;
      if (scores.length) {
        const mid = Math.floor(scores.length / 2);
        medianScore = scores.length % 2 !== 0 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2;
      }

      // Funnel reconciliation counts — these mirror the dashboard tiles and the
      // Supabase tables directly so the sheet's numbers can be sanity-checked
      const fMovedToR2 = candidatesToExport.filter(c => {
        const status = (getR1(c).app_status || '').trim().toLowerCase();
        return status === 'yes';
      }).length;
      const fR2Evaluated = candidatesToExport.filter(c => {
        const r2 = getR2(c);
        return r2.id !== undefined && r2.id !== null;
      }).length;
      const fRejected = candidatesToExport.filter(c => {
        const status = (getR1(c).app_status || '').trim().toLowerCase();
        return ['no', 'rejected', 'invalid', 'reject'].includes(status);
      }).length;
      const fPending = totalApplicants - fMovedToR2 - fRejected - candidatesToExport.filter(c => {
        const status = (getR1(c).app_status || '').trim().toLowerCase();
        return status === 'maybe';
      }).length;

      // Write Row 3 (values)
      sheet.getRow(3).height = 20;
      // Generation stamp so a stale download is immediately recognisable
      const generatedAt = `${new Date().toLocaleDateString('en-CA')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
      const statsVals = [totalApplicants, t1, t1Plus, t2, t2Plus, t3, t4, parseFloat(avgScore.toFixed(1)), topScore, medianScore, fMovedToR2, fR2Evaluated, fRejected, fPending, generatedAt];
      statsVals.forEach((val, idx) => {
        const colLetter = String.fromCharCode(65 + idx); // A to J
        const cell = unshareStyle(sheet.getCell(`${colLetter}3`));
        cell.value = val;
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF1F3864' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F5FB' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
        };
      });

      // Write Row 4 (labels)
      sheet.getRow(4).height = 18;
      const statsLabels = ["Applicants", "Tier 1", "Tier 1-", "Tier 2", "Tier 2-", "Tier 3", "Tier 4", "Avg Total", "Top Score", "Median", "Moved to R2", "R2 Evaluated", "Rejected", "Pending", "Generated"];
      statsLabels.forEach((label, idx) => {
        const colLetter = String.fromCharCode(65 + idx);
        const cell = unshareStyle(sheet.getCell(`${colLetter}4`));
        cell.value = label;
        cell.font = { name: 'Segoe UI', size: 9, color: { argb: 'FF595959' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F5FB' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
        };
      });

      // Write Row 5 (merged labels above R1/R2)
      sheet.getRow(5).height = 18;
      // The template ships with its own row-5 merge (e.g. AM5:AV5 "Screening").
      // unMergeCells (capital M — exceljs API) dissolves every merge group
      // intersecting the range so the two new merges below cannot collide.
      try {
        sheet.unMergeCells('A5:AT5');
      } catch (e) {}
      // Three labelled sections: the candidate profile (A-AI), the columns the
      // R1 reviewer fills (AJ-AL, ending at Status), and the R2 inputs (AM-AT) —
      // so each label sits directly above its own columns.
      const row5Sections = [
        { range: 'A5:AI5', anchor: 'A5', label: 'Candidate Analysed Details', color: 'FF1F3864' },
        { range: 'AJ5:AL5', anchor: 'AJ5', label: 'Round 1 Inputs', color: 'FF2F5597' },
        { range: 'AM5:AT5', anchor: 'AM5', label: 'Round 2 Inputs', color: 'FF0070C0' }
      ];
      row5Sections.forEach(({ range, anchor, label, color }) => {
        try {
          sheet.mergeCells(range);
        } catch (e) {}
        const cell = unshareStyle(sheet.getCell(anchor));
        cell.value = label;
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // Row 6 Headers
      const headers = [
        "Rank", "Name", "Gender", "Cat", "Graduation", "Tier", "Total", "Edu", "Exp", "Proj", 
        "Substance", "Deploy", "Artifact", "Skills", "Domain", "Degree", "Stream", "College", "F_college", "F_University", 
        "Location", "AI Proj", "FS Proj", "Intern Mo", "Co.Tier", "Deploy Stage", "Num Skills", "Claude Lvl", "AI/ML Exp", "Email", 
        "Resume", "GitHub", "Demo", "Demo Explanation", "Demo Review Notes (AI)", "R1 Review", "Screened By", 
        "R1 Status", "Start Date", "Concerns", "Tech Depth", "Tech Stack", "Problem Fit", "Latency/Cost/Security", "R2 Decision", "TR Comments"
      ];

      sheet.getRow(6).height = 24;
      headers.forEach((h, idx) => {
        const cell = unshareStyle(sheet.getCell(6, idx + 1));
        cell.value = h;
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        
        // Match the row-5 sections: profile (0-34), R1 inputs (35-37 up to
        // Status), R2 inputs (38+)
        const headerColor = idx >= 38 ? 'FF0070C0' : idx >= 35 ? 'FF2F5597' : 'FF1F3864';
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: headerColor }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });

      // Sort order (primary = R1 Status so reviewed people stay together):
      //   1. R1 Yes (reviewed & moved to Round 2) — within this block the
      //      R2-vetted candidates come first (R2 Yes → Maybe → No → vetted
      //      without decision), and untouched/null R2 rows sink to its end
      //   2. R1 Maybe
      //   3. R1 Rejected
      //   4. Pending / everything else last (the mostly-empty rows)
      const getSortGroup = (cand) => {
        const r1Status = (getR1(cand).app_status || '').trim().toLowerCase();
        if (r1Status === 'yes') return 0;
        if (r1Status === 'maybe') return 1;
        if (['no', 'rejected', 'invalid', 'reject'].includes(r1Status)) return 2;
        return 3; // Pending & rest
      };
      const getR2SubOrder = (cand) => {
        const r2 = getR2(cand);
        // _draft decisions are unfinished reviews — treat as no decision yet
        const r2Raw = (r2.moved_to_round_3 || '').trim();
        const r2Decision = r2Raw.endsWith('_draft') ? '' : r2Raw.toLowerCase();
        if (['yes', 'promoted'].includes(r2Decision)) return 0;
        if (r2Decision === 'maybe') return 1;
        if (r2Decision === 'no' || r2Decision === 'declined') return 2;
        if (r2.id !== undefined && r2.id !== null) return 3; // vetting started, no decision yet
        return 4; // no R2 record at all
      };
      const sortedCandidates = [...candidatesToExport].sort((a, b) => {
        const groupDiff = getSortGroup(a) - getSortGroup(b);
        if (groupDiff !== 0) return groupDiff;
        const subDiff = getR2SubOrder(a) - getR2SubOrder(b);
        if (subDiff !== 0) return subDiff;
        return parseFloat(getR1(b).total || 0) - parseFloat(getR1(a).total || 0);
      });

      // Write data starting from Row 7
      sortedCandidates.forEach((c, index) => {
        const rowNumber = index + 7;
        const r1 = getR1(c);
        const r2 = getR2(c);

        const rawSolves = r2.solves_business_problem || '';
        const contactStatus = r2.contact_status || (rawSolves.includes('Contact: ') ? rawSolves.split('Contact: ')[1].split(' | ')[0] : (['Yet to Speak', 'Spoke', 'Scheduled', 'No response'].includes(rawSolves) ? rawSolves : ''));
        const problemFit = r2.problem_fit || (rawSolves.includes('Fit: ') ? rawSolves.split('Fit: ')[1] : (['Yes', 'Maybe', 'No'].includes(rawSolves) ? rawSolves : ''));

        const rawDepth = r2.product_depth || '';
        const techDepth = r2.tech_depth || (rawDepth.includes('Depth: ') ? rawDepth.split('Depth: ')[1].split(' | ')[0] : (['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));
        const latency = r2.latency_considerations || (rawDepth.includes('Latency: ') ? rawDepth.split('Latency: ')[1] : (!['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));

        const rowData = [
          index + 1, // Rank
          c.full_name, // Name
          r1.gender || '-',
          r1.cat || '-',
          r1.graduation || '-',
          r1.tier || '-',
          parseFloat(r1.total || 0), // Total
          parseFloat(r1.edu || 0),
          parseFloat(r1.exp || 0),
          parseFloat(r1.proj || 0),
          parseFloat(r1.substance || 0),
          parseFloat(r1.deploy || 0),
          parseFloat(r1.artifact || 0),
          parseFloat(r1.skills || 0),
          r1.domain || '-',
          r1.degree || '-',
          r1.stream || '-',
          c.ug_university || '-',
          r1.college || '-',
          c.ug_university || '-',
          r1.location || '-',
          parseFloat(r1.ai_proj || 0),
          parseFloat(r1.fs_proj || 0),
          parseFloat(r1.intern_mo || 0),
          parseFloat(r1.co_tier || 0),
          r1.deploy_stage || '-',
          parseFloat(r1.num_skills || 0),
          r1.claude_lvl || '-',
          r1.aiml_exp || '-',
          c.email || '-',
          c.resume_drive_url || '-',
          c.github_url || '-',
          c.demo_link || '-',
          c.demo_explanation || c.current_project || '-',
          r1.demo_review_notes_ai || '-',
          r1.review_comments || '-',
          r1.eval_group || '-',
          (r1.app_status && String(r1.app_status).trim() && !["-", "None"].includes(String(r1.app_status).trim())) ? r1.app_status : 'Pending',
          r2.id ? (r2.when_can_they_start || 'NA') : '-',
          r2.id ? (r2.complexity || 'NA') : '-',
          r2.id ? (techDepth || 'NA') : '-',
          r2.id ? (r2.tech_stack || 'NA') : '-',
          r2.id ? (problemFit || 'NA') : '-',
          r2.id ? (latency || 'NA') : '-',
          r2.id
            ? (((r2.moved_to_round_3 || '').trim().endsWith('_draft') ? 'Pending' : r2.moved_to_round_3) || 'Pending')
            : (['no', 'rejected', 'invalid', 'reject'].includes((r1.app_status || '').trim().toLowerCase()) ? 'Rejected (R1)' : 'Pending'),
          r2.id ? (r2.demo_review_comment || 'NA') : '-'
        ];

        rowData.forEach((val, idx) => {
          const cell = unshareStyle(sheet.getCell(rowNumber, idx + 1));
          cell.value = val;

          cell.font = { name: 'Segoe UI', size: 9.5 };
          cell.alignment = { vertical: 'middle', horizontal: (typeof val === 'number') ? 'center' : 'left' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };

          // Color-code ONLY R1 Status (idx 37) and R2 Decision (idx 44)
          const DECISION_COLS = new Set([37, 44]);
          if (DECISION_COLS.has(idx)) {
            const valStr = String(val || '').trim().toLowerCase();
            if (['yes', 'promoted', 'approved'].includes(valStr)) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2F0D9' } };
              cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF385723' }, bold: true };
            } else if (['maybe'].includes(valStr)) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
              cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF856404' }, bold: true };
            } else if (['no', 'invalid', 'declined'].includes(valStr) || valStr.startsWith('reject')) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
              cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF721C24' }, bold: true };
            } else {
              cell.fill = { type: 'pattern', pattern: 'none' };
              cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF000000' } };
            }
          }
        });

        sheet.getRow(rowNumber).height = 20;
      });

      // Set exact column widths matching typical content (46 elements)
      const widths = [
        6, 25, 10, 8, 12, 10, 8, 8, 8, 8, 8, 8, 8, 8, 20, 15, 20, 30, 30, 25,
        18, 10, 10, 10, 10, 18, 10, 15, 15, 30, 25, 25, 25, 35, 35, 30, 18,
        18, 12, 18, 25, 18, 25, 15, 20, 12, 35
      ];
      widths.forEach((w, idx) => {
        sheet.getColumn(idx + 1).width = w;
      });

      // Unhide all rows to prevent template from hiding data rows
      sheet.eachRow((row) => {
        row.hidden = false;
      });
    };

    // --- Tab: Analysis_Clean (63 columns) ---
    const addAnalysisCleanTab = () => {
      const cleanSheet = workbook.getWorksheet("Analysis_Clean");
      if (!cleanSheet) return;

      // Keep rows 1 and 2 (headers), clear data from row 3 onwards
      const totalRows = cleanSheet.rowCount;
      if (totalRows >= 3) {
        cleanSheet.spliceRows(3, totalRows - 2);
      }

      // Sort order by score descending (so Rank starts at 1 for the highest score)
      const sortedCandidates = [...evaluatedCandidates].sort((a, b) => {
        const totalA = parseFloat(getR1(a).total || 0);
        const totalB = parseFloat(getR1(b).total || 0);
        return totalB - totalA;
      });

      sortedCandidates.forEach((c, idx) => {
        const r1 = getR1(c);
        const r2 = getR2(c);
        const r3 = getR3(c);

        const appStatus = r1.app_status || 'Pending';
        const r2Status = r2.moved_to_round_3 || '';
        const r3Status = r3.verdict || r3.final_status || '';

        const tier = r1.tier || '';
        
        // Col 47: Tier Group
        const tierGroup = ['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+', 'Tier 1-', 'Tier 2-', 'T1', 'T1+', 'T2', 'T2+', 'T1-', 'T2-'].includes(tier) 
          ? 'Tier 1-2-' 
          : 'Tier 3-4';

        // Col 48: R1 Review Status
        let r1ReviewStatus = 'R1 Pending Review';
        if (appStatus === 'Yes') {
          r1ReviewStatus = 'R1 Reviewed - Yes';
        } else if (['No', 'Reject', 'Rejected', 'Invalid'].includes(appStatus)) {
          r1ReviewStatus = 'R1 Reviewed - Rejected';
        }

        // Col 49: R1 Reviewed
        const r1Reviewed = (appStatus && appStatus !== 'Pending') || (r1.review_comments && r1.review_comments.trim() !== '') 
          ? 'Yes' 
          : 'No';

        // Col 50: Moved to R2
        const movedToR2 = appStatus === 'Yes' ? 'Yes' : 'No';

        // Col 51: R2 Assignment
        let r2Assignment = 'Not in R2';
        if (appStatus === 'Yes') {
          const evalGroup = r1.eval_group;
          r2Assignment = evalGroup && evalGroup !== '' && evalGroup !== 'None' && evalGroup !== 'Unassigned' 
            ? 'Assigned' 
            : 'Unassigned';
        }

        // Col 52: R2 Review Completion
        let r2ReviewCompletion = 'Not in R2';
        if (appStatus === 'Yes') {
          if (r2Status === 'Declined') {
            r2ReviewCompletion = 'Declined';
          } else if (r2Status && !r2Status.endsWith('_draft') && ['Yes', 'Maybe', 'No'].includes(r2Status)) {
            r2ReviewCompletion = 'Finalized';
          } else {
            r2ReviewCompletion = 'Pending';
          }
        }

        // Col 53: R2 Outcome
        let r2Outcome = 'Not in R2';
        if (appStatus === 'Yes') {
          if (!r2Status || r2Status.endsWith('_draft')) {
            r2Outcome = 'Pending';
          } else {
            r2Outcome = r2Status;
          }
        }

        // Col 54: Moved to R3
        const movedToR3 = (appStatus === 'Yes' && r2Status && !r2Status.endsWith('_draft') && ['Yes', 'Maybe'].includes(r2Status)) 
          ? 'Yes' 
          : 'No';

        // Col 55: R3 Status
        let r3StatusText = 'Not in R3';
        if (movedToR3 === 'Yes') {
          if (['Hired', 'Yes', 'Offer'].includes(r3Status)) {
            r3StatusText = 'Hired';
          } else if (['Rejected', 'No'].includes(r3Status)) {
            r3StatusText = 'Rejected';
          } else {
            r3StatusText = 'Pending Review';
          }
        }

        // Col 56: Funnel Stage
        let funnelStage = 'Pending R1 Review';
        if (appStatus === 'Pending' || !appStatus) {
          funnelStage = 'Pending R1 Review';
        } else if (['No', 'Reject', 'Rejected', 'Invalid'].includes(appStatus)) {
          funnelStage = 'Rejected at R1';
        } else if (appStatus === 'Yes') {
          if (!r2Status || r2Status.endsWith('_draft')) {
            funnelStage = 'In R2 (Pending)';
          } else if (r2Status === 'Declined') {
            funnelStage = 'Declined (R2)';
          } else if (r2Status === 'No') {
            funnelStage = 'Rejected at R2';
          } else if (['Yes', 'Maybe'].includes(r2Status)) {
            if (['Hired', 'Yes', 'Offer'].includes(r3Status)) {
              funnelStage = 'Hired';
            } else if (['Rejected', 'No'].includes(r3Status)) {
              funnelStage = 'Rejected at R3';
            } else {
              funnelStage = 'In R3 (Pending)';
            }
          }
        }

        const domain = (r1.domain || '').trim();
        const d_empty = domain === '' || domain === '-' ? 1 : 0;
        const d_content = domain.toLowerCase().includes('content') ? 1 : 0;
        const d_creator = domain.toLowerCase().includes('creator economy') ? 1 : 0;
        const d_healthcare = domain.toLowerCase().includes('healthcare') ? 1 : 0;
        const d_retail = domain.toLowerCase().includes('retail') ? 1 : 0;
        const d_travel = domain.toLowerCase().includes('travel') ? 1 : 0;
        const d_no_match = (domain !== '' && domain !== '-' && !d_content && !d_creator && !d_healthcare && !d_retail && !d_travel) ? 1 : 0;

        const rowNumber = idx + 3;
        const row = cleanSheet.getRow(rowNumber);

        row.getCell(1).value = idx + 1;
        row.getCell(2).value = c.full_name || '';
        row.getCell(3).value = r1.gender || '';
        row.getCell(4).value = r1.cat || '';
        row.getCell(5).value = r1.graduation || '';
        row.getCell(6).value = r1.tier || '';
        row.getCell(7).value = r1.total !== null && r1.total !== undefined ? parseFloat(r1.total) : null;
        row.getCell(8).value = r1.edu !== null && r1.edu !== undefined ? parseFloat(r1.edu) : null;
        row.getCell(9).value = r1.exp !== null && r1.exp !== undefined ? parseFloat(r1.exp) : null;
        row.getCell(10).value = r1.proj !== null && r1.proj !== undefined ? parseFloat(r1.proj) : null;
        row.getCell(11).value = r1.substance !== null && r1.substance !== undefined ? parseFloat(r1.substance) : null;
        row.getCell(12).value = r1.deploy !== null && r1.deploy !== undefined ? parseFloat(r1.deploy) : null;
        row.getCell(13).value = r1.artifact !== null && r1.artifact !== undefined ? parseFloat(r1.artifact) : null;
        row.getCell(14).value = r1.skills !== null && r1.skills !== undefined ? parseFloat(r1.skills) : null;
        row.getCell(15).value = r1.domain || '';
        row.getCell(16).value = r1.degree || '';
        row.getCell(17).value = r1.stream || '';
        row.getCell(18).value = r1.college || '';
        row.getCell(19).value = r1.college || '';
        row.getCell(20).value = c.ug_university || '';
        row.getCell(21).value = r1.location || '';
        row.getCell(22).value = r1.ai_proj !== null && r1.ai_proj !== undefined ? parseFloat(r1.ai_proj) : null;
        row.getCell(23).value = r1.fs_proj !== null && r1.fs_proj !== undefined ? parseFloat(r1.fs_proj) : null;
        row.getCell(24).value = r1.intern_mo !== null && r1.intern_mo !== undefined ? parseFloat(r1.intern_mo) : null;
        row.getCell(25).value = r1.co_tier !== null && r1.co_tier !== undefined ? parseFloat(r1.co_tier) : null;
        row.getCell(26).value = r1.deploy_stage || '';
        row.getCell(27).value = r1.num_skills !== null && r1.num_skills !== undefined ? parseInt(r1.num_skills) : null;
        row.getCell(28).value = r1.claude_lvl || '';
        row.getCell(29).value = r1.aiml_exp || '';
        row.getCell(30).value = c.email || '';
        row.getCell(31).value = c.resume_drive_url || '';
        row.getCell(32).value = c.github_url || '';
        row.getCell(33).value = c.demo_link || '';
        row.getCell(34).value = c.demo_explanation || c.current_project || '';
        row.getCell(35).value = r1.demo_review_notes_ai || '';
        row.getCell(36).value = r1.review_comments || '';
        row.getCell(37).value = r1.eval_group || '';
        row.getCell(38).value = r1.app_status || '';
        row.getCell(39).value = r2.when_can_they_start || '';
        row.getCell(40).value = r2.complexity || '';
        row.getCell(41).value = r2.tech_depth || r2.product_depth || '';
        row.getCell(42).value = r2.tech_stack || '';
        row.getCell(43).value = r2.problem_fit || r2.solves_business_problem || '';
        row.getCell(44).value = r2.latency_considerations || r2.product_depth || '';
        row.getCell(45).value = r2.moved_to_round_3 || '';
        row.getCell(46).value = r2.demo_review_comment || '';
        row.getCell(47).value = tierGroup;
        row.getCell(48).value = r1ReviewStatus;
        row.getCell(49).value = r1Reviewed;
        row.getCell(50).value = movedToR2;
        row.getCell(51).value = r2Assignment;
        row.getCell(52).value = r2ReviewCompletion;
        row.getCell(53).value = r2Outcome;
        row.getCell(54).value = movedToR3;
        row.getCell(55).value = r3StatusText;
        row.getCell(56).value = funnelStage;
        row.getCell(57).value = d_empty;
        row.getCell(58).value = d_content;
        row.getCell(59).value = d_creator;
        row.getCell(60).value = d_healthcare;
        row.getCell(61).value = d_retail;
        row.getCell(62).value = d_travel;
        row.getCell(63).value = d_no_match;

        row.height = 20;
        row.alignment = { vertical: 'middle' };
        
        // Re-apply borders and fonts to newly written row cells to keep formatting beautiful
        for (let colIdx = 1; colIdx <= 63; colIdx++) {
          const cell = row.getCell(colIdx);
          cell.font = { name: 'Segoe UI', size: 9.5 };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          };
          
          const val = cell.value;
          cell.alignment = { vertical: 'middle', horizontal: (typeof val === 'number') ? 'center' : 'left' };
        }
      });
    };

    // --- Tab: Pivot Data (flat, pivot-table-ready — one row per application,
    // one clean header row, pre-computed dimension columns so the funnel
    // narrative can be produced with simple pivots) ---
    const addPivotDataTab = () => {
      const existing = workbook.getWorksheet('Pivot Data');
      if (existing) workbook.removeWorksheet(existing.id);
      const sheet = workbook.addWorksheet('Pivot Data');

      const TOP_TIERS = ['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+'];
      const LOW_TIERS = ['Tier 3', 'Tier 4'];

      sheet.columns = [
        { header: 'Candidate ID', key: 'id', width: 12 },
        { header: 'Full Name', key: 'name', width: 26 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'University', key: 'university', width: 30 },
        { header: 'Submission Status', key: 'submission', width: 20 },
        { header: 'R1 Tier', key: 'tier', width: 10 },
        { header: 'Tier Group', key: 'tierGroup', width: 14 },
        { header: 'R1 Score', key: 'score', width: 9 },
        { header: 'R1 Status', key: 'r1Status', width: 12 },
        { header: 'R1 Manually Reviewed', key: 'reviewed', width: 12 },
        { header: 'Moved To R2', key: 'movedR2', width: 10 },
        { header: 'Technical Reviewer', key: 'reviewer', width: 16 },
        { header: 'R2 Assigned', key: 'assigned', width: 11 },
        { header: 'R2 Review State', key: 'reviewState', width: 17 },
        { header: 'R2 Decision', key: 'r2Decision', width: 12 },
        { header: 'Moved To R3', key: 'movedR3', width: 10 },
        { header: 'R3 Verdict', key: 'r3Verdict', width: 11 },
      ];
      const headerRow = sheet.getRow(1);
      headerRow.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];

      [...globalData].sort((a, b) => a.id - b.id).forEach(c => {
        const r1 = getR1(c);
        const r2 = getR2(c);
        const r3 = getR3(c);
        const hasR1 = c.round_1_evaluation !== null;

        const submission = hasR1
          ? 'Evaluated'
          : (isDuplicateStatus(c.Analysis_status || '') ? 'Duplicate' : 'Awaiting AI Evaluation');

        const tier = hasR1 ? (r1.tier || '').trim() : '';
        const tierGroup = TOP_TIERS.includes(tier) ? 'Tier 1-2 Group' : (LOW_TIERS.includes(tier) ? 'Tier 3-4 Group' : '');

        const r1Status = hasR1 ? ((r1.app_status || 'Pending').trim()) : '';
        const reviewed = hasR1
          ? ((r1Status !== 'Pending' || (r1.review_comments || '').trim()) ? 'Yes' : 'No')
          : '';
        const movedR2 = hasR1 ? (r1Status === 'Yes' ? 'Yes' : 'No') : '';

        let reviewer = '', assigned = '', reviewState = '', r2Decision = '', movedR3 = '';
        if (movedR2 === 'Yes') {
          reviewer = (r1.eval_group || '').trim();
          assigned = (reviewer && reviewer !== 'None' && reviewer !== 'Unassigned') ? 'Yes' : 'No';
          if (!reviewer || reviewer === 'None') reviewer = 'Unassigned';
          const rawDec = (r2.moved_to_round_3 || '').trim();
          if (rawDec.endsWith('_draft')) {
            reviewState = 'Draft (In Progress)';
            r2Decision = 'Pending';
          } else if (['Yes', 'Maybe', 'No', 'Declined'].includes(rawDec)) {
            reviewState = 'Finalized';
            r2Decision = rawDec;
          } else if (r2.id !== undefined && r2.id !== null) {
            reviewState = 'Draft (In Progress)';
            r2Decision = 'Pending';
          } else {
            reviewState = 'Not Started';
            r2Decision = 'Pending';
          }
          movedR3 = ['Yes', 'Maybe'].includes(r2Decision) ? 'Yes' : 'No';
        }

        let r3Verdict = '';
        if (movedR3 === 'Yes') {
          const v = (r3.final_status || '').trim();
          if (['Yes', 'Hired'].includes(v)) r3Verdict = 'Hired';
          else if (['No', 'Rejected'].includes(v)) r3Verdict = 'Rejected';
          else if (v === 'Maybe') r3Verdict = 'Maybe';
          else r3Verdict = 'Pending';
        }

        sheet.addRow({
          id: c.id,
          name: c.full_name || '',
          email: c.email || '',
          university: c.ug_university || '',
          submission,
          tier,
          tierGroup,
          score: (hasR1 && r1.total !== null && r1.total !== undefined) ? parseFloat(r1.total) : null,
          r1Status,
          reviewed,
          movedR2,
          reviewer,
          assigned,
          reviewState,
          r2Decision,
          movedR3,
          r3Verdict,
        });
      });
    };

    let filename = '';
    const dateSuffix = new Date().toLocaleDateString('en-CA');
    
    if (roundType === 1) {
      addR1Tab();
      filename = `round_1_screening_report_${dateSuffix}.xlsx`;
    } else if (roundType === 2) {
      addR2Tab();
      filename = `round_2_technical_review_hub_${dateSuffix}.xlsx`;
    } else if (roundType === 3) {
      addR3Tab();
      filename = `round_3_executive_verdicts_${dateSuffix}.xlsx`;
    } else if (roundType === 'side-by-side') {
      addSideBySideTab();
      addAnalysisCleanTab();
      addPivotDataTab();
      filename = `r1_r2_side_by_side_report_${dateSuffix}.xlsx`;
    } else {
      addSummaryTab();
      addR1Tab();
      addR2Tab();
      addR3Tab();
      filename = `aviators_compiled_report_${dateSuffix}.xlsx`;
    }

    // Trigger browser download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating Excel report:", error);
      alert("Failed to generate Excel report: " + error.message);
    }
  };

  // Old deduplication removed here because we moved it to the top

  const totalApplications = globalData.length;
  const { duplicatesCount, pendingReviewCount } = useMemo(() => {
    const notEvaluated = globalData.filter(c => !c.round_1_evaluation);
    const awaiting = notEvaluated.filter(c => !isDuplicateStatus(c.Analysis_status || '')).length;
    return { duplicatesCount: notEvaluated.length - awaiting, pendingReviewCount: awaiting };
  }, [globalData]);

  const uniqueCount = totalApplications - duplicatesCount;
  const reviewedCount = evaluatedCandidates.length;

  // Round 1 Tiers: T1/T1-/T2/T2- (uses evaluatedCandidates to align 100% with worksheets!)
  const isT1T2 = (tier) => ['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-', 'T1', 'T1-', 'T2', 'T2-', 'Tier 1+', 'Tier 2+', 'T1+', 'T2+'].includes(tier);
  const isT3T4 = (tier) => ['Tier 3', 'Tier 4', 'T3', 'T4'].includes(tier);

  const t1t2Candidates = useMemo(() => evaluatedCandidates.filter(c => isT1T2(getR1(c).tier)), [evaluatedCandidates]);
  const t1t2Count = t1t2Candidates.length;

  // Manually reviewed and comments marked in R1 (means app_status is not Pending or review_comments is not empty)
  const t1t2ManuallyReviewed = useMemo(() => {
    return t1t2Candidates.filter(c => {
      const status = getR1(c).app_status || 'Pending';
      const comments = getR1(c).review_comments || '';
      return status !== 'Pending' || comments.trim() !== '';
    });
  }, [t1t2Candidates]);
  const t1t2ManuallyReviewedCount = t1t2ManuallyReviewed.length;

  const t1t2YesCount = useMemo(() => t1t2ManuallyReviewed.filter(c => getR1(c).app_status === 'Yes').length, [t1t2ManuallyReviewed]);
  const t1t2NoCount = useMemo(() => t1t2ManuallyReviewed.filter(c => ['No', 'Reject', 'Rejected', 'Invalid'].includes(getR1(c).app_status)).length, [t1t2ManuallyReviewed]);
  const t1t2PendingCount = t1t2ManuallyReviewedCount - t1t2YesCount - t1t2NoCount;

  // R1 T3/T4
  const t3t4Candidates = useMemo(() => evaluatedCandidates.filter(c => isT3T4(getR1(c).tier)), [evaluatedCandidates]);
  const t3t4Count = t3t4Candidates.length;

  const t3t4ManuallyReviewed = useMemo(() => {
    return t3t4Candidates.filter(c => {
      const status = getR1(c).app_status || 'Pending';
      const comments = getR1(c).review_comments || '';
      return status !== 'Pending' || comments.trim() !== '';
    });
  }, [t3t4Candidates]);
  const t3t4ManuallyReviewedCount = t3t4ManuallyReviewed.length;

  const t3t4Shortlisted = useMemo(() => t3t4ManuallyReviewed.filter(c => getR1(c).app_status === 'Yes').length, [t3t4ManuallyReviewed]);
  const t3t4PendingCount = t3t4Count - t3t4ManuallyReviewedCount;

  // Total moved from R1 to R2: candidates with app_status = 'Yes' (no email dedup to match worksheets)
  const movedR1ToR2 = useMemo(() => evaluatedCandidates.filter(c => getR1(c).app_status === 'Yes'), [evaluatedCandidates]);
  const movedR1ToR2Count = movedR1ToR2.length;

  // Round 2
  const r2TotalCandidates = movedR1ToR2Count;
  const r2AssignedCandidates = useMemo(() => {
    return movedR1ToR2.filter(c => {
      const eg = getR1(c).eval_group;
      return eg && eg !== '' && eg !== 'None' && eg !== 'Unassigned';
    });
  }, [movedR1ToR2]);
  const r2AssignedCount = r2AssignedCandidates.length;
  const r2YetToAssignCount = r2TotalCandidates - r2AssignedCount;

  // Finalized vs Draft:
  const r2Finalized = useMemo(() => {
    return r2AssignedCandidates.filter(c => {
      const status = getR2(c).moved_to_round_3 || '';
      return ['Yes', 'Maybe', 'No', 'Declined'].includes(status) && !status.endsWith('_draft');
    });
  }, [r2AssignedCandidates]);
  const r2FinalizedCount = r2Finalized.length;
  
  const r2DraftCount = useMemo(() => {
    return r2AssignedCandidates.filter(c => {
      const status = getR2(c).moved_to_round_3 || '';
      return status.endsWith('_draft') || status === '';
    });
  }, [r2AssignedCandidates]);

  const r2YesCount = useMemo(() => r2Finalized.filter(c => getR2(c).moved_to_round_3 === 'Yes').length, [r2Finalized]);
  const r2MaybeCount = useMemo(() => r2Finalized.filter(c => getR2(c).moved_to_round_3 === 'Maybe').length, [r2Finalized]);
  const r2NoCount = useMemo(() => r2Finalized.filter(c => getR2(c).moved_to_round_3 === 'No' || getR2(c).moved_to_round_3 === 'Declined').length, [r2Finalized]);

  // Moved R2 to R3
  const movedR2ToR3Count = r2YesCount + r2MaybeCount;

  // Round 3
  const r3Total = movedR2ToR3Count;
  const r3HiredCount = useMemo(() => {
    return r2Finalized.filter(c => ['Yes', 'Maybe'].includes(getR2(c).moved_to_round_3) && ['Hired', 'Yes'].includes(getR3(c).final_status)).length;
  }, [r2Finalized]);
  const r3RejectedCount = useMemo(() => {
    return r2Finalized.filter(c => ['Yes', 'Maybe'].includes(getR2(c).moved_to_round_3) && ['Rejected', 'No'].includes(getR3(c).final_status)).length;
  }, [r2Finalized]);
  const r3PendingCount = r3Total - r3HiredCount - r3RejectedCount;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Title & Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-heading tracking-tight text-foreground">
            AI Builder Intern — Applicant Funnel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            <strong className="text-[#800020]">{rawTotal} applications</strong> received · {evaluatedCount} evaluated · {duplicatesRemoved} duplicates removed · {awaitingEvaluation} Application Pending review rubric
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:items-end justify-end self-stretch md:self-auto">
          <Button 
            onClick={() => downloadExcelReport('side-by-side')} 
            className="bg-[#800020] hover:bg-[#800020]/90 text-white rounded-xl text-xs font-semibold h-10 shadow-sm transition-all"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download Report
          </Button>
        </div>
      </div>






      {/* Quick Summary — horizontal stat strip */}
      <Card className="rounded-[1.5rem] border shadow-sm w-full">
        <CardContent className="py-5 px-6">
          <div className="flex flex-wrap items-center justify-around gap-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-black text-[10px]">
                <Users className="h-3 w-3 text-blue-500" /> Total Applications
              </div>
              <span className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400">{totalApplications}</span>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 hidden sm:block" />
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-black text-[10px]">
                <XCircle className="h-3 w-3 text-red-500" /> Duplicates
              </div>
              <span className="font-mono text-2xl font-extrabold text-red-600 dark:text-red-400">{duplicatesCount}</span>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 hidden sm:block" />
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-black text-[10px]">
                <Users className="h-3 w-3 text-blue-500" /> Unique Applications
              </div>
              <span className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400">{uniqueCount}</span>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 hidden sm:block" />
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-black text-[10px]">
                <CheckCircle className="h-3 w-3 text-emerald-500" /> Reviewed
              </div>
              <span className="font-mono text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{reviewedCount}</span>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 hidden sm:block" />
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-black text-[10px]">
                <HelpCircle className="h-3 w-3 text-amber-500" /> Pending Review
              </div>
              <span className="font-mono text-2xl font-extrabold text-amber-600 dark:text-amber-400">{pendingReviewCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>






      {/* Pivot Tables Analysis Section */}
      <div className="flex flex-col gap-6 w-full items-stretch">
        {/* Table 1: Tier Status */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> TIER — STATUS DISTRIBUTION
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Count of Name</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">Status ▼</th>
                    <th className="py-2 px-6"></th>
                    <th className="py-2 px-6"></th>
                    <th className="py-2 px-6"></th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      Tier
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Yes
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Pending
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Reject
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {['Tier 1', 'Tier 1+', 'Tier 2', 'Tier 2+', 'Tier 3', 'Tier 4'].map(tier => {
                    const d = tierPivotData[tier] || { yes: 0, pending: 0, reject: 0, total: 0 };
                    return (
                      <tr key={tier} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{tier}</td>
                        <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{d.yes || 0}</td>
                        <td className="py-3 px-6 text-center font-bold text-[#2563eb] dark:text-blue-400">{d.pending || 0}</td>
                        <td className="py-3 px-6 text-center font-bold text-[#dc2626] dark:text-red-500">{d.reject || 0}</td>
                        <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-200">{d.total || 0}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{tierGrandTotal.yes || 0}</td>
                    <td className="py-3 px-6 text-center text-[#2563eb] dark:text-blue-400">{tierGrandTotal.pending || 0}</td>
                    <td className="py-3 px-6 text-center text-[#dc2626] dark:text-red-500">{tierGrandTotal.reject || 0}</td>
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{tierGrandTotal.total || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          

        {/* Table 3 Decision Analysis */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> SCREENED BY DECISION (ROUND 2)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Count of Name</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">Decision ▼</th>
                    <th className="py-2 px-6"></th>
                    <th className="py-2 px-6"></th>
                    <th className="py-2 px-6"></th>
                    <th className="py-2 px-6"></th>
                    <th className="py-2 px-6"></th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      To be screened by
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Yes
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Maybe
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      No
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Pending
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Rejected (R1)
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const dynamicReviewers = Object.keys(reviewerPivotData)
                      .filter(k => k !== 'Unassigned' && k !== 'None')
                      .sort();
                    
                    return dynamicReviewers.map(name => {
                      const data = reviewerPivotData[name] || { yes: 0, maybe: 0, no: 0, pending: 0, rejectedR1: 0, total: 0 };
                      if (data.total === 0) return null;
                      return (
                        <tr key={name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{name}</td>
                          <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{data.yes || 0}</td>
                          <td className="py-3 px-6 text-center font-bold text-[#d97706] dark:text-amber-500">{data.maybe || 0}</td>
                          <td className="py-3 px-6 text-center font-bold text-[#dc2626] dark:text-red-500">{data.no || 0}</td>
                          <td className="py-3 px-6 text-center font-bold text-[#2563eb] dark:text-blue-400">{data.pending || 0}</td>
                          <td className="py-3 px-6 text-center font-bold text-[#dc2626] dark:text-red-500">{data.rejectedR1 || 0}</td>
                          <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-200">{data.total || 0}</td>
                        </tr>
                      );
                    });
                  })()}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{reviewerGrandTotal.yes || 0}</td>
                    <td className="py-3 px-6 text-center text-[#d97706] dark:text-amber-500">{reviewerGrandTotal.maybe || 0}</td>
                    <td className="py-3 px-6 text-center text-[#dc2626] dark:text-red-500">{reviewerGrandTotal.no || 0}</td>
                    <td className="py-3 px-6 text-center text-[#2563eb] dark:text-blue-400">{reviewerGrandTotal.pending || 0}</td>
                    <td className="py-3 px-6 text-center text-[#dc2626] dark:text-red-500">{reviewerGrandTotal.rejectedR1 || 0}</td>
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{reviewerGrandTotal.total || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

        {/* Graduation Wise Table */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> GRADUATION WISE TABLE (ROUND 1)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300">Decision</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center" colSpan={graduationPivotDataR1.years.length + 1}>
                      <select 
                        value={graduationDecisionFilterR1} 
                        onChange={(e) => setGraduationDecisionFilterR1(e.target.value)}
                        className="bg-transparent border-none font-semibold text-slate-600 dark:text-slate-300 cursor-pointer outline-none appearance-none hover:opacity-80 transition-opacity"
                      >
                        <option value="Yes">Yes ▼</option>
                        <option value="Pending">Pending ▼</option>
                        <option value="No">No ▼</option>
                        <option value="All">All ▼</option>
                      </select>
                    </th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/20 dark:bg-slate-800/20">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Count of Name</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center" colSpan={graduationPivotDataR1.years.length + 1}>Graduation ▼</th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      Tier
                    </th>
                    {graduationPivotDataR1.years.map(y => (
                      <th key={y} className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                        {y}
                      </th>
                    ))}
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const dynamicReviewers = Object.keys(graduationPivotDataR1.counts)
                      .filter(k => k !== 'Unassigned' && k !== 'None');
                    // We don't sort here because the keys are already in the order of `tiersList` array.
                    
                    return dynamicReviewers.map(name => {
                      const data = graduationPivotDataR1.counts[name] || { total: 0 };
                      return (
                        <tr key={name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{name}</td>
                          {graduationPivotDataR1.years.map(y => (
                            <td key={y} className="py-3 px-6 text-center font-bold text-[#2563eb] dark:text-blue-400">
                              {data[y] || 0}
                            </td>
                          ))}
                          <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-200">{data.total || 0}</td>
                        </tr>
                      );
                    });
                  })()}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    {graduationPivotDataR1.years.map(y => (
                      <td key={y} className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR1.grandTotal[y] || 0}</td>
                    ))}
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR1.grandTotal.total || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Graduation Wise Table */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> GRADUATION WISE TABLE (ROUND 2)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300">Decision</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center" colSpan={graduationPivotDataR2.years.length + 1}>
                      <select 
                        value={graduationDecisionFilterR2} 
                        onChange={(e) => setGraduationDecisionFilterR2(e.target.value)}
                        className="bg-transparent border-none font-semibold text-slate-600 dark:text-slate-300 cursor-pointer outline-none appearance-none hover:opacity-80 transition-opacity"
                      >
                        <option value="Yes">Yes ▼</option>
                        <option value="Maybe">Maybe ▼</option>
                        <option value="No">No ▼</option>
                        <option value="All">All ▼</option>
                      </select>
                    </th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/20 dark:bg-slate-800/20">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Count of Name</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center" colSpan={graduationPivotDataR2.years.length + 1}>Graduation ▼</th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      Tier
                    </th>
                    {graduationPivotDataR2.years.map(y => (
                      <th key={y} className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                        {y}
                      </th>
                    ))}
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const dynamicReviewers = Object.keys(graduationPivotDataR2.counts)
                      .filter(k => k !== 'Unassigned' && k !== 'None');
                    // We don't sort here because the keys are already in the order of `tiersList` array.
                    
                    return dynamicReviewers.map(name => {
                      const data = graduationPivotDataR2.counts[name] || { total: 0 };
                      return (
                        <tr key={name} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{name}</td>
                          {graduationPivotDataR2.years.map(y => (
                            <td key={y} className="py-3 px-6 text-center font-bold text-[#2563eb] dark:text-blue-400">
                              {data[y] || 0}
                            </td>
                          ))}
                          <td className="py-3 px-6 text-center font-bold text-slate-800 dark:text-slate-200">{data.total || 0}</td>
                        </tr>
                      );
                    });
                  })()}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    {graduationPivotDataR2.years.map(y => (
                      <td key={y} className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR2.grandTotal[y] || 0}</td>
                    ))}
                    <td className="py-3 px-6 text-center text-slate-800 dark:text-slate-200">{graduationPivotDataR2.grandTotal.total || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

        {/* Deploy Stage Table */}
          <Card className="rounded-xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-[#9b1c1c] dark:text-red-500 font-bold text-sm tracking-wide uppercase">
              <Users className="w-4 h-4" /> DEPLOY STAGE TABLE
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/40 dark:bg-slate-800/40">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300">Decision</th>
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">Yes ▼</th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-[#e2e8f0]/20 dark:bg-slate-800/20">
                    <th className="py-2 px-6 font-semibold text-xs text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">Count of Name</th>
                    <th className="py-2 px-6"></th>
                  </tr>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      Deploy Stage
                    </th>
                    <th className="py-3 px-6 font-bold text-xs uppercase tracking-wider text-slate-400 text-center">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deployStagePivotData.stages.map(stage => {
                    const count = deployStagePivotData.counts[stage];
                    return (
                      <tr key={stage} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-6 font-bold text-slate-700 dark:text-slate-300">{stage}</td>
                        <td className="py-3 px-6 text-center font-bold text-[#059669] dark:text-emerald-400">{count || 0}</td>
                      </tr>
                    );
                  })}
                  <tr className="font-bold border-t-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200">Grand Total</td>
                    <td className="py-3 px-6 text-center text-[#059669] dark:text-emerald-400">{deployStagePivotData.total || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
      </div>
    </div>
  );
}
