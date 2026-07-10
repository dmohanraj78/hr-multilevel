import os

app_path = 'master-portal/src/App.jsx'

with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change ))) } to )) }
content = content.replace(")))}", "))}")

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated to ))}")
