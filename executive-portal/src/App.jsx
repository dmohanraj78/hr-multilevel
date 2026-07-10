import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CandidateListTable from '@/components/CandidateListTable';
import CandidateProfileDossier from '@/components/CandidateProfileDossier';
import { fetchRound3Candidates, upsertRound3, upsertRound1 } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Trophy, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRound3Candidates();
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
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [candidates]);

  const handleSaveVerdict = async (payload) => {
    try {
      await upsertRound3(selectedCandidate.id, payload.round_3_evaluation);
      setSelectedCandidate(null);
      await loadData();
    } catch (e) {
      alert('Failed to save final verdict: ' + e.message);
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

  // Helper to safely parse round 2 evaluation
  const getRound2 = (c) => {
    if (!c) return {};
    const r2 = c.round_2_evaluation;
    const r2Parsed = Array.isArray(r2) ? r2[0] : (r2 || {});
    return {
      ...r2Parsed,
      moved_to_round_3: c.moved_to_round_3 !== undefined ? c.moved_to_round_3 : r2Parsed?.moved_to_round_3,
      when_can_they_start: c.when_can_they_start !== undefined ? c.when_can_they_start : r2Parsed?.when_can_they_start,
      duration_months: c.duration_months !== undefined ? c.duration_months : r2Parsed?.duration_months,
      complexity: c.complexity !== undefined ? c.complexity : r2Parsed?.complexity,
      solves_business_problem: c.solves_business_problem !== undefined ? c.solves_business_problem : r2Parsed?.solves_business_problem,
      tech_stack: c.tech_stack !== undefined ? c.tech_stack : r2Parsed?.tech_stack,
      demo_review_comment: c.demo_review_comment !== undefined ? c.demo_review_comment : r2Parsed?.demo_review_comment,
    };
  };

  // Filter candidates that passed Round 2 review (moved_to_round_3 is Yes or Maybe)
  const getExecutiveCandidates = () => {
    return candidates.filter(c => {
      const r2 = getRound2(c);
      const statusR2 = r2.moved_to_round_3 || '';
      return statusR2 === 'Yes' || statusR2 === 'Maybe';
    });
  };

  const executiveCandidates = getExecutiveCandidates();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header title="Executive Verdict Stage" isDemo={!!error} />

      <main className="flex-1 p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
        
        {/* Connection warning banner if offline */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-sm font-mono text-sm leading-relaxed">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <strong className="font-bold block text-foreground mb-1">Live Database Connection Required</strong>
              Database connection failed: {error}. Since local storage is isolated by port, please click the Settings gear icon in the top right to configure your Supabase URL & Anon Key for port 5175.
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
                round={3}
                onSave={handleSaveVerdict}
                onCancel={() => setSelectedCandidate(null)}
              />
            )}
            <div className={selectedCandidate ? 'hidden' : 'flex flex-col gap-6'}>
            
            {/* Title Section */}
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold font-heading tracking-tight flex items-center gap-2">
                <Award className="h-8 w-8 text-[#800020]" /> Executive Verdict Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Vetted candidates currently approved by the technical evaluators (Moved to R3: Yes/Maybe) awaiting your final verdict.
              </p>
            </div>

            <div className="mt-2">
              <CandidateListTable
                candidates={candidates}
                actionLabel="Review"
                onActionClick={(cand) => setSelectedCandidate(cand)}
                showTechEvaluatorFilter={true}
                round={3}
                onUpdateTechEvaluator={handleUpdateTechEvaluator}
              />
            </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
