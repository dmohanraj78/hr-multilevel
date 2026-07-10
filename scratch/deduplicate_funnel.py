import os

portals = ['master-portal', 'recruiter-portal']

for portal in portals:
    filepath = os.path.join(portal, 'src', 'components', 'OverallFunnelDashboard.jsx')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Insert deduplicatedFiltered memo definition right before header field value extractors
        target_memo = "  // Header field value extractors"
        replacement_memo = """  // Deduplicated sortedAndFiltered list
  const deduplicatedFiltered = useMemo(() => {
    return sortedAndFiltered.reduce((acc, current) => {
      const x = acc.find(item => item.email?.trim().toLowerCase() === current.email?.trim().toLowerCase());
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
  }, [sortedAndFiltered]);

  // Header field value extractors"""

        if "deduplicatedFiltered = useMemo" not in content:
            content = content.replace(target_memo, replacement_memo)

        # Replace sortedAndFiltered.length in subtitle, export button, and first card count
        content = content.replace("{sortedAndFiltered.length} applicants", "{deduplicatedFiltered.length} applicants")
        content = content.replace("Export Filtered ({sortedAndFiltered.length}) Records", "Export Filtered ({deduplicatedFiltered.length}) Records")
        content = content.replace("<span className=\"text-3xl font-extrabold font-mono text-foreground\">{sortedAndFiltered.length}</span>", "<span className=\"text-3xl font-extrabold font-mono text-foreground\">{deduplicatedFiltered.length}</span>")
        
        # Replace card label "Total submissions" with "Deduplicated applicants"
        content = content.replace('<span className="text-[10px] text-muted-foreground">Total submissions</span>', '<span className="text-[10px] text-muted-foreground">Deduplicated applicants</span>')

        # Replace exportToCSV to map over deduplicatedFiltered instead of sortedAndFiltered
        content = content.replace("const rows = sortedAndFiltered.map(c => {", "const rows = deduplicatedFiltered.map(c => {")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Updated {filepath}")
