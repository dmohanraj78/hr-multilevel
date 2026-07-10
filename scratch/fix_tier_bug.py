import os

portals = ['master-portal', 'recruiter-portal', 'evaluator-portal', 'executive-portal']

for portal in portals:
    dossier_path = os.path.join(portal, 'src', 'components', 'CandidateProfileDossier.jsx')
    if os.path.exists(dossier_path):
        with open(dossier_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        target = "eval_group: c.eval_group !== undefined ? c.eval_group : valParsed?.eval_group,"
        replacement = "eval_group: c.eval_group !== undefined ? c.eval_group : valParsed?.eval_group,\n      tier: c.tier !== undefined ? c.tier : valParsed?.tier,"
        
        if target in content and "tier: c.tier" not in content:
            new_content = content.replace(target, replacement)
            with open(dossier_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Added tier mapping to {dossier_path}")
        else:
            print(f"Skipped {dossier_path} (already mapped or target not found)")
