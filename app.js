// Recruiting HR Portal Controller Script
// Manages local state, filters, modal forms, statistics, and syncs with supabase.js

// Mock Candidates Database for Demo mode
const MOCK_CANDIDATES = [
  {
    id: 1,
    submission_date: "2026-07-01T10:15:30Z",
    full_name: "Aarav Mehta",
    email: "aarav.mehta@university.edu",
    phone: "+91 98765 43210",
    linkedin: "https://linkedin.com/in/aaravmehta",
    location: "Mumbai, India",
    preferred_start_date: "2026-08-15",
    education_level: "B.Tech",
    ug_university: "IIT Bombay",
    masters_university: null,
    course_major: "Computer Science",
    degree_status: "Graduated",
    completion_year: 2025,
    programming_languages: "Python, C++, Javascript, Go",
    aiml_experience: "2 Years",
    claude_ecosystem: "Tier 3",
    skill_python: 5,
    skill_deep_learning: 4,
    skill_nlp: 4,
    skill_computer_vision: 3,
    skill_reinforcement_learning: 2,
    skill_multimodal_ai: 4,
    skill_finetuning_lora_peft: 4,
    skill_llm_orchestration: 5,
    skill_agent_fundamentals: 5,
    skill_mcp: 4,
    skill_embeddings_vector_rag: 5,
    skill_reasoning_models: 4,
    skill_evals: 3,
    skill_ai_coding_tools: 5,
    skill_rag: 5,
    current_project: "Multi-agent repository analyzer using MCP server protocols to parse dependency trees.",
    project_state: "Production",
    project_category: "AI Coding Agents",
    demo_link: "https://demo.aarav.dev",
    github_url: "https://github.com/aaravmehta/mcp-analyzer",
    preferred_industry: "Artificial Intelligence",
    open_to_onsite: "Yes",
    open_to_travel: "Yes",
    anything_else: "Highly interested in generative AI orchestration.",
    applied_role: "ML Engineer Intern",
    job_id: "JOB-ML-01",
    rubric_id: "RUBRIC-V2",
    screening_type: "Standard",
    resume_drive_url: "https://drive.google.com/file/d/sample-aarav/view",
    resume_filename: "Aarav_Mehta_Resume.pdf",
    Analysis_status: "Completed",
    round_1_evaluation: {
      gender: "Male",
      cat: "UG",
      graduation: "2025",
      tier: "T1+",
      total: 19.5,
      edu: 5.0,
      exp: 4.5,
      proj: 5.0,
      substance: 4.5,
      deploy: 5.0,
      artifact: 2.0,
      skills: 4.0,
      domain: "GenAI Orchestration",
      degree: "B.Tech CS",
      stream: "Computer Science",
      college: "IIT Bombay",
      location: "Mumbai",
      ai_proj: 5.0,
      fs_proj: 4.0,
      intern_mo: 6.0,
      co_tier: 1.0,
      deploy_stage: "Production Vercel",
      num_skills: 12,
      claude_lvl: "Advanced",
      aiml_exp: "24 months relevant AI project build time",
      demo_explanation: "Advanced MCP server codebase connecting vector databases to agent networks.",
      demo_review_notes_ai: "Claude Evaluation: Aarav displays state-of-the-art understanding of Model Context Protocol (MCP) and multi-agent interaction. Excellent codebase structure, solid typescript implementation, proper error boundaries. Code is clean and modular. Highly recommended for immediate interview advancement.",
      mg_review: "Audited - scores look accurate.",
      mg_interview_priority: "High",
      review_comments: "Incredible AI portfolio. Code structure looks professional.",
      app_status: "Yes",
      eval_group: "Dharti"
    },
    round_2_evaluation: {
      when_can_they_start: "15-08-2026",
      duration_months: "6 months",
      demo_review_comment: "The candidate demonstrated the multi-agent orchestration setup in real-time. Depth of build is high, candidate clearly understands asynchronous worker coordination and caching layers.",
      product_depth: "Deep technical architecture utilizing Redis and queues.",
      complexity: "High",
      tech_stack: "TypeScript, Python, FastAPI, Redis, Supabase",
      solves_business_problem: "Yes",
      moved_to_round_3: "Yes"
    },
    round_3_evaluation: {
      review_comments: "Excellent cultural fit and raw problem-solving capability. Strong design patterns knowledge.",
      verdict: "Yes"
    }
  },
  {
    id: 2,
    submission_date: "2026-07-02T11:30:10Z",
    full_name: "Sofia Rodriguez",
    email: "sofia.rod@state.edu",
    phone: "+1 415 555 0192",
    linkedin: "https://linkedin.com/in/sofiarod",
    location: "San Francisco, USA",
    preferred_start_date: "2026-09-01",
    education_level: "M.S.",
    ug_university: "UC Berkeley",
    masters_university: "Stanford University",
    course_major: "Data Science",
    degree_status: "Ongoing",
    completion_year: 2026,
    programming_languages: "Python, R, SQL, PyTorch",
    aiml_experience: "1 Year",
    claude_ecosystem: "Tier 2",
    skill_python: 4,
    skill_deep_learning: 5,
    skill_nlp: 5,
    skill_computer_vision: 2,
    skill_reinforcement_learning: 2,
    skill_multimodal_ai: 3,
    skill_finetuning_lora_peft: 4,
    skill_llm_orchestration: 3,
    skill_agent_fundamentals: 3,
    skill_mcp: 2,
    skill_embeddings_vector_rag: 4,
    skill_reasoning_models: 3,
    skill_evals: 4,
    skill_ai_coding_tools: 4,
    skill_rag: 4,
    current_project: "Fine-tuning Llama-3 models on legal compliance documents using LoRA and PEFT techniques.",
    project_state: "Staging",
    project_category: "LLM Fine-tuning",
    demo_link: "https://huggingface.co/spaces/sofiarod/legal-finetuner",
    github_url: "https://github.com/sofiarod/legal-peft",
    preferred_industry: "LegalTech / FinTech",
    open_to_onsite: "Yes",
    open_to_travel: "Negotiable",
    anything_else: "Looking for an internship before graduating in Spring 2026.",
    applied_role: "AI Research Intern",
    job_id: "JOB-AI-02",
    rubric_id: "RUBRIC-V2",
    screening_type: "Standard",
    resume_drive_url: "https://drive.google.com/file/d/sample-sofia/view",
    resume_filename: "Sofia_Rodriguez_Resume.pdf",
    Analysis_status: "Completed",
    round_1_evaluation: {
      gender: "Female",
      cat: "PG",
      graduation: "2026",
      tier: "T1",
      total: 17.0,
      edu: 4.8,
      exp: 3.8,
      proj: 4.2,
      substance: 4.0,
      deploy: 3.5,
      artifact: 1.5,
      skills: 3.8,
      domain: "LLM Finetuning",
      degree: "MS Data Science",
      stream: "Data Science",
      college: "Stanford University",
      location: "San Francisco",
      ai_proj: 4.5,
      fs_proj: 3.0,
      intern_mo: 3.0,
      co_tier: 2.0,
      deploy_stage: "HuggingFace Space",
      num_skills: 10,
      claude_lvl: "Intermediate",
      aiml_exp: "12 months data analysis and fine-tuning experiments",
      demo_explanation: "Fine-tuning pipeline with weights hosted on Hugging Face.",
      demo_review_notes_ai: "Claude Evaluation: Sofia exhibits high capability in model parameter tuning and hyperparameter optimization. Her dataset curation and prep logic are outstanding. The project is hosted on HuggingFace Spaces but lacks a custom UI wrapper, which lowers the deployment score slightly. Substance is solid.",
      mg_review: "Looks good.",
      mg_interview_priority: "Medium",
      review_comments: "Excellent school tier background. Stanford MS data sciences candidate.",
      app_status: "Yes",
      eval_group: "Jal"
    },
    round_2_evaluation: {
      when_can_they_start: "01-09-2026",
      duration_months: "3 months",
      demo_review_comment: "Demonstrated fine-tuning results. The stack is clean. Good grasp of training mechanics, though deployment details are generic.",
      product_depth: "Good dataset cleanup routines, training code is reproducible.",
      complexity: "Medium",
      tech_stack: "Python, PyTorch, HuggingFace Transformers, LoRA",
      solves_business_problem: "Yes",
      moved_to_round_3: "Maybe"
    },
    round_3_evaluation: {
      review_comments: "Recruiter to review start dates alignment. Standard competency is high.",
      verdict: ""
    }
  },
  {
    id: 3,
    submission_date: "2026-07-03T09:40:22Z",
    full_name: "Rahul Verma",
    email: "rahul.verma@nit.edu",
    phone: "+91 87654 32109",
    linkedin: "https://linkedin.com/in/rahulverma",
    location: "Delhi, India",
    preferred_start_date: "2026-08-01",
    education_level: "B.Tech",
    ug_university: "NIT Trichy",
    masters_university: null,
    course_major: "Electronics",
    degree_status: "Graduated",
    completion_year: 2025,
    programming_languages: "Python, C++, Java",
    aiml_experience: "Under 1 Year",
    claude_ecosystem: "Tier 1",
    skill_python: 3,
    skill_deep_learning: 3,
    skill_nlp: 2,
    skill_computer_vision: 4,
    skill_reinforcement_learning: 1,
    skill_multimodal_ai: 2,
    skill_finetuning_lora_peft: 2,
    skill_llm_orchestration: 3,
    skill_agent_fundamentals: 2,
    skill_mcp: 1,
    skill_embeddings_vector_rag: 3,
    skill_reasoning_models: 2,
    skill_evals: 2,
    skill_ai_coding_tools: 3,
    skill_rag: 3,
    current_project: "Simple web dashboard using Streamlit to classify input images into 5 categories using ResNet.",
    project_state: "Staging",
    project_category: "Computer Vision",
    demo_link: "https://streamlit.nit.edu/rahul-resnet",
    github_url: "https://github.com/rahulverma/resnet-classifier",
    preferred_industry: "Software Engineering",
    open_to_onsite: "Negotiable",
    open_to_travel: "No",
    anything_else: "Looking for an entry level ML role.",
    applied_role: "Software Engineer (ML)",
    job_id: "JOB-SWE-03",
    rubric_id: "RUBRIC-V2",
    screening_type: "Standard",
    resume_drive_url: "https://drive.google.com/file/d/sample-rahul/view",
    resume_filename: "Rahul_Verma_Resume.pdf",
    Analysis_status: "Completed",
    round_1_evaluation: {
      gender: "Male",
      cat: "UG",
      graduation: "2025",
      tier: "T2+",
      total: 11.2,
      edu: 3.5,
      exp: 2.0,
      proj: 2.5,
      substance: 2.5,
      deploy: 2.5,
      artifact: 1.0,
      skills: 2.2,
      domain: "Computer Vision",
      degree: "B.Tech ECE",
      stream: "Electronics",
      college: "NIT Trichy",
      location: "Delhi",
      ai_proj: 2.5,
      fs_proj: 2.0,
      intern_mo: 0.0,
      co_tier: 3.0,
      deploy_stage: "Streamlit share",
      num_skills: 5,
      claude_lvl: "Beginner",
      aiml_exp: "6 months simple visual classification projects",
      demo_explanation: "Basic Streamlit loader and image classification loop.",
      demo_review_notes_ai: "Claude Evaluation: Rahul's project utilizes standard out-of-the-box model architecture (ResNet50) without fine-tuning or customized head weights. Code is minimal and relies heavily on tutorial code. Lacks deployment optimization or robust system design. Not recommended for core AI research but could fit general SWE.",
      mg_review: "Accurate evaluation.",
      mg_interview_priority: "Low",
      review_comments: "Candidate skills are slightly basic for the ML Engineer profile.",
      app_status: "Reject",
      eval_group: "Agni"
    },
    round_2_evaluation: null,
    round_3_evaluation: null
  },
  {
    id: 4,
    submission_date: "2026-07-04T14:20:00Z",
    full_name: "Emma Watson",
    email: "emma.watson@oxford.edu",
    phone: "+44 20 7946 0958",
    linkedin: "https://linkedin.com/in/emmawatson-ox",
    location: "London, UK",
    preferred_start_date: "2026-10-01",
    education_level: "Ph.D.",
    ug_university: "Oxford University",
    masters_university: "Oxford University",
    course_major: "Machine Learning",
    degree_status: "Graduated",
    completion_year: 2026,
    programming_languages: "Python, PyTorch, C++, R, Julia",
    aiml_experience: "3+ Years",
    claude_ecosystem: "Tier 3",
    skill_python: 5,
    skill_deep_learning: 5,
    skill_nlp: 4,
    skill_computer_vision: 4,
    skill_reinforcement_learning: 5,
    skill_multimodal_ai: 5,
    skill_finetuning_lora_peft: 4,
    skill_llm_orchestration: 4,
    skill_agent_fundamentals: 4,
    skill_mcp: 3,
    skill_embeddings_vector_rag: 4,
    skill_reasoning_models: 5,
    skill_evals: 4,
    skill_ai_coding_tools: 4,
    skill_rag: 4,
    current_project: "Novel Reinforcement Learning from Human Feedback (RLHF) algorithms optimization for reasoning models.",
    project_state: "Production",
    project_category: "RLHF / Alignment",
    demo_link: "https://oxford.ai/research/rlhf-optimizer",
    github_url: "https://github.com/emmawatson/rlhf-opt",
    preferred_industry: "AI Alignment Lab",
    open_to_onsite: "Negotiable",
    open_to_travel: "Yes",
    anything_else: "Publications in NeurIPS and ICML.",
    applied_role: "Senior AI Researcher",
    job_id: "JOB-RES-01",
    rubric_id: "RUBRIC-V2",
    screening_type: "Standard",
    resume_drive_url: "https://drive.google.com/file/d/sample-emma/view",
    resume_filename: "Emma_Watson_CV.pdf",
    Analysis_status: "Completed",
    round_1_evaluation: {
      gender: "Female",
      cat: "PG",
      graduation: "2026",
      tier: "T1+",
      total: 20.8,
      edu: 5.0,
      exp: 5.0,
      proj: 5.0,
      substance: 5.0,
      deploy: 4.8,
      artifact: 2.0,
      skills: 4.0,
      domain: "RLHF / Reasoning",
      degree: "PhD ML",
      stream: "Machine Learning",
      college: "Oxford University",
      location: "London",
      ai_proj: 5.0,
      fs_proj: 3.5,
      intern_mo: 12.0,
      co_tier: 1.0,
      deploy_stage: "Staging and Paper publish",
      num_skills: 14,
      claude_lvl: "Advanced",
      aiml_exp: "40+ months deep reinforcement learning experience",
      demo_explanation: "PyTorch framework implementing novel alignment reward curves.",
      demo_review_notes_ai: "Claude Evaluation: Emma's profile is world-class. Her research on reward reward curves is state-of-the-art. Codebase demonstrates high engineering discipline. Lacks standard commercial full-stack components, but more than makes up for it in algorithmic substance.",
      mg_review: "Stunning profile.",
      mg_interview_priority: "Critical",
      review_comments: "Top tier academic record. Immediate fast-track candidate.",
      app_status: "Yes",
      eval_group: "Vayu"
    },
    round_2_evaluation: {
      when_can_they_start: "01-10-2026",
      duration_months: "12 months",
      demo_review_comment: "Deep discussion. Understands optimizer level mathematics thoroughly.",
      product_depth: "Exceptional code quality and performance profiling.",
      complexity: "High",
      tech_stack: "Python, PyTorch, Triton, CUDA",
      solves_business_problem: "Yes",
      moved_to_round_3: "Yes"
    },
    round_3_evaluation: {
      review_comments: "Outstanding final interview loop. Strongly recommend hire.",
      verdict: "Yes"
    }
  },
  {
    id: 5,
    submission_date: "2026-07-05T10:00:00Z",
    full_name: "Vikram Malhotra",
    email: "vikram@delhitech.edu",
    phone: "+91 99999 11111",
    linkedin: "https://linkedin.com/in/vikramm",
    location: "Delhi, India",
    preferred_start_date: "2026-08-10",
    education_level: "B.Tech",
    ug_university: "DTU Delhi",
    masters_university: null,
    course_major: "Information Technology",
    degree_status: "Graduated",
    completion_year: 2025,
    programming_languages: "Python, Javascript, Rust, HTML/CSS",
    aiml_experience: "1.5 Years",
    claude_ecosystem: "Tier 2",
    skill_python: 4,
    skill_deep_learning: 4,
    skill_nlp: 3,
    skill_computer_vision: 3,
    skill_reinforcement_learning: 2,
    skill_multimodal_ai: 3,
    skill_finetuning_lora_peft: 3,
    skill_llm_orchestration: 4,
    skill_agent_fundamentals: 4,
    skill_mcp: 3,
    skill_embeddings_vector_rag: 4,
    skill_reasoning_models: 3,
    skill_evals: 3,
    skill_ai_coding_tools: 4,
    skill_rag: 4,
    current_project: "Visual RAG system using Claude multimodal APIs to search through company blueprints and PDF reports.",
    project_state: "Staging",
    project_category: "Multimodal AI",
    demo_link: "https://blueprint-rag.vikram.xyz",
    github_url: "https://github.com/vikramm/multimodal-rag",
    preferred_industry: "Enterprise SaaS",
    open_to_onsite: "Yes",
    open_to_travel: "Yes",
    anything_else: "Strong experience building responsive frontends.",
    applied_role: "AI Application Developer",
    job_id: "JOB-DEV-04",
    rubric_id: "RUBRIC-V2",
    screening_type: "Standard",
    resume_drive_url: "https://drive.google.com/file/d/sample-vikram/view",
    resume_filename: "Vikram_Malhotra_Resume.pdf",
    Analysis_status: "Completed",
    round_1_evaluation: {
      gender: "Male",
      cat: "UG",
      graduation: "2025",
      tier: "T2",
      total: 15.5,
      edu: 4.2,
      exp: 3.5,
      proj: 4.0,
      substance: 3.8,
      deploy: 4.0,
      artifact: 1.5,
      skills: 3.5,
      domain: "Multimodal RAG",
      degree: "B.Tech IT",
      stream: "Information Technology",
      college: "DTU Delhi",
      location: "Delhi",
      ai_proj: 4.0,
      fs_proj: 4.5,
      intern_mo: 4.0,
      co_tier: 2.0,
      deploy_stage: "Staging URL available",
      num_skills: 9,
      claude_lvl: "Intermediate",
      aiml_exp: "18 months building fullstack apps with AI wrappers",
      demo_explanation: "Multimodal RAG parsing PDF diagrams and blueprints.",
      demo_review_notes_ai: "Claude Evaluation: Vikram's fullstack integration is extremely robust. The frontend is beautiful, responsive, and handles file uploads smoothly. RAG search works well, although vector chunking logic on blueprints could be optimized. Great potential for user-facing AI roles.",
      mg_review: "Solid build.",
      mg_interview_priority: "Medium",
      review_comments: "Very strong fullstack capabilities. Good candidate for engineering.",
      app_status: "Yes",
      eval_group: "Akash"
    },
    round_2_evaluation: {
      when_can_they_start: "10-08-2026",
      duration_months: "6 months",
      demo_review_comment: "Demonstrated full product. Very clean React flow. Well thought out vector storage mechanics.",
      product_depth: "Good RAG integration, frontend logic is pristine.",
      complexity: "Medium",
      tech_stack: "React, Tailwind, Node.js, Pinecone, Claude API",
      solves_business_problem: "Yes",
      moved_to_round_3: "Yes"
    },
    round_3_evaluation: {
      review_comments: "Communication was excellent. Ready to issue offer.",
      verdict: "Yes"
    }
  },
  {
    id: 6,
    submission_date: "2026-07-06T15:00:00Z",
    full_name: "Anika Sharma",
    email: "anika@bits.edu",
    phone: "+91 99887 76655",
    linkedin: "https://linkedin.com/in/anika-sharma",
    location: "Bangalore, India",
    preferred_start_date: "2026-08-20",
    education_level: "B.Tech",
    ug_university: "BITS Pilani",
    masters_university: null,
    course_major: "Computer Science",
    degree_status: "Graduated",
    completion_year: 2025,
    programming_languages: "Python, Javascript, SQL, HTML",
    aiml_experience: "1 Year",
    claude_ecosystem: "Tier 2",
    skill_python: 4,
    skill_deep_learning: 3,
    skill_nlp: 4,
    skill_computer_vision: 2,
    skill_reinforcement_learning: 1,
    skill_multimodal_ai: 3,
    skill_finetuning_lora_peft: 2,
    skill_llm_orchestration: 4,
    skill_agent_fundamentals: 3,
    skill_mcp: 2,
    skill_embeddings_vector_rag: 4,
    skill_reasoning_models: 3,
    skill_evals: 3,
    skill_ai_coding_tools: 4,
    skill_rag: 4,
    current_project: "LLM agent helper to automate drafting customized sales outreach emails based on LinkedIn profiles.",
    project_state: "Staging",
    project_category: "Agent Applications",
    demo_link: "https://sales-agent.anika.dev",
    github_url: "https://github.com/anikasharma/sales-outreach-agent",
    preferred_industry: "SaaS / SalesTech",
    open_to_onsite: "Yes",
    open_to_travel: "Negotiable",
    anything_else: "Completed a 6 month internship in a growth stage startup.",
    applied_role: "Software Developer (AI Systems)",
    job_id: "JOB-DEV-05",
    rubric_id: "RUBRIC-V2",
    screening_type: "Standard",
    resume_drive_url: "https://drive.google.com/file/d/sample-anika/view",
    resume_filename: "Anika_Sharma_Resume.pdf",
    Analysis_status: "Completed",
    round_1_evaluation: {
      gender: "Female",
      cat: "UG",
      graduation: "2025",
      tier: "T1",
      total: 14.8,
      edu: 4.5,
      exp: 3.0,
      proj: 3.5,
      substance: 3.5,
      deploy: 3.8,
      artifact: 1.5,
      skills: 3.5,
      domain: "Agent Workflows",
      degree: "B.Tech CS",
      stream: "Computer Science",
      college: "BITS Pilani",
      location: "Bangalore",
      ai_proj: 3.5,
      fs_proj: 4.0,
      intern_mo: 6.0,
      co_tier: 2.0,
      deploy_stage: "Vercel live deployment",
      num_skills: 8,
      claude_lvl: "Intermediate",
      aiml_exp: "12 months agent building experience",
      demo_explanation: "Sales assistant scraping info and drafting personalized email outreach.",
      demo_review_notes_ai: "Claude Evaluation: Anika has built a very practical automation workflow. Email outputs are well-crafted using prompt engineering frameworks. Code is clean and functional, utilizing standard APIs. System latency could be improved via parallelizing scraper threads, but overall a solid delivery.",
      mg_review: "Looks solid.",
      mg_interview_priority: "Medium",
      review_comments: "Interesting practical utility. Good college tier (BITS).",
      app_status: "Maybe",
      eval_group: "Bijli"
    },
    round_2_evaluation: null,
    round_3_evaluation: null
  }
];

// Tier Weights mapping for sorting candidates
const TIER_WEIGHTS = {
  'T1+': 6,
  'T1': 5,
  'T2+': 4,
  'T2': 3,
  'T3': 2,
  'T4': 1
};

// App State Management
class AppState {
  constructor() {
    this.candidates = [];
    this.currentViewCandidates = [];
    this.selectedCandidate = null;
    this.isDemoMode = false;
    this.currentTab = 'round1'; // Defaults to Recruiter Portal
    this.selectedClan = null; // Currently entered clan in Evaluator Hub
    
    // R1 Filters
    this.r1Search = '';
    this.r1Tier = '';
    this.r1Status = '';
    
    // R2 Filters (Clan Search)
    this.r2Search = '';
  }

  async loadData() {
    try {
      this.updateStatusBadge('connecting', 'Connecting...');
      const remoteData = await window.supabaseConnector.fetchCandidates();
      
      // Clean up remote data format if needed
      this.candidates = this.normalizeCandidates(remoteData);
      this.isDemoMode = false;
      this.updateStatusBadge('connected', 'Supabase DB Live');
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to mock data:", err);
      // Fallback to mock
      this.candidates = JSON.parse(JSON.stringify(MOCK_CANDIDATES));
      this.isDemoMode = true;
      this.updateStatusBadge('demo', 'Demo Mock Mode');
      this.showToast("Database connection failed. Loaded local data.");
    }
    
    this.applyAllFilters();
  }

  normalizeCandidates(data) {
    if (!data) return [];
    return data.map(cand => {
      // Ensure evaluation objects exist in expected structure, even if null in Postgres
      return {
        ...cand,
        round_1_evaluation: cand.round_1_evaluation && cand.round_1_evaluation[0] ? cand.round_1_evaluation[0] : (cand.round_1_evaluation || null),
        round_2_evaluation: cand.round_2_evaluation && cand.round_2_evaluation[0] ? cand.round_2_evaluation[0] : (cand.round_2_evaluation || null),
        round_3_evaluation: cand.round_3_evaluation && cand.round_3_evaluation[0] ? cand.round_3_evaluation[0] : (cand.round_3_evaluation || null),
      };
    });
  }

  updateStatusBadge(state, text) {
    const badge = document.getElementById('dbStatusBadge');
    badge.className = 'db-status-badge ' + state;
    badge.querySelector('.status-text').innerText = text;
  }

  // Classify candidates into 4 priority categories based on tier & score
  classifyCandidate(c) {
    const r1 = c.round_1_evaluation;
    if (!r1) return 'invalid';
    const score = parseFloat(r1.total) || 0;
    
    if (score >= 16) return 'strong';
    if (score >= 12 && score < 16) return 'good';
    if (score >= 8 && score < 12) return 'clarity';
    return 'invalid';
  }

  // Sort candidate lists by Tier weight first, then by tier score (total) descending
  sortCandidates(list) {
    return list.sort((a, b) => {
      const r1A = a.round_1_evaluation;
      const r1B = b.round_1_evaluation;
      
      const tierA = r1A ? r1A.tier : '';
      const tierB = r1B ? r1B.tier : '';
      const weightA = TIER_WEIGHTS[tierA] || 0;
      const weightB = TIER_WEIGHTS[tierB] || 0;
      
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      
      const scoreA = r1A ? parseFloat(r1A.total) || 0 : 0;
      const scoreB = r1B ? parseFloat(r1B.total) || 0 : 0;
      return scoreB - scoreA;
    });
  }

  applyAllFilters() {
    if (this.currentTab === 'round1') {
      // Recruiter Portal Filters
      const filtered = this.candidates.filter(c => {
        const matchesSearch = c.full_name.toLowerCase().includes(this.r1Search) || 
                              (c.email && c.email.toLowerCase().includes(this.r1Search)) || 
                              (c.ug_university && c.ug_university.toLowerCase().includes(this.r1Search));
        
        const r1 = c.round_1_evaluation;
        const matchesTier = !this.r1Tier || (r1 && r1.tier === this.r1Tier);
        
        let matchesStatus = true;
        if (this.r1Status) {
          if (this.r1Status === 'pending') {
            matchesStatus = !r1 || !r1.app_status || r1.app_status === '';
          } else {
            matchesStatus = r1 && r1.app_status === this.r1Status;
          }
        }

        return matchesSearch && matchesTier && matchesStatus;
      });

      // Split filtered list into priority groups and sort them
      const strong = this.sortCandidates(filtered.filter(c => this.classifyCandidate(c) === 'strong'));
      const good = this.sortCandidates(filtered.filter(c => this.classifyCandidate(c) === 'good'));
      const clarity = this.sortCandidates(filtered.filter(c => this.classifyCandidate(c) === 'clarity'));
      const invalid = this.sortCandidates(filtered.filter(c => this.classifyCandidate(c) === 'invalid'));

      this.renderPriorityTable('strong', strong);
      this.renderPriorityTable('good', good);
      this.renderPriorityTable('clarity', clarity);
      this.renderPriorityTable('invalid', invalid);

    } else if (this.currentTab === 'evalportal') {
      // Update counts for each clan inside the hub cards
      const clans = ['Dharti', 'Jal', 'Agni', 'Vayu', 'Akash', 'Bijli'];
      clans.forEach(clan => {
        const count = this.candidates.filter(c => {
          const r1 = c.round_1_evaluation;
          return r1 && r1.app_status === 'Yes' && r1.eval_group === clan;
        }).length;
        document.getElementById(`badge-${clan}`).innerText = `${count} Candidate${count !== 1 ? 's' : ''}`;
      });

      // If inside a clan worksheet, filter & render the clan list
      if (this.selectedClan) {
        this.currentViewCandidates = this.candidates.filter(c => {
          const r1 = c.round_1_evaluation;
          const isAssigned = r1 && r1.app_status === 'Yes' && r1.eval_group === this.selectedClan;
          if (!isAssigned) return false;

          const matchesSearch = c.full_name.toLowerCase().includes(this.r2Search) ||
                                (c.round_2_evaluation && c.round_2_evaluation.tech_stack && c.round_2_evaluation.tech_stack.toLowerCase().includes(this.r2Search));
          return matchesSearch;
        });

        this.renderClanPortalTable();
      }
    }
  }

  // Renders a Recruiter priority table
  renderPriorityTable(category, list) {
    const countBadge = document.getElementById(`count-${category}`);
    const tbody = document.getElementById(`table-${category}-body`);
    
    countBadge.innerText = list.length;
    tbody.innerHTML = '';

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="loading-state">No candidates in this priority level.</td></tr>`;
      return;
    }

    list.forEach(cand => {
      const r1 = cand.round_1_evaluation;
      const tier = r1 ? r1.tier || 'N/A' : 'N/A';
      const score = r1 ? r1.total || '0' : '0';
      const edu = r1 ? r1.edu || '0' : '0';
      const exp = r1 ? r1.exp || '0' : '0';
      const proj = r1 ? r1.proj || '0' : '0';
      
      const summary = r1 && r1.demo_review_notes_ai ? r1.demo_review_notes_ai : (cand.anything_else || 'No summary notes');
      
      let statusClass = 'status-pending';
      let statusText = 'Pending';
      if (r1 && r1.app_status) {
        if (r1.app_status === 'Yes') {
          statusClass = 'status-moved';
          statusText = 'Yes (R2)';
        } else if (r1.app_status === 'Reject') {
          statusClass = 'status-rejected';
          statusText = 'Reject';
        } else if (r1.app_status === 'Maybe') {
          statusClass = 'status-maybe';
          statusText = 'Maybe';
        } else if (r1.app_status === 'Duplicate') {
          statusClass = 'status-pending';
          statusText = 'Duplicate';
        }
      }

      tbody.innerHTML += `
        <tr>
          <td>#${cand.id}</td>
          <td>
            <div class="candidate-name-cell">${cand.full_name}</div>
            <div class="candidate-email-cell">${cand.email || ''}</div>
          </td>
          <td>
            <span class="badge badge-tier">${tier}</span>
            <div style="font-size: 0.75rem; margin-top: 2px; font-weight: 600; color: var(--primary)">Score: ${score}</div>
          </td>
          <td>
            <div class="subscores-row">
              <span class="subscore-pill" title="Education">Edu: ${edu}</span>
              <span class="subscore-pill" title="Experience">Exp: ${exp}</span>
              <span class="subscore-pill" title="Projects">Proj: ${proj}</span>
            </div>
          </td>
          <td>
            <div class="summary-bubble" title="${summary}">${summary}</div>
          </td>
          <td>
            <span class="badge badge-status ${statusClass}">${statusText}</span>
          </td>
          <td>
            <button class="btn btn-secondary btn-small" onclick="app.viewCandidateDetails(${cand.id})">
              <i class="fa-solid fa-folder-open"></i> Review & Screen
            </button>
          </td>
        </tr>
      `;
    });
  }

  // Renders the selected Clan candidates
  renderClanPortalTable() {
    const tbody = document.getElementById('evalPortalTableBody');
    tbody.innerHTML = '';

    if (this.currentViewCandidates.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="loading-state">No Round 2 candidates found in ${this.selectedClan} clan.</td></tr>`;
      return;
    }

    this.currentViewCandidates.forEach(cand => {
      const r2 = cand.round_2_evaluation;
      const stack = r2 ? r2.tech_stack || 'Not entered' : 'Not entered';
      const complexity = r2 ? r2.complexity || 'Pending' : 'Pending';
      const solves = r2 ? r2.solves_business_problem || 'Pending' : 'Pending';
      
      let nextStepBadge = '<span class="badge badge-status status-pending">Decision Pending</span>';
      if (r2 && r2.moved_to_round_3) {
        if (r2.moved_to_round_3 === 'Yes') {
          nextStepBadge = '<span class="badge badge-status status-moved">Yes (Move to R3)</span>';
        } else if (r2.moved_to_round_3 === 'Maybe') {
          nextStepBadge = '<span class="badge badge-status status-maybe">Maybe</span>';
        } else if (r2.moved_to_round_3 === 'No') {
          nextStepBadge = '<span class="badge badge-status status-rejected">No (Decline)</span>';
        }
      }

      tbody.innerHTML += `
        <tr>
          <td>#${cand.id}</td>
          <td>
            <div class="candidate-name-cell">${cand.full_name}</div>
            <div class="candidate-email-cell">${cand.email || ''}</div>
          </td>
          <td style="font-weight: 500; font-size: 0.8rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${stack}
          </td>
          <td>
            <span class="badge" style="background-color: var(--bg-cream); color: var(--text-dark)">${complexity}</span>
          </td>
          <td>
            <span class="badge" style="background-color: ${solves === 'Yes' ? '#e6ffed' : '#ffebe6'}; color: ${solves === 'Yes' ? '#00874c' : '#cc1e38'}">${solves}</span>
          </td>
          <td>${nextStepBadge}</td>
          <td>
            <button class="btn btn-secondary btn-small" onclick="app.viewEvaluatorVetting(${cand.id})">
              <i class="fa-solid fa-code"></i> Vet Tech Demo
            </button>
          </td>
        </tr>
      `;
    });
  }

  // Clan Routing Actions
  enterClan(clanName) {
    this.selectedClan = clanName;
    document.getElementById('selectedClanTitle').innerText = `${clanName} Clan Worksheet`;
    
    // Switch views
    document.getElementById('evalPortalHubView').style.display = 'none';
    document.getElementById('evalPortalQueueView').style.display = 'block';
    
    // Clear clan search input
    document.getElementById('r2Search').value = '';
    this.r2Search = '';
    
    this.applyAllFilters();
  }

  exitClan() {
    this.selectedClan = null;
    
    // Switch views
    document.getElementById('evalPortalQueueView').style.display = 'none';
    document.getElementById('evalPortalHubView').style.display = 'block';
    
    this.applyAllFilters();
  }

  // Setup the full-page candidate detail view
  viewCandidateDetails(id) {
    const cand = this.candidates.find(c => c.id === id);
    if (!cand) return;
    this.selectedCandidate = cand;
    this.detailContext = 'r1';

    // Update back button
    document.getElementById('btnDetailBack').innerHTML = `<i class="fa-solid fa-arrow-left"></i> Back to Candidate List`;

    // Populate profile basics
    document.getElementById('detailCandName').innerText = cand.full_name;
    const r1 = cand.round_1_evaluation;
    document.getElementById('detailCandTier').innerText = r1 ? r1.tier || 'N/A' : 'N/A';
    document.getElementById('detailCandGroup').innerText = r1 ? r1.eval_group || 'No Clan Assigned' : 'No Clan Assigned';
    document.getElementById('detailCandStatus').innerText = 'Round 1 Screening';

    document.getElementById('detailEmail').innerText = cand.email || '-';
    document.getElementById('detailPhone').innerText = cand.phone || '-';
    document.getElementById('detailLocation').innerText = cand.location || '-';
    document.getElementById('detailStartDate').innerText = cand.preferred_start_date || '-';
    document.getElementById('detailEduLevel').innerText = cand.education_level || '-';
    document.getElementById('detailGradYear').innerText = cand.completion_year || '-';

    let collegesStr = cand.ug_university || '';
    if (cand.masters_university) {
      collegesStr += collegesStr ? ` & ${cand.masters_university}` : cand.masters_university;
    }
    document.getElementById('detailColleges').innerText = collegesStr || '-';
    document.getElementById('detailRole').innerText = cand.applied_role || '-';

    // Links setup
    const resumeBtn = document.getElementById('detailLinkResume');
    if (cand.resume_drive_url) {
      resumeBtn.href = cand.resume_drive_url;
      resumeBtn.style.display = 'inline-flex';
    } else {
      resumeBtn.style.display = 'none';
    }

    const githubBtn = document.getElementById('detailLinkGithub');
    if (cand.github_url) {
      githubBtn.href = cand.github_url;
      githubBtn.style.display = 'inline-flex';
    } else {
      githubBtn.style.display = 'none';
    }

    const demoBtn = document.getElementById('detailLinkDemo');
    if (cand.demo_link) {
      demoBtn.href = cand.demo_link;
      demoBtn.style.display = 'inline-flex';
    } else {
      demoBtn.style.display = 'none';
    }

    // Projects details
    document.getElementById('detailProjectCategory').innerText = cand.project_category || 'N/A';
    document.getElementById('detailProjectState').innerText = cand.project_state || 'Pending';
    document.getElementById('detailProjectExplanation').innerText = cand.current_project || 'No project explanation provided.';

    // AI assessment rubrics
    document.getElementById('detailScoreTotal').innerText = r1 ? r1.total || '0' : '0';
    document.getElementById('detailScoreEdu').innerText = r1 ? r1.edu || '0' : '0';
    document.getElementById('detailScoreExp').innerText = r1 ? r1.exp || '0' : '0';
    document.getElementById('detailScoreProj').innerText = r1 ? r1.proj || '0' : '0';
    document.getElementById('detailScoreSkills').innerText = r1 ? r1.skills || '0' : '0';
    document.getElementById('detailScoreClaudeNotes').innerText = r1 && r1.demo_review_notes_ai ? r1.demo_review_notes_ai : 'No evaluation summary from Claude.';

    // Populate skills progress bars
    const skillsList = [
      { name: 'Python', score: cand.skill_python },
      { name: 'Deep Learning', score: cand.skill_deep_learning },
      { name: 'NLP', score: cand.skill_nlp },
      { name: 'Computer Vision', score: cand.skill_computer_vision },
      { name: 'Reinforcement Learning', score: cand.skill_reinforcement_learning },
      { name: 'Multimodal AI', score: cand.skill_multimodal_ai },
      { name: 'Finetuning (LoRA)', score: cand.skill_finetuning_lora_peft },
      { name: 'LLM Orchestration', score: cand.skill_llm_orchestration },
      { name: 'Agent Fundamentals', score: cand.skill_agent_fundamentals },
      { name: 'MCP Protocols', score: cand.skill_mcp },
      { name: 'Vector Embeddings', score: cand.skill_embeddings_vector_rag },
      { name: 'Reasoning Models', score: cand.skill_reasoning_models },
      { name: 'Eval Frameworks', score: cand.skill_evals },
      { name: 'AI Coding Tools', score: cand.skill_ai_coding_tools },
      { name: 'Generic RAG', score: cand.skill_rag }
    ];

    const skillsGrid = document.getElementById('detailSkillsGrid');
    skillsGrid.innerHTML = '';
    skillsList.forEach(s => {
      const val = s.score || 0;
      let starsHTML = '';
      for (let i = 1; i <= 5; i++) {
        starsHTML += `<i class="fa-solid fa-star rating-star ${i <= val ? 'filled' : ''}"></i>`;
      }
      skillsGrid.innerHTML += `
        <div class="skill-bar-row">
          <div class="skill-label-wrap">
            <span class="skill-rating-label">${s.name}</span>
            <span style="font-weight:700; color: var(--primary);">${val}/5</span>
          </div>
          <div class="skill-dots">${starsHTML}</div>
        </div>
      `;
    });

    // Toggle forms
    document.getElementById('detailR2FormSection').style.display = 'none';
    document.getElementById('detailR1FormSection').style.display = 'block';

    // Populate R1 values
    document.getElementById('detailR1Status').value = r1 ? r1.app_status || '' : '';
    document.getElementById('detailR1Group').value = r1 ? r1.eval_group || '' : '';
    document.getElementById('detailR1Comments').value = r1 ? r1.review_comments || '' : '';

    this.switchTab('candidate-detail');
  }

  viewEvaluatorVetting(id) {
    const cand = this.candidates.find(c => c.id === id);
    if (!cand) return;
    this.selectedCandidate = cand;
    this.detailContext = 'r2';

    // Update back button
    document.getElementById('btnDetailBack').innerHTML = `<i class="fa-solid fa-arrow-left"></i> Back to ${this.selectedClan} Clan`;

    // Populate profile basics
    document.getElementById('detailCandName').innerText = cand.full_name;
    const r1 = cand.round_1_evaluation;
    const r2 = cand.round_2_evaluation;
    document.getElementById('detailCandTier').innerText = r1 ? r1.tier || 'N/A' : 'N/A';
    document.getElementById('detailCandGroup').innerText = r1 ? r1.eval_group || 'No Clan Assigned' : 'No Clan Assigned';
    document.getElementById('detailCandStatus').innerText = 'Round 2 Tech Vetting';

    document.getElementById('detailEmail').innerText = cand.email || '-';
    document.getElementById('detailPhone').innerText = cand.phone || '-';
    document.getElementById('detailLocation').innerText = cand.location || '-';
    document.getElementById('detailStartDate').innerText = cand.preferred_start_date || '-';
    document.getElementById('detailEduLevel').innerText = cand.education_level || '-';
    document.getElementById('detailGradYear').innerText = cand.completion_year || '-';

    let collegesStr = cand.ug_university || '';
    if (cand.masters_university) {
      collegesStr += collegesStr ? ` & ${cand.masters_university}` : cand.masters_university;
    }
    document.getElementById('detailColleges').innerText = collegesStr || '-';
    document.getElementById('detailRole').innerText = cand.applied_role || '-';

    // Links setup
    const resumeBtn = document.getElementById('detailLinkResume');
    if (cand.resume_drive_url) {
      resumeBtn.href = cand.resume_drive_url;
      resumeBtn.style.display = 'inline-flex';
    } else {
      resumeBtn.style.display = 'none';
    }

    const githubBtn = document.getElementById('detailLinkGithub');
    if (cand.github_url) {
      githubBtn.href = cand.github_url;
      githubBtn.style.display = 'inline-flex';
    } else {
      githubBtn.style.display = 'none';
    }

    const demoBtn = document.getElementById('detailLinkDemo');
    if (cand.demo_link) {
      demoBtn.href = cand.demo_link;
      demoBtn.style.display = 'inline-flex';
    } else {
      demoBtn.style.display = 'none';
    }

    // Projects details
    document.getElementById('detailProjectCategory').innerText = cand.project_category || 'N/A';
    document.getElementById('detailProjectState').innerText = cand.project_state || 'Pending';
    document.getElementById('detailProjectExplanation').innerText = cand.current_project || 'No project explanation provided.';

    // AI assessment rubrics
    document.getElementById('detailScoreTotal').innerText = r1 ? r1.total || '0' : '0';
    document.getElementById('detailScoreEdu').innerText = r1 ? r1.edu || '0' : '0';
    document.getElementById('detailScoreExp').innerText = r1 ? r1.exp || '0' : '0';
    document.getElementById('detailScoreProj').innerText = r1 ? r1.proj || '0' : '0';
    document.getElementById('detailScoreSkills').innerText = r1 ? r1.skills || '0' : '0';
    document.getElementById('detailScoreClaudeNotes').innerText = r1 && r1.demo_review_notes_ai ? r1.demo_review_notes_ai : 'No evaluation summary from Claude.';

    // Populate skills progress bars
    const skillsList = [
      { name: 'Python', score: cand.skill_python },
      { name: 'Deep Learning', score: cand.skill_deep_learning },
      { name: 'NLP', score: cand.skill_nlp },
      { name: 'Computer Vision', score: cand.skill_computer_vision },
      { name: 'Reinforcement Learning', score: cand.skill_reinforcement_learning },
      { name: 'Multimodal AI', score: cand.skill_multimodal_ai },
      { name: 'Finetuning (LoRA)', score: cand.skill_finetuning_lora_peft },
      { name: 'LLM Orchestration', score: cand.skill_llm_orchestration },
      { name: 'Agent Fundamentals', score: cand.skill_agent_fundamentals },
      { name: 'MCP Protocols', score: cand.skill_mcp },
      { name: 'Vector Embeddings', score: cand.skill_embeddings_vector_rag },
      { name: 'Reasoning Models', score: cand.skill_reasoning_models },
      { name: 'Eval Frameworks', score: cand.skill_evals },
      { name: 'AI Coding Tools', score: cand.skill_ai_coding_tools },
      { name: 'Generic RAG', score: cand.skill_rag }
    ];

    const skillsGrid = document.getElementById('detailSkillsGrid');
    skillsGrid.innerHTML = '';
    skillsList.forEach(s => {
      const val = s.score || 0;
      let starsHTML = '';
      for (let i = 1; i <= 5; i++) {
        starsHTML += `<i class="fa-solid fa-star rating-star ${i <= val ? 'filled' : ''}"></i>`;
      }
      skillsGrid.innerHTML += `
        <div class="skill-bar-row">
          <div class="skill-label-wrap">
            <span class="skill-rating-label">${s.name}</span>
            <span style="font-weight:700; color: var(--primary);">${val}/5</span>
          </div>
          <div class="skill-dots">${starsHTML}</div>
        </div>
      `;
    });

    // Toggle forms
    document.getElementById('detailR1FormSection').style.display = 'none';
    document.getElementById('detailR2FormSection').style.display = 'block';

    // Populate R2 values
    document.getElementById('detailR2Start').value = r2 ? r2.when_can_they_start || '' : '';
    document.getElementById('detailR2Duration').value = r2 ? r2.duration_months || '' : '';
    document.getElementById('detailR2Complexity').value = r2 ? r2.complexity || '' : '';
    document.getElementById('detailR2SolvesProblem').value = r2 ? r2.solves_business_problem || '' : '';
    document.getElementById('detailR2Stack').value = r2 ? r2.tech_stack || '' : '';
    document.getElementById('detailR2Comments').value = r2 ? r2.demo_review_comment || '' : '';
    document.getElementById('detailR2NextStep').value = r2 ? r2.moved_to_round_3 || '' : '';

    this.switchTab('candidate-detail');
  }

  async saveDetailChanges() {
    if (!this.selectedCandidate) return;
    const id = this.selectedCandidate.id;
    const saveBtn = document.getElementById('btnDetailSave');
    const statusText = document.getElementById('detailSaveStatusText');
    
    saveBtn.disabled = true;
    statusText.innerText = 'Saving decisions...';

    try {
      if (this.detailContext === 'r1') {
        const r1Status = document.getElementById('detailR1Status').value;
        const r1Group = document.getElementById('detailR1Group').value;
        const r1Comments = document.getElementById('detailR1Comments').value;

        if (this.isDemoMode) {
          const cand = this.candidates.find(c => c.id === id);
          cand.round_1_evaluation = cand.round_1_evaluation || {};
          cand.round_1_evaluation.app_status = r1Status;
          cand.round_1_evaluation.eval_group = r1Group;
          cand.round_1_evaluation.review_comments = r1Comments;
        } else {
          const r1Payload = {
            app_status: r1Status || null,
            eval_group: r1Group || null,
            review_comments: r1Comments || null
          };
          await window.supabaseConnector.upsertRound1(id, r1Payload);
          
          const remoteData = await window.supabaseConnector.fetchCandidates();
          this.candidates = this.normalizeCandidates(remoteData);
        }

        this.showToast('Round 1 screening details updated successfully!');
        this.switchTab('round1');
      } else if (this.detailContext === 'r2') {
        const r2Start = document.getElementById('detailR2Start').value;
        const r2Duration = document.getElementById('detailR2Duration').value;
        const r2Complexity = document.getElementById('detailR2Complexity').value;
        const r2Solves = document.getElementById('detailR2SolvesProblem').value;
        const r2Stack = document.getElementById('detailR2Stack').value;
        const r2Comments = document.getElementById('detailR2Comments').value;
        const r2NextStep = document.getElementById('detailR2NextStep').value;

        if (this.isDemoMode) {
          const cand = this.candidates.find(c => c.id === id);
          cand.round_2_evaluation = cand.round_2_evaluation || {};
          cand.round_2_evaluation.when_can_they_start = r2Start;
          cand.round_2_evaluation.duration_months = r2Duration;
          cand.round_2_evaluation.complexity = r2Complexity;
          cand.round_2_evaluation.solves_business_problem = r2Solves;
          cand.round_2_evaluation.tech_stack = r2Stack;
          cand.round_2_evaluation.demo_review_comment = r2Comments;
          cand.round_2_evaluation.moved_to_round_3 = r2NextStep;

          if (r2NextStep === 'Yes' || r2NextStep === 'Maybe') {
            cand.round_3_evaluation = cand.round_3_evaluation || {};
          } else {
            cand.round_3_evaluation = null;
          }
        } else {
          const r2Payload = {
            when_can_they_start: r2Start || null,
            duration_months: r2Duration || null,
            complexity: r2Complexity || null,
            solves_business_problem: r2Solves || null,
            tech_stack: r2Stack || null,
            demo_review_comment: r2Comments || null,
            moved_to_round_3: r2NextStep || null
          };
          await window.supabaseConnector.upsertRound2(id, r2Payload);

          if (r2NextStep === 'Yes' || r2NextStep === 'Maybe') {
            await window.supabaseConnector.upsertRound3(id, {});
          }
          
          const remoteData = await window.supabaseConnector.fetchCandidates();
          this.candidates = this.normalizeCandidates(remoteData);
        }

        this.showToast('Round 2 technical demo details updated successfully!');
        this.switchTab('evalportal');
      }
    } catch (err) {
      console.error(err);
      this.showToast('Failed to save to Supabase: ' + err.message);
    } finally {
      saveBtn.disabled = false;
      statusText.innerText = '';
    }
  }

  cancelDetailView() {
    if (this.detailContext === 'r2') {
      this.switchTab('evalportal');
    } else {
      this.switchTab('round1');
    }
    this.selectedCandidate = null;
  }

  showToast(message) {
    const toast = document.getElementById('toastNotification');
    document.getElementById('toastMessage').innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    
    // Manage tab panes
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');

    // Manage nav highlights
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Reset evaluator selected clan if switching tab
    if (tabId !== 'evalportal') {
      this.selectedClan = null;
      document.getElementById('evalPortalQueueView').style.display = 'none';
      document.getElementById('evalPortalHubView').style.display = 'block';
    }

    this.applyAllFilters();
  }
}

// Instantiate Global Application App
const app = new AppState();
window.app = app;

// Setup Event Listeners on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  // Load connection keys if previously stored
  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_key');
  
  if (localUrl) document.getElementById('settingsDbUrl').value = localUrl;
  if (localKey) document.getElementById('settingsDbKey').value = localKey;

  // Initial load
  app.loadData();

  // Navigation click routing
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      app.switchTab(btn.getAttribute('data-tab'));
    });
  });

  // Settings Modal triggers
  const settingsModal = document.getElementById('settingsModal');
  document.getElementById('btnSettings').addEventListener('click', () => {
    settingsModal.classList.add('open');
  });
  document.getElementById('btnSettingsClose').addEventListener('click', () => {
    settingsModal.classList.remove('open');
  });
  
  // Save Settings
  document.getElementById('btnSettingsSave').addEventListener('click', () => {
    const url = document.getElementById('settingsDbUrl').value;
    const key = document.getElementById('settingsDbKey').value;
    window.supabaseConnector.setCredentials(url, key);
    settingsModal.classList.remove('open');
    app.loadData();
  });

  // Clear Settings
  document.getElementById('btnSettingsClear').addEventListener('click', () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    document.getElementById('settingsDbUrl').value = '';
    document.getElementById('settingsDbKey').value = '';
    settingsModal.classList.remove('open');
    app.loadData();
  });

  // Detail page back, cancel, save triggers
  document.getElementById('btnDetailBack').addEventListener('click', () => app.cancelDetailView());
  document.getElementById('btnDetailCancel').addEventListener('click', () => app.cancelDetailView());
  document.getElementById('btnDetailSave').addEventListener('click', () => app.saveDetailChanges());

  // Set up Filter Input Event Listeners
  // R1 Filters
  document.getElementById('r1Search').addEventListener('input', (e) => {
    app.r1Search = e.target.value.toLowerCase();
    app.applyAllFilters();
  });
  document.getElementById('r1FilterTier').addEventListener('change', (e) => {
    app.r1Tier = e.target.value;
    app.applyAllFilters();
  });
  document.getElementById('r1FilterStatus').addEventListener('change', (e) => {
    app.r1Status = e.target.value;
    app.applyAllFilters();
  });

  // R2 Search Filter
  document.getElementById('r2Search').addEventListener('input', (e) => {
    app.r2Search = e.target.value.toLowerCase();
    app.applyAllFilters();
  });
});
