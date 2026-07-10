# Recruiting HR Portal Implementation Plan

We will build a minimal, compact three-part web portal styled with **Mondee.com** brand colors to support the streamlined recruitment funnel.

---

## Proposed Funnel Architecture & User Portals

The application will be divided into three distinct spaces:

### 1. Recruiter Workspace (Round 1 Screening)
- **Grouping & Sorting**: Candidates will be classified into four distinct priority categories based on their programmatic tier and scores:
  - **Strong**: Tier 1+/1 with scores $\ge 16$
  - **Good**: Tier 2+/2 with scores $12 \le \text{score} < 16$
  - **Need Clarity**: Tier 3 with scores $8 \le \text{score} < 12$
  - **Invalid**: Tier 4 or scores $< 8$
  - Inside each category, candidates are ordered by Tier (`T1+` -> `T1` -> `T2+` -> `T2` -> `T3` -> `T4`) and total rubric score descending.
- **Workflow Actions**: A single recruiter views the candidate details and updates:
  - `review_comments` (screen comments)
  - `app_status` (Dropdown: `Yes`, `Reject`, `Maybe`, `Duplicate`)
  - `eval_group` (Dropdown of 6 clans: `Dharti`, `Jal`, `Agni`, `Vayu`, `Akash`, `Bijli` - plain text, no emojis)

### 2. Evaluator Hub
- A shared landing grid containing **6 large minimal tiles** representing the clans:
  - **Dharti**
  - **Jal**
  - **Agni**
  - **Vayu**
  - **Akash**
  - **Bijli**
- Evaluators select their clan to enter their respective vetting queues.

### 3. Clan Portal (Round 2 Tech Vetting)
- Displays only candidates assigned to that specific clan (`eval_group` matches selected clan) who have been passed from Round 1 (`app_status` set to `Yes`).
- **Workflow Actions**: Evaluators review the candidate's project details and complete the Round 2 form fields:
  - Start Date availability (`when_can_they_start`)
  - Internship duration (`duration_months`)
  - Project complexity (`complexity`: `High`, `Medium`, `Low`)
  - Business problem alignment (`solves_business_problem`: `Yes`, `No`)
  - Tech stack observed (`tech_stack`)
  - Vetting comments (`demo_review_comment`)
  - Move to Round 3 selector (`moved_to_round_3`: `Yes`, `No`, `Maybe`)

---

## Technical Details

- **index.html**: Restructured to support:
  - Recruiter Portal view (collapsible priority sections: Strong, Good, Need Clarity, Invalid).
  - Evaluator Hub grid (6 tiles).
  - Clan Workspace queue view (displays when a clan is active, includes a back button to the Hub).
  - Compact modal popups for Round 1 & Round 2 vettings.
- **app.js**: Integrates classification sorting algorithms, clan routing, local mock data extensions, and Supabase updates.
- **styles.css**: Styled in a compact, grey-toned slate aesthetic with warm orange primary actions.
