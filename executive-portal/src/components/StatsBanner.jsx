import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

export default function StatsBanner({ candidates }) {
  const getR3 = (c) => {
    if (!c) return {};
    const val = c.round_3_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };

  const total = candidates.length;
  
  const yesCount = candidates.filter(c => {
    const r3 = getR3(c);
    return r3.verdict === 'Yes';
  }).length;

  const maybeCount = candidates.filter(c => {
    const r3 = getR3(c);
    return r3.verdict === 'Maybe';
  }).length;

  const noCount = candidates.filter(c => {
    const r3 = getR3(c);
    return r3.verdict === 'No';
  }).length;

  const stats = [
    { title: 'Total Candidates', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Approved (Yes)', value: yesCount, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
    { title: 'Maybe', value: maybeCount, icon: HelpCircle, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Declined (No)', value: noCount, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
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
