import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const RubricsView = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            Official Scoring Rubric — v3 (revised)
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            AI Builder Intern · Founder & CEO's Office | Total = 21 (Education 5 · Experience 5 · Projects 5 · Artifact 2 · Skills 4)
          </p>
        </CardHeader>
        <CardContent className="p-6 md:p-8 prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
          
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4 mb-8">
            <h3 className="text-blue-800 dark:text-blue-300 font-bold mt-0 mb-2">Tier Thresholds</h3>
            <p className="mb-0 text-blue-700 dark:text-blue-400">
              ≥15 → <strong className="text-slate-900 dark:text-white">Tier 1</strong> · 
              14.2–14.9 → <strong className="text-slate-900 dark:text-white">Tier 1-</strong> · 
              ≥12.5 → <strong className="text-slate-900 dark:text-white">Tier 2</strong> · 
              11.9–12.4 → <strong className="text-slate-900 dark:text-white">Tier 2-</strong> · 
              ≥9.5 → <strong className="text-slate-900 dark:text-white">Tier 3</strong> · 
              &lt;9.5 → <strong className="text-slate-900 dark:text-white">Tier 4</strong>
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-8 mb-4">
            EDUCATION (Max 5)
          </h3>
          <ul className="space-y-2">
            <li><strong>Degree Type | UG:</strong> B.Tech = +1 · BE = +1 · Integrated M.Tech = +1 · B.Sc (CS/AI/DS) = +0.8 · BCA = +0.7</li>
            <li><strong>Degree Type | PG:</strong> M.Tech = +1 · ME = +1 · MCA = +0.8 · M.Sc (CS/AI/DS) = +0.8</li>
            <li><strong>Degree Type | PhD:</strong> PhD = +1</li>
            <li><strong>Degree Status:</strong> Ongoing = +0.5 · Completed = +1</li>
            <li><strong>Relevant Stream:</strong> AI / AI&ML / AI&DS / CSE / CE / SE = +2 · IT / DS / ML = +1.5 · Non-Relevant = 0</li>
            <li><strong>College Bonus:</strong> IIT = +1 · IIIT / NIT / VIT / K L Univ / MIT-WPU / DBUU / Adichunchanagiri / JK Lakshmipat / Vivekananda Global / MNR / MIT–ADT / Jeppiaar / Bharati Vidyapeeth = +0.5</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-8 mb-4">
            EXPERIENCE (Max 5)
          </h3>
          <ul className="space-y-2 mb-4">
            <li><strong>Professional / Research Exp. | UG:</strong> Professional Experience 0–1 Year = +2</li>
            <li><strong>Professional / Research Exp. | PG:</strong> ≥2 Years = +5 · 1–2 Years = +4 · &lt;1 Year = +3 · Research Experience = +3 · Internship ≥12 Months = +2 · Internship &lt;12 Months = +1</li>
            <li><strong>Professional / Research Exp. | PhD:</strong> Research Experience ≥2 Years = +5 · Professional Experience ≥2 Years = +4 · Professional Experience 1–2 Years = +3 · Research / Teaching Assistant = +3</li>
            <li><strong>Internship Duration:</strong> ≥12 Months = +3 · 6–12 Months = +2.5 · 3–6 Months = +2 · 1–3 Months = +1</li>
            <li><strong>Internship Domain:</strong> Agentic AI / GenAI / AI / ML / LLM = +2 · NLP / CV / MLOps = +1.5 · Backend / Software / Cloud = +1 · Frontend / Mobile = +0.5</li>
            <li><strong>Company Tier:</strong> FAANG / OpenAI / Anthropic / DeepMind / NVIDIA / Meta AI / Microsoft AI / xAI / Amazon AGI / Tesla AI / Apple AI = +2 · Perplexity / Cohere / Mistral AI / Scale AI / Cognition / Cursor / Together AI / Writer / Adept = +1.5 · Sarvam AI / Krutrim / Fractal / Haptik / Yellow.ai / Uniphore = +1 · TCS / Infosys / Wipro / HCL / Accenture / Capgemini / Cognizant = ✗ (0)</li>
          </ul>
          
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded p-4 text-amber-800 dark:text-amber-300 text-sm">
            <strong>CRITICAL Disambiguation Rule:</strong> If the résumé explicitly titles the role "Intern"/"Internship", it does NOT count under Professional/Research Exp at all. It is scored ONLY through the internship-specific paths.
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-8 mb-4">
            PROJECTS (Max 5)
          </h3>
          <ul className="space-y-2 mb-4">
            <li><strong>Substance (Max 3, AI weighted 2×):</strong> ≥3 AI-equivalent = 3 · 2 = 2 · 1 = 1.5 · Academic/Mini project only = 0.75 · None = 0 · Hackathon project = +0.25</li>
            <li><strong>Deployment Maturity (Max 2):</strong> Live — Paying Customers = 2 · Live — Internal/Free Users = 1.4 · In Staging (working) = 0.6 · Not yet/still building = 0</li>
          </ul>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded p-4 text-amber-800 dark:text-amber-300 text-sm space-y-2">
            <p><strong>CRITICAL Rule #1 (Substance):</strong> Only count work that is described in the résumé's dedicated "Projects" section (or the form's current_project field). Do NOT count deliverables from the candidate's "Experience"/internship section.</p>
            <p><strong>CRITICAL Rule #2 (Substance):</strong> Only count a project if its description gives concrete, specific detail about what the candidate actually built. Generic/templated boilerplate does NOT count.</p>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-8 mb-4">
            ARTIFACT (Max 2)
          </h3>
          <p className="mb-2"><strong>Demo link only — GitHub column gives NO points.</strong></p>
          <ul className="space-y-2">
            <li>Loom / Vimeo / YouTube = 2</li>
            <li>Deployment URL/website (Vercel, etc.) = 1.5</li>
            <li>Google Drive = 1</li>
            <li>GitHub = 0.5</li>
            <li>Invalid/None = 0 → Demo cell flagged RED</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-8 mb-4">
            SKILLS (Max 4)
          </h3>
          <p className="mb-2"><strong>0.2 each, capped at 4.0:</strong></p>
          <p className="leading-relaxed">
            Agentic AI (0.4) · Multimodal AI (0.4) · LLM Orchestration · MCP · RAG · Embeddings/Vector DB · Fine-tuning (LoRA/PEFT) · Reasoning Models · Evals · Python · AI Coding Tools · NLP · Deep Learning · Computer Vision · Reinforcement Learning · Prompt Engineering · LangChain/LangGraph · API Integration · Workflow Automation (n8n/Zapier) · Cloud Deployment (AWS/GCP/Azure)
          </p>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-8 mb-4">
            DOMAIN EXPERTISE (Label, not scored)
          </h3>
          <ul className="space-y-2">
            <li><strong>Domains:</strong> Travel · Healthcare · Content · Retail · Creator Economy</li>
            <li><strong>Strong (Dark Green):</strong> Industry problem + advanced AI + complex + not a student project</li>
            <li><strong>Good (Light Green):</strong> Function problem + advanced AI + complex + not a common student project</li>
            <li><strong>Need Clarity (Pink):</strong> Unclear/unassessable</li>
            <li><strong>Invalid (Red):</strong> Everything else or common student project</li>
          </ul>

        </CardContent>
      </Card>
    </div>
  );
};

export default RubricsView;
