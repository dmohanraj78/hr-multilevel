import os

app_path = 'master-portal/src/App.jsx'

with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's locate the end of the overview tab content block
target = """                </div>
              </div>
            )}

            {/* Round 1 tab content */}"""

replacement = """                </div>
              </div>
            )))}

            {/* Round 1 tab content */}"""

content = content.replace(target, replacement)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed parentheses mismatch in App.jsx")
