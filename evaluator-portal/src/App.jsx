import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CandidateListTable from '@/components/CandidateListTable';
import CandidateProfileDossier from '@/components/CandidateProfileDossier';
import { fetchRound2Candidates, upsertRound2, upsertRound1 } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, ShieldAlert, ArrowLeft, GitPullRequest } from 'lucide-react';

const TECH_EVALUATORS = [
  { id: 'Akash', name: 'Akash', desc: 'Akash\'s Queue', color: 'border-teal-500/20 hover:border-teal-500/80 bg-teal-500/5' },
  { id: 'Akhil L', name: 'Akhil L', desc: 'Akhil L\'s Queue', color: 'border-indigo-500/20 hover:border-indigo-500/80 bg-indigo-500/5' },
  { id: 'Akhil M', name: 'Akhil M', desc: 'Akhil M\'s Queue', color: 'border-fuchsia-500/20 hover:border-fuchsia-500/80 bg-fuchsia-500/5' },
  { id: 'Anmol', name: 'Anmol', desc: 'Anmol\'s Queue', color: 'border-cyan-500/20 hover:border-cyan-500/80 bg-cyan-500/5' },
  { id: 'Ankita', name: 'Ankita', desc: 'Ankita\'s Queue', color: 'border-amber-500/20 hover:border-amber-500/80 bg-amber-500/5' },
  { id: 'Basvaraj', name: 'Basvaraj', desc: 'Basvaraj\'s Queue', color: 'border-green-500/20 hover:border-green-500/80 bg-green-500/5' },
  { id: 'Kaushik', name: 'Kaushik', desc: 'Kaushik\'s Queue', color: 'border-orange-500/20 hover:border-orange-500/80 bg-orange-500/5' },
  { id: 'Pushkaraj', name: 'Pushkaraj', desc: 'Pushkaraj\'s Queue', color: 'border-emerald-500/20 hover:border-emerald-500/80 bg-emerald-500/5' },
  { id: 'Sachin', name: 'Sachin', desc: 'Sachin\'s Queue', color: 'border-sky-500/20 hover:border-sky-500/80 bg-sky-500/5' },
  { id: 'Samit', name: 'Samit', desc: 'Samit\'s Queue', color: 'border-pink-500/20 hover:border-pink-500/80 bg-pink-500/5' },
  { id: 'Snehanshu', name: 'Snehanshu', desc: 'Snehanshu\'s Queue', color: 'border-rose-500/20 hover:border-rose-500/80 bg-rose-500/5' },
  { id: 'Sohan', name: 'Sohan', desc: 'Sohan\'s Queue', color: 'border-blue-500/20 hover:border-blue-500/80 bg-blue-500/5' },
  { id: 'Tejaswini', name: 'Tejaswini', desc: 'Tejaswini\'s Queue', color: 'border-purple-500/20 hover:border-purple-500/80 bg-purple-500/5' },
  { id: 'Vedant', name: 'Vedant', desc: 'Vedant\'s Queue', color: 'border-violet-500/20 hover:border-violet-500/80 bg-violet-500/5' }
];

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTechEvaluator, setSelectedTechEvaluator] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [worksheetTab, setWorksheetTab] = useState('active'); // 'active' | 'completed'

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRound2Candidates();
      setCandidates(data || []);
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
          const r1 = getRound1(found);
          const techEvaluatorId = r1?.eval_group;
          if (techEvaluatorId) {
            const foundTechEvaluator = TECH_EVALUATORS.find(cl => cl.id.toLowerCase() === techEvaluatorId.toLowerCase());
            if (foundTechEvaluator) {
              setSelectedTechEvaluator(foundTechEvaluator);
            }
          }
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [candidates]);

  const handleSaveReview = async (payload) => {
    try {
      await upsertRound2(selectedCandidate.id, payload.round_2_evaluation);
      if (payload.round_1_evaluation?.eval_group) {
        await upsertRound1(selectedCandidate.id, { eval_group: payload.round_1_evaluation.eval_group });
      }
      setSelectedCandidate(null);
      await loadData();
    } catch (e) {
      alert('Failed to save technical review: ' + e.message);
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

  // Helper to safely parse round 1 evaluation
  const getRound1 = (c) => {
    if (!c) return {};
    const r1 = c.round_1_evaluation;
    const r1Parsed = Array.isArray(r1) ? r1[0] : (r1 || {});
    return {
      ...r1Parsed,
      app_status: c.app_status !== undefined ? c.app_status : r1Parsed?.app_status,
      eval_group: c.eval_group !== undefined ? c.eval_group : r1Parsed?.eval_group,
      review_comments: c.review_comments !== undefined ? c.review_comments : r1Parsed?.review_comments,
    };
  };

  // Filter candidates assigned to active technical evaluator who passed Round 1 review
  const getTechEvaluatorCandidates = (techEvaluatorId) => {
    return candidates.filter(c => {
      const r1 = getRound1(c);
      const groupMatch = r1.eval_group && r1.eval_group.toLowerCase() === techEvaluatorId.toLowerCase();
      return groupMatch && r1.app_status === 'Yes';
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header title="Technical Review Hub" isDemo={!!error} />

      <main className="flex-1 p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
        
        {/* Connection warning banner if offline */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-sm font-mono text-sm leading-relaxed">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <strong className="font-bold block text-foreground mb-1">Live Database Connection Required</strong>
              Database connection failed: {error}. Since local storage is isolated by port, please click the Settings gear icon in the top right to configure your Supabase URL & Anon Key for port 5174.
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-muted-foreground font-mono animate-pulse">Querying live applicant records...</div>
          </div>
        ) : (
          <>
            {selectedCandidate && (
              <CandidateProfileDossier
                candidate={selectedCandidate}
                round={2}
                onSave={handleSaveReview}
                onCancel={() => setSelectedCandidate(null)}
              />
            )}
            
            <div className={selectedCandidate ? 'hidden' : 'flex flex-col gap-6'}>
              {selectedTechEvaluator ? (
                // Technical Evaluator Worksheet view
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedTechEvaluator(null)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Technical Review Hub
                    </Button>
                    <h2 className="text-2xl font-bold font-heading">{selectedTechEvaluator.name}'s Sheet</h2>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Reviewing candidate code-submissions currently assigned to the <strong className="text-foreground">{selectedTechEvaluator.name}</strong> queue.
                  </p>

                  <CandidateListTable
                    candidates={getTechEvaluatorCandidates(selectedTechEvaluator.id)}
                    actionLabel="Review"
                    onActionClick={(cand) => setSelectedCandidate(cand)}
                    round={2}
                    onUpdateTechEvaluator={handleUpdateTechEvaluator}
                  />
                </div>
              ) : (
                // Technical Evaluator selector landing hub
                <div className="flex flex-col gap-6">
                  <div className="text-center py-6">
                    <h1 className="text-3xl font-extrabold font-heading tracking-tight flex items-center justify-center gap-2">
                      <GitPullRequest className="h-8 w-8 text-[#800020]" /> Technical Review Hub
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                      Select your assigned technical review hub queue below to begin inspection of review-passed technical demo submissions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TECH_EVALUATORS.map((techEvaluator) => {
                      const allAssigned = getTechEvaluatorCandidates(techEvaluator.id);
                      const totalCount = allAssigned.length;
                      const pendingCount = allAssigned.filter(c => {
                        const m = c.round_2_evaluation?.moved_to_round_3;
                        return !m || m.endsWith('_draft');
                      }).length;
                      const completedCount = totalCount - pendingCount;
                      return (
                        <Card 
                          key={techEvaluator.id} 
                          className={`cursor-pointer transition-all border-2 duration-300 hover:shadow-lg ${techEvaluator.color}`}
                          onClick={() => setSelectedTechEvaluator(techEvaluator)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl font-bold font-heading">{techEvaluator.name}</CardTitle>
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                                {totalCount}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-2 flex items-center justify-between gap-4">
                            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> {pendingCount} pending · {completedCount} completed
                            </span>
                            <Button variant="ghost" size="sm" className="font-mono text-xs hover:bg-transparent p-0 hover:underline text-[#800020] hover:text-[#800020]/80">
                              Enter &rarr;
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
