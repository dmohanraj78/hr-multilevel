import os

app_path = 'recruiter-portal/src/App.jsx'

with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace actionLabel="Review & Screen" with actionLabel="Review"
content = content.replace('actionLabel="Review & Screen"', 'actionLabel="Review"')

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated actionLabel in recruiter-portal App.jsx to 'Review'.")
