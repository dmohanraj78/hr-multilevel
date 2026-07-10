import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Github, ExternalLink, ArrowLeft, Sparkles, Star } from 'lucide-react';

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
  const [r2Solves, setR2Solves] = useState(r2.solves_business_problem || '');
  const [r2Stack, setR2Stack] = useState(r2.tech_stack || '');
  const [r2Comments, setR2Comments] = useState(r2.demo_review_comment || '');
  const [r2NextStep, setR2NextStep] = useState(r2.moved_to_round_3 || '');
  const [r2ProductDepth, setR2ProductDepth] = useState(r2.product_depth || '');

  const [r3Comments, setR3Comments] = useState(r3.review_comments || '');

  const [saving, setSaving] = useState(false);

  const handleSave = async (forceVerdict) => {
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
        await onSave({
          round_2_evaluation: {
            ...r2,
            when_can_they_start: r2Start,
            duration_months: r2Duration,
            complexity: r2Complexity,
            solves_business_problem: r2Solves,
            tech_stack: r2Stack,
            demo_review_comment: r2Comments,
            moved_to_round_3: r2NextStep,
            product_depth: r2ProductDepth
          }
        });
      } else if (round === 3) {
        await onSave({
          round_3_evaluation: {
            ...r3,
            review_comments: r3Comments,
            verdict: forceVerdict
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

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
                  <p className="text-sm text-muted-foreground mt-1">{getBio('applied_role') || 'ML Engineer Intern'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {getBio('resume_drive_url') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={getBio('resume_drive_url')} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4 stroke-[1.5]" /> Resume
                      </a>
                    </Button>
                  )}
                  {getBio('github_url') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={getBio('github_url')} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4 stroke-[1.5]" /> GitHub
                      </a>
                    </Button>
                  )}
                  {getBio('demo_link') && (
                    <Button variant="outline" size="sm" asChild className="rounded-md">
                      <a href={getBio('demo_link')} target="_blank" rel="noopener noreferrer">
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

          {/* Skills horizontal progress bars */}
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
                    <span className="text-xs font-mono text-muted-foreground ml-auto">Assigned Tech Evaluator: <strong className="text-foreground">{r1.eval_group || 'None'}</strong></span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground italic">
                    "{r1.review_comments || 'No screen comments logged.'}"
                  </p>
                </div>

                {/* R2 History */}
                {round === 3 && (
                  <div className="border-l-2 border-green-600 pl-4 py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-green-600 text-green-600 bg-green-600/5 font-semibold">Round 2 Tech Review</Badge>
                      <span className="text-xs font-mono text-muted-foreground">Start: {r2.when_can_they_start || '-'}</span>
                      <span className="text-xs font-mono text-muted-foreground">Concerns: <strong>{r2.duration_months || 'None'}</strong></span>
                      <span className="text-xs font-mono text-muted-foreground">Tech Depth: <strong>{r2.product_depth || '-'}</strong></span>
                      <span className="text-xs font-mono text-muted-foreground">Problem Fit: <strong>{r2.solves_business_problem || '-'}</strong></span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mt-1.5">Stack: {r2.tech_stack || '-'}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">Latency/Cost/Security considered: {r2.complexity || '-'}</p>
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

          {/* Review Input Panel */}
          <Card className="border shadow-md rounded-[1.5rem]">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Review Inputs</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col gap-4">
              
              {/* Round 1 Review Form */}
              {round === 1 && (
                <div className="flex flex-col gap-3">
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
                          <SelectItem value="Duplicate">Duplicate</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="evalGroup" className="font-semibold text-xs">Assign Tech Evaluator</Label>
                    <Select value={r1Group} onValueChange={setR1Group}>
                      <SelectTrigger id="evalGroup" className="rounded-md">
                        <SelectValue placeholder="Select Tech Evaluator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="Dharti">Dharti</SelectItem>
                          <SelectItem value="Jal">Jal</SelectItem>
                          <SelectItem value="Agni">Agni</SelectItem>
                          <SelectItem value="Vayu">Vayu</SelectItem>
                          <SelectItem value="Akash">Akash</SelectItem>
                          <SelectItem value="Bijli">Bijli</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r1Comments" className="font-semibold text-xs">Recruiter Comments</Label>
                    <Textarea
                      id="r1Comments"
                      placeholder="Add initial review comments..."
                      value={r1Comments}
                      onChange={(e) => setR1Comments(e.target.value)}
                      rows={4}
                      className="rounded-md"
                    />
                  </div>

                  <Button onClick={() => handleSave(null)} className="w-full mt-2 bg-[#800020] hover:bg-[#800020]/90 text-white rounded-lg" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Decision'}
                  </Button>
                </div>
              )}

              {/* Round 2 Review Form */}
              {round === 2 && (
                <div className="flex flex-col gap-3 text-sm">
                  
                  {/* Candidate Tier Display */}
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Candidate Review Tier:</span>
                    <Badge variant="outline" className="font-mono font-bold text-xs border-primary/30 text-[#800020] bg-primary/5">
                      {r1.tier || 'N/A'} (Score: {r1.total || 0})
                    </Badge>
                  </div>

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

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Duration" className="font-semibold text-xs">Any concerns / restrictions (with college commitment, personal, others)</Label>
                    <Input
                      id="r2Duration"
                      placeholder="e.g. exams in Oct, college NOC required"
                      value={r2Duration}
                      onChange={(e) => setR2Duration(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="r2ProductDepth" className="font-semibold text-xs">Technical depth of demo / product</Label>
                      <Select value={r2ProductDepth} onValueChange={setR2ProductDepth}>
                        <SelectTrigger id="r2ProductDepth" className="rounded-md">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="r2Solves" className="font-semibold text-xs">Problem-solution fit</Label>
                      <Select value={r2Solves} onValueChange={setR2Solves}>
                        <SelectTrigger id="r2Solves" className="rounded-md">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Complexity" className="font-semibold text-xs">Have latency, cost, security, etc. been considered?</Label>
                    <Input
                      id="r2Complexity"
                      placeholder="e.g. redis caching, indexed queries"
                      value={r2Complexity}
                      onChange={(e) => setR2Complexity(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Next" className="font-semibold text-xs">Decision (Promote to Round 3?)</Label>
                    <Select value={r2NextStep} onValueChange={setR2NextStep}>
                      <SelectTrigger id="r2Next" className="rounded-md">
                        <SelectValue placeholder="Select Decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes (Promote)</SelectItem>
                        <SelectItem value="Maybe">Maybe</SelectItem>
                        <SelectItem value="No">No (Decline)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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

                  <Button onClick={() => handleSave(null)} className="w-full mt-2 bg-[#800020] hover:bg-[#800020]/90 text-white rounded-lg" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Review outcomes'}
                  </Button>
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
                    <Button onClick={() => handleSave('No')} variant="outline" className="flex-1 border-red-500 hover:bg-red-500/10 text-red-500 rounded-lg font-bold" disabled={saving}>
                      Decline
                    </Button>
                    <Button onClick={() => handleSave('Yes')} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold" disabled={saving}>
                      Approve Hire
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
