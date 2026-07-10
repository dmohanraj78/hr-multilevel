# AI Builder Intern Recruitment Suite - Documentation

This document provides a comprehensive guide for each of the four specialized portals in the AI Builder Intern recruitment suite. It details the purpose of each portal, the user roles, and the step-by-step actions that can be performed in each interface.

---

## 🌐 Overview of Deployed Portals

| Portal | Local Port | Production URL |
| :--- | :--- | :--- |
| **Recruiter Portal (Round 1)** | `5173` | [https://recruiter-portal-one.vercel.app](https://recruiter-portal-one.vercel.app) |
| **Evaluator Portal (Round 2)** | `5174` | [https://evaluator-portal-mu.vercel.app](https://evaluator-portal-mu.vercel.app) |
| **Executive Portal (Round 3)** | `5175` | [https://executive-portal-nine.vercel.app](https://executive-portal-nine.vercel.app) |
| **Master Control Portal (Unified)** | `5176` | [https://master-portal-kohl.vercel.app](https://master-portal-kohl.vercel.app) |

---

## 1. 📋 Recruiter Portal (Round 1 - Resume Vetting)

### Purpose
The Recruiter Portal is designed for the initial phase of applicant screening. The recruiter reviews the raw resume data, parsed candidate information, and assigns each candidate a tier and clan group.

### Actions to Perform
1. **Screen Candidate**:
   * Click **Review & Screen** on any candidate row to open their profile dossier.
   * View the applicant's raw details (Name, College, Github, Resume link).
2. **Assign Tier & Score**:
   * Evaluate the candidate's resume/profile.
   * Select a **Tier** classification (e.g., `T1+`, `T1`, `T2+`, `T2`, `T3`, `N/A`).
   * Enter a numeric **Total Score** (Rubric maximum 30).
3. **Assign Clan Group**:
   * Change the **Clan** dropdown directly in the candidate table or inside the dossier to route them to a specific technical team (e.g., `Dharti`, `Jal`, `Agni`, `Vayu`, `Akash`, `Bijli`).
4. **Approve or Reject**:
   * Set **App Status** to:
     * **Yes**: Promotes the applicant to **Round 2 (Technical Vetting)**.
     * **Reject**: Declines the applicant.
     * **Maybe**: Flags the applicant for subsequent review.

> [!NOTE]
> Setting the App Status to **Yes** automatically registers the applicant in the Round 2 Evaluator queue.

---

## 2. 💻 Evaluator Portal (Round 2 - Technical Clan Vetting)

### Purpose
The Evaluator Portal is used by technical team leads (divided into Clans) to perform in-depth evaluations of the applicant's demo projects, codebase depth, and overall technical capability.

### Actions to Perform
1. **Vet Candidate**:
   * Filter candidates by your specific Clan (e.g., `Dharti`).
   * Click **Vet Candidate** to inspect their technical details.
2. **Review demo link**:
   * Access the applicant's **Resume**, **GitHub Repository**, and **Demo Link**.
3. **Input Technical Details**:
   * **Earliest Start Date**: Log when the candidate is available to start the internship.
   * **College Commitment & Restrictions**: Detail any restrictions (e.g., exams, class commitments).
   * **Demo Technical Depth**: Write structured notes regarding how advanced their project architecture is.
   * **Tech Stack Used**: List the technologies (e.g., Next.js, FastAPI, LangChain).
   * **Problem-Solution Fit**: Rate how effectively their demo project addresses the stated problem.
   * **Architecture & Latency Considerations**: Log comments on design patterns, cost-efficiency, security, and performance.
4. **Submit Verdict**:
   * Set **Moved to Round 3** to:
     * **Yes** / **Maybe**: Promotes the candidate to **Round 3 (Executive Verdict)**.
     * **No**: Declines the candidate at the vetting stage.

---

## 3. 👑 Executive Portal (Round 3 - Executive Verdict)

### Purpose
The Executive Portal is used by founders and senior executives to review vetted candidates, assign hiring tiers, and finalize recruitment decisions (Hired/Rejected).

### Actions to Perform
1. **Submit Verdict**:
   * Click **Decide Verdict** on any candidate in the queue.
2. **Review dossier**:
   * Review both Recruiter screening notes and Technical evaluator vetting remarks (tech stack, start dates, and latency concerns).
3. **Assign Verdict Tier**:
   * Assign a final **Verdict Tier** (e.g., `Tier 1`, `Tier 2`, `Tier 3`).
4. **Add Executive Notes**:
   * Write **Reason for Decision** and specific **Onboarding / Project Guidelines**.
5. **Hiring Verdict**:
   * Click **Approve (Hire)** or **Reject (Decline)** to finalize the application.

---

## 4. 🎛️ Master Control Portal (Unified Console)

### Purpose
The Master Control Portal is a unified administrative dashboard designed for the Program Directors or HR Leads. It allows global management of the entire candidate lifecycle.

### Actions to Perform
1. **Funnel Analytics (Overview & Charts)**:
   * View live recruitment conversion graphs.
   * View **Round-by-Round Snapshots** showing active pipelines.
   * View the **Clan Workload Status Snapshot** showing real-time loads and vetting velocities for each technical clan.
2. **Interactive Filtering**:
   * Click metrics tiles (e.g., *Hired*, *In Vetting*) to instantly filter list views.
3. **Cross-Round Actions**:
   * Direct tabs allow the admin to perform the screening, vetting, or executive decisions on any candidate in any round without switching apps.
   * Live Clan updates can be done directly from the tables.
