import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Search, LayoutGrid, Users, CheckCircle, Flame, XOctagon, HelpCircle, BarChart3, TrendingUp, Filter, ArrowUp, ArrowDown, FileSpreadsheet } from 'lucide-react';
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
    const r3 = getR3(c);

    if (r3.verdict === 'Yes') return 'Hired';
    if (r3.verdict === 'No') return 'Declined (Offer)';
    
    if (r1.app_status === 'Reject') return 'Declined (Review)';
    if (r1.app_status === 'Yes') return 'Tech Review';
    if (r1.app_status === 'Maybe') return 'Maybe (Reviewed)';
    if (r1.app_status === 'Duplicate') return 'Duplicate';
    return 'Pending Review';
  };

  // Base list containing only evaluated candidates (those with a round_1_evaluation record)
  const evaluatedCandidates = useMemo(() => {
    return globalData.filter(c => c.round_1_evaluation !== null);
  }, [globalData]);

  const evaluatedCount = evaluatedCandidates.length;
  const rawTotal = globalData.length; // total raw submissions
  const duplicatesRemoved = rawTotal - evaluatedCount; // duplicates removed

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
      else if (status === 'Reject') rejected++;
      else if (status === 'Maybe') maybeCount++;
      else pendingScreening++;
    });

    // Hired count is candidates in round_3_evaluation with verdict === 'Yes'
    hired = evaluatedCandidates.filter(c => getR3(c).verdict === 'Yes').length;

    return { total, hired, rejected, review, pendingScreening, maybeCount };
  }, [evaluatedCandidates, evaluatedCount]);

  // 2. Chart Calculations — use evaluatedCandidates so Technical Reviewer counts reflect actual eval records
  const chartData = useMemo(() => {
    const clans = { Tejaswini: 0, Sohan: 0, Basvaraj: 0, Pushkaraj: 0, Akash: 0, Anmol: 0, Sachin: 0, 'Akhil L': 0, Vedant: 0, 'Akhil M': 0, Samit: 0, Snehanshu: 0, Ankita: 0, Kaushik: 0, Unassigned: 0 };
    const tiers = { 'T1+': 0, 'T1': 0, 'T2+': 0, 'T2': 0, 'T3': 0, 'T4': 0, 'N/A': 0 };
    const scores = { '0-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '21-25': 0, '26-30': 0 };

    evaluatedCandidates.forEach(c => {
      const r1 = getR1(c);
      
      const clan = r1.eval_group || 'Unassigned';
      if (clans[clan] !== undefined) clans[clan]++;
      else clans['Unassigned']++;

      let tier = r1.tier || 'N/A';
      if (tier === 'Tier 1+') tier = 'T1+';
      else if (tier === 'Tier 1') tier = 'T1';
      else if (tier === 'Tier 2+') tier = 'T2+';
      else if (tier === 'Tier 2') tier = 'T2';
      else if (tier === 'Tier 3') tier = 'T3';
      else if (tier === 'Tier 4') tier = 'T4';

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
        r3.verdict || 'Pending',
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
        if (r3.verdict) {
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
        { header: 'Tier', key: 'tier', width: 12 },
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
        { header: 'TR Decision', key: 'tr_decision', width: 15 },
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
          if (r3.verdict === 'Yes') reviewStatus = 'Promoted';
          else if (r3.verdict === 'No') reviewStatus = 'Declined';
          else if (r2.moved_to_round_3 === 'No' || r2.moved_to_round_3 === 'Declined') reviewStatus = 'Declined';
          else if (r2.moved_to_round_3 === 'Yes' || r2.moved_to_round_3 === 'Maybe') reviewStatus = 'Promoted';
          else if (r1.app_status === 'Reject') reviewStatus = 'Declined';
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
            tier: r1.tier || 'N/A',
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
        { header: 'TR Decision', key: 'tr_decision', width: 15 },
        { header: 'TR Comments', key: 'tr_comments', width: 45 },
        { header: 'Decision', key: 'verdict', width: 15 },
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
            verdict: r3.verdict || 'Pending',
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
      let t1 = 0, t1Minus = 0, t2 = 0, t2Minus = 0, t3 = 0, t4 = 0;
      let scores = [];
      candidatesToExport.forEach(c => {
        const r1 = getR1(c);
        const tier = (r1.tier || '').trim().toUpperCase();
        if (['T1', 'T1+', 'TIER 1', 'TIER 1+'].includes(tier)) t1++;
        else if (['T1-', 'TIER 1-'].includes(tier)) t1Minus++;
        else if (['T2', 'T2+', 'TIER 2', 'TIER 2+'].includes(tier)) t2++;
        else if (['T2-', 'TIER 2-'].includes(tier)) t2Minus++;
        else if (['T3', 'TIER 3'].includes(tier)) t3++;
        else if (['T4', 'TIER 4'].includes(tier)) t4++;

        const scoreVal = parseFloat(r1.total || 0);
        scores.push(scoreVal);
      });

      scores.sort((a, b) => a - b);
      const avgScore = scores.length ? (scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
      const topScore = scores.length ? scores[scores.length - 1] : 0;
      let medianScore = 0;
      if (scores.length) {
        const mid = Math.floor(scores.length / 2);
        medianScore = scores.length % 2 !== 0 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2;
      }

      // Write Row 3 (values)
      sheet.getRow(3).height = 20;
      const statsVals = [totalApplicants, t1, t1Minus, t2, t2Minus, t3, t4, parseFloat(avgScore.toFixed(1)), topScore, medianScore];
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
      const statsLabels = ["Applicants", "Tier 1", "Tier 1-", "Tier 2", "Tier 2-", "Tier 3", "Tier 4", "Avg Total", "Top Score", "Median"];
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
        sheet.unMergeCells('A5:AV5');
      } catch (e) {}
      try {
        sheet.mergeCells('A5:AM5');
      } catch (e) {}
      const cellR1Header = unshareStyle(sheet.getCell('A5'));
      cellR1Header.value = "Round 1 Inputs";
      cellR1Header.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cellR1Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F3864' } };
      cellR1Header.alignment = { horizontal: 'center', vertical: 'middle' };

      try {
        sheet.mergeCells('AN5:AV5');
      } catch (e) {}
      const cellR2Header = unshareStyle(sheet.getCell('AN5'));
      cellR2Header.value = "Round 2 Inputs";
      cellR2Header.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cellR2Header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } };
      cellR2Header.alignment = { horizontal: 'center', vertical: 'middle' };

      // Row 6 Headers
      const headers = [
        "Rank", "Name", "Gender", "Cat", "Graduation", "Tier", "Total", "Edu", "Exp", "Proj", 
        "Substance", "Deploy", "Artifact", "Skills", "Domain", "Degree", "Stream", "College", "F_college", "F_University", 
        "Location", "AI Proj", "FS Proj", "Intern Mo", "Co.Tier", "Deploy Stage", "#Skills", "Claude Lvl", "AI/ML Exp", "Email", 
        "Résumé", "GitHub", "Demo", "Demo Explanation (their project)", "Demo Review Notes (AI)", "R1 Review", "R1 Interview Priority", "To be screened by", 
        "Status", "Earliest date they can start the internship", "Any concerns / restrictions (with college commitment, personal, others)", "Technical depth of demo / product", "Tech stack used", "Problem-solution fit", "Areas like latency, cost, security, etc been considered", "Decision", "Tier", "Reason for decision (detailed notes)"
      ];

      sheet.getRow(6).height = 24;
      headers.forEach((h, idx) => {
        const cell = unshareStyle(sheet.getCell(6, idx + 1));
        cell.value = h;
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        
        const isR2 = idx >= 38;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isR2 ? 'FF0070C0' : 'FF1F3864' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });

      // Sort order: Yes → Maybe → Pending Decisions → Rejected, then by score within each group
      const getSortGroup = (cand) => {
        const r1Status = (getR1(cand).app_status || '').trim().toLowerCase();
        const r2Decision = (getR2(cand).moved_to_round_3 || '').trim().toLowerCase();

        // 1. If R2 Decision exists (is not empty/pending)
        if (['yes', 'promoted', 'yes_draft'].includes(r2Decision)) return 0; // Yes
        if (['maybe', 'maybe_draft'].includes(r2Decision)) return 1; // Maybe
        if (['no', 'no_draft'].includes(r2Decision)) return 3; // Rejected

        // 2. If R2 is pending/empty, fallback to R1 Status
        if (r1Status === 'yes') return 0; // Yes
        if (r1Status === 'maybe') return 1; // Maybe
        if (['no', 'rejected', 'invalid', 'reject'].includes(r1Status)) return 3; // Rejected

        // 3. Otherwise it's Pending
        return 2; // Pending Decisions
      };
      const sortedCandidates = [...candidatesToExport].sort((a, b) => {
        const groupDiff = getSortGroup(a) - getSortGroup(b);
        if (groupDiff !== 0) return groupDiff;
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
          r1.r1_interview_priority || '-',
          r1.eval_group || '-',
          r1.app_status || '-', // Status (R2 Status)
          r2.id ? (r2.when_can_they_start || '-') : '-',
          r2.id ? (r2.complexity || '-') : '-',
          r2.id ? (techDepth || '-') : '-',
          r2.id ? (r2.tech_stack || '-') : '-',
          r2.id ? (problemFit || '-') : '-',
          r2.id ? (latency || '-') : '-',
          r2.id ? (r2.moved_to_round_3 ? r2.moved_to_round_3.replace('_draft', '') : '-') : '-',
          "-", // Tier (R2 tier placeholder)
          r2.id ? (r2.demo_review_comment || '-') : '-'
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

          // Color-code ONLY R1 Status (idx 38) and R2 Decision (idx 45)
          const DECISION_COLS = new Set([38, 45]);
          if (DECISION_COLS.has(idx)) {
            const valStr = String(val || '').trim().toLowerCase();
            if (['yes', 'promoted', 'approved'].includes(valStr)) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2F0D9' } };
              cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF385723' }, bold: true };
            } else if (['maybe'].includes(valStr)) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
              cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF856404' }, bold: true };
            } else if (['no', 'rejected', 'invalid', 'reject'].includes(valStr)) {
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

      // Set exact column widths matching typical content
      const widths = [
        6, 25, 10, 8, 12, 10, 8, 8, 8, 8, 8, 8, 8, 8, 20, 15, 20, 30, 30, 25,
        18, 10, 10, 10, 10, 18, 10, 15, 15, 30, 25, 25, 25, 35, 35, 30, 18, 18,
        12, 18, 25, 18, 25, 15, 20, 12, 10, 35
      ];
      widths.forEach((w, idx) => {
        sheet.getColumn(idx + 1).width = w;
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
        <div className="flex flex-wrap gap-3 items-center shrink-0">
          <Button onClick={exportToCSV} className="bg-[#800020] hover:bg-[#800020]/90 text-white rounded-xl shadow-md">
            <Download className="mr-2 h-4 w-4 stroke-[1.5]" /> Export Filtered ({deduplicatedFiltered.length}) Records (CSV)
          </Button>
        </div>
      </div>

      {/* Date-wise Custom Downloader Card */}
      <div className="bg-card border border-muted-foreground/10 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Selector (Optional Filter)</label>
            <div className="flex items-center gap-2">
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="h-10 text-xs w-[145px] bg-card border-muted-foreground/20 rounded-xl"
              />
              <span className="text-muted-foreground text-xs font-semibold px-0.5">to</span>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="h-10 text-xs w-[145px] bg-card border-muted-foreground/20 rounded-xl"
              />
              {(startDate || endDate) && (
                <Button 
                  onClick={() => { setStartDate(''); setEndDate(''); }} 
                  variant="ghost" 
                  className="h-10 px-3 text-xs text-rose-500 hover:text-rose-600 font-semibold hover:bg-rose-50/50 rounded-xl transition-all"
                >
                  Clear Range
                </Button>
              )}
            </div>
          </div>
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
                .filter(([clan, count]) => count > 0 && clan !== 'Unassigned')
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

      </div>

    </div>
  );
}
