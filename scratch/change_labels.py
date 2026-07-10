import os

filepath = 'master-portal/src/App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Substitutions:
# 1. Screen Candidate -> Review (only for Round 1 actionLabel)
content = content.replace('actionLabel="Screen Candidate"', 'actionLabel="Review"')

# 2. R3: Executive Verdicts -> R3: Executive Review
content = content.replace('R3: Executive Verdicts', 'R3: Executive Review')
content = content.replace('Round 3: Executive Verdicts', 'Round 3: Executive Review')

# 3. R2: Technical Evaluator Technical Review -> R2: Technical Review
content = content.replace('R2: Technical Evaluator Technical Review', 'R2: Technical Review')

# 4. University Review -> University Overview
content = content.replace('University Review', 'University Overview')
content = content.replace('university review', 'university overview')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully replaced labels in master App.jsx!")
