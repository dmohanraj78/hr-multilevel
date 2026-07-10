import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatsBanner from '@/components/StatsBanner';
import CandidateListTable from '@/components/CandidateListTable';
import CandidateProfileDossier from '@/components/CandidateProfileDossier';
import OverallFunnelDashboard from '@/components/OverallFunnelDashboard';
import { fetchCandidates, upsertRound1, fetchGlobalFunnelData } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, ShieldAlert, KanbanSquare, BarChart } from 'lucide-react';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'overall'
  const [activeWorksheetTab, setActiveWorksheetTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCandidates();
      setCandidates(data || []);

      const global = await fetchGlobalFunnelData();
      setGlobalData(global || []);
    } catch (err) {
      console.error('Supabase fetch failed:', err);
      setError(err.message || 'Failed to connect to Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (candidates.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const candId = params.get('candidateId');
      if (candId) {
        const found = candidates.find(c => String(c.id) === String(candId));
        if (found) {
          setSelectedCandidate(found);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [candidates]);

  const handleSaveReview = async (payload) => {
    try {
      await upsertRound1(selectedCandidate.id, payload.round_1_evaluation);
      setSelectedCandidate(null);
      await loadData();
    } catch (e) {
      alert('Failed to save review details: ' + e.message);
    }
  };

  const handleUpdateTechEvaluator = async (candidateId, newTechEvaluator) => {
    try {
      await upsertRound1(candidateId, { eval_group: newTechEvaluator });
      await loadData();
    } catch (e) {
      alert('Failed to update evaluation technical evaluator: ' + e.message);
    }
  };

  // Safe helper to extract round 1 fields (either flat or relationally joined)
  const getEvalField = (c, field) => {
    if (!c) return '';
    const r1 = c.round_1_evaluation;
    const r1Parsed = Array.isArray(r1) ? r1[0] : r1;
    return c[field] !== undefined ? c[field] : (r1Parsed?.[field] || '');
  };

  // Grouping logic (Strong, Good, Need Clarity, Invalid)
  const categorizeCandidates = () => {
    const categories = {
      strong: [],
      good: [],
      clarity: [],
      invalid: [],
      hired: [],
      review: [],
      declined: [],
      unscreened: []
    };

    const getTierWeight = (tier) => {
      if (!tier) return 0;
      const t = String(tier).toUpperCase();
      if (t.includes('T1+')) return 6;
      if (t.includes('T1')) return 5;
      if (t.includes('T2+')) return 4;
      if (t.includes('T2')) return 3;
      if (t.includes('T3')) return 2;
      return 1;
    };

    const sorted = [...candidates].sort((a, b) => {
      const weightA = getTierWeight(getEvalField(a, 'tier'));
      const weightB = getTierWeight(getEvalField(b, 'tier'));
      
      if (weightA !== weightB) return weightB - weightA;
      
      const scoreA = parseFloat(getEvalField(a, 'total') || 0);
      const scoreB = parseFloat(getEvalField(b, 'total') || 0);
      return scoreB - scoreA;
    });

    sorted.forEach(cand => {
      const total = parseFloat(getEvalField(cand, 'total') || 0);
      if (total >= 16) {
        categories.strong.push(cand);
      } else if (total >= 12) {
        categories.good.push(cand);
      } else if (total >= 8) {
        categories.clarity.push(cand);
      } else {
        categories.invalid.push(cand);
      }

      const r1 = cand;
      const r2 = cand.round_2_evaluation?.[0] || cand.round_2_evaluation || {};
      const r3 = cand.round_3_evaluation?.[0] || cand.round_3_evaluation || {};
      
      const isHired = r3.verdict === 'Yes';
      const isDeclined = r1.app_status === 'Reject' || r2.moved_to_round_3 === 'No' || r3.verdict === 'No';
      const isReview = r1.app_status === 'Yes' && !isHired && !isDeclined;
      const isUnscreened = !r1.app_status || r1.app_status === 'Pending';

      if (isHired) categories.hired.push(cand);
      if (isReview) categories.review.push(cand);
      if (isDeclined) categories.declined.push(cand);
      if (isUnscreened) categories.unscreened.push(cand);
    });

    return categories;
  };

  const categories = categorizeCandidates();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header bar */}
      <Header title="HR Round" isDemo={!!error} />

      <main className="flex-1 p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
        
        {/* Connection warning banner if offline */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-sm font-mono text-sm leading-relaxed">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <strong className="font-bold block text-foreground mb-1">Live Database Connection Required</strong>
              Database connection failed: {error}. Since local storage is isolated by port, please click the Settings gear icon in the top right to configure your Supabase URL & Anon Key for port 5173.
            </div>
          </div>
        )}

        {loading && candidates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-2">
            <div className="text-muted-foreground font-mono animate-pulse">Querying live applicant records...</div>
          </div>
        ) : (
          <>
            {selectedCandidate && (
              <CandidateProfileDossier
                candidate={selectedCandidate}
                round={1}
                onSave={handleSaveReview}
                onCancel={() => setSelectedCandidate(null)}
              />
            )}
            <div className={selectedCandidate ? 'hidden' : 'flex flex-col gap-6'}>
            
            {/* Tab switch bar */}
            <div className="flex items-center gap-2 border-b pb-2">
              <Button
                variant={activeTab === 'pipeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('pipeline')}
                className={`rounded-lg px-4 font-bold text-xs ${
                  activeTab === 'pipeline' ? 'bg-[#800020] text-white hover:bg-[#800020]/90' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <KanbanSquare className="mr-2 h-4 w-4 stroke-[1.5]" /> Review Worksheet
              </Button>
              <Button
                variant={activeTab === 'overall' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('overall')}
                className={`rounded-lg px-4 font-bold text-xs ${
                  activeTab === 'overall' ? 'bg-[#800020] text-white hover:bg-[#800020]/90' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BarChart className="mr-2 h-4 w-4 stroke-[1.5]" /> Overall Funnel Dashboard
              </Button>
            </div>

            {activeTab === 'pipeline' ? (
              // Review Pipeline View
              <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                {/* Header Title Grid */}
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-extrabold font-heading tracking-tight flex items-center gap-2">
                    <Users className="h-7 w-7 text-[#800020] stroke-[1.5]" /> Applicant Review Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Monitor resume review rates and inspect candidate scores by active role.
                  </p>
                </div>

                {/* Banner stats */}
                <StatsBanner candidates={candidates} rawCount={globalData.length} />

                {/* Categorized Lists */}
                <Tabs value={activeWorksheetTab} onValueChange={setActiveWorksheetTab} className="w-full">
                  <div className="flex items-center justify-between border-b pb-2 mb-6 overflow-x-auto">
                    <TabsList className="bg-muted/50 border rounded-lg p-1 whitespace-nowrap flex-nowrap flex">
                      <TabsTrigger value="all" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-[#800020] data-[state=active]:text-white">All ({candidates.length})</TabsTrigger>
                      <TabsTrigger value="strong" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-[#800020] data-[state=active]:text-white">Strong ({categories.strong.length})</TabsTrigger>
                      <TabsTrigger value="good" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-[#800020] data-[state=active]:text-white">Good ({categories.good.length})</TabsTrigger>
                      <TabsTrigger value="clarity" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-[#800020] data-[state=active]:text-white">Need Clarity ({categories.clarity.length})</TabsTrigger>
                      <TabsTrigger value="invalid" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-[#800020] data-[state=active]:text-white">Invalid ({categories.invalid.length})</TabsTrigger>
                      <TabsTrigger value="hired" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-green-600 data-[state=active]:text-white">Hired ({categories.hired.length})</TabsTrigger>
                      <TabsTrigger value="review" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">In Review ({categories.review.length})</TabsTrigger>
                      <TabsTrigger value="declined" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-red-600 data-[state=active]:text-white">Declined ({categories.declined.length})</TabsTrigger>
                      <TabsTrigger value="unscreened" className="font-mono text-xs px-3 py-1.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white">Unscreened ({categories.unscreened.length})</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="all" className="mt-0">
                    <CandidateListTable
                      candidates={candidates}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="strong" className="mt-0">
                    <CandidateListTable
                      candidates={categories.strong}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="good" className="mt-0">
                    <CandidateListTable
                      candidates={categories.good}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="clarity" className="mt-0">
                    <CandidateListTable
                      candidates={categories.clarity}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="invalid" className="mt-0">
                    <CandidateListTable
                      candidates={categories.invalid}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="hired" className="mt-0">
                    <CandidateListTable
                      candidates={categories.hired}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="review" className="mt-0">
                    <CandidateListTable
                      candidates={categories.review}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="declined" className="mt-0">
                    <CandidateListTable
                      candidates={categories.declined}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="unscreened" className="mt-0">
                    <CandidateListTable
                      candidates={categories.unscreened}
                      actionLabel="Review & Screen"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              // Overall Funnel Dashboard View
              <div className="animate-in fade-in duration-300">
                <OverallFunnelDashboard
                  globalData={globalData}
                  onViewCandidate={(c) => setSelectedCandidate(c)}
                  onTileClick={(stage) => {
                    setActiveTab('pipeline');
                    if (stage === 'Hired') setActiveWorksheetTab('hired');
                    else if (stage === 'Review') setActiveWorksheetTab('review');
                    else if (stage === 'Declined') setActiveWorksheetTab('declined');
                    else if (stage === 'Pending') setActiveWorksheetTab('unscreened');
                    else if (stage === 'ALL') setActiveWorksheetTab('all');
                  }}
                />
              </div>
            )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
