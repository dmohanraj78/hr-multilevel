import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import StatsBanner from '@/components/StatsBanner';
import CandidateListTable from '@/components/CandidateListTable';
import CandidateProfileDossier from '@/components/CandidateProfileDossier';
import OverallFunnelDashboard from '@/components/OverallFunnelDashboard';
import { fetchCandidates, upsertRound1, fetchGlobalFunnelData } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ShieldAlert, KanbanSquare, BarChart, Building } from 'lucide-react';

function normalizeUniversity(rawName) {
  if (!rawName) return 'Other/Unspecified';
  
  let clean = rawName.trim();
  
  // Remove suffix ", India", " , India", ",India", " and India", " & India", etc.
  clean = clean.replace(/[,]?\s*india/gi, '');
  clean = clean.replace(/\s+and\s*$/i, '');
  clean = clean.replace(/\s+&\s*$/i, '');
  clean = clean.replace(/[,]$/, '');
  clean = clean.trim();
  
  if (!clean) return 'Other/Unspecified';
  
  const lower = clean.toLowerCase();
  
  // 1. Vardhaman College of Engineering
  if (lower.includes('vardhaman')) {
    return 'Vardhaman College of Engineering';
  }
  
  // 2. IIIT Nagpur
  if (lower.includes('iiit nagpur') || (lower.includes('information technology') && lower.includes('nagpur'))) {
    return 'IIIT Nagpur';
  }
  
  // 3. IIIT Kottayam
  if (lower.includes('iiit kottayam') || (lower.includes('information technology') && lower.includes('kottayam'))) {
    return 'IIIT Kottayam';
  }
  
  // 4. IIIT Kurnool
  if (lower.includes('iiit kurnool') || (lower.includes('information technology') && lower.includes('kurnool'))) {
    return 'IIIT Kurnool';
  }
  
  // 5. IIIT Manipur
  if (lower.includes('iiit manipur') || (lower.includes('information technology') && lower.includes('manipur'))) {
    return 'IIIT Manipur';
  }

  // 6. IIIT Jabalpur
  if (lower.includes('iiit jabalpur') || lower.includes('pdpm') || (lower.includes('information technology') && lower.includes('jabalpur'))) {
    return 'IIIT Jabalpur';
  }
  
  // 7. Vellore Institute of Technology (VIT)
  if (lower.includes('vellore institute') || lower.includes('vit-ap') || lower.includes('vit ap') || lower.includes('vit bhopal') || lower.includes('vit chennai') || lower.match(/\bvit\b/)) {
    return 'Vellore Institute of Technology (VIT)';
  }
  
  // 8. KL University
  if (lower.includes('koneru lakshmaiah') || lower.includes('kl university') || lower.includes('k l university') || lower.match(/\bklu\b/)) {
    return 'KL University';
  }
  
  // 9. MIT World Peace University
  if (lower.includes('world peace university') || lower.includes('mit-wpu') || lower.includes('mit wpu')) {
    return 'MIT World Peace University';
  }
  
  // 10. SRM University
  if (lower.includes('srm university') || lower.includes('srm institute')) {
    return 'SRM University';
  }

  // 11. Annamacharya University
  if (lower.includes('annamacharya')) {
    return 'Annamacharya University';
  }

  // 12. Osmania University
  if (lower.includes('osmania')) {
    return 'Osmania University';
  }

  // 13. JNTU
  if (lower.includes('jawaharlal nehru technological') || lower.includes('jntu')) {
    if (lower.includes('jntuh') || lower.includes('hyderabad')) return 'JNTU Hyderabad';
    if (lower.includes('jntuk') || lower.includes('kakinada')) return 'JNTU Kakinada';
    if (lower.includes('jntua') || lower.includes('anantapur')) return 'JNTU Anantapur';
    return 'JNTU';
  }

  // 14. BITS Pilani
  if (lower.includes('birla institute of technology and science') || lower.includes('bits pilani') || lower.match(/\bbits\b/)) {
    return 'BITS Pilani';
  }

  // 15. Amrita
  if (lower.includes('amrita vishwa') || lower.includes('amrita university')) {
    return 'Amrita Vishwa Vidyapeetham';
  }

  // 16. SPPU / Pune University
  if (lower.includes('savitribai phule') || lower.includes('pune university') || lower.includes('sppu')) {
    return 'Savitribai Phule Pune University (SPPU)';
  }

  // 17. Mumbai University
  if (lower.includes('mumbai university') || lower.includes('university of mumbai')) {
    return 'Mumbai University';
  }

  // 18. IIT Patna
  if (lower.includes('iit patna') || (lower.includes('indian institute of technology') && lower.includes('patna'))) {
    return 'IIT Patna';
  }

  // 19. Newton School of Technology
  if (lower.includes('newton school')) {
    return 'Newton School of Technology';
  }
  
  // 20. ICFAI University
  if (lower.includes('icfai')) {
    return 'ICFAI University';
  }

  // 21. Dr. A.P.J. Abdul Kalam Technical University (AKTU)
  if (lower.includes('aktu') || lower.includes('abdul kalam technical') || lower.includes('technical university, uttar pradesh')) {
    return 'Dr. A.P.J. Abdul Kalam Technical University (AKTU)';
  }

  // 22. Rajiv Gandhi University of Knowledge Technologies (RGUKT)
  if (lower.includes('rgukt') || lower.includes('rajiv gandhi university of knowledge')) {
    return 'Rajiv Gandhi University of Knowledge Technologies (RGUKT)';
  }

  // 23. Mody University
  if (lower.includes('mody university')) {
    return 'Mody University of Science and Technology';
  }

  // 24. Woxsen University
  if (lower.includes('woxsen')) {
    return 'Woxsen University';
  }

  // 25. Vivekananda Global University
  if (lower.includes('vivekananda global')) {
    return 'Vivekananda Global University';
  }

  // 26. Manipal University
  if (lower.includes('manipal university') || lower.includes('mit manipal') || lower.includes('mahe')) {
    return 'Manipal University';
  }

  // 27. M Ramaiah
  if (lower.includes('ramaiah')) {
    return 'M.S. Ramaiah Institute of Technology';
  }

  return clean.replace(/\b\w/g, c => c.toUpperCase());
}

export default function App() {
  const [candidates, setCandidates] = useState([]);
  const [globalData, setGlobalData] = useState([]);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedUnivName, setSelectedUnivName] = useState(null);
  const [univSearch, setUnivSearch] = useState('');
  const [showAllUnis, setShowAllUnis] = useState(false); // 'pipeline' | 'overall'
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
      if (t.includes('T1+') || t.includes('TIER 1+')) return 6;
      if (t.includes('T1') || t.includes('TIER 1')) return 5;
      if (t.includes('T2+') || t.includes('TIER 2+')) return 4;
      if (t.includes('T2') || t.includes('TIER 2')) return 3;
      if (t.includes('T3') || t.includes('TIER 3')) return 2;
      if (t.includes('T4') || t.includes('TIER 4')) return 1;
      return 0;
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
      
      const isHired = r3.verdict === 'Yes' || r3.verdict === 'Hired';
      const isDeclined = r1.app_status === 'Reject' || ['No', 'Declined'].includes(r2.moved_to_round_3) || ['No', 'Rejected'].includes(r3.verdict);
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

  // Helper to get distinctive words for adaptive merging
  const getDistinctiveWords = (str) => {
    const noise = new Set([
      'india', 'university', 'univ', 'college', 'institute', 'technology', 'tech', 
      'engineering', 'school', 'of', 'and', 'ap', 'chennai', 'hyderabad', 'pune', 
      'jaipur', 'bhopal', 'nagpur', 'kottayam', 'kurnool', 'manipur', 'jabalpur',
      'science', 'sciences', 'education', 'foundation', 'management', 'development',
      'designed', 'manufacturing', 'research', 'other', 'unspecified'
    ]);
    
    return str.toLowerCase()
      .replace(/[,.-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !noise.has(w));
  };

  const shouldMerge = (name1, name2) => {
    const words1 = getDistinctiveWords(name1);
    const words2 = getDistinctiveWords(name2);
    if (words1.length === 0 || words2.length === 0) return false;
    return words1.some(w => words2.includes(w));
  };

  // Construct presentation data with tier counts
  const uniDataList = useMemo(() => {
    const rawGroups = {};
    candidates.forEach(cand => {
      const rawUniv = cand.raw_submissions?.ug_university || cand.ug_university || 'Other/Unspecified';
      const name = normalizeUniversity(rawUniv);
      
      if (!rawGroups[name]) {
        rawGroups[name] = {
          name,
          candidates: []
        };
      }
      rawGroups[name].candidates.push(cand);
    });

    const mergedGroups = [];
    Object.values(rawGroups).forEach(group => {
      let merged = false;
      for (let target of mergedGroups) {
        if (shouldMerge(group.name, target.name)) {
          target.candidates.push(...group.candidates);
          merged = true;
          break;
        }
      }
      if (!merged) {
        mergedGroups.push(group);
      }
    });

    return mergedGroups.map(group => {
      const tiers = { 'Tier 1+': 0, 'Tier 1': 0, 'Tier 2+': 0, 'Tier 2': 0, 'Tier 3': 0, 'T4': 0, 'N/A': 0 };
      
      group.candidates.forEach(cand => {
        let tier = cand.tier || 'N/A';
        if (tier === 'T1+' || tier === 'Tier 1+') tier = 'Tier 1+';
        else if (tier === 'T1' || tier === 'Tier 1') tier = 'Tier 1';
        else if (tier === 'T2+' || tier === 'Tier 2+') tier = 'Tier 2+';
        else if (tier === 'T2' || tier === 'Tier 2') tier = 'Tier 2';
        else if (tier === 'T3' || tier === 'Tier 3') tier = 'Tier 3';
        else if (tier === 'T4' || tier === 'Tier 4') tier = 'T4';
        else tier = 'N/A';
        
        tiers[tier] = (tiers[tier] || 0) + 1;
      });

      return {
        name: group.name,
        total: group.candidates.length,
        tiers,
        candidates: group.candidates
      };
    });
  }, [candidates]);

  const sortedUnis = useMemo(() => {
    let list = uniDataList;
    if (univSearch) {
      list = list.filter(u => u.name.toLowerCase().includes(univSearch.toLowerCase()));
    }
    return [...list].sort((a, b) => b.total - a.total);
  }, [uniDataList, univSearch]);

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
                    </TabsList>
                  </div>

                  {['hired', 'review', 'declined', 'unscreened'].includes(activeWorksheetTab) && (
                    <div className="bg-[#800020]/5 border border-[#800020]/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-semibold text-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#800020] animate-pulse" />
                        Showing only status: <strong className="text-[#800020]">
                          {activeWorksheetTab === 'hired' ? 'Hired' : activeWorksheetTab === 'review' ? 'In Review' : activeWorksheetTab === 'declined' ? 'Rejected' : 'Unscreened'}
                        </strong> Candidates
                      </div>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => setActiveWorksheetTab('all')}
                        className="h-7 px-2.5 text-xs border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white rounded-lg shadow-sm font-bold"
                      >
                        Reset Filter
                      </Button>
                    </div>
                  )}

                  <TabsContent value="all" className="mt-0">
                    <CandidateListTable
                      candidates={candidates}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="strong" className="mt-0">
                    <CandidateListTable
                      candidates={categories.strong}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="good" className="mt-0">
                    <CandidateListTable
                      candidates={categories.good}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="clarity" className="mt-0">
                    <CandidateListTable
                      candidates={categories.clarity}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="invalid" className="mt-0">
                    <CandidateListTable
                      candidates={categories.invalid}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="hired" className="mt-0">
                    <CandidateListTable
                      candidates={categories.hired}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="review" className="mt-0">
                    <CandidateListTable
                      candidates={categories.review}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="declined" className="mt-0">
                    <CandidateListTable
                      candidates={categories.declined}
                      actionLabel="Review"
                      onActionClick={(cand) => setSelectedCandidate(cand)}
                      showTechEvaluatorFilter={true}
                      round={1}
                      onUpdateTechEvaluator={handleUpdateTechEvaluator}
                    />
                  </TabsContent>

                  <TabsContent value="unscreened" className="mt-0">
                    <CandidateListTable
                      candidates={categories.unscreened}
                      actionLabel="Review"
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
              selectedUnivName ? (() => {
                const targetUni = uniDataList.find(u => u.name === selectedUnivName);
                if (!targetUni) return null;
                return (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                    <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUnivName(null)}
                          className="rounded-lg h-9 px-3 border-[#800020] text-[#800020] hover:bg-[#800020]/10 hover:text-[#800020] font-bold"
                        >
                          &larr; Back to Dashboard
                        </Button>
                        <div>
                          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                            <Building className="h-5 w-5 text-[#800020]" /> {targetUni.name}
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Candidate roster for {targetUni.name}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono font-bold text-xs bg-[#800020]/10 text-[#800020] px-3 py-1.5 rounded-full">
                        {targetUni.total} {targetUni.total === 1 ? 'candidate' : 'candidates'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                      {Object.entries(targetUni.tiers).map(([tierName, count]) => {
                        const colors = {
                          'Tier 1+': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
                          'Tier 1': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
                          'Tier 2+': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
                          'Tier 2': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
                          'Tier 3': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/25',
                          'T4': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25',
                          'N/A': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25'
                        };
                        return (
                          <div key={tierName} className={`flex flex-col items-center p-3 rounded-xl border text-center font-semibold ${colors[tierName] || 'bg-muted text-muted-foreground'}`}>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider mb-1">{tierName}</span>
                            <span className="font-mono text-xl font-black">{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    <Card className="rounded-[1.25rem] overflow-hidden border shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted/40 border-b">
                              <th className="p-3.5 font-bold font-mono text-[10px] uppercase text-muted-foreground w-[80px]">ID</th>
                              <th className="p-3.5 font-bold text-muted-foreground">Candidate Name</th>
                              <th className="p-3.5 font-bold text-muted-foreground">Applied Role</th>
                              <th className="p-3.5 font-bold text-muted-foreground w-[100px]">Tier</th>
                              <th className="p-3.5 font-bold text-muted-foreground w-[120px] text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {targetUni.candidates.map((cand) => (
                              <tr key={cand.id} className="border-b hover:bg-muted/20 last:border-0">
                                <td className="p-3.5 font-mono text-muted-foreground font-semibold">{cand.id}</td>
                                <td className="p-3.5">
                                  <div className="font-bold text-foreground text-sm">{cand.raw_submissions?.full_name || cand.full_name}</div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">{cand.raw_submissions?.email || cand.email}</div>
                                </td>
                                <td className="p-3.5">
                                  <span className="px-2 py-0.5 rounded-full bg-muted border font-semibold text-muted-foreground">
                                    {cand.raw_submissions?.applied_role || cand.applied_role}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 bg-background font-bold">{cand.tier || 'N/A'}</Badge>
                                </td>
                                <td className="p-3.5 text-right">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedCandidate(cand)}
                                    className="h-8 px-3 text-xs font-bold border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white rounded-lg shadow-sm"
                                  >
                                    Screen Candidate
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                );
              })() : (
                <div className="animate-in fade-in duration-300 flex flex-col gap-8">
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

                  {/* University Overview Cards Section */}
                  <div className="flex flex-col gap-1 mt-2">
                    <h3 className="text-base font-bold text-foreground font-heading">University Distribution Cards</h3>
                    <p className="text-xs text-muted-foreground">Real-time candidate volumes and tier configurations across colleges.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {uniDataList.length === 0 ? (
                      <div className="col-span-full text-center py-12 border border-dashed rounded-2xl text-muted-foreground font-mono text-sm">
                        No universities found.
                      </div>
                    ) : (
                      (showAllUnis ? uniDataList : uniDataList.slice(0, 4)).map((uni) => {
                        return (
                          <Card key={uni.name} className="border rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader className="pb-3 bg-muted/20 border-b">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-2.5 items-center">
                                  <div className="p-2 bg-[#800020]/10 rounded-lg text-[#800020]">
                                    <Building className="h-4 w-4 stroke-[1.5]" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base font-bold leading-none">{uni.name}</CardTitle>
                                    <span className="text-[10px] text-muted-foreground mt-1.5 block">Normalized from variations</span>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="font-mono font-bold text-xs bg-[#800020]/10 text-[#800020] px-2 py-0.5 rounded-full">
                                  {uni.total} {uni.total === 1 ? 'candidate' : 'candidates'}
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-4 flex flex-col gap-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground font-mono uppercase tracking-wider">Tier Distribution</span>
                                <div className="grid grid-cols-3 gap-2">
                                  {Object.entries(uni.tiers).map(([tierName, count]) => {
                                    const colors = {
                                      'Tier 1+': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25',
                                      'Tier 1': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25',
                                      'Tier 2+': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
                                      'Tier 2': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
                                      'Tier 3': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/25',
                                      'T4': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25',
                                      'N/A': 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/25'
                                    };
                                    return (
                                      <div key={tierName} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${colors[tierName] || 'bg-muted text-muted-foreground'}`}>
                                        <span className="font-sans">{tierName}</span>
                                        <span className="font-mono font-bold">{count}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUnivName(uni.name)}
                                className="w-full flex items-center justify-center gap-1.5 text-xs text-[#800020] border-[#800020]/30 hover:border-[#800020] hover:bg-[#800020]/10 font-bold py-2 rounded-xl mt-1"
                              >
                                View Candidates ({uni.total}) &rarr;
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>

                  {uniDataList.length > 4 && (
                    <div className="flex justify-center mt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllUnis(!showAllUnis)}
                        className="rounded-xl border-[#800020] text-[#800020] hover:bg-[#800020]/10 font-bold px-6 py-2"
                      >
                        {showAllUnis ? "View Less Universities" : `View More Universities (${uniDataList.length - 4} more)`}
                      </Button>
                    </div>
                  )}
                </div>
              )
            )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
