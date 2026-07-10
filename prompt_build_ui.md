# SPECIFICATION & PROMPT: Build 3 Isolated Vercel React Apps for Recruiter Funnel

You are tasked with building a premium, modern, Vercel-inspired (Geist Design) Recruiter Workspace system in React. The system consists of **3 separate React applications** hosted as independent Vercel projects, sharing the same UI design system, custom components, and connecting directly to a Supabase PostgreSQL backend.

---

## 1. Global Architecture & Access Separation

We require 3 distinct React apps to physically isolate access per recruitment stage:
1. **App 1 (Round 1: Recruiter Screening)**: Manages incoming raw submissions, displays automated AI scoring/reviews, and routes candidates to clans.
2. **App 2 (Round 2: Clan Vetting Workspace)**: Manages candidate queues assigned to one of 6 clans (`Dharti`, `Jal`, `Vaayu`, `Agni`, `Akash`, `Bijli`), reviews technical demos, and promotes candidates.
3. **App 3 (Round 3: Executive Verdict Portal)**: Consolidates previous rounds' comments for final hire/reject decisions.

### Reusability Rule:
- Style sheets, table layouts, and the primary `<CandidateProfileDossier />` component **must be shared or identical**.
- Control which parts of the profile and which input panel to show using configuration props (e.g. `activeRound`, `showRound1Comments`, `showRound2Comments`).

---

## 2. Supabase Database Schema Context

Use the `@supabase/supabase-js` client. The primary keys `id` map 1:1 across all tables (Foreign Keys reference `raw_submissions.id` with `ON DELETE CASCADE`).

```sql
-- 1. raw_submissions (Parent details)
-- id, full_name, email, linkedin, resume_drive_url, github_url, demo_link, analyzed (boolean), and skill metrics (1-5)

-- 2. round_1_evaluation (Round 1 inputs)
-- id, total (Numeric), edu, exp, proj, skills, demo_review_notes_ai, review_comments (recruiter text), app_status (string), eval_group (allocated clan)

-- 3. round_2_evaluation (Round 2 inputs)
-- id, when_can_they_start, duration_months, demo_review_comment, product_depth, complexity, tech_stack, solves_business_problem, moved_to_round_3 (Yes/Maybe/No)

-- 4. round_3_evaluation (Round 3 final)
-- id, review_comments (executive text), verdict (Yes/No)
```

---

## 3. UI/UX Design System (Vercel Geist Aesthetic with Theme Toggle)

Implement a clean UI matching the Vercel aesthetic with a **Theme Toggle Button** at the top right of each application to switch between Dark and Light mode:

### Themes & CSS Variables:
* **Dark Mode**:
  - Backgrounds: Deep black (`#000000`) and dark slate card backgrounds (`#0a0a0a` / `#111111`).
  - Text: Pure white (`#ffffff`) and secondary muted gray (`#888888`).
  - Borders: Thin dark gray borders (`1px solid #222222`).
* **Light Mode**:
  - Backgrounds: Pure white (`#ffffff`) and soft gray card backgrounds (`#fafafa` / `#f5f5f5`).
  - Text: Dark charcoal (`#111111`) and secondary muted gray (`#666666`).
  - Borders: Thin light gray borders (`1px solid #eaeaea`).

### Shared Design Assets:
* **Typography**: Clean sans-serif (Inter / Geist Sans). Use monospace (Geist Mono) for numbers, categories, and scores.
* **Color Accents**:
  - Vercel Blue (`#0070f3`) for action buttons.
  - Status Indicators: Minimal colored dots (Green for R2/R3 Yes, Amber for Maybe/Need Clarity, Red for Reject).
  - Subtle hovers: Highlight cards and table rows with transition on hover (e.g. border color changes to highlight).
* **Global Theme Switcher**: Add a header button showing an icon (Sun/Moon) that toggles the `dark` class on the `<html>` or `<body>` element, updating all CSS variables instantly.


---

## 4. Reusable React Components Specifications

### Component A: `<StatsBanner />`
- Renders global stats cards for total candidate count, pending screenings, and accepted counts.

### Component B: `<CandidateListTable />`
- Columns: `ID`, `Candidate Name`, `Tier/Score`, `Sub-Scores (Edu/Exp/Proj)`, `Claude AI Summary` (truncated), `Status`, and `Action Button` ("Review & Screen" / "Vet Tech Demo").
- Includes a client-side search bar and status filter dropdowns.

### Component C: `<CandidateProfileDossier />` (The core reusable component)
Accepts: `candidate` (object), `round` (1, 2, or 3), `onSave` (function), `savedData` (object).
1. **Left Panel (70% - Profile details)**:
   - **Header**: Name, LinkedIn icon, and flat outline action buttons for `Resume Drive`, `GitHub`, and `Live Demo` with icons.
   - **Academic/Contact Grid**: 3-column key-value layout.
   - **Project Detail Box**: Shaded container showing project category and demo explanation.
   - **Skills Bar Graph**: Horizontal visual progress bars for self-reported AI/ML skills.
   - **Round History**:
     - *If `round === 2 || round === 3`*: Render a card containing **Round 1 Recruiter Comments** and **Assigned Clan**.
     - *If `round === 3`*: Also render a card containing **Round 2 Vetting Comments**, **Tech Stack**, **Complexity**, and **Business Problem Verdict**.
2. **Right Panel (30% - AI Notes & Active Input Form)**:
   - **AI Evaluation Summary**: Large score badge (e.g., **`20.8`**`/21`), sub-score mini-badges, and scrollable AI review markdown text.
   - **Decision Form**: Renders inputs matching the current `round`:
     - *Round 1 Form*: Dropdown for `App Status` (Yes / No / Maybe), Dropdown for `Assigned Clan` (`Dharti`, `Jal`, etc.), and `Recruiter Comments` textarea.
     - *Round 2 Form*: Input for `Start Date`, Input for `Duration`, Textarea for `Demo Vetting Comments`, Input for `Tech Stack`, Dropdown for `Complexity` (High/Medium/Low), Dropdown for `Solves Business Problem` (Yes/No), Dropdown for `Promote to Round 3` (Yes/No/Maybe).
     - *Round 3 Form*: Textarea for `Executive Comments`, Action Buttons: `Approve Hire` (Green) and `Reject` (Red/Border).

---

## 5. Isolated App Specifications & DB Flows

### App 1: Round 1 (Screening)
- **Database Fetch**:
  ```sql
  SELECT r.*, e1.* FROM raw_submissions r 
  LEFT JOIN round_1_evaluation e1 ON r.id = e1.id;
  ```
- **Filter Categories**: Displays lists divided by AI categories: "Strong Candidates", "Good Candidates", "Need Clarity", "Invalid".
- **Database Save**: Upserts values to `round_1_evaluation` and updates `raw_submissions.analyzed = true`.

### App 2: Round 2 (Clan Vetting)
- **Landing Page**: Shows 6 large tiles representing `Dharti`, `Jal`, `Vaayu`, `Agni`, `Akash`, and `Bijli`. Each tile displays a count of candidates currently in that clan's worksheet queue.
- **Worksheet Fetch**: On click of a tile, routes to that clan's table fetching:
  ```sql
  SELECT r.*, e1.*, e2.* FROM raw_submissions r 
  JOIN round_1_evaluation e1 ON r.id = e1.id
  LEFT JOIN round_2_evaluation e2 ON r.id = e2.id
  WHERE e1.eval_group = '[Active Clan]' AND e1.app_status = 'Yes';
  ```
- **Database Save**: Writes all Round 2 input values to `round_2_evaluation`.

### App 3: Round 3 (Executive Verdict)
- **Database Fetch**:
  ```sql
  SELECT r.*, e1.*, e2.*, e3.* FROM raw_submissions r 
  JOIN round_1_evaluation e1 ON r.id = e1.id
  JOIN round_2_evaluation e2 ON r.id = e2.id
  LEFT JOIN round_3_evaluation e3 ON r.id = e3.id
  WHERE e2.moved_to_round_3 IN ('Yes', 'Maybe');
  ```
- **Database Save**: Writes executive comments and verdict to `round_3_evaluation`. If verdict is `Yes`, show a confetti celebration screen.
