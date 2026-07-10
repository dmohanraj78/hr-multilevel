import os

filepath = 'master-portal/src/App.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix JavaScript lower() bug
content = content.replace("item.email?.trim().lower() === current.email?.trim().lower()", "item.email?.trim().toLowerCase() === current.email?.trim().toLowerCase()")

# Revert URLs
content = content.replace("let baseUrl = 'https://hr-round.vercel.app';", "let baseUrl = 'https://recruiter-portal-one.vercel.app';")
content = content.replace("baseUrl = 'https://executive-portal.vercel.app';", "baseUrl = 'https://executive-portal-nine.vercel.app';")
content = content.replace("window.open('https://hr-round.vercel.app', '_blank')", "window.open('https://recruiter-portal-one.vercel.app', '_blank')")
content = content.replace("window.open('https://executive-portal.vercel.app', '_blank')", "window.open('https://executive-portal-nine.vercel.app', '_blank')")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Javascript runtime bug and set URLs back successfully!")
