import os

filepath = 'master-portal/src/App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Revert R2 URL back to evaluator-portal-mu.vercel.app
content = content.replace("baseUrl = 'https://technical-review.vercel.app';", "baseUrl = 'https://evaluator-portal-mu.vercel.app';")
content = content.replace("window.open('https://technical-review.vercel.app', '_blank')", "window.open('https://evaluator-portal-mu.vercel.app', '_blank')")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Reverted R2 redirect URL to evaluator-portal-mu.vercel.app successfully!")
