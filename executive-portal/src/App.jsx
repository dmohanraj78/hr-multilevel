import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CandidateListTable from '@/components/CandidateListTable';
import CandidateProfileDossier from '@/components/CandidateProfileDossier';
import StatsBanner from '@/components/StatsBanner';
import { fetchRound3Candidates, upsertRound3, upsertRound1, supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Trophy, ShieldAlert, Award, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [authChecking, setAuthChecking] = useState(true);
  const [authRoleError, setAuthRoleError] = useState('');

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
    const timeoutId = setTimeout(() => {
      // If we are still checking after 3 seconds, redirect to SSO portal as fallback
      window.location.href = 'https://aviators-sso.vercel.app';
    }, 4000);

    const checkSession = async () => {
      try {
        // Set the session from the tokens handed off by the SSO portal.
        // supabase-js requires BOTH access_token and refresh_token — an empty
        // refresh_token makes setSession throw, so the session never persists.
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (token && refreshToken) {
          await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
          // Clean parameters from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          clearTimeout(timeoutId);
          window.location.href = 'https://aviators-sso.vercel.app';
          return;
        }
        
        // Verify role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('email', session.user.email.toLowerCase().trim())
          .maybeSingle();

        if (error || !data || !['Admin', 'Executive'].includes(data.role)) {
          clearTimeout(timeoutId);
          setAuthRoleError(`Access Denied: ${session.user.email} is not authorized for Executive Portal.`);
          setAuthChecking(false);
          return;
        }

        clearTimeout(timeoutId);
        setAuthChecking(false);
        loadData();
      } catch (err) {
        console.error('Auth verification error:', err);
        clearTimeout(timeoutId);
        window.location.href = 'https://aviators-sso.vercel.app';
      }
    };
    checkSession();
    return () => clearTimeout(timeoutId);
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
      alert('Failed to save final final_status: ' + e.message);
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

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [trFilter, setTrFilter] = useState('ALL');
  const executiveCandidates = getExecutiveCandidates();

  const getFilteredCandidates = () => {
    return executiveCandidates.filter(c => {
      // 1. Filter by Executive Verdict (StatsBanner)
      if (activeFilter !== 'ALL') {
        const r3 = c.round_3_evaluation;
        const r3Parsed = Array.isArray(r3) ? r3[0] : (r3 || {});
        const v = r3Parsed.verdict;
        if (activeFilter === 'Hired' && !['Yes', 'Hired'].includes(v)) return false;
        if (activeFilter === 'Rejected' && !['No', 'Rejected'].includes(v)) return false;
        if (activeFilter === 'Maybe' && v !== 'Maybe') return false;
      }
      // 2. Filter by Technical Reviewer Decision (TR Verdict: Yes/Maybe)
      if (trFilter !== 'ALL') {
        const r2 = c.round_2_evaluation;
        const r2Parsed = Array.isArray(r2) ? r2[0] : (r2 || {});
        if (r2Parsed.moved_to_round_3 !== trFilter) return false;
      }
      return true;
    });
  };

  const filteredCandidates = getFilteredCandidates();

  // TR Statistics calculations
  const totalTR = executiveCandidates.length;
  const yesTR = executiveCandidates.filter(c => {
    const r2 = c.round_2_evaluation;
    const r2Parsed = Array.isArray(r2) ? r2[0] : (r2 || {});
    return r2Parsed.moved_to_round_3 === 'Yes';
  }).length;
  const maybeTR = executiveCandidates.filter(c => {
    const r2 = c.round_2_evaluation;
    const r2Parsed = Array.isArray(r2) ? r2[0] : (r2 || {});
    return r2Parsed.moved_to_round_3 === 'Maybe';
  }).length;

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 font-mono text-xs text-slate-400">
        <Loader2 className="h-6 w-6 text-[#800020] animate-spin" />
        Checking portal access permissions...
      </div>
    );
  }

  if (authRoleError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-red-950/30 border border-red-900/30 text-red-500 rounded-full animate-bounce">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-200">Role and Access Mismatch</h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{authRoleError}</p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = 'https://aviators-sso.vercel.app';
            }}
            className="w-full bg-[#800020] hover:bg-[#800020]/90 text-white font-bold py-3 rounded-2xl text-xs transition-all mt-4"
          >
            Return to SSO Login
          </button>
        </div>
      </div>
    );
  }

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
              Database connection failed: {error}. Since local storage is isolated by port, please click the Settings gear icon in the right top to configure your Supabase URL & Anon Key for port 5175.
            </div>
          </div>
        )}

        {loading && candidates.length === 0 ? (
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
                Reviewed candidates currently approved by the technical evaluators (Moved to R3: Yes/Maybe) awaiting your final verdict.
              </p>
            </div>

            <div className="mt-2">
              <StatsBanner 
                candidates={executiveCandidates} 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* TR Decision Filter Tabs */}
            <div className="flex items-center justify-between border-b pb-4 mt-2">
              <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border">
                <button
                  onClick={() => setTrFilter('ALL')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    trFilter === 'ALL'
                      ? 'bg-white dark:bg-zinc-800 text-[#800020] shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All TR Decisions ({totalTR})
                </button>
                <button
                  onClick={() => setTrFilter('Yes')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    trFilter === 'Yes'
                      ? 'bg-green-600 text-white shadow-sm font-extrabold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${trFilter === 'Yes' ? 'bg-white' : 'bg-green-500'}`} />
                  TR Recommended: Yes ({yesTR})
                </button>
                <button
                  onClick={() => setTrFilter('Maybe')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    trFilter === 'Maybe'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${trFilter === 'Maybe' ? 'bg-white' : 'bg-amber-500'}`} />
                  TR Recommended: Maybe ({maybeTR})
                </button>
              </div>
            </div>

            {activeFilter !== 'ALL' && (
              <div className="bg-[#800020]/5 border border-[#800020]/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-semibold text-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#800020] animate-pulse" />
                  Showing only: <strong className="text-[#800020]">{activeFilter === 'Hired' ? 'Hired' : activeFilter === 'Maybe' ? 'Maybe' : 'Rejected'}</strong> Candidates ({filteredCandidates.length})
                </div>
                <Button 
                  size="xs" 
                  variant="outline" 
                  onClick={() => setActiveFilter('ALL')}
                  className="h-7 px-2.5 text-xs border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white rounded-lg shadow-sm font-bold"
                >
                  Clear Filter
                </Button>
              </div>
            )}

            <div className="mt-2">
              <CandidateListTable
                candidates={filteredCandidates}
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
