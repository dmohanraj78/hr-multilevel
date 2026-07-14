# Aviators Funnel — Dashboard Naming Conventions

A standardized way of naming portals, pages, widgets, charts, filters, KPIs, and
data fields so that everyone in the organization understands what they are
looking at without confusion. **The golden rule: the exact word a reviewer
selects in a form is the exact word stored in Supabase and the exact word
displayed in every badge, tile, filter, Excel report, and daily email — no
translations anywhere.**

---

## 1. Portals (applications)

| Name | Audience | Purpose |
|---|---|---|
| **Master Portal** | Leadership / admins | Full control: overview charts, all round worksheets, University Overview, report download |
| **Recruiter Portal** | HR team | Round 1 — resume review and screening decisions |
| **Evaluator Portal** | Technical Reviewers | Round 2 — technical/demo evaluation |
| **Executive Portal** | Executives | Round 3 — final hiring decisions |

Portal titles follow: `Aviators Funnel | <Stage> Stage` (e.g. *Master Control
Stage*, *Executive Verdict Stage*).

## 2. Pages / tabs (Master Portal)

Order and names are fixed:

`Overview & Charts` → `R1: HR Review` → `R2: Technical Review` → `R3: Executive Review` → `University Overview`

Worksheet page headings follow: `Round <N> <Stage> Worksheet`
(e.g. *Round 1 Review Worksheet*, *Round 2 Technical Review Worksheet*,
*Round 3 Executive Decisions Worksheet*).

## 3. Funnel stages

| Stage | Name | Actor | Table |
|---|---|---|---|
| Round 1 | **HR Review** | Recruiter | `round_1_evaluation` |
| Round 2 | **Technical Review** | Technical Reviewer (**TR**) | `round_2_evaluation` |
| Round 3 | **Executive Review** | Executive | `round_3_evaluation` |

## 4. Decision vocabulary (stored = displayed)

| Round | Field | Allowed values | Meaning of each |
|---|---|---|---|
| Round 1 | **App Status** (`app_status`) | `Yes` · `Reject` · `Maybe` · `Access requested` · `Pending` | Yes = moves to Round 2 · Reject = out at R1 · Access requested = waiting on candidate materials · Pending = awaiting manual review (default, never NULL) |
| Round 2 | **Decision** (`moved_to_round_3`) | `Yes` · `Maybe` · `No` · `Declined` | Yes/Maybe = promoted to Round 3 · No = not promoted · Declined = declined by/for the candidate · a value ending `_draft` = review saved but not finished → displayed **Pending Review** |
| Round 3 | **Verdict** (`verdict`) | `Hired` · `Maybe` · `Rejected` | no row / empty = **Pending Decisions** |

Round-specific rejection words are deliberate and must not be mixed:
**Reject** (R1) · **No / Declined** (R2) · **Rejected** (R3).

## 5. KPI tiles (widgets)

Tile titles are UPPERCASE labels with a fixed definition:

| Tile | Definition (formula) |
|---|---|
| **Applicants / Applications Evaluated** | `count(round_1_evaluation)` — every evaluated candidate |
| **Duplicates removed** | raw submissions with `Analysis_status='Completed'` and no R1 record |
| **Awaiting evaluation** | raw submissions with `Analysis_status = NULL` |
| **HR Round Cleared / Review** | R1 `app_status = 'Yes'` |
| **Pending Reviews** | R1 `app_status = 'Pending'` |
| **Rejected Submissions / Declined** | R1 `app_status = 'Reject'` |
| **Total in Review** (R2) | all R1-Yes candidates |
| **Promoted (R3)** | R2 decision `Yes` or `Maybe` (finalized, drafts excluded) |
| **Review Declined** (R2) | R2 decision `No` or `Declined` |
| **Total Promoted** (R3) | candidates in the R3 queue |
| **Hired / Maybe / Rejected** (R3) | R3 verdict counts |

Reconciliation identities that must always hold:
`received = evaluated + duplicates + awaiting` ·
`evaluated = Yes + Reject + Maybe + Access requested + Pending` ·
`promoted = R2 Yes + R2 Maybe`.

## 6. Charts

- **Candidate Tiers** — evaluator-assigned tier counts (no N/A row)
- **Technical Reviewer Workloads** — candidates per TR
- **Candidate Pipeline** — funnel: Applied → Cleared HR Round → Selected for Executive Review → Hired

Tier labels are always full form: `Tier 1+`, `Tier 1`, `Tier 2+`, `Tier 2`,
`Tier 3`, `Tier 4` — never `T1`/`T2`.

## 7. Table columns

Column headers are Title Case. Fixed sequences:

- **R1/R2 worksheets**: ID · Candidate · Tier · Score · Demo-AI Review · Status · Technical Reviewer · Actions
- **R3 worksheet**: ID · Candidate · Tier · Score · Technical Reviewer · TR Comments · Actions · Status

`TR Comments` = the technical reviewer's written feedback
(`demo_review_comment`). `Status` on R3 = the executive verdict badge.

## 8. Filters

- Header filters (funnel icon) are named exactly after their column: ID,
  Candidate, Tier, Score, Status, Technical Reviewer.
- Quick tabs use the pattern `TR Recommended: <Value> (<count>)`.
- Filter option lists are built from live data values, never hardcoded.

## 9. Data fields (Supabase)

- Tables and columns: `snake_case` (`raw_submissions`, `round_1_evaluation`,
  `app_status`, `moved_to_round_3`, `demo_review_comment`).
  Historical exception: `raw_submissions."Analysis_status"` (capital A).
- One row per candidate per round, joined by `id` = `raw_submissions.id`.
- No NULL decision fields: `app_status` defaults to `Pending`.
- No duplicate candidates in `round_1_evaluation` (guarded by the daily
  data-quality job and the DB trigger in `enforce_r1_quality.sql`).

## 10. Reports & files

- Excel report: `R1_R2_EOD_REPORT_YYYY-MM-DD.xlsx`
- Analysis sheet row‑5 section headers: **Candidate Analysed Details** (A–AI) ·
  **Round 1 Inputs** (AJ–AM) · **Round 2 Inputs** (AN–AU)
- Stats strip includes reconciliation cells (Moved to R2, R2 Evaluated,
  Rejected, Pending) and a **Generated** timestamp so stale files are obvious.
- Sort order: R1-Yes block (R2 Yes → Maybe → No/Declined → in progress → not
  started) → R1 Maybe → R1 Rejected → Pending last.
- Daily email: sent 8 AM CST / 9 AM CDT with the funnel-summary narrative,
  numbers computed live at send time.

## 11. Color semantics (uniform everywhere)

| Color | Meaning | Used for |
|---|---|---|
| 🟢 Green | Positive | Yes, Hired, Promoted |
| 🟡 Amber | Undecided-positive | Maybe |
| 🔴 Red | Negative | Reject, No, Declined, Rejected |
| ⚪ Grey | No decision yet | Pending, Pending Review, Pending Decisions |
| 🔵 Blue | Informational | Totals, Access requested |

Only decision columns are color-filled in the Excel report; pending cells have
no fill.
