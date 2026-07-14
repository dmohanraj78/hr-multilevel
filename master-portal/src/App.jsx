import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import StatsBanner from '@/components/StatsBanner';
import CandidateListTable from '@/components/CandidateListTable';
import CandidateProfileDossier from '@/components/CandidateProfileDossier';
import OverallFunnelDashboard from '@/components/OverallFunnelDashboard';
import { 
  fetchCandidates, 
  upsertRound1, 
  fetchRound2Candidates, 
  upsertRound2, 
  fetchRound3Candidates, 
  upsertRound3, 
  fetchGlobalFunnelData 
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  KanbanSquare, 
  ShieldAlert, 
  Flame, 
  Award, 
  Settings2, 
  GitMerge, 
  Users,
  GraduationCap,
  Search,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'r1' | 'r2' | 'r3'
  
  // Data lists
  const [globalData, setGlobalData] = useState([]);
  const [r1Candidates, setR1Candidates] = useState([]);
  const [r2Candidates, setR2Candidates] = useState([]);
  const [r3Candidates, setR3Candidates] = useState([]);
  
  // Executive tab filtering states
  const [r3ActiveFilter, setR3ActiveFilter] = useState('ALL');
  const [r3TrFilter, setR3TrFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection states
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedRound, setSelectedRound] = useState(1);
  const [univSearch, setUnivSearch] = useState('');
  const [showAllUnis, setShowAllUnis] = useState(false);
  const [expandedUnivs, setExpandedUnivs] = useState({});
  const [selectedUnivName, setSelectedUnivName] = useState(null);

  const getCandidatePortalUrl = (cand) => {
    const r1 = cand;
    const r2 = cand.round_2_evaluation?.[0] || cand.round_2_evaluation || {};
    const r3 = cand.round_3_evaluation?.[0] || cand.round_3_evaluation || {};

    const isHired = r3.verdict === 'Yes' || r3.verdict === 'Hired';
    const isDeclined = r1.app_status === 'Reject' || ['No', 'Declined'].includes(r2.moved_to_round_3) || ['No', 'Rejected'].includes(r3.verdict);
    const isReview = r1.app_status === 'Yes' && !isHired && !isDeclined;
    
    let baseUrl = 'https://recruiter-portal-one.vercel.app';
    if (isReview) {
      baseUrl = 'https://evaluator-portal-mu.vercel.app';
    } else if (r2.moved_to_round_3 === 'Yes' || r2.moved_to_round_3 === 'Maybe') {
      baseUrl = 'https://executive-portal-nine.vercel.app';
    }

    return `${baseUrl}/?candidateId=${cand.id}`;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load all stages from Supabase
      const g = await fetchGlobalFunnelData();
      setGlobalData(g || []);

      const r1 = await fetchCandidates();
      setR1Candidates(r1 || []);

      const r2 = await fetchRound2Candidates();
      setR2Candidates(r2 || []);

      const r3 = await fetchRound3Candidates();
      setR3Candidates(r3 || []);
    } catch (err) {
      console.error('Supabase load failed:', err);
      setError(err.message || 'Failed to connect to Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDecision = async (payload) => {
    try {
      if (selectedRound === 1) {
        await upsertRound1(selectedCandidate.id, payload.round_1_evaluation);
      } else if (selectedRound === 2) {
        await upsertRound2(selectedCandidate.id, payload.round_2_evaluation);
        if (payload.round_1_evaluation?.eval_group) {
          await upsertRound1(selectedCandidate.id, { eval_group: payload.round_1_evaluation.eval_group });
        }
      } else if (selectedRound === 3) {
        await upsertRound3(selectedCandidate.id, payload.round_3_evaluation);
      }
      setSelectedCandidate(null);
      await loadData();
    } catch (e) {
      alert(`Failed to save Round ${selectedRound} details: ` + e.message);
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

  // Helper selectors for snapshots
  const getR1 = (c) => {
    const val = c.round_1_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };
  const getR2 = (c) => {
    const val = c.round_2_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };
  const getR3 = (c) => {
    const val = c.round_3_evaluation;
    return Array.isArray(val) ? val[0] || {} : val || {};
  };


  // Deduplicated applicant stats
  const deduplicatedCandidates = globalData.reduce((acc, current) => {
    const x = acc.find(item => item.email?.trim().toLowerCase() === current.email?.trim().toLowerCase());
    if (!x) return acc.concat([current]);
    return acc;
  }, []);
  const deduplicatedCount = deduplicatedCandidates.length;

  const overallTiers = { 'Tier 1+': 0, 'Tier 1': 0, 'Tier 2+': 0, 'Tier 2': 0, 'Tier 3': 0, 'Tier 4': 0, 'N/A': 0 };
  deduplicatedCandidates.forEach(cand => {
    let tier = getR1(cand).tier || 'N/A';
    if (tier === 'T1+') tier = 'Tier 1+';
    else if (tier === 'T1') tier = 'Tier 1';
    else if (tier === 'T2+') tier = 'Tier 2+';
    else if (tier === 'T2') tier = 'Tier 2';
    else if (tier === 'T3') tier = 'Tier 3';
    else if (tier === 'T4') tier = 'Tier 4';
    overallTiers[tier] = (overallTiers[tier] || 0) + 1;
  });

  const r1Stats = {
    total: deduplicatedCount,
    pending: globalData.filter(c => {
      const r = getR1(c);
      return !r.app_status || r.app_status === 'Pending';
    }).length,
    passed: globalData.filter(c => getR1(c).app_status === 'Yes').length,
    rejected: globalData.filter(c => getR1(c).app_status === 'Reject').length,
  };

  const r2Stats = {
    total: r1Stats.passed,
    promoted: globalData.filter(c => {
      const r = getR2(c);
      const m = r.moved_to_round_3;
      return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
    }).length,
    declined: globalData.filter(c => {
      const r = getR2(c);
      const m = r.moved_to_round_3;
      return m && !m.endsWith('_draft') && (m === 'No' || m === 'Declined');
    }).length,
    pending: globalData.filter(c => {
      const r = getR2(c);
      const m = r.moved_to_round_3;
      return getR1(c).app_status === 'Yes' && (!m || m.endsWith('_draft'));
    }).length,
  };

  const r3Stats = {
    total: r2Stats.promoted,
    hired: globalData.filter(c => ['Yes', 'Hired'].includes(getR3(c).verdict)).length,
    declined: globalData.filter(c => ['No', 'Rejected'].includes(getR3(c).verdict)).length,
    pending: globalData.filter(c => {
      const r2 = getR2(c);
      const r3 = getR3(c);
      const m = r2.moved_to_round_3;
      const isFinished = m && !m.endsWith('_draft');
      return isFinished && (m === 'Yes' || m === 'Maybe') && !r3.verdict;
    }).length,
  };

  const techEvaluatorsSnapshot = [
    'Tejaswini', 'Sohan', 'Basvaraj', 'Pushkaraj', 'Akash', 'Anmol',
    'Sachin', 'Akhil L', 'Vedant', 'Akhil M', 'Samit', 'Snehanshu',
    'Ankita', 'Kaushik'
  ].map(techEvaluatorId => {
    const assigned = globalData.filter(c => getR1(c).eval_group === techEvaluatorId);
    return {
      name: techEvaluatorId,
      total: assigned.length,
      pending: assigned.filter(c => {
        const r1 = getR1(c);
        const r2 = getR2(c);
        const m = r2.moved_to_round_3;
        return r1.app_status === 'Yes' && (!m || m.endsWith('_draft'));
      }).length,
      promoted: assigned.filter(c => {
        const r2 = getR2(c);
        const m = r2.moved_to_round_3;
        return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
      }).length,
      declined: assigned.filter(c => {
        const r2 = getR2(c);
        const m = r2.moved_to_round_3;
        return m && !m.endsWith('_draft') && (m === 'No' || m === 'Declined');
      }).length,
    };
  });

  const techEvaluatorColors = {
    Tejaswini: { border: 'border-t-purple-500', text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/5' },
    Sohan: { border: 'border-t-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/5' },
    Basvaraj: { border: 'border-t-green-500', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/5' },
    Pushkaraj: { border: 'border-t-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/5' },
    Akash: { border: 'border-t-teal-500', text: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/5' },
    Anmol: { border: 'border-t-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/5' },
    Sachin: { border: 'border-t-sky-500', text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/5' },
    'Akhil L': { border: 'border-t-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/5' },
    Vedant: { border: 'border-t-violet-500', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/5' },
    'Akhil M': { border: 'border-t-fuchsia-500', text: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/5' },
    Samit: { border: 'border-t-pink-500', text: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/5' },
    Snehanshu: { border: 'border-t-rose-500', text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/5' },
    Ankita: { border: 'border-t-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/5' },
    Kaushik: { border: 'border-t-orange-500', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/5' }
  };

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
    r1Candidates.forEach(cand => {
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
  }, [r1Candidates]);

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
      <Header title="Master Control Stage" isDemo={!!error} />

      <main className="flex-1 p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
        
        {/* Connection warning banner if offline */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-sm font-mono text-sm leading-relaxed">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <strong className="font-bold block text-foreground mb-1">Live Database Connection Required</strong>
              Database connection failed: {error}. Please click the Settings gear icon in the top right to configure your Supabase credentials for port 5176.
            </div>
          </div>
        )}

        {loading && globalData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-2">
            <div className="text-muted-foreground font-mono animate-pulse">Quering all pipeline stages...</div>
          </div>
        ) : (
          <>
            {selectedCandidate && (
              <CandidateProfileDossier
                candidate={selectedCandidate}
                round={selectedRound}
                onSave={handleSaveDecision}
                onCancel={() => setSelectedCandidate(null)}
              />
            )}
            <div className={selectedCandidate ? 'hidden' : 'flex flex-col gap-6'}>
            
            {/* Top Navigation switch */}
            <div className="flex flex-wrap items-center gap-2 border-b pb-3 justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('overview')}
                  className={`rounded-lg px-4 font-bold text-xs transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-[#800020] text-white hover:bg-[#800020]/90 border-transparent' 
                      : 'border border-[#800020]/30 text-[#800020] hover:bg-[#800020]/5 hover:text-[#800020]'
                  }`}
                >
                  <BarChart className="mr-2 h-4 w-4 stroke-[1.5]" /> Overview & Charts
                </Button>
                
                <Button
                  variant={activeTab === 'r1' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('r1')}
                  className={`rounded-lg px-4 font-bold text-xs transition-all ${
                    activeTab === 'r1' 
                      ? 'bg-[#800020] text-white hover:bg-[#800020]/90 border-transparent' 
                      : 'border border-[#800020]/30 text-[#800020] hover:bg-[#800020]/5 hover:text-[#800020]'
                  }`}
                >
                  <Users className="mr-2 h-4 w-4 stroke-[1.5]" /> R1: HR Review
                </Button>
                
                <Button
                  variant={activeTab === 'r2' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('r2')}
                  className={`rounded-lg px-4 font-bold text-xs transition-all ${
                    activeTab === 'r2' 
                      ? 'bg-[#800020] text-white hover:bg-[#800020]/90 border-transparent' 
                      : 'border border-[#800020]/30 text-[#800020] hover:bg-[#800020]/5 hover:text-[#800020]'
                  }`}
                >
                  <Flame className="mr-2 h-4 w-4 stroke-[1.5]" /> R2: Technical Review
                </Button>
                
                <Button
                  variant={activeTab === 'r3' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('r3')}
                  className={`rounded-lg px-4 font-bold text-xs transition-all ${
                    activeTab === 'r3' 
                      ? 'bg-[#800020] text-white hover:bg-[#800020]/90 border-transparent' 
                      : 'border border-[#800020]/30 text-[#800020] hover:bg-[#800020]/5 hover:text-[#800020]'
                  }`}
                >
                  <Award className="mr-2 h-4 w-4 stroke-[1.5]" /> R3: Executive Review
                </Button>

                <Button
                  variant={activeTab === 'university' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('university')}
                  className={`rounded-lg px-4 font-bold text-xs transition-all ${
                    activeTab === 'university'
                      ? 'bg-[#800020] text-white hover:bg-[#800020]/90 border-transparent'
                      : 'border border-[#800020]/30 text-[#800020] hover:bg-[#800020]/5 hover:text-[#800020]'
                  }`}
                >
                  <GraduationCap className="mr-2 h-4 w-4 stroke-[1.5]" /> University Overview
                </Button>
              </div>
            </div>

                        {/* Overview Tab Content */}
            {activeTab === 'overview' && (
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
                                    onClick={() => {
                                      window.open(getCandidatePortalUrl(cand), '_blank');
                                    }}
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
                    onViewCandidate={(c) => {
                      setSelectedRound(1); // Default to review view
                      setSelectedCandidate(c);
                    }}
                    onTileClick={(stage) => {
                      if (stage === 'Hired' || stage === 'Declined') {
                        setActiveTab('r3');
                      } else if (stage === 'Review') {
                        setActiveTab('r2');
                      } else if (stage === 'Pending') {
                        setActiveTab('r1');
                      } else if (stage === 'ALL') {
                        setActiveTab('r1');
                      }
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

{/* Technical Reviewer Workload Status Snapshots */}
                <div className="flex flex-col gap-1 mt-2">
                  <h3 className="text-base font-bold text-foreground font-heading">Technical Reviewer Workload Snapshots</h3>
                  <p className="text-xs text-muted-foreground">Real-time workloads and status breakdowns for each technical review technical evaluator.</p>
                </div>

                <div className="border rounded-xl bg-card text-card-foreground overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b">
                          <th className="p-3.5 font-bold text-muted-foreground font-mono uppercase tracking-wider text-[10px]">Technical Reviewer</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Total Assigned</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Pending Review</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Promoted</th>
                          <th className="p-3.5 font-bold text-muted-foreground text-center font-mono uppercase tracking-wider text-[10px] w-[140px]">Declined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-mono">
                        {techEvaluatorsSnapshot.map((evaluator) => (
                          <tr key={evaluator.name} className="hover:bg-muted/10 transition-colors">
                            <td className="p-3.5 font-sans font-bold text-foreground">{evaluator.name}</td>
                            <td className="p-3.5 text-center text-foreground font-extrabold">{evaluator.total}</td>
                            <td className="p-3.5 text-center text-amber-600 font-extrabold">{evaluator.pending}</td>
                            <td className="p-3.5 text-center text-green-600 font-extrabold">{evaluator.promoted}</td>
                            <td className="p-3.5 text-center text-red-600 font-extrabold">{evaluator.declined}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}

            {/* Round 1 tab content */}
            {activeTab === 'r1' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-extrabold tracking-tight">Round 1 Review Worksheet</h2>
                  <p className="text-xs text-muted-foreground">Manage initial resume review, total scores, and evaluator technical evaluator assignments.</p>
                </div>
                
                <StatsBanner candidates={r1Candidates} rawCount={globalData.length} />

                <CandidateListTable
                  candidates={r1Candidates}
                  actionLabel="Review"
                  onActionClick={(cand) => {
                    setSelectedRound(1);
                    setSelectedCandidate(cand);
                  }}
                  showTechEvaluatorFilter={true}
                  round={1}
                  onUpdateTechEvaluator={handleUpdateTechEvaluator}
                />
              </div>
            )}

            {/* Round 2 tab content */}
            {activeTab === 'r2' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-extrabold tracking-tight">Round 2 Technical Review Worksheet</h2>
                  <p className="text-xs text-muted-foreground">Evaluate candidate project depth, start dates, and business-fit alignment.</p>
                </div>

                <StatsBanner candidates={r2Candidates} round={2} />

                <CandidateListTable
                  candidates={r2Candidates}
                  actionLabel="Review Candidate"
                  onActionClick={(cand) => {
                    setSelectedRound(2);
                    setSelectedCandidate(cand);
                  }}
                  showTechEvaluatorFilter={true}
                  round={2}
                  onUpdateTechEvaluator={handleUpdateTechEvaluator}
                />
              </div>
            )}

            {/* Round 3 tab content */}
            {activeTab === 'r3' && (() => {
              const getFilteredR3Candidates = () => {
                return r3Candidates.filter(c => {
                  // 1. Filter by Executive Verdict (StatsBanner)
                  if (r3ActiveFilter !== 'ALL') {
                    const r3 = c.round_3_evaluation?.[0] || c.round_3_evaluation || {};
                    const v = r3.verdict;
                    if (r3ActiveFilter === 'Hired' && !['Yes', 'Hired'].includes(v)) return false;
                    if (r3ActiveFilter === 'Rejected' && !['No', 'Rejected'].includes(v)) return false;
                    if (r3ActiveFilter === 'Maybe' && v !== 'Maybe') return false;
                  }
                  // 2. Filter by Technical Reviewer Decision (TR Verdict: Yes/Maybe)
                  if (r3TrFilter !== 'ALL') {
                    const r2 = c.round_2_evaluation?.[0] || c.round_2_evaluation || {};
                    if (r2.moved_to_round_3 !== r3TrFilter) return false;
                  }
                  return true;
                });
              };

              const filteredR3Candidates = getFilteredR3Candidates();

              // Calculate TR statistics
              const totalTR = r3Candidates.length;
              const yesTR = r3Candidates.filter(c => {
                const r2 = c.round_2_evaluation?.[0] || c.round_2_evaluation || {};
                return r2.moved_to_round_3 === 'Yes';
              }).length;
              const maybeTR = r3Candidates.filter(c => {
                const r2 = c.round_2_evaluation?.[0] || c.round_2_evaluation || {};
                return r2.moved_to_round_3 === 'Maybe';
              }).length;

              return (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-extrabold tracking-tight">Round 3 Executive Decisions Worksheet</h2>
                    <p className="text-xs text-muted-foreground">Decide final internship offers and add onboard guidelines comments.</p>
                  </div>

                  <StatsBanner 
                    candidates={r3Candidates} 
                    round={3} 
                    activeFilter={r3ActiveFilter}
                    onFilterChange={setR3ActiveFilter}
                  />

                  {/* TR Decision Filter Tabs */}
                  <div className="flex items-center justify-between border-b pb-4 mt-2">
                    <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border">
                      <button
                        onClick={() => setR3TrFilter('ALL')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          r3TrFilter === 'ALL'
                            ? 'bg-white dark:bg-zinc-800 text-[#800020] shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        All TR Decisions ({totalTR})
                      </button>
                      <button
                        onClick={() => setR3TrFilter('Yes')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          r3TrFilter === 'Yes'
                            ? 'bg-green-600 text-white shadow-sm font-extrabold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${r3TrFilter === 'Yes' ? 'bg-white' : 'bg-green-500'}`} />
                        TR Recommended: Yes ({yesTR})
                      </button>
                      <button
                        onClick={() => setR3TrFilter('Maybe')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          r3TrFilter === 'Maybe'
                            ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${r3TrFilter === 'Maybe' ? 'bg-white' : 'bg-amber-500'}`} />
                        TR Recommended: Maybe ({maybeTR})
                      </button>
                    </div>
                  </div>

                  {r3ActiveFilter !== 'ALL' && (
                    <div className="bg-[#800020]/5 border border-[#800020]/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#800020] animate-pulse" />
                        Showing only: <strong className="text-[#800020]">{r3ActiveFilter === 'Hired' ? 'Hired' : r3ActiveFilter === 'Maybe' ? 'Maybe' : 'Rejected'}</strong> Candidates ({filteredR3Candidates.length})
                      </div>
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => setR3ActiveFilter('ALL')}
                        className="h-7 px-2.5 text-xs border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white rounded-lg shadow-sm font-bold"
                      >
                        Clear Filter
                      </Button>
                    </div>
                  )}

                  <CandidateListTable
                    candidates={filteredR3Candidates}
                    actionLabel="Review"
                    onActionClick={(cand) => {
                      setSelectedRound(3);
                      setSelectedCandidate(cand);
                    }}
                    showTechEvaluatorFilter={true}
                    round={3}
                    onUpdateTechEvaluator={handleUpdateTechEvaluator}
                  />
                </div>
              );
            })()}

            {/* University Overview tab content */}
            {activeTab === 'university' && (() => {

              // Dedicated sub-page / details view for selected university
              if (selectedUnivName) {
                const targetUni = uniDataList.find(u => u.name === selectedUnivName);
                if (targetUni) {
                  return (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                      {/* Back / Header Row */}
                      <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUnivName(null)}
                            className="rounded-lg h-9 px-3 border-[#800020] text-[#800020] hover:bg-[#800020]/10 hover:text-[#800020] font-bold"
                          >
                            &larr; Back to Universities
                          </Button>
                          <div>
                            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                              <Building className="h-5 w-5 text-[#800020]" /> {targetUni.name}
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Candidate roster and review workflow for {targetUni.name}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-mono font-bold text-xs bg-[#800020]/10 text-[#800020] px-3 py-1.5 rounded-full">
                          {targetUni.total} {targetUni.total === 1 ? 'candidate' : 'candidates'}
                        </Badge>
                      </div>

                      {/* Tier Distribution Cards */}
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

                      {/* Candidates Table */}
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
                                      onClick={() => {
                                        window.open(getCandidatePortalUrl(cand), '_blank');
                                      }}
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
                }
              }

              // Main grid page
              return (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-[#800020]" /> University Overview
                    </h2>
                    <p className="text-xs text-muted-foreground">Monitor candidate distributions and screen applicants grouped by their academic institutions.</p>
                  </div>

                  {/* Search bar */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground stroke-[1.5]" />
                    <Input
                      placeholder="Search universities..."
                      value={univSearch}
                      onChange={(e) => setUnivSearch(e.target.value)}
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>

                  {/* University Table */}
                  <Card className="rounded-[1.25rem] overflow-hidden border shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#1B365D] text-white">
                            <th className="p-3.5 font-bold text-sm">University</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[100px] border-l border-white/10">Total</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 1</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 1+</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 2</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 2+</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 3</th>
                            <th className="p-3.5 font-bold text-sm text-center w-[90px] border-l border-white/10">Tier 4</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedUnis.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-12 text-muted-foreground font-mono text-sm bg-muted/20">
                                No universities found matching your search.
                              </td>
                            </tr>
                          ) : (
                            sortedUnis.map((uni) => {
                              const t1 = uni.tiers['Tier 1'] || 0;
                              const t1p = uni.tiers['Tier 1+'] || 0;
                              const t2 = uni.tiers['Tier 2'] || 0;
                              const t2p = uni.tiers['Tier 2+'] || 0;
                              const t3 = uni.tiers['Tier 3'] || 0;
                              const t4 = uni.tiers['T4'] || 0;

                              return (
                                <tr key={uni.name} className="border-b hover:bg-muted/10 transition-colors last:border-0">
                                  <td className="p-3.5 font-semibold text-foreground text-sm">
                                    <button 
                                      onClick={() => setSelectedUnivName(uni.name)}
                                      className="text-[#800020] hover:underline font-bold text-left focus:outline-none"
                                    >
                                      {uni.name}
                                    </button>
                                  </td>
                                  <td className="p-3.5 text-center font-bold text-sm border-l border-muted bg-muted/20 text-foreground">
                                    {uni.total}
                                  </td>
                                  
                                  {/* Tier 1 - light green */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t1 > 0 
                                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t1}
                                  </td>
                                  
                                  {/* Tier 1+ - light green */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t1p > 0 
                                      ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t1p}
                                  </td>
                                  
                                  {/* Tier 2 - light blue */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t2 > 0 
                                      ? 'bg-blue-500/10 text-blue-800 dark:text-blue-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t2}
                                  </td>
                                  
                                  {/* Tier 2+ - light blue */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t2p > 0 
                                      ? 'bg-blue-500/15 text-blue-800 dark:text-blue-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t2p}
                                  </td>
                                  
                                  {/* Tier 3 - light yellow */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t3 > 0 
                                      ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t3}
                                  </td>
                                  
                                  {/* Tier 4 - light orange */}
                                  <td className={`p-3.5 text-center font-bold text-sm border-l border-muted ${
                                    t4 > 0 
                                      ? 'bg-orange-500/10 text-orange-800 dark:text-orange-400' 
                                      : 'text-muted-foreground/30'
                                  }`}>
                                    {t4}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              );
            })()}

            </div>
          </>
        )}
      </main>
    </div>
  );
}
