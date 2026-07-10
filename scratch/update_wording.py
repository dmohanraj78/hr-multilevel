import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Timeline replacements in CandidateProfileDossier.jsx
    if 'CandidateProfileDossier.jsx' in filepath:
        # Remove Tech Evaluator from Round 1 timeline
        # <span className="text-xs font-mono text-muted-foreground ml-auto">Tech Evaluator: <strong className="text-foreground">{r1.eval_group || 'None'}</strong></span>
        content = re.sub(
            r'<span className="text-xs font-mono text-muted-foreground ml-auto">Tech Evaluator: <strong className="text-foreground">\{r1\.eval_group \|\| \'None\'\}</strong></span>',
            '',
            content
        )
        
        # Add Technical Reviewer: eval_group to Round 2 timeline
        # <Badge variant="outline" className="border-green-600 text-green-600 bg-green-600/5 font-semibold">Round 2 Tech Review</Badge>
        # <span className="text-xs font-mono text-muted-foreground">Start: {r2.when_can_they_start || '-'}</span>
        old_r2_timeline = """                      <Badge variant="outline" className="border-green-600 text-green-600 bg-green-600/5 font-semibold">Round 2 Tech Review</Badge>
                      <span className="text-xs font-mono text-muted-foreground">Start: {r2.when_can_they_start || '-'}</span>"""
        
        new_r2_timeline = """                      <Badge variant="outline" className="border-green-600 text-green-600 bg-green-600/5 font-semibold">Round 2 Technical Review</Badge>
                      <span className="text-xs font-mono text-muted-foreground">Start: {r2.when_can_they_start || '-'}</span>
                      <span className="text-xs font-mono text-muted-foreground ml-auto">Technical Reviewer: <strong className="text-foreground">{r1.eval_group || 'None'}</strong></span>"""
        content = content.replace(old_r2_timeline, new_r2_timeline)

    # 2. General Wording Replacements
    # Case: "Recruiter Funnel Stage" -> "HR Round"
    content = content.replace("Recruiter Funnel Stage", "HR Round")
    content = content.replace("Recruiter Workspace", "HR Workspace")
    content = content.replace("Round 1: Recruiter Review", "Round 1: HR Review")
    content = content.replace("R1: Recruiter Review", "R1: HR Review")
    content = content.replace("Recruiter Comments", "HR Comments")
    content = content.replace("recruiter comments", "hr comments")
    
    # Case: "Tech Evaluator" / "tech evaluator" -> "Technical Evaluator" / "technical evaluator"
    # But wait, in columnKey="clan", label="Tech Evaluator" -> "Technical Reviewer" (for breadcrumb request)
    content = content.replace('label="Tech Evaluator"', 'label="Technical Reviewer"')
    content = content.replace('label={<span>Tech Evaluator</span>}', 'label={<span>Technical Reviewer</span>}')
    content = content.replace("Tech Evaluator Workloads", "Technical Reviewer Workloads")
    content = content.replace("tech evaluator review queue", "technical evaluator review queue")
    content = content.replace("tech evaluator", "technical evaluator")
    content = content.replace("Tech Evaluator", "Technical Evaluator")
    content = content.replace("tech evaluators", "technical evaluators")
    content = content.replace("Tech Evaluators", "Technical Evaluators")

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Processed wording replacements in {filepath}")

# Walk directories
dirs_to_process = ['evaluator-portal', 'recruiter-portal', 'master-portal', 'executive-portal']
for d in dirs_to_process:
    for root, dirs, files in os.walk(os.path.join(d, 'src')):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                process_file(os.path.join(root, file))

print("Wording refactoring script completed successfully!")
