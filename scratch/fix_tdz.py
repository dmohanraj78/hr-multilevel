import os

portals = ['master-portal', 'recruiter-portal']

for portal in portals:
    filepath = os.path.join(portal, 'src', 'components', 'OverallFunnelDashboard.jsx')
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Define the block to move
        block_to_move = """  // Deduplicated sortedAndFiltered list
  const deduplicatedFiltered = useMemo(() => {
    return sortedAndFiltered.reduce((acc, current) => {
      const x = acc.find(item => item.email?.trim().toLowerCase() === current.email?.trim().toLowerCase());
      if (!x) return acc.concat([current]);
      return acc;
    }, []);
  }, [sortedAndFiltered]);"""

        if block_to_move in content:
            # Remove it from the top
            content = content.replace(block_to_move, "")
            
            # Find sortedAndFiltered declaration end and insert it right after
            target = "  }, [filteredApplicants, sortConfig]);"
            
            if target in content:
                content = content.replace(target, target + "\n\n" + block_to_move)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Moved deduplicatedFiltered below sortedAndFiltered in {filepath}")
            else:
                print(f"Error: Target sortedAndFiltered end not found in {filepath}")
        else:
            print(f"Error: block_to_move not found in {filepath}")
