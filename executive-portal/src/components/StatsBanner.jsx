import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Hourglass, CheckCircle2, XCircle } from 'lucide-react';

export default function StatsBanner({ candidates }) {
  const total = candidates.length;
  
  // Safe helper to extract fields flatly or relationally
  const getEvalField = (c, field) => {
    if (!c) return '';
    const r1 = c.round_1_evaluation;
    const r1Parsed = Array.isArray(r1) ? r1[0] : r1;
    return c[field] !== undefined ? c[field] : (r1Parsed?.[field] || '');
  };

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

  const stats = [
    { title: 'Total Candidates', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Pending Screenings', value: pendingScreen, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Screening Passed (R2)', value: approvedR1, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
    { title: 'Rejected Submissions', value: rejected, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
  ];

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
            <CardContent>
              <div className="text-3xl font-extrabold font-mono tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
