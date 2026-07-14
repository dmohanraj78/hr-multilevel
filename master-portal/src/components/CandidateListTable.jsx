import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Download, Filter, ArrowUp, ArrowDown, Check } from 'lucide-react';

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

export default function CandidateListTable({ candidates, actionLabel, onActionClick, showTechEvaluatorFilter = false, round = 1, onUpdateTechEvaluator }) {
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Relational data helpers
  const getBio = (c, field) => {
    if (!c) return '';
    const raw = c.raw_submissions;
    const rawParsed = Array.isArray(raw) ? raw[0] : raw;
    return c[field] || rawParsed?.[field] || '';
  };

  const getEval1 = (c, field) => {
    if (!c) return '';
    const r1 = c.round_1_evaluation;
    const r1Parsed = Array.isArray(r1) ? r1[0] : r1;
    return c[field] !== undefined ? c[field] : (r1Parsed?.[field] || '');
  };

  // Safe helper to extract status based on the current round
  const getStatusInfo = (cand) => {
    if (round === 3) {
      const r3 = cand.round_3_evaluation;
      const r3Parsed = Array.isArray(r3) ? r3[0] : r3;
      const verdict = r3Parsed?.verdict;
      if (verdict === 'Yes' || verdict === 'Hired') return { text: 'Hired', color: 'bg-green-600 hover:bg-green-700 text-white border-transparent' };
      if (verdict === 'No' || verdict === 'Rejected') return { text: 'Rejected', color: 'bg-red-600 hover:bg-red-700 text-white border-transparent' };
      if (verdict === 'Maybe') return { text: 'Maybe', color: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' };
      return { text: 'Pending Decisions', color: 'bg-slate-500 hover:bg-slate-600 text-white border-transparent' };
    }
    
    if (round === 2) {
      const r2 = cand.round_2_evaluation;
      const r2Parsed = Array.isArray(r2) ? r2[0] : r2;
      const decision = r2Parsed?.moved_to_round_3;
      if (decision === 'Yes') return { text: 'Yes', color: 'bg-green-600 hover:bg-green-700 text-white border-transparent' };
      if (decision === 'Maybe') return { text: 'Maybe', color: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' };
      if (decision === 'No') return { text: 'No', color: 'bg-red-600 hover:bg-red-700 text-white border-transparent' };
      if (decision === 'Declined') return { text: 'Declined', color: 'bg-red-600 hover:bg-red-700 text-white border-transparent' };
      return { text: 'Pending Review', color: 'bg-gray-400 hover:bg-gray-500 text-white border-transparent' };
    }

    const status = getEval1(cand, 'app_status') || 'Pending';
    if (status === 'Yes') return { text: 'Yes', color: 'bg-green-600 hover:bg-green-700 text-white border-transparent' };
    if (status === 'Reject') return { text: 'Reject', color: 'bg-red-600 hover:bg-red-700 text-white border-transparent' };
    if (status === 'Maybe') return { text: 'Maybe', color: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' };
    if (status === 'Duplicate') return { text: 'Duplicate', color: 'border-gray-500 text-gray-500 bg-transparent' };
    if (status === 'Access requested') return { text: 'Access requested', color: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' };
    return { text: 'Pending', color: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
  };

  // Extraction maps for headers
  const getCandValue = {
    id: (c) => c.id,
    candidate: (c) => getBio(c, 'full_name'),
    tier: (c) => getEval1(c, 'tier') || 'N/A',
    score: (c) => parseFloat(getEval1(c, 'total') || 0),
    review_cat: (c) => getEval1(c, 'review_cat') || 'N/A',
    status: (c) => getStatusInfo(c).text,
    clan: (c) => getEval1(c, 'eval_group') || 'None'
  };

  // Helper to extract unique values for dropdowns
  const getUniqueValues = (key, extractor) => {
    const vals = candidates.map(extractor);
    return Array.from(new Set(vals)).sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
  };

  // Unique values lists
  const uniqueIds = useMemo(() => getUniqueValues('id', getCandValue.id), [candidates]);
  const uniqueCandidates = useMemo(() => getUniqueValues('candidate', getCandValue.candidate), [candidates]);
  const uniqueTiers = useMemo(() => getUniqueValues('tier', getCandValue.tier), [candidates]);
  const uniqueScores = useMemo(() => getUniqueValues('score', getCandValue.score), [candidates]);
  const uniqueReviewCats = useMemo(() => getUniqueValues('review_cat', getCandValue.review_cat), [candidates]);
  const uniqueStatuses = useMemo(() => getUniqueValues('status', getCandValue.status), [candidates]);
  const uniqueClans = useMemo(() => getUniqueValues('clan', getCandValue.clan), [candidates]);

  // Apply filters
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

  // Combined filter logic
  const filtered = useMemo(() => {
    return candidates.filter(cand => {
      // 1. Global Search
      if (search) {
        const query = search.toLowerCase();
        const nameMatch = getBio(cand, 'full_name')?.toLowerCase().includes(query);
        const emailMatch = getBio(cand, 'email')?.toLowerCase().includes(query);
        const roleMatch = getBio(cand, 'applied_role')?.toLowerCase().includes(query);
        const idMatch = cand.id?.toString().includes(query);
        
        if (!nameMatch && !emailMatch && !roleMatch && !idMatch) return false;
      }

      // 2. Header Filters
      if (activeFilters.id && !activeFilters.id.includes(cand.id)) return false;
      if (activeFilters.candidate && !activeFilters.candidate.includes(getBio(cand, 'full_name'))) return false;
      if (activeFilters.tier && !activeFilters.tier.includes(getEval1(cand, 'tier') || 'N/A')) return false;
      if (activeFilters.score && !activeFilters.score.includes(parseFloat(getEval1(cand, 'total') || 0))) return false;
      if (activeFilters.review_cat && !activeFilters.review_cat.includes(getEval1(cand, 'review_cat') || 'N/A')) return false;
      if (activeFilters.status && !activeFilters.status.includes(getStatusInfo(cand).text)) return false;
      if (showTechEvaluatorFilter && activeFilters.clan && !activeFilters.clan.includes(getEval1(cand, 'eval_group') || 'None')) return false;

      return true;
    });
  }, [candidates, search, activeFilters, showTechEvaluatorFilter]);

  // Sorting logic
  const sortedAndFiltered = useMemo(() => {
    if (!sortConfig.key) {
      if (round === 3) {
        // Default Executive R3 sequence: Pending first, TR Decision 'Yes' > 'Maybe', Completed verdict at bottom
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

        return [...filtered].sort((a, b) => {
          const r3A = getR3(a);
          const r3B = getR3(b);
          const hasVerdictA = !!r3A.verdict;
          const hasVerdictB = !!r3B.verdict;

          // 1. Sort by R3 Verdict completed status (Pending first, Completed last)
          if (hasVerdictA !== hasVerdictB) {
            return hasVerdictA ? 1 : -1;
          }

          // 2. Sort by TR Decision (Yes first, Maybe second)
          const trA = getR2(a).moved_to_round_3 || '';
          const trB = getR2(b).moved_to_round_3 || '';
          
          if (trA !== trB) {
            if (trA === 'Yes') return -1;
            if (trB === 'Yes') return 1;
            if (trA === 'Maybe') return -1;
            if (trB === 'Maybe') return 1;
          }

          // 3. Fallback to ID
          return parseInt(a.id) - parseInt(b.id);
        });
      }
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      let valA = getCandValue[sortConfig.key](a);
      let valB = getCandValue[sortConfig.key](b);

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }

      return sortConfig.direction === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filtered, sortConfig, round]);

  const handleExportCSV = () => {
    const headers = [
      'Candidate ID',
      'Name',
      'Email',
      'Role',
      'Tier',
      'Review Score',
      'Demo-AI Review',
      'Review Status',
      'Technical Evaluator Assigned',
      'Start Date',
      'Duration (Months)',
      'College Commitment / Concerns',
      'Contact Status',
      'Problem Fit',
      'Technical Depth',
      'Latency/Security/Cost',
      'Tech Stack',
      'TR Decision',
      'TR Comments'
    ];

    const rows = sortedAndFiltered.map(c => {
      const r1 = c.round_1_evaluation?.[0] || c.round_1_evaluation || c || {};
      const r2 = c.round_2_evaluation?.[0] || c.round_2_evaluation || {};
      const r3 = c.round_3_evaluation?.[0] || c.round_3_evaluation || {};

      // Parse combined columns or use new separate fields
      const rawSolves = r2.solves_business_problem || '';
      const r2Solves = r2.contact_status || (rawSolves.includes('Contact: ') ? rawSolves.split('Contact: ')[1].split(' | ')[0] : (['Yet to Speak', 'Spoke', 'Scheduled', 'No response'].includes(rawSolves) ? rawSolves : ''));
      const r2ProblemFit = r2.problem_fit || (rawSolves.includes('Fit: ') ? rawSolves.split('Fit: ')[1] : (['Yes', 'Maybe', 'No'].includes(rawSolves) ? rawSolves : ''));

      const rawDepth = r2.product_depth || '';
      const r2ProductDepth = r2.tech_depth || (rawDepth.includes('Depth: ') ? rawDepth.split('Depth: ')[1].split(' | ')[0] : (['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));
      const r2Latency = r2.latency_considerations || (rawDepth.includes('Latency: ') ? rawDepth.split('Latency: ')[1] : (!['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));

      return [
        c.id || '',
        getBio(c, 'full_name'),
        getBio(c, 'email'),
        getBio(c, 'applied_role'),
        getEval1(c, 'tier'),
        getEval1(c, 'total'),
        getEval1(c, 'review_cat'),
        getStatusInfo(c).text,
        getEval1(c, 'eval_group') || 'None',
        r2.when_can_they_start || '',
        r2.duration_months || '',
        r2.complexity || '',
        r2Solves || '',
        r2ProblemFit || '',
        r2ProductDepth || '',
        r2Latency || '',
        r2.tech_stack || '',
        r2.moved_to_round_3 || 'Pending',
        r2.demo_review_comment || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `candidates_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground stroke-[1.5]" />
          <Input
            placeholder="Search candidates by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-lg"
          />
        </div>

        {Object.keys(activeFilters).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilters({})}
            className="text-xs font-semibold text-[#800020] hover:bg-[#800020]/10 rounded-lg h-10 px-3 border border-transparent hover:border-[#800020]/20"
          >
            Reset All Filters ({Object.keys(activeFilters).length})
          </Button>
        )}

        <Button 
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="ml-auto h-10 rounded-lg border-primary/20 text-[#800020] hover:bg-[#800020] hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV ({sortedAndFiltered.length})
        </Button>
      </div>

      {/* Candidates Table */}
      <div className="border rounded-xl bg-card text-card-foreground overflow-visible shadow-sm">
        <Table className="relative z-10">
          <TableHeader className="bg-muted/40 border-b">
            <TableRow>
              <TableHead className="w-[85px] font-mono text-xs py-3 overflow-visible">
                <HeaderFilter
                  label="ID"
                  columnKey="id"
                  uniqueValues={uniqueIds}
                  activeFilters={activeFilters}
                  onApplyFilter={handleApplyFilter}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  isNumeric={true}
                />
              </TableHead>
              <TableHead className="overflow-visible min-w-[180px]">
                <HeaderFilter
                  label="Candidate"
                  columnKey="candidate"
                  uniqueValues={uniqueCandidates}
                  activeFilters={activeFilters}
                  onApplyFilter={handleApplyFilter}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[125px] overflow-visible">
                <HeaderFilter
                  label="Tier"
                  columnKey="tier"
                  uniqueValues={uniqueTiers}
                  activeFilters={activeFilters}
                  onApplyFilter={handleApplyFilter}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[110px] overflow-visible">
                <HeaderFilter
                  label="Score"
                  columnKey="score"
                  uniqueValues={uniqueScores}
                  activeFilters={activeFilters}
                  onApplyFilter={handleApplyFilter}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  isNumeric={true}
                />
              </TableHead>
              {round !== 3 && (
                <TableHead className="w-[155px] overflow-visible">
                  <HeaderFilter
                    label="Demo-AI Review"
                    columnKey="review_cat"
                    uniqueValues={uniqueReviewCats}
                    activeFilters={activeFilters}
                    onApplyFilter={handleApplyFilter}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </TableHead>
              )}
              {round !== 3 && (
                <TableHead className="w-[155px] overflow-visible">
                  <HeaderFilter
                    label="Status"
                    columnKey="status"
                    uniqueValues={uniqueStatuses}
                    activeFilters={activeFilters}
                    onApplyFilter={handleApplyFilter}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </TableHead>
              )}
              {showTechEvaluatorFilter && (
                <TableHead className="w-[180px] overflow-visible">
                  <HeaderFilter
                    label="Technical Reviewer"
                    columnKey="clan"
                    uniqueValues={uniqueClans}
                    activeFilters={activeFilters}
                    onApplyFilter={handleApplyFilter}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </TableHead>
              )}
              {round === 3 && (
                <TableHead className="min-w-[240px] font-semibold">TR Comments</TableHead>
              )}
              <TableHead className="w-[150px] text-right font-semibold pr-6">Actions</TableHead>
              {round === 3 && (
                <TableHead className="w-[155px] overflow-visible">
                  <HeaderFilter
                    label="Status"
                    columnKey="status"
                    uniqueValues={uniqueStatuses}
                    activeFilters={activeFilters}
                    onApplyFilter={handleApplyFilter}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFiltered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={round === 3 ? 8 : (showTechEvaluatorFilter ? 9 : 8)} className="text-center py-10 text-muted-foreground font-mono text-sm">
                  No applicants matching active selection filters.
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFiltered.map((cand) => {
                const info = getStatusInfo(cand);
                
                let statusBadge = (
                  <Badge className={`rounded-full px-2.5 ${info.color}`}>
                    {info.text}
                  </Badge>
                );

                // Review Cat formatting
                const cat = getEval1(cand, 'review_cat') || 'N/A';
                let catBadge = <Badge variant="secondary" className="rounded-full px-2 py-0.5">{cat}</Badge>;
                if (cat === 'Strong') catBadge = <Badge className="bg-emerald-600 text-white border-transparent rounded-full px-2 py-0.5">Strong</Badge>;
                else if (cat === 'Good') catBadge = <Badge className="bg-blue-600 text-white border-transparent rounded-full px-2 py-0.5">Good</Badge>;
                else if (cat === 'Need Clarity') catBadge = <Badge className="bg-orange-500 text-white border-transparent rounded-full px-2 py-0.5">Need Clarity</Badge>;
                else if (cat === 'Invalid') catBadge = <Badge variant="destructive" className="rounded-full px-2 py-0.5">Invalid</Badge>;

                return (
                  <TableRow key={cand.id} className="hover:bg-muted/20 border-b transition-colors duration-200">
                    <TableCell className="font-mono text-xs font-bold py-4">{cand.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{getBio(cand, 'full_name')}</div>
                      
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5 border-primary/20">{getEval1(cand, 'tier') || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-extrabold text-sm text-[#800020]">
                      {getEval1(cand, 'total') || 0}
                    </TableCell>
                    {round !== 3 && <TableCell>{catBadge}</TableCell>}
                    {round !== 3 && <TableCell>{statusBadge}</TableCell>}
                    {showTechEvaluatorFilter && (
                      <TableCell className="py-2">
                        {round === 1 ? (
                          <select
                            value={getEval1(cand, 'eval_group') || 'None'}
                            onChange={(e) => {
                              const val = e.target.value;
                              onUpdateTechEvaluator?.(cand.id, val === 'None' ? null : val);
                            }}
                            className="h-8 w-24 text-xs bg-card border rounded-md px-1 focus:outline-none focus:ring-1 focus:ring-[#800020] font-semibold text-[#800020] border-[#800020]/20"
                          >
                            <option value="None">None</option>
                            <option value="Tejaswini">Tejaswini</option>
                            <option value="Sohan">Sohan</option>
                            <option value="Basvaraj">Basvaraj</option>
                            <option value="Pushkaraj">Pushkaraj</option>
                            <option value="Akash">Akash</option>
                            <option value="Anmol">Anmol</option>
                            <option value="Sachin">Sachin</option>
                            <option value="Akhil L">Akhil L</option>
                            <option value="Vedant">Vedant</option>
                            <option value="Akhil M">Akhil M</option>
                            <option value="Samit">Samit</option>
                            <option value="Snehanshu">Snehanshu</option>
                            <option value="Ankita">Ankita</option>
                            <option value="Kaushik">Kaushik</option>
                          </select>
                        ) : (
                          <Badge variant="outline" className="font-semibold text-[11px] border-primary/20 text-[#800020] bg-primary/5 rounded-full px-2">
                            {getEval1(cand, 'eval_group') || 'None'}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    {round === 3 && (() => {
                      const r2val = cand.round_2_evaluation;
                      const r2 = Array.isArray(r2val) ? (r2val[0] || {}) : (r2val || {});
                      const trComment = r2.demo_review_comment || '';
                      return (
                        <TableCell className="max-w-[280px]">
                          <span
                            title={trComment}
                            className="text-xs text-muted-foreground line-clamp-2 whitespace-normal block"
                          >
                            {trComment || '—'}
                          </span>
                        </TableCell>
                      );
                    })()}
                    <TableCell className="text-right pr-6">
                      <Button size="sm" variant="outline" onClick={() => onActionClick(cand)} className="rounded-md font-semibold text-xs border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white transition-colors duration-300">
                        {actionLabel}
                      </Button>
                    </TableCell>
                    {round === 3 && <TableCell>{statusBadge}</TableCell>}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
