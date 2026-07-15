import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Hourglass, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export default function StatsBanner({ candidates, round = 1, rawCount = 0, activeFilter, onFilterChange }) {
  const total = candidates.length;
  
  const getR2 = (c) => {
    const val = c.round_2_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };

  const getR3 = (c) => {
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
    const assignedCount = candidates.filter(c => {
      const eg = getEvalField(c, 'eval_group');
      return eg && eg !== 'None';
    }).length;
    const unassignedCount = total - assignedCount;

    const yesCount = candidates.filter(c => getR2(c).moved_to_round_3 === 'Yes').length;
    const maybeCount = candidates.filter(c => getR2(c).moved_to_round_3 === 'Maybe').length;
    const noCount = candidates.filter(c => getR2(c).moved_to_round_3 === 'No' || getR2(c).moved_to_round_3 === 'Reject').length;

    const yetToSpeak = candidates.filter(c => getR2(c).contact_status === 'Yet to Speak').length;
    const spoke = candidates.filter(c => getR2(c).contact_status === 'Spoke').length;
    const scheduled = candidates.filter(c => getR2(c).contact_status === 'Scheduled').length;
    const noResponse = candidates.filter(c => {
      const status = String(getR2(c).contact_status || '').toLowerCase();
      return status === 'no response';
    }).length;

    stats = [
      {
        title: 'Total Candidates in R2',
        value: total,
        subtitle: `${assignedCount} Assigned · ${unassignedCount} Unassigned`,
        icon: Users,
        color: 'text-blue-500 bg-blue-500/10'
      },
      {
        title: 'Decisions',
        value: assignedCount,
        subtitle: `${yesCount} Yes · ${maybeCount} Maybe · ${noCount} No`,
        icon: CheckCircle2,
        color: 'text-green-500 bg-green-500/10'
      },
      {
        title: 'Status',
        value: assignedCount,
        subtitle: `${yetToSpeak} Yet to Speak · ${spoke} Spoke · ${scheduled} Scheduled · ${noResponse} No Response`,
        icon: Hourglass,
        color: 'text-amber-500 bg-amber-500/10'
      }
    ];
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

    stats = [
      { title: 'Applications Reviewed', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
      { title: 'HR Round Cleared', value: approvedR1, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      {
        title: (
          <span>
            Pending for Manual Review <span className="block text-[8px] normal-case font-bold mt-0.5 opacity-90">(Tier 1, 1-, Tier 2, 2-)</span>
          </span>
        ),
        value: pendingTop,
        icon: Hourglass,
        color: 'text-amber-500 bg-amber-500/10'
      },
      { title: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-500 bg-red-500/10' },
      {
        title: (
          <span>
            Pending for Manual Review <span className="block text-[8px] normal-case font-bold mt-0.5 opacity-90">(Tier 3 & Tier 4)</span>
          </span>
        ),
        value: pendingLow,
        icon: Hourglass,
        color: 'text-amber-500 bg-amber-500/10'
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
              <div className="text-3xl font-extrabold font-mono tracking-tight">{stat.value}</div>
              {stat.subtitle && (
                <div className="text-[10px] text-muted-foreground mt-1 font-medium font-sans">
                  {stat.subtitle}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
