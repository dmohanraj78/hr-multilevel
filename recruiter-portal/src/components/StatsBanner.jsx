import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Hourglass, CheckCircle2, XCircle } from 'lucide-react';

export default function StatsBanner({ candidates, round = 1, rawCount = 0 }) {
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
    const pendingReview = candidates.filter(c => {
      const r2 = getR2(c);
      return !r2.moved_to_round_3;
    }).length;

    const promoted = candidates.filter(c => {
      const r2 = getR2(c);
      return r2.moved_to_round_3 === 'Yes' || r2.moved_to_round_3 === 'Maybe';
    }).length;

    const declined = candidates.filter(c => {
      const r2 = getR2(c);
      return r2.moved_to_round_3 === 'No' || r2.moved_to_round_3 === 'Declined';
    }).length;

    stats = [
      { title: 'Total in Review', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
      { title: 'Promoted (R3)', value: promoted, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Pending Review', value: pendingReview, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
      { title: 'Review Declined', value: declined, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    ];
  } else if (round === 3) {
    const pendingVerdict = candidates.filter(c => {
      const r3 = getR3(c);
      return !r3.verdict;
    }).length;

    const hired = candidates.filter(c => {
      const r3 = getR3(c);
      return r3.verdict === 'Yes';
    }).length;

    const declined = candidates.filter(c => {
      const r3 = getR3(c);
      return r3.verdict === 'No';
    }).length;

    stats = [
      { title: 'Total Promoted', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
      { title: 'Pending Decisions', value: pendingVerdict, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
      { title: 'Hired (Approved)', value: hired, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Declined', value: declined, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    ];
  } else {
    const pendingScreen = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      return !status || status === 'Pending';
    }).length;
    
    const approvedR1 = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      return status === 'Yes';
    }).length;

    const rejected = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      return status === 'Reject';
    }).length;

    stats = [
      { title: 'Applications Evaluated', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10', subtitle: 'in round_1_evaluation table' },
      { title: 'HR Round Cleared', value: approvedR1, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Pending Reviews', value: pendingScreen, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
      { title: 'Rejected Submissions', value: rejected, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    ];
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 border rounded-[1.25rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <span className="text-[10px] font-bold text-muted-foreground font-mono tracking-wider uppercase">{stat.title}</span>
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <Icon className="h-4 w-4 stroke-[1.5]" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
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
