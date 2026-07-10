import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Download } from 'lucide-react';

export default function CandidateListTable({ candidates, actionLabel, onActionClick, showClanFilter = false, round = 1, onUpdateClan }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [clanFilter, setClanFilter] = useState('ALL');

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
      // Check Round 3 Verdict
      const r3 = cand.round_3_evaluation;
      const r3Parsed = Array.isArray(r3) ? r3[0] : r3;
      const verdict = r3Parsed?.verdict;
      if (verdict === 'Yes') return { text: 'Approved', color: 'bg-green-600 hover:bg-green-700 text-white border-transparent' };
      if (verdict === 'No') return { text: 'Declined', color: 'bg-red-600 hover:bg-red-700 text-white border-transparent' };
      return { text: 'Pending Verdict', color: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' };
    }
    
    if (round === 2) {
      // Check Round 2 Decision
      const r2 = cand.round_2_evaluation;
      const r2Parsed = Array.isArray(r2) ? r2[0] : r2;
      const decision = r2Parsed?.moved_to_round_3;
      if (decision === 'Yes') return { text: 'Promoted', color: 'bg-green-600 hover:bg-green-700 text-white border-transparent' };
      if (decision === 'Maybe') return { text: 'Maybe', color: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' };
      if (decision === 'No') return { text: 'Declined', color: 'bg-red-600 hover:bg-red-700 text-white border-transparent' };
      return { text: 'Pending Vetting', color: 'bg-gray-400 hover:bg-gray-500 text-white border-transparent' };
    }

    // Default: Round 1 app_status
    const status = getEval1(cand, 'app_status') || 'Pending';
    if (status === 'Yes') return { text: 'Yes', color: 'bg-green-600 hover:bg-green-700 text-white border-transparent' };
    if (status === 'Reject') return { text: 'Reject', color: 'bg-red-600 hover:bg-red-700 text-white border-transparent' };
    if (status === 'Maybe') return { text: 'Maybe', color: 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' };
    if (status === 'Duplicate') return { text: 'Duplicate', color: 'border-gray-500 text-gray-500 bg-transparent' };
    return { text: 'Pending', color: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
  };

  // Filter logic
  const filtered = candidates.filter(cand => {
    // Search
    const query = search.toLowerCase();
    const nameMatch = getBio(cand, 'full_name')?.toLowerCase().includes(query);
    const emailMatch = getBio(cand, 'email')?.toLowerCase().includes(query);
    const roleMatch = getBio(cand, 'applied_role')?.toLowerCase().includes(query);
    const idMatch = cand.id?.toString().includes(query);
    
    if (search && !nameMatch && !emailMatch && !roleMatch && !idMatch) return false;

    // Status filter
    if (statusFilter !== 'ALL') {
      const info = getStatusInfo(cand);
      if (info.text !== statusFilter) return false;
    }

    // Tier filter
    const tier = getEval1(cand, 'tier') || 'N/A';
    if (tierFilter !== 'ALL' && tier !== tierFilter) return false;

    // Clan filter
    const clan = getEval1(cand, 'eval_group') || 'None';
    if (showClanFilter && clanFilter !== 'ALL' && clan !== clanFilter) return false;

    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      'Candidate ID',
      'Name',
      'Email',
      'Role',
      'Tier',
      'Screening Score',
      'Review Category',
      'Vetting Status',
      'Clan Assigned',
      'Start Date',
      'College Commitment',
      'Technical Depth',
      'Tech Stack',
      'Problem Fit',
      'Latency/Security/Cost'
    ];

    const rows = filtered.map(c => {
      const r1 = c.round_1_evaluation?.[0] || c.round_1_evaluation || c || {};
      const r2 = c.round_2_evaluation?.[0] || c.round_2_evaluation || {};
      const r3 = c.round_3_evaluation?.[0] || c.round_3_evaluation || {};

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
        r2.complexity || '',
        r2.demo_review_comment || '',
        r2.tech_stack || '',
        r2.solves_business_problem || '',
        r2.product_depth || ''
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

  // Render round-specific filter options
  const renderStatusFilterOptions = () => {
    if (round === 3) {
      return (
        <>
          <SelectItem value="ALL">All Verdicts</SelectItem>
          <SelectItem value="Pending Verdict">Pending Verdict</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Declined">Declined</SelectItem>
        </>
      );
    }
    if (round === 2) {
      return (
        <>
          <SelectItem value="ALL">All Vettings</SelectItem>
          <SelectItem value="Pending Vetting">Pending Vetting</SelectItem>
          <SelectItem value="Promoted">Promoted</SelectItem>
          <SelectItem value="Maybe">Maybe</SelectItem>
          <SelectItem value="Declined">Declined</SelectItem>
        </>
      );
    }
    return (
      <>
        <SelectItem value="ALL">All Statuses</SelectItem>
        <SelectItem value="Pending">Pending</SelectItem>
        <SelectItem value="Yes">Yes</SelectItem>
        <SelectItem value="Reject">Reject</SelectItem>
        <SelectItem value="Maybe">Maybe</SelectItem>
        <SelectItem value="Duplicate">Duplicate</SelectItem>
      </>
    );
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

        {/* Status Filter */}
        <div className="w-[160px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {renderStatusFilterOptions()}
            </SelectContent>
          </Select>
        </div>

        {/* Tier Filter */}
        <div className="w-[120px]">
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="h-10 rounded-lg">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value="T1+">Tier 1+</SelectItem>
              <SelectItem value="T1">Tier 1</SelectItem>
              <SelectItem value="T2+">Tier 2+</SelectItem>
              <SelectItem value="T2">Tier 2</SelectItem>
              <SelectItem value="T3">Tier 3</SelectItem>
              <SelectItem value="N/A">N/A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clan Filter */}
        {showClanFilter && (
          <div className="w-[130px]">
            <Select value={clanFilter} onValueChange={setClanFilter}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Clan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Clans</SelectItem>
                <SelectItem value="Dharti">Dharti</SelectItem>
                <SelectItem value="Jal">Jal</SelectItem>
                <SelectItem value="Agni">Agni</SelectItem>
                <SelectItem value="Vayu">Vayu</SelectItem>
                <SelectItem value="Akash">Akash</SelectItem>
                <SelectItem value="Bijli">Bijli</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button 
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="ml-auto h-10 rounded-lg border-primary/20 text-[#800020] hover:bg-[#800020] hover:text-white"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Candidates Table */}
      <div className="border rounded-xl bg-card text-card-foreground overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40 border-b">
            <TableRow>
              <TableHead className="w-[60px] font-mono text-xs font-semibold py-3">ID</TableHead>
              <TableHead className="font-semibold">Candidate</TableHead>
              <TableHead className="w-[100px] font-semibold">Tier</TableHead>
              <TableHead className="w-[80px] font-semibold">Score</TableHead>
              <TableHead className="w-[130px] font-semibold">Review Cat</TableHead>
              <TableHead className="w-[130px] font-semibold">Status</TableHead>
              {showClanFilter && <TableHead className="w-[100px] font-semibold">Clan</TableHead>}
              <TableHead className="w-[150px] text-right font-semibold pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showClanFilter ? 9 : 8} className="text-center py-10 text-muted-foreground font-mono text-sm">
                  No applicants matching active selection filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cand) => {
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

                const notes = getEval1(cand, 'demo_review_notes_ai') || 'No analysis available.';

                return (
                  <TableRow key={cand.id} className="hover:bg-muted/20 border-b transition-colors duration-200">
                    <TableCell className="font-mono text-xs font-bold py-4">{cand.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{getBio(cand, 'full_name')}</div>
                      <div className="text-xs text-muted-foreground">{getBio(cand, 'applied_role') || 'ML Engineer Intern'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5 border-primary/20">{getEval1(cand, 'tier') || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-extrabold text-sm text-[#800020]">
                      {getEval1(cand, 'total') || 0}
                    </TableCell>
                    <TableCell>{catBadge}</TableCell>
                    <TableCell>{statusBadge}</TableCell>
                    {showClanFilter && (
                      <TableCell className="py-2">
                        {round === 1 ? (
                          <select
                            value={getEval1(cand, 'eval_group') || 'None'}
                            onChange={(e) => {
                              const val = e.target.value;
                              onUpdateClan?.(cand.id, val === 'None' ? null : val);
                            }}
                            className="h-8 w-24 text-xs bg-card border rounded-md px-1 focus:outline-none focus:ring-1 focus:ring-[#800020] font-semibold text-[#800020] border-[#800020]/20"
                          >
                            <option value="None">None</option>
                            <option value="Dharti">Dharti</option>
                            <option value="Jal">Jal</option>
                            <option value="Agni">Agni</option>
                            <option value="Vayu">Vayu</option>
                            <option value="Akash">Akash</option>
                            <option value="Bijli">Bijli</option>
                          </select>
                        ) : (
                          <Badge variant="outline" className="font-semibold text-[11px] border-primary/20 text-[#800020] bg-primary/5 rounded-full px-2">
                            {getEval1(cand, 'eval_group') || 'None'}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right pr-6">
                      <Button size="sm" variant="outline" onClick={() => onActionClick(cand)} className="rounded-md font-semibold text-xs border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white transition-colors duration-300">
                        {actionLabel}
                      </Button>
                    </TableCell>
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
