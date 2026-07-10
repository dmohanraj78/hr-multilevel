import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CandidateListTable from '@/components/CandidateListTable';
import CandidateProfileDossier from '@/components/CandidateProfileDossier';
import { fetchRound2Candidates, upsertRound2, upsertRound1 } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, ShieldAlert, ArrowLeft, GitPullRequest, Code, FileText } from 'lucide-react';

const CLANS = [
  { id: 'Dharti', name: 'Dharti', desc: 'Earth Core Vetting', color: 'border-amber-500/20 hover:border-amber-500/80 bg-amber-500/5' },
  { id: 'Jal', name: 'Jal', desc: 'Water Flow Vetting', color: 'border-blue-500/20 hover:border-blue-500/80 bg-blue-500/5' },
  { id: 'Agni', name: 'Agni', desc: 'Fire Spark Vetting', color: 'border-red-500/20 hover:border-red-500/80 bg-red-500/5' },
  { id: 'Vayu', name: 'Vayu', desc: 'Air Breeze Vetting', color: 'border-teal-500/20 hover:border-teal-500/80 bg-teal-500/5' },
  { id: 'Akash', name: 'Akash', desc: 'Sky Space Vetting', color: 'border-indigo-500/20 hover:border-indigo-500/80 bg-indigo-500/5' },
  { id: 'Bijli', name: 'Bijli', desc: 'Lightning Spark Vetting', color: 'border-yellow-500/20 hover:border-yellow-500/80 bg-yellow-500/5' }
];

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClan, setSelectedClan] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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
          const clanId = r1?.eval_group;
          if (clanId) {
            const foundClan = CLANS.find(cl => cl.id.toLowerCase() === clanId.toLowerCase());
            if (foundClan) {
              setSelectedClan(foundClan);
            }
          }
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [candidates]);

  const handleSaveVetting = async (payload) => {
    try {
      await upsertRound2(selectedCandidate.id, payload.round_2_evaluation);
      setSelectedCandidate(null);
      await loadData();
    } catch (e) {
      alert('Failed to save technical vetting: ' + e.message);
    }
  };

  const handleUpdateClan = async (candidateId, newClan) => {
    try {
      await upsertRound1(candidateId, { eval_group: newClan });
      await loadData();
    } catch (e) {
      alert('Failed to update evaluation clan: ' + e.message);
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

  // Filter candidates assigned to active clan who passed Round 1 screening
  const getClanCandidates = (clanId) => {
    return candidates.filter(c => {
      const r1 = getRound1(c);
      const groupMatch = r1.eval_group && r1.eval_group.toLowerCase() === clanId.toLowerCase();
      return groupMatch && r1.app_status === 'Yes';
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header title="Evaluator Vetting Stage" isDemo={!!error} />

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
                onSave={handleSaveVetting}
                onCancel={() => setSelectedCandidate(null)}
              />
            )}
            
            <div className={selectedCandidate ? 'hidden' : 'flex flex-col gap-6'}>
              {selectedClan ? (
                // Clan Worksheet view
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedClan(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clans Hub
              </Button>
              <h2 className="text-2xl font-bold font-heading">{selectedClan.name} Clan Worksheet</h2>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Reviewing candidate code-submissions currently assigned to the <strong className="text-foreground">{selectedClan.name}</strong> queue (Status: Screening Passed).
            </p>

            <CandidateListTable
              candidates={getClanCandidates(selectedClan.id)}
              actionLabel="Vet Tech Demo"
              onActionClick={(cand) => setSelectedCandidate(cand)}
              round={2}
              onUpdateClan={handleUpdateClan}
            />
          </div>
        ) : (
          // Clan selector landing hub
          <div className="flex flex-col gap-6">
            <div className="text-center py-6">
              <h1 className="text-3xl font-extrabold font-heading tracking-tight flex items-center justify-center gap-2">
                <GitPullRequest className="h-8 w-8 text-[#800020]" /> Technical Clan Vetting Hub
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Select your assigned clan review queue below to begin inspection of screening-passed technical demo submissions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CLANS.map((clan) => {
                const count = getClanCandidates(clan.id).length;
                return (
                  <Card 
                    key={clan.id} 
                    className={`cursor-pointer transition-all border-2 duration-300 hover:shadow-lg ${clan.color}`}
                    onClick={() => setSelectedClan(clan)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold font-heading">{clan.name}</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-mono font-bold">
                          {count}
                        </div>
                      </div>
                      <CardDescription>{clan.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> candidates queued
                      </span>
                      <Button variant="ghost" size="sm" className="font-mono text-xs hover:bg-transparent p-0 hover:underline text-[#800020] hover:text-[#800020]/80">
                        Enter Worksheet &rarr;
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
