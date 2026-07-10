import os

recruiter_app_path = 'recruiter-portal/src/App.jsx'
master_app_path = 'master-portal/src/App.jsx'

with open(master_app_path, 'r', encoding='utf-8') as f:
    master_content = f.read()

# Extract normalizeUniversity definition from master App.jsx
start_idx = master_content.find("function normalizeUniversity(rawName) {")
end_idx = master_content.find("export default function App() {")
normalize_uni_def = master_content[start_idx:end_idx].strip()

with open(recruiter_app_path, 'r', encoding='utf-8') as f:
    recruiter_content = f.read()

# 1. Update imports
recruiter_content = recruiter_content.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useMemo } from 'react';"
)

recruiter_content = recruiter_content.replace(
    "import { Users, ShieldAlert, KanbanSquare, BarChart } from 'lucide-react';",
    "import { Users, ShieldAlert, KanbanSquare, BarChart, Building } from 'lucide-react';"
)

# Insert Badge import
badge_import = "import { Badge } from '@/components/ui/badge';"
if badge_import not in recruiter_content:
    recruiter_content = recruiter_content.replace(
        "import { Button } from '@/components/ui/button';",
        "import { Button } from '@/components/ui/button';\nimport { Badge } from '@/components/ui/badge';"
    )

# 2. Insert normalizeUniversity before export default function App()
if "function normalizeUniversity" not in recruiter_content:
    recruiter_content = recruiter_content.replace(
        "export default function App() {",
        normalize_uni_def + "\n\nexport default function App() {"
    )

with open(recruiter_app_path, 'w', encoding='utf-8') as f:
    f.write(recruiter_content)

print("Updated recruiter-portal App.jsx imports and normalizeUniversity helper.")
