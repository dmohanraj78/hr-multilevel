import os
import sys
import requests
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime

# Load .env file manually to avoid dependency issues if python-dotenv is not installed
def load_dotenv():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mujqmdmzloizqhglayxe.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "")
EMAIL_TO = os.getenv("EMAIL_TO", "mgoel@mondee.com")  # Default recipient

def get_median(lst):
    n = len(lst)
    if n == 0:
        return 0
    s_lst = sorted(lst)
    mid = n // 2
    if n % 2 == 1:
        return s_lst[mid]
    else:
        return (s_lst[mid - 1] + s_lst[mid]) / 2.0

def build_excel_report():
    print("Fetching candidate data from Supabase...")
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }

    # Fetch R1 reviews + raw submissions
    r1_url = f"{SUPABASE_URL}/rest/v1/round_1_evaluation?select=*,raw_submissions(*)"
    resp_r1 = requests.get(r1_url, headers=headers)
    if resp_r1.status_code != 200:
        print(f"Error fetching R1: {resp_r1.text}")
        sys.exit(1)
    r1_list = resp_r1.json()

    # Fetch R2 reviews
    r2_url = f"{SUPABASE_URL}/rest/v1/round_2_evaluation?select=*"
    resp_r2 = requests.get(r2_url, headers=headers)
    if resp_r2.status_code != 200:
        print(f"Error fetching R2: {resp_r2.text}")
        sys.exit(1)
    r2_list = resp_r2.json()

    # Map R2 by ID
    r2_map = {item["id"]: item for item in r2_list}

    # Filter evaluated candidates (having R1 record)
    candidates = []
    for r1 in r1_list:
        raw = r1.get("raw_submissions")
        if not raw:
            continue
        raw_parsed = raw[0] if isinstance(raw, list) else raw
        candidates.append({
            "c": raw_parsed,
            "r1": r1,
            "r2": r2_map.get(r1["id"], {})
        })

    # Sort order: Yes first → Maybe → Pending (no R2 decision) → Rejected
    # Within each group, sort by total score descending
    def sort_key(cand):
        r1_status = str(cand["r1"].get("app_status") or "").strip().lower()
        r2_decision = str(cand["r2"].get("moved_to_round_3") or "").strip().lower()
        score = float(cand["r1"].get("total") or 0)

        # Determine primary group order
        # Group 0 = Yes (R1 yes, or R2 yes/promoted)
        # Group 1 = Maybe
        # Group 2 = Pending (no R1 or R2 decision yet)
        # Group 3 = Rejected / No
        if r1_status in ["yes"] or r2_decision in ["yes", "promoted", "yes_draft"]:
            group = 0
        elif r1_status in ["maybe"] or r2_decision in ["maybe", "maybe_draft"]:
            group = 1
        elif r1_status in ["no", "rejected", "invalid"] or r2_decision in ["no", "no_draft"]:
            group = 3
        else:
            group = 2  # Pending Decisions (no decision yet)

        return (group, -score)  # sort by group asc, then score desc within group

    candidates.sort(key=sort_key)

    # Initialize Workbook from template if exists
    template_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Copy of AI_Builder_Intern_v9.xlsx")
    template_loaded = False
    
    if os.path.exists(template_path):
        print(f"Loading template from {template_path}...")
        wb = openpyxl.load_workbook(template_path)
        ws = wb["Analysis"]
        template_loaded = True
        # Clear existing candidate rows in Analysis sheet (starting from Row 7 onwards)
        if ws.max_row >= 7:
            ws.delete_rows(7, ws.max_row - 6)
    else:
        print("Template file not found. Creating blank workbook.")
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Analysis"
        ws.views.sheetView[0].showGridLines = True

        # Row 1: Title
        ws.row_dimensions[1].height = 28
        ws["A1"] = "Scored Candidates — Analysis"
        ws["A1"].font = Font(name="Segoe UI", size=16, bold=True, color="1F3864")

        # Row 2: Subtitle
        ws.row_dimensions[2].height = 42
        ws["A2"] = "Demo Review Notes (AG): DARK GREEN = Industry problem + advanced AI + complex + not a student project · LIGHT GREEN = Function problem + advanced AI + complex + not common student project · PINK = unclear/unassessable · RED = everything else.   Demo cell (AE) RED = invalid/missing demo link."
        ws["A2"].font = Font(name="Segoe UI", size=9.5, italic=True, color="595959")
        ws["A2"].alignment = Alignment(wrap_text=True, vertical="center")

    # Statistics Calculation
    total_applicants = len(candidates)
    t1 = 0
    t1_minus = 0
    t2 = 0
    t2_minus = 0
    t3 = 0
    t4 = 0
    scores = []

    for cand in candidates:
        r1 = cand["r1"]
        tier = str(r1.get("tier") or "").strip().upper()
        if tier in ["T1", "T1+", "TIER 1", "TIER 1+"]:
            t1 += 1
        elif tier in ["T1-", "TIER 1-"]:
            t1_minus += 1
        elif tier in ["T2", "T2+", "TIER 2", "TIER 2+"]:
            t2 += 1
        elif tier in ["T2-", "TIER 2-"]:
            t2_minus += 1
        elif tier in ["T3", "TIER 3"]:
            t3 += 1
        elif tier in ["T4", "TIER 4"]:
            t4 += 1

        score_val = float(r1.get("total") or 0)
        scores.append(score_val)

    avg_score = sum(scores) / len(scores) if scores else 0
    top_score = max(scores) if scores else 0
    median_score = get_median(scores)

    # Write Row 3 & 4 (Stats Table)
    ws.row_dimensions[3].height = 20
    ws.row_dimensions[4].height = 18

    stats_vals = [total_applicants, t1, t1_minus, t2, t2_minus, t3, t4, round(avg_score, 1), top_score, median_score]
    stats_labels = ["Applicants", "Tier 1", "Tier 1-", "Tier 2", "Tier 2-", "Tier 3", "Tier 4", "Avg Total", "Top Score", "Median"]

    thin_border = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )

    light_blue_fill = PatternFill(start_color="F2F5FB", end_color="F2F5FB", fill_type="solid")

    for i in range(10):
        col_letter = get_column_letter(i + 1)
        
        # Row 3 Value
        cell_val = ws[f"{col_letter}3"]
        cell_val.value = stats_vals[i]
        cell_val.font = Font(name="Segoe UI", size=10, bold=True, color="1F3864")
        cell_val.fill = light_blue_fill
        cell_val.alignment = Alignment(horizontal="center", vertical="center")
        cell_val.border = thin_border

        # Row 4 Label
        cell_lbl = ws[f"{col_letter}4"]
        cell_lbl.value = stats_labels[i]
        cell_lbl.font = Font(name="Segoe UI", size=9, color="595959")
        cell_lbl.fill = light_blue_fill
        cell_lbl.alignment = Alignment(horizontal="center", vertical="center")
        cell_lbl.border = thin_border

    # Overwrite Raw Data sheet if it exists
    if "Raw Data" in wb.sheetnames:
        ws_raw = wb["Raw Data"]
        raw_row_idx = 2
        for cand in candidates:
            c = cand["c"]
            r1 = cand["r1"]
            row_data = [
                c.get("id"),
                c.get("submission_date"),
                c.get("full_name"),
                c.get("email"),
                c.get("phone"),
                c.get("linkedin"),
                c.get("location"),
                c.get("preferred_start_date"),
                c.get("education_level"),
                c.get("ug_university"),
                c.get("masters_university"),
                c.get("course_major"),
                c.get("degree_status"),
                c.get("completion_year"),
                c.get("programming_languages"),
                c.get("aiml_experience") or r1.get("aiml_exp") or '',
                c.get("claude_ecosystem") or r1.get("claude_lvl") or '',
                c.get("skill_python"),
                c.get("skill_deep_learning"),
                c.get("skill_nlp"),
                c.get("skill_computer_vision"),
                c.get("skill_reinforcement_learning"),
                c.get("skill_multimodal_ai"),
                c.get("skill_finetuning_lora_peft"),
                c.get("skill_llm_orchestration"),
                c.get("skill_agent_fundamentals"),
                c.get("skill_mcp"),
                c.get("skill_embeddings_vector_rag"),
                c.get("skill_reasoning_models"),
                c.get("skill_evals"),
                c.get("skill_ai_coding_tools"),
                c.get("skill_rag"),
                c.get("demo_explanation") or c.get("current_project") or '',
                c.get("project_state") or r1.get("deploy_stage") or '',
                c.get("project_category") or r1.get("domain") or '',
                c.get("demo_link"),
                c.get("github_url"),
                c.get("preferred_industry") or '',
                c.get("open_to_onsite") or '',
                c.get("open_to_travel") or '',
                c.get("anything_else") or '',
                c.get("applied_role") or '',
                c.get("job_id") or '',
                c.get("rubric_id") or '',
                c.get("screening_type") or '',
                c.get("resume_drive_url"),
                c.get("resume_filename") or '',
                c.get("Analysis_status") or ''
            ]
            for col_idx, val in enumerate(row_data):
                ws_raw.cell(row=raw_row_idx, column=col_idx + 1).value = val
            raw_row_idx += 1
            
        # Delete any trailing/leftover rows from template
        if ws_raw.max_row >= raw_row_idx:
            ws_raw.delete_rows(raw_row_idx, ws_raw.max_row - raw_row_idx + 1)

    grid_border = Border(
        left=Side(style='thin', color='E0E0E0'),
        right=Side(style='thin', color='E0E0E0'),
        top=Side(style='thin', color='E0E0E0'),
        bottom=Side(style='thin', color='E0E0E0')
    )

    # Row 5: Merged Headers for Round 1 & Round 2 Inputs
    ws.row_dimensions[5].height = 18
    # Safely unmerge if already merged
    for r in list(ws.merged_cells.ranges):
        if r.coord in ['A5:AM5', 'AN5:AV5', 'AM5']:
            try:
                ws.unmerge_cells(r.coord)
            except Exception:
                pass

    ws.merge_cells('A5:AM5')
    cell_r1 = ws['A5']
    cell_r1.value = "Round 1 Inputs"
    cell_r1.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    cell_r1.fill = PatternFill(start_color="1F3864", end_color="1F3864", fill_type="solid")
    cell_r1.alignment = Alignment(horizontal="center", vertical="center")

    ws.merge_cells('AN5:AV5')
    cell_r2 = ws['AN5']
    cell_r2.value = "Round 2 Inputs"
    cell_r2.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    cell_r2.fill = PatternFill(start_color="0070C0", end_color="0070C0", fill_type="solid")
    cell_r2.alignment = Alignment(horizontal="center", vertical="center")

    if not template_loaded:
        # Row 6: Column Headers
        headers = [
            "Rank", "Name", "Gender", "Cat", "Graduation", "Tier", "Total", "Edu", "Exp", "Proj", 
            "Substance", "Deploy", "Artifact", "Skills", "Domain", "Degree", "Stream", "College", "F_college", "F_University", 
            "Location", "AI Proj", "FS Proj", "Intern Mo", "Co.Tier", "Deploy Stage", "#Skills", "Claude Lvl", "AI/ML Exp", "Email", 
            "Résumé", "GitHub", "Demo", "Demo Explanation (their project)", "Demo Review Notes (AI)", "R1 Review", "R1 Interview Priority", "To be screened by", 
            "Status", "Earliest date they can start the internship", "Any concerns / restrictions (with college commitment, personal, others)", "Technical depth of demo / product", "Tech stack used", "Problem-solution fit", "Areas like latency, cost, security, etc been considered", "Decision", "Tier", "Reason for decision (detailed notes)"
        ]

        ws.row_dimensions[6].height = 24
        dark_blue_fill = PatternFill(start_color="1F3864", end_color="1F3864", fill_type="solid")
        blue_fill = PatternFill(start_color="0070C0", end_color="0070C0", fill_type="solid")

        for idx, h in enumerate(headers):
            cell = ws.cell(row=6, column=idx + 1)
            cell.value = h
            cell.font = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
            cell.fill = blue_fill if idx >= 38 else dark_blue_fill
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.border = grid_border

    # Fills for row data highlighting
    green_fill = PatternFill(start_color="E2F0D9", end_color="E2F0D9", fill_type="solid")
    green_font = Font(name="Segoe UI", size=9.5, color="385723", bold=True)
    
    amber_fill = PatternFill(start_color="FFF3CD", end_color="FFF3CD", fill_type="solid")
    amber_font = Font(name="Segoe UI", size=9.5, color="856404", bold=True)
    
    red_fill = PatternFill(start_color="F8D7DA", end_color="F8D7DA", fill_type="solid")
    red_font = Font(name="Segoe UI", size=9.5, color="721C24", bold=True)

    # Write Candidates starting at Row 7
    for index, cand in enumerate(candidates):
        row_number = index + 7
        ws.row_dimensions[row_number].height = 20
        c = cand["c"]
        r1 = cand["r1"]
        r2 = cand["r2"]

        raw_solves = r2.get("solves_business_problem") or ""
        
        # Safe string checks
        contact_status = r2.get("contact_status") or ""
        if not contact_status:
            if "Contact: " in raw_solves:
                contact_status = raw_solves.split("Contact: ")[1].split(" | ")[0]
            elif raw_solves in ["Yet to Speak", "Spoke", "Scheduled", "No response"]:
                contact_status = raw_solves

        problem_fit = r2.get("problem_fit") or ""
        if not problem_fit:
            if "Fit: " in raw_solves:
                problem_fit = raw_solves.split("Fit: ")[1]
            elif raw_solves in ["Yes", "Maybe", "No"]:
                problem_fit = raw_solves

        raw_depth = r2.get("product_depth") or ""
        tech_depth = r2.get("tech_depth") or ""
        if not tech_depth:
            if "Depth: " in raw_depth:
                tech_depth = raw_depth.split("Depth: ")[1].split(" | ")[0]
            elif raw_depth in ["High", "Medium", "Low", "None"]:
                tech_depth = raw_depth

        latency = r2.get("latency_considerations") or ""
        if not latency:
            if "Latency: " in raw_depth:
                latency = raw_depth.split("Latency: ")[1]
            elif raw_depth not in ["High", "Medium", "Low", "None"]:
                latency = raw_depth

        row_data = [
            index + 1,  # Rank
            c.get("full_name"),
            r1.get("gender") or "-",
            r1.get("cat") or "-",
            r1.get("graduation") or "-",
            r1.get("tier") or "-",
            float(r1.get("total") or 0),
            float(r1.get("edu") or 0),
            float(r1.get("exp") or 0),
            float(r1.get("proj") or 0),
            float(r1.get("substance") or 0),
            float(r1.get("deploy") or 0),
            float(r1.get("artifact") or 0),
            float(r1.get("skills") or 0),
            r1.get("domain") or "-",
            r1.get("degree") or "-",
            r1.get("stream") or "-",
            c.get("ug_university") or "-",
            r1.get("college") or "-",
            c.get("ug_university") or "-",
            r1.get("location") or "-",
            float(r1.get("ai_proj") or 0),
            float(r1.get("fs_proj") or 0),
            float(r1.get("intern_mo") or 0),
            float(r1.get("co_tier") or 0),
            r1.get("deploy_stage") or "-",
            float(r1.get("num_skills") or 0),
            r1.get("claude_lvl") or "-",
            r1.get("aiml_exp") or "-",
            c.get("email") or "-",
            c.get("resume_drive_url") or "-",
            c.get("github_url") or "-",
            c.get("demo_link") or "-",
            c.get("demo_explanation") or c.get("current_project") or "-",
            r1.get("demo_review_notes_ai") or "-",
            r1.get("review_comments") or "-",
            r1.get("r1_interview_priority") or "-",
            r1.get("eval_group") or "-",
            r1.get("app_status") or "-",
            r2.get("when_can_they_start") or "-" if r2.get("id") else "-",
            r2.get("complexity") or "-" if r2.get("id") else "-",
            tech_depth or "-" if r2.get("id") else "-",
            r2.get("tech_stack") or "-" if r2.get("id") else "-",
            problem_fit or "-" if r2.get("id") else "-",
            latency or "-" if r2.get("id") else "-",
            r2.get("moved_to_round_3").replace("_draft", "") or "-" if (r2.get("id") and r2.get("moved_to_round_3")) else "-",
            "-",  # Tier placeholder
            r2.get("demo_review_comment") or "-" if r2.get("id") else "-"
        ]

        # Column indices (0-based) for decision cells that get color-coded:
        # idx 38 = R1 "Status" (col 39), idx 45 = R2 "Decision" (col 46)
        DECISION_COLS = {38, 45}

        for idx, val in enumerate(row_data):
            cell = ws.cell(row=row_number, column=idx + 1)
            cell.value = val
            cell.font = Font(name="Segoe UI", size=9.5)
            cell.alignment = Alignment(vertical="center", horizontal="center" if isinstance(val, (int, float)) else "left")
            cell.border = grid_border

            # Color-code ONLY the R1 Status and R2 Decision columns
            if idx in DECISION_COLS:
                val_str = str(val or "").strip().lower()
                if val_str in ["yes", "promoted", "approved"]:
                    cell.fill = green_fill
                    cell.font = green_font
                elif val_str in ["maybe"]:
                    cell.fill = amber_fill
                    cell.font = amber_font
                elif val_str in ["no", "rejected", "invalid", "reject"]:
                    cell.fill = red_fill
                    cell.font = red_font

    # Set Column Widths only if template not loaded
    if not template_loaded:
        widths = [
            6, 25, 10, 8, 12, 10, 8, 8, 8, 8, 8, 8, 8, 8, 20, 15, 20, 30, 30, 25,
            18, 10, 10, 10, 10, 18, 10, 15, 15, 30, 25, 25, 25, 35, 35, 30, 18, 18,
            12, 18, 25, 18, 25, 15, 20, 12, 10, 35
        ]
        for idx, w in enumerate(widths):
            ws.column_dimensions[get_column_letter(idx + 1)].width = w

    date_str = datetime.now().strftime("%Y-%m-%d")
    output_filename = f"r1_r2_side_by_side_report_{date_str}.xlsx"
    wb.save(output_filename)
    print(f"Report saved successfully as {output_filename}")
    return output_filename

def send_email(filename):
    if not SMTP_USER or not SMTP_PASSWORD or not EMAIL_TO:
        print("Error: SMTP details or recipient address not configured in .env. Skipping email.")
        return False

    print(f"Sending email to {EMAIL_TO}...")
    msg = MIMEMultipart()
    msg['From'] = EMAIL_FROM or SMTP_USER
    msg['To'] = EMAIL_TO
    date_str = datetime.now().strftime("%Y-%m-%d")
    msg['Subject'] = f"Aviators AI Builder Intern - EOD R1 & R2 Combined Report ({date_str})"

    body = f"""Hi Manish,

Please find attached the EOD R1 & R2 Combined Report auto-generated on {date_str} at 8:00 PM CDT.

Report includes:
  - Candidate profile & R1 evaluation details
  - R2 screening inputs (where available)
  - Sorted by: Yes → Maybe → Pending Decisions → Rejected
  - R1 Status and R2 Decision columns are color-coded (Green = Yes, Amber = Maybe, Red = No)

Best Regards,
Aviators Recruitment Bot"""

    msg.attach(MIMEText(body, 'plain'))

    try:
        with open(filename, "rb") as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header(
                'Content-Disposition',
                f'attachment; filename= {filename}',
            )
            msg.attach(part)
            
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            text = msg.as_string()
            server.sendmail(msg['From'], msg['To'], text)
            server.quit()
            print("Email sent successfully!")
            return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

if __name__ == "__main__":
    report_file = build_excel_report()
    send_email(report_file)
