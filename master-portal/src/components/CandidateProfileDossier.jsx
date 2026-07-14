import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Github, ExternalLink, ArrowLeft, Sparkles, Linkedin } from 'lucide-react';

const formatExternalLink = (url) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export default function CandidateProfileDossier({ candidate, round, onSave, onCancel }) {
  // Safe parsing helper for Supabase relations
  const getRound1 = (c) => {
    if (!c) return {};
    const val = c.round_1_evaluation;
    const valParsed = Array.isArray(val) ? val[0] : (val || {});
    return {
      ...valParsed,
      app_status: c.app_status !== undefined ? c.app_status : valParsed?.app_status,
      eval_group: c.eval_group !== undefined ? c.eval_group : valParsed?.eval_group,
      tier: c.tier !== undefined ? c.tier : valParsed?.tier,
      review_comments: c.review_comments !== undefined ? c.review_comments : valParsed?.review_comments,
      total: c.total !== undefined ? c.total : valParsed?.total,
      edu: c.edu !== undefined ? c.edu : valParsed?.edu,
      exp: c.exp !== undefined ? c.exp : valParsed?.exp,
      proj: c.proj !== undefined ? c.proj : valParsed?.proj,
      skills: c.skills !== undefined ? c.skills : valParsed?.skills,
      demo_review_notes_ai: c.demo_review_notes_ai !== undefined ? c.demo_review_notes_ai : valParsed?.demo_review_notes_ai
    };
  };

  const getRound2 = (c) => {
    if (!c) return {};
    const val = c.round_2_evaluation;
    const valParsed = Array.isArray(val) ? val[0] : (val || {});
    return {
      ...valParsed,
      moved_to_round_3: c.moved_to_round_3 !== undefined ? c.moved_to_round_3 : valParsed?.moved_to_round_3,
      when_can_they_start: c.when_can_they_start !== undefined ? c.when_can_they_start : valParsed?.when_can_they_start,
      duration_months: c.duration_months !== undefined ? c.duration_months : valParsed?.duration_months,
      complexity: c.complexity !== undefined ? c.complexity : valParsed?.complexity,
      solves_business_problem: c.solves_business_problem !== undefined ? c.solves_business_problem : valParsed?.solves_business_problem,
      tech_stack: c.tech_stack !== undefined ? c.tech_stack : valParsed?.tech_stack,
      demo_review_comment: c.demo_review_comment !== undefined ? c.demo_review_comment : valParsed?.demo_review_comment,
      product_depth: c.product_depth !== undefined ? c.product_depth : valParsed?.product_depth,
      contact_status: c.contact_status !== undefined ? c.contact_status : valParsed?.contact_status,
      problem_fit: c.problem_fit !== undefined ? c.problem_fit : valParsed?.problem_fit,
      tech_depth: c.tech_depth !== undefined ? c.tech_depth : valParsed?.tech_depth,
      latency_considerations: c.latency_considerations !== undefined ? c.latency_considerations : valParsed?.latency_considerations,
    };
  };

  const getRound3 = (c) => {
    if (!c) return {};
    const val = c.round_3_evaluation;
    if (Array.isArray(val)) return val[0] || {};
    return val || {};
  };

  const r1 = getRound1(candidate);
  const r2 = getRound2(candidate);
  const r3 = getRound3(candidate);

  // Safe relational extraction helpers
  const getBio = (field) => {
    const raw = candidate.raw_submissions;
    const rawParsed = Array.isArray(raw) ? raw[0] : raw;
    return candidate[field] || rawParsed?.[field] || '';
  };

  const getSkill = (skillField) => {
    const val = getBio(skillField);
    return parseInt(val || 0);
  };

  // Form states based on active round
  const [r1Status, setR1Status] = useState(r1.app_status || '');
  const [r1Group, setR1Group] = useState(r1.eval_group || '');
  const [r1Comments, setR1Comments] = useState(r1.review_comments || '');

  const [r2Start, setR2Start] = useState(r2.when_can_they_start || '');
  const [r2Duration, setR2Duration] = useState(r2.duration_months || '');
  const [r2Complexity, setR2Complexity] = useState(r2.complexity || '');
  
  // Custom combined column parsing for Contact Status and Problem Fit (with new columns fallback)
  const rawSolves = r2.solves_business_problem || '';
  const initialContact = r2.contact_status || (rawSolves.includes('Contact: ') ? rawSolves.split('Contact: ')[1].split(' | ')[0] : (['Yet to Speak', 'Spoke', 'Scheduled', 'No response'].includes(rawSolves) ? rawSolves : ''));
  const initialFit = r2.problem_fit || (rawSolves.includes('Fit: ') ? rawSolves.split('Fit: ')[1] : (['Yes', 'Maybe', 'No'].includes(rawSolves) ? rawSolves : ''));
  
  const [r2Solves, setR2Solves] = useState(initialContact);
  const [r2ProblemFit, setR2ProblemFit] = useState(initialFit);
  
  const [r2Stack, setR2Stack] = useState(r2.tech_stack || '');
  const [r2Comments, setR2Comments] = useState(r2.demo_review_comment || '');
  const [r2NextStep, setR2NextStep] = useState(r2.moved_to_round_3 ? r2.moved_to_round_3.replace('_draft', '') : '');
  
  // Custom combined column parsing for Tech Depth and Latency Considered (with new columns fallback)
  const rawDepth = r2.product_depth || '';
  const initialDepth = r2.tech_depth || (rawDepth.includes('Depth: ') ? rawDepth.split('Depth: ')[1].split(' | ')[0] : (['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));
  const initialLatency = r2.latency_considerations || (rawDepth.includes('Latency: ') ? rawDepth.split('Latency: ')[1] : (!['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : ''));
  
  const [r2ProductDepth, setR2ProductDepth] = useState(initialDepth);
  const [r2Latency, setR2Latency] = useState(initialLatency);

  const [r3Comments, setR3Comments] = useState(r3.review_comments || '');

  const [saving, setSaving] = useState(false);

  const handleSave = async (forceFinalStatus, isFinish = false) => {
    const activeEvaluator = r1Group || r1.eval_group;

    if (round === 2 && isFinish) {
      const isPromote = r2NextStep === 'Yes' || r2NextStep === 'Maybe';
      const isReject = r2NextStep === 'No' || r2NextStep === 'Declined';

      if (isPromote) {
        const missing = [];
        if (!r2Start.trim()) missing.push("Earliest date they can start the internship");
        if (!r2Duration.trim()) missing.push("Duration for which they are available");
        if (!r2Complexity.trim()) missing.push("Any concerns / restrictions");
        if (!r2ProductDepth) missing.push("Technical depth of demo / product");
        if (!r2Solves) missing.push("Contact Status");
        if (!r2Stack.trim()) missing.push("Tech stack used");
        if (!r2ProblemFit) missing.push("Problem-solution fit");
        if (!r2Latency.trim()) missing.push("Areas like latency, cost, security, etc");
        if (!r2NextStep) missing.push("Decision");
        if (!r2Comments.trim()) missing.push("Reason for decision");

        if (missing.length > 0) {
          alert("Please fill out all mandatory fields before completing the review:\n- " + missing.join("\n- "));
          return;
        }
      } else if (isReject) {
        const rejectMissing = [];
        if (!r2NextStep) rejectMissing.push("Decision");
        if (!r2Comments.trim()) rejectMissing.push("Reason for decision");

        if (rejectMissing.length > 0) {
          alert("Please fill out the mandatory fields before completing the review:\n- " + rejectMissing.join("\n- "));
          return;
        }
      } else {
        alert("Please select a Decision before finishing the review.");
        return;
      }
    }

    setSaving(true);
    try {
      if (round === 1) {
        await onSave({
          round_1_evaluation: {
            ...r1,
            app_status: r1Status,
            eval_group: r1Group,
            review_comments: r1Comments
          }
        });
      } else if (round === 2) {
        let finalDecision = r2NextStep;
        if (r2NextStep) {
          if (!isFinish) {
            finalDecision = r2NextStep + '_draft';
          }
        }
        await onSave({
          round_2_evaluation: {
            ...r2,
            when_can_they_start: r2Start,
            duration_months: r2Duration,
            complexity: r2Complexity,
            solves_business_problem: r2Solves || r2ProblemFit ? `Contact: ${r2Solves || ''} | Fit: ${r2ProblemFit || ''}` : '',
            tech_stack: r2Stack,
            demo_review_comment: r2Comments,
            moved_to_round_3: finalDecision,
            product_depth: r2ProductDepth || r2Latency ? `Depth: ${r2ProductDepth || ''} | Latency: ${r2Latency || ''}` : '',
            contact_status: r2Solves,
            problem_fit: r2ProblemFit,
            tech_depth: r2ProductDepth,
            latency_considerations: r2Latency
          },
          round_1_evaluation: {
            ...r1,
            eval_group: activeEvaluator
          }
        });
      } else if (round === 3) {
        await onSave({
          round_3_evaluation: {
            ...r3,
            review_comments: r3Comments,
            final_status: forceFinalStatus
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const reviewers = [
    'Tejaswini', 'Sohan', 'Basvaraj', 'Pushkaraj', 'Akash', 'Anmol',
    'Sachin', 'Akhil L', 'Vedant', 'Akhil M', 'Samit', 'Snehanshu',
    'Ankita', 'Kaushik', 'Aman'
  ];

  const skillsList = [
    { name: 'Python', score: getSkill('skill_python') },
    { name: 'Deep Learning', score: getSkill('skill_deep_learning') },
    { name: 'NLP', score: getSkill('skill_nlp') },
    { name: 'Computer Vision', score: getSkill('skill_computer_vision') },
    { name: 'Reinforcement Learning', score: getSkill('skill_reinforcement_learning') },
    { name: 'Multimodal AI', score: getSkill('skill_multimodal_ai') },
    { name: 'Finetuning (LoRA)', score: getSkill('skill_finetuning_lora_peft') },
    { name: 'LLM Orchestration', score: getSkill('skill_llm_orchestration') },
    { name: 'Agent Fundamentals', score: getSkill('skill_agent_fundamentals') },
    { name: 'MCP Protocols', score: getSkill('skill_mcp') },
    { name: 'Vector Embeddings', score: getSkill('skill_embeddings_vector_rag') },
    { name: 'Reasoning Models', score: getSkill('skill_reasoning_models') },
    { name: 'Eval Frameworks', score: getSkill('skill_evals') },
    { name: 'AI Coding Tools', score: getSkill('skill_ai_coding_tools') },
    { name: 'Generic RAG', score: getSkill('skill_rag') }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header breadcrumbs */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onCancel} className="rounded-lg">
          <ArrowLeft className="mr-2 h-4 w-4 stroke-[1.5]" /> Back to List
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Column (70%) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Basics Card */}
          <Card className="rounded-[1.5rem] border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-extrabold font-heading tracking-tight">{getBio('full_name')}</CardTitle>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground">{getBio('applied_role') || 'ML Engineer Intern'}</span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      TR Decision:
                      <Badge className={`border-transparent rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        r2.moved_to_round_3 === 'Yes' 
                          ? 'bg-green-600 text-white' 
                          : r2.moved_to_round_3 === 'Maybe' 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {r2.moved_to_round_3 || 'Pending'}
                      </Badge>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {getBio('resume_drive_url') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={formatExternalLink(getBio('resume_drive_url'))} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4 stroke-[1.5]" /> Resume
                      </a>
                    </Button>
                  )}
                  {getBio('github_url') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={formatExternalLink(getBio('github_url'))} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4 stroke-[1.5]" /> GitHub
                      </a>
                    </Button>
                  )}
                  {(getBio('linkedin') || getBio('linkedin_url')) && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={formatExternalLink(getBio('linkedin') || getBio('linkedin_url'))} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="mr-2 h-4 w-4 stroke-[1.5]" /> LinkedIn
                      </a>
                    </Button>
                  )}
                  {getBio('demo_link') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={formatExternalLink(getBio('demo_link'))} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4 stroke-[1.5]" /> Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase block mb-1">Email</span>
                  <span className="font-medium text-foreground">{getBio('email') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase block mb-1">Phone</span>
                  <span className="font-medium text-foreground">{getBio('phone') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase block mb-1">Location</span>
                  <span className="font-medium text-foreground">{getBio('location') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase block mb-1">Education</span>
                  <span className="font-medium text-foreground">
                    {getBio('education_level') || '-'} {getBio('course_major') ? `(${getBio('course_major')})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase block mb-1">Colleges</span>
                  <span className="font-medium text-foreground">{getBio('ug_university') || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase block mb-1">Availability Start</span>
                  <span className="font-medium text-foreground">{getBio('preferred_start_date') || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Box */}
          <Card className="rounded-[1.5rem] border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Demo Project Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 border rounded-xl p-4">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  Category: <span className="text-foreground font-bold">{getBio('project_category') || 'N/A'}</span> ({getBio('project_state') || 'Pending'})
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {candidate.demo_explanation || getBio('current_project') || 'No explanation provided.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills progress bars */}
          <Card className="rounded-[1.5rem] border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Self-Reported AI/ML Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsList.map((skill) => (
                  <div key={skill.name} className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>{skill.name}</span>
                      <span className="text-[#800020] font-bold font-mono">{skill.score}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-sm border ${
                            i < (skill.score || 0) ? 'bg-[#800020] border-[#800020]' : 'bg-muted/50 border-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Round History (Timeline) */}
          {(round === 2 || round === 3) && (
            <Card className="rounded-[1.5rem] border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Funnel History Timeline</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-2">
                {/* R1 History */}
                <div className="border-l-2 border-[#800020] pl-4 py-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-[#800020] text-[#800020] bg-[#800020]/5 font-semibold">Round 1 Review</Badge>
                    <span className="text-xs font-mono text-muted-foreground">App Status: {r1.app_status || 'Pending'}</span>
                    
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground italic">
                    "{r1.review_comments || 'No review comments logged.'}"
                  </p>
                </div>

                {/* R2 History */}
                {round === 3 && (
                  <div className="border-l-2 border-green-600 pl-4 py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-green-600 text-green-600 bg-green-600/5 font-semibold">Round 2 Technical Review</Badge>
                      <span className="text-xs font-mono text-muted-foreground">Start: {r2.when_can_they_start || '-'}</span>
                      <span className="text-xs font-mono text-muted-foreground ml-auto">Technical Reviewer: <strong className="text-foreground">{r1.eval_group || 'None'}</strong></span>
                      <span className="text-xs font-mono text-muted-foreground">Duration: <strong>{r2.duration_months || '-'}</strong></span>
                      <span className="text-xs font-mono text-muted-foreground">Contact: <strong>{r2.solves_business_problem || '-'}</strong></span>
                      <span className="text-xs font-mono text-muted-foreground">Tech Depth: <strong>{r2.product_depth || '-'}</strong></span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-1.5">Stack: {r2.tech_stack || '-'}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">Concerns: {r2.complexity || '-'}</p>
                    <p className="text-sm mt-2 text-muted-foreground italic">
                      "{r2.demo_review_comment || 'No review comments logged.'}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column (30%) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Claude AI Evaluation */}
          <Card className="border-dashed border-2 bg-muted/5 rounded-[1.5rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#800020] fill-[#800020]/20" /> Claude AI evaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono tracking-tighter text-[#800020]">
                  {r1.total || 0}
                </span>
                <span className="text-muted-foreground text-sm font-mono">/ 21</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5">Edu: {r1.edu || 0}</Badge>
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5">Exp: {r1.exp || 0}</Badge>
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5">Proj: {r1.proj || 0}</Badge>
                <Badge variant="secondary" className="font-mono text-[10px] px-1.5">Skills: {r1.skills || 0}</Badge>
              </div>
              <div className="text-xs leading-relaxed text-muted-foreground max-h-48 overflow-y-auto bg-muted/30 p-3 rounded-lg border border-border whitespace-pre-wrap font-mono">
                {r1.demo_review_notes_ai || 'No evaluation notes available.'}
              </div>
            </CardContent>
          </Card>

          {/* Input Panel */}
          <Card className="border shadow-md rounded-[1.5rem]">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Review Inputs</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              
              {/* Round 1 Screening Form */}
              {round === 1 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r1Comments" className="font-semibold text-xs">HR Comments</Label>
                    <Textarea
                      id="r1Comments"
                      placeholder="Add initial review comments..."
                      value={r1Comments}
                      onChange={(e) => setR1Comments(e.target.value)}
                      rows={4}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="appStatus" className="font-semibold text-xs">App Status</Label>
                    <Select value={r1Status} onValueChange={setR1Status}>
                      <SelectTrigger id="appStatus" className="rounded-md">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Yes">Yes (Round 2)</SelectItem>
                          <SelectItem value="Reject">Reject</SelectItem>
                          <SelectItem value="Maybe">Maybe</SelectItem>
                          <SelectItem value="Access requested">Access requested</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r1Group" className="font-semibold text-xs">Assign Technical Evaluator</Label>
                    <Select value={r1Group} onValueChange={setR1Group}>
                      <SelectTrigger id="r1Group" className="rounded-md">
                        <SelectValue placeholder="Select Technical Evaluator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {reviewers.map((name) => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={() => handleSave(null, false)} className="w-full mt-2 bg-[#800020] hover:bg-[#800020]/90 text-white rounded-lg" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Decision'}
                  </Button>
                </div>
              )}

              {/* Round 2 Review Form */}
              {round === 2 && (
                <div className="flex flex-col gap-3 text-sm">
                  
                  {/* Candidate Tier Display */}
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Candidate Review Tier:</span>
                      <Badge variant="outline" className="font-mono font-bold text-xs border-primary/30 text-[#800020] bg-primary/5">
                        {r1.tier || 'N/A'} (Score: {r1.total || 0})
                      </Badge>
                    </div>
                  </div>

                  {/* 1. Contact Status */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Solves" className="font-semibold text-xs">Contact Status</Label>
                    <Select value={r2Solves} onValueChange={setR2Solves}>
                      <SelectTrigger id="r2Solves" className="rounded-md">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yet to Speak">Yet to Speak</SelectItem>
                        <SelectItem value="Spoke">Spoke</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="No response">No response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. Earliest date they can start the internship */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Start" className="font-semibold text-xs">Earliest date they can start the internship</Label>
                    <Input
                      id="r2Start"
                      placeholder="e.g. 15-08-2026"
                      value={r2Start}
                      onChange={(e) => setR2Start(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 3. Duration for which they are available */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Duration" className="font-semibold text-xs">Duration for which they are available</Label>
                    <Input
                      id="r2Duration"
                      placeholder="e.g. 6 months"
                      value={r2Duration}
                      onChange={(e) => setR2Duration(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 4. Any concerns / restrictions */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Complexity" className="font-semibold text-xs">Any concerns / restrictions (with college commitment, personal, others)</Label>
                    <Input
                      id="r2Complexity"
                      placeholder="e.g. exams in Oct, college NOC required"
                      value={r2Complexity}
                      onChange={(e) => setR2Complexity(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 5. Technical depth of demo / product */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2ProductDepth" className="font-semibold text-xs">Technical depth of demo / product</Label>
                    <Select value={r2ProductDepth} onValueChange={setR2ProductDepth}>
                      <SelectTrigger id="r2ProductDepth" className="rounded-md">
                        <SelectValue placeholder="Select Depth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 6. Tech stack used */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Stack" className="font-semibold text-xs">Tech stack used</Label>
                    <Input
                      id="r2Stack"
                      placeholder="e.g. React, FastApi, Postgres"
                      value={r2Stack}
                      onChange={(e) => setR2Stack(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 7. Problem-solution fit */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2ProblemFit" className="font-semibold text-xs">Problem-solution fit</Label>
                    <Select value={r2ProblemFit} onValueChange={setR2ProblemFit}>
                      <SelectTrigger id="r2ProblemFit" className="rounded-md">
                        <SelectValue placeholder="Select Fit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="Maybe">Maybe</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 8. Areas like latency, cost, security, etc been considered */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Latency" className="font-semibold text-xs">Areas like latency, cost, security, etc been considered</Label>
                    <Input
                      id="r2Latency"
                      placeholder="e.g. Rate limits, cost estimates, basic encryption"
                      value={r2Latency}
                      onChange={(e) => setR2Latency(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 9. Decision */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Next" className="font-semibold text-xs">Decision</Label>
                    <Select value={r2NextStep} onValueChange={setR2NextStep}>
                      <SelectTrigger id="r2Next" className="rounded-md">
                        <SelectValue placeholder="Select Decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="Maybe">Maybe</SelectItem>
                        <SelectItem value="No">No (not Promoted)</SelectItem>
                        
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 10. Reason for decision (detailed notes) */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Comments" className="font-semibold text-xs">Reason for decision (detailed notes)</Label>
                    <Textarea
                      id="r2Comments"
                      placeholder="Enter detailed notes explaining the review outcome..."
                      value={r2Comments}
                      onChange={(e) => setR2Comments(e.target.value)}
                      rows={3}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button 
                      onClick={() => handleSave(null, false)} 
                      variant="outline" 
                      className="flex-1 border-[#800020] text-[#800020] hover:bg-[#800020]/10 rounded-lg font-bold" 
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      onClick={() => handleSave(null, true)} 
                      className="flex-1 bg-[#800020] hover:bg-[#800020]/90 text-white rounded-lg font-bold" 
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Finish Review'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Round 3 Executive Verdict Form */}
              {round === 3 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r3Comments" className="font-semibold text-xs">Executive comments</Label>
                    <Textarea
                      id="r3Comments"
                      placeholder="State offer detail guidelines..."
                      value={r3Comments}
                      onChange={(e) => setR3Comments(e.target.value)}
                      rows={5}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleSave('Rejected', false)} variant="outline" className="flex-1 border-red-500 hover:bg-red-500/10 text-red-500 rounded-lg font-bold text-xs" disabled={saving}>
                      Rejected
                    </Button>
                    <Button onClick={() => handleSave('Maybe', false)} variant="outline" className="flex-1 border-amber-500 hover:bg-amber-500/10 text-amber-500 rounded-lg font-bold text-xs" disabled={saving}>
                      Maybe
                    </Button>
                    <Button onClick={() => handleSave('Hired', false)} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs" disabled={saving}>
                      Hired
                    </Button>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
