with open('master-portal/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect lines around the overview tab content
lines = content.split('\n')
start = 598
end = 825

for i in range(start, end):
    print(f"{i+1}: {lines[i]}")
