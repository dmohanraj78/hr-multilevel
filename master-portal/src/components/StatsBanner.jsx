import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Hourglass, CheckCircle2, XCircle, HelpCircle, Check, X, Clock, Headphones, MessageSquare, Calendar, VolumeX, MoreHorizontal } from 'lucide-react';

export default function StatsBanner({ candidates, round = 1, rawCount = 0, activeFilter, onFilterChange }) {
  const total = candidates.length;
  
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

  // Safe helper to extract fields flatly or relationally
  const getEvalField = (c, field) => {
    if (!c) return '';
    const r1 = c.round_1_evaluation;
    const r1Parsed = Array.isArray(r1) ? r1[0] : r1;
    return c[field] !== undefined ? c[field] : (r1Parsed?.[field] || '');
  };

  let stats = [];

  if (round === 2) {
    const assignedCandidates = candidates.filter(c => {
      const eg = getEvalField(c, 'eval_group');
      return eg && eg !== 'None';
    });
    const assignedCount = assignedCandidates.length;
    const unassignedCount = total - assignedCount;

    const yesCount = assignedCandidates.filter(c => getR2(c).moved_to_round_3 === 'Yes').length;
    const maybeCount = assignedCandidates.filter(c => getR2(c).moved_to_round_3 === 'Maybe').length;
    const noCount = assignedCandidates.filter(c => getR2(c).moved_to_round_3 === 'No' || getR2(c).moved_to_round_3 === 'Reject').length;
    const pendingCount = assignedCount - yesCount - maybeCount - noCount;

    const yetToSpeak = assignedCandidates.filter(c => {
      const status = getR2(c).contact_status;
      return !status || status === 'Yet to Speak' || status === 'Pending';
    }).length;
    const spoke = assignedCandidates.filter(c => getR2(c).contact_status === 'Spoke').length;
    const scheduled = assignedCandidates.filter(c => getR2(c).contact_status === 'Scheduled').length;
    const noResponse = assignedCandidates.filter(c => {
      const status = String(getR2(c).contact_status || '').toLowerCase();
      return status === 'no response';
    }).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Card 1: Total Candidates in R2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden h-[350px]">
          {/* Wave Graphic at bottom right */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-500 stroke-current stroke-1">
              <path d="M0 100 C 30 70, 70 70, 100 100" />
              <path d="M0 90 C 30 60, 70 60, 100 90" />
              <path d="M0 80 C 30 50, 70 50, 100 80" />
            </svg>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-full">
              <Users className="h-6 w-6 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">Total Candidates in R2</span>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <div className="text-7xl font-extrabold text-blue-900 dark:text-blue-100 font-mono tracking-tight">{total}</div>
          </div>

          <div>
            <div className="border-t border-slate-100 dark:border-slate-800/60 my-4" />
            <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex-1 text-center border-r border-blue-500/10">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100 font-mono">{assignedCount}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Assigned</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100 font-mono">{unassignedCount}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Unassigned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Decisions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                  <CheckCircle2 className="h-5 w-5 stroke-[1.5]" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-wider uppercase">Decisions</span>
              </div>
              <div className="h-7 w-7 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* List Rows */}
            <div className="flex flex-col gap-2">
              {/* Yes Row */}
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/40 last:border-0 pb-1.5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                    <Check className="h-3.5 w-3.5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Yes</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{yesCount}</span>
              </div>

              {/* Maybe Row */}
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/40 last:border-0 pb-1.5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                    <HelpCircle className="h-3.5 w-3.5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">May be</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{maybeCount}</span>
              </div>

              {/* No Row */}
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/40 last:border-0 pb-1.5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                    <X className="h-3.5 w-3.5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">No</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{noCount}</span>
              </div>

              {/* Pending Row */}
              <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/40 last:border-0 pb-1.5">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                    <Clock className="h-3.5 w-3.5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pending</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{pendingCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Total</span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">{assignedCount}</span>
          </div>
        </div>

      </div>
    );
  } else if (round === 3) {
    const yesCount = candidates.filter(c => {
      const r3 = getR3(c);
      return r3.final_status === 'Yes' || r3.final_status === 'Hired';
    }).length;

    const maybeCount = candidates.filter(c => {
      const r3 = getR3(c);
      return r3.final_status === 'Maybe';
    }).length;

    const noCount = candidates.filter(c => {
      const r3 = getR3(c);
      return r3.final_status === 'No' || r3.final_status === 'Rejected';
    }).length;

    stats = [
      { key: 'ALL', title: 'Total Promoted', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
      { key: 'Hired', title: 'Hired', value: yesCount, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { key: 'Maybe', title: 'Maybe', value: maybeCount, icon: HelpCircle, color: 'text-amber-500 bg-amber-500/10' },
      { key: 'Rejected', title: 'Rejected', value: noCount, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    ];
  } else {
    const TOP_TIERS = ['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-'];
    const LOW_TIERS = ['Tier 3', 'Tier 4'];

    const approvedR1 = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      return status === 'Yes';
    }).length;

    const rejected = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      return status === 'No' || status === 'Reject';
    }).length;

    const pendingTop = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      const tier = getEvalField(c, 'tier');
      const isPending = (!status || status === 'Pending');
      return isPending && TOP_TIERS.includes(tier);
    }).length;

    const pendingLow = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      const tier = getEvalField(c, 'tier');
      const isPending = (!status || status === 'Pending');
      return isPending && LOW_TIERS.includes(tier);
    }).length;

    const demoAccessTop = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      const tier = getEvalField(c, 'tier');
      return status === 'Access requested' && TOP_TIERS.includes(tier);
    }).length;

    stats = [
      { 
        title: 'Applications Reviewed', 
        value: total, 
        icon: Users, 
        iconColorClass: 'text-blue-600 dark:text-blue-400',
        iconBgClass: 'bg-blue-50 dark:bg-blue-950/25',
        titleColorClass: 'text-blue-600 dark:text-blue-400',
        valueColorClass: 'text-blue-600 dark:text-blue-400'
      },
      { 
        title: 'HR Round Cleared', 
        value: approvedR1, 
        icon: Check, 
        iconColorClass: 'text-green-600 dark:text-green-400',
        iconBgClass: 'bg-green-50 dark:bg-green-950/25',
        titleColorClass: 'text-green-600 dark:text-green-400',
        valueColorClass: 'text-green-600 dark:text-green-400'
      },
      {
        title: (
          <span>
            Pending for Manual Review <span className="block text-[8px] normal-case font-bold mt-0.5 opacity-90">(Tier 1, 1+, Tier 2, 2-)</span>
          </span>
        ),
        value: pendingTop,
        subtitle: `Pending Demo Access: ${demoAccessTop}`,
        icon: Hourglass,
        iconColorClass: 'text-[#c2410c] dark:text-orange-400',
        iconBgClass: 'bg-orange-50 dark:bg-orange-950/25',
        titleColorClass: 'text-[#c2410c] dark:text-orange-400',
        valueColorClass: 'text-[#c2410c] dark:text-orange-400'
      },
      { 
        title: 'Rejected', 
        value: rejected, 
        icon: X, 
        iconColorClass: 'text-red-600 dark:text-red-400',
        iconBgClass: 'bg-red-50 dark:bg-red-950/25',
        titleColorClass: 'text-red-600 dark:text-red-400',
        valueColorClass: 'text-red-600 dark:text-red-400'
      },
      {
        title: (
          <span>
            Pending for Manual Review <span className="block text-[8px] normal-case font-bold mt-0.5 opacity-90">(Tier 3 & Tier 4)</span>
          </span>
        ),
        value: pendingLow,
        icon: Hourglass,
        iconColorClass: 'text-[#c2410c] dark:text-orange-400',
        iconBgClass: 'bg-orange-50 dark:bg-orange-950/25',
        titleColorClass: 'text-[#c2410c] dark:text-orange-400',
        valueColorClass: 'text-[#c2410c] dark:text-orange-400'
      }
    ];
  }

  return (
    <div className={`grid gap-6 ${
      stats.length === 5 
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' 
        : stats.length === 4 
          ? 'grid-cols-2 lg:grid-cols-4' 
          : 'grid-cols-1 md:grid-cols-3'
    }`}>
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const isClickable = round === 3 && onFilterChange && stat.key;
        const isSelected = isClickable && activeFilter === stat.key;

        // Redesigned Card Layout for Round 1
        if (round !== 2 && round !== 3) {
          return (
            <Card
              key={i}
              className="min-h-[245px] h-full flex flex-col justify-between p-5 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700"
            >
              {/* Top: Icon */}
              <div className="flex justify-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.iconBgClass} ${stat.iconColorClass}`}>
                  <Icon className="h-4 w-4 stroke-[2]" />
                </div>
              </div>

              {/* Middle: Title */}
              <div className="flex flex-col gap-1 mt-3">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider font-sans leading-normal min-h-[1.75rem] ${stat.titleColorClass}`}>
                  {stat.title}
                </span>
              </div>

              {/* Dotted separator line */}
              <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-800/80 my-2" />

              {/* Bottom: Value & Subtitle badge */}
              <div className="flex flex-col gap-2 mt-auto">
                <div className={`text-4xl font-extrabold font-mono tracking-tight leading-none ${stat.valueColorClass}`}>
                  {stat.value}
                </div>
                {/* Subtitle Badge */}
                <div className="min-h-[18px] flex items-center mt-0.5">
                  {stat.subtitle ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#fff7ed] dark:bg-orange-950/20 text-[#c2410c] dark:text-orange-400 border border-[#ffedd5] dark:border-orange-900/50 shadow-sm">
                      {stat.subtitle}
                    </span>
                  ) : (
                    '\u00A0'
                  )}
                </div>
              </div>
            </Card>
          );
        }

        // Standard Card Layout for Round 2 & 3
        return (
          <Card
            key={i}
            onClick={() => {
              if (isClickable) {
                onFilterChange(stat.key);
              }
            }}
            className={`h-full flex flex-col transition-all duration-300 border rounded-[1.25rem] overflow-hidden ${
              isClickable ? 'cursor-pointer hover:shadow-md' : 'hover:shadow-lg'
            } ${
              isSelected
                ? 'ring-2 ring-offset-2 ring-[#800020] border-transparent scale-[1.02] shadow-md'
                : 'hover:border-muted-foreground/30'
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2 space-y-0">
              <span className="text-[10px] font-bold text-muted-foreground font-mono tracking-wider uppercase leading-snug min-h-[2.5rem]">{stat.title}</span>
              <div className={`p-1.5 rounded-lg shrink-0 ${stat.color}`}>
                <Icon className="h-4 w-4 stroke-[1.5]" />
              </div>
            </CardHeader>
            <CardContent className="pb-4 mt-auto">
              {stat.customContent ? (
                stat.customContent
              ) : (
                <>
                  <div className="text-3xl font-extrabold font-mono tracking-tight">{stat.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-1 font-medium font-sans min-h-[15px]">
                    {stat.subtitle || '\u00A0'}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
