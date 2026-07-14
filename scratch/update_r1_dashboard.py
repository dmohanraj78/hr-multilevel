import re

def update_stats_banner(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the `else {` block in StatsBanner for round 1
    # We will just replace the `else { ... }` block inside StatsBanner
    old_else_block = re.search(r'\} else \{\s*const pendingScreen.*?return \(\s*<div', content, re.DOTALL)
    if not old_else_block:
        print("Could not find else block in", file_path)
        return

    new_else_block = """} else {
    const TOP_TIERS = ['Tier 1', 'Tier 1-', 'Tier 2', 'Tier 2-'];
    const LOW_TIERS = ['Tier 3', 'Tier 4'];

    const approvedR1 = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      return status === 'Yes';
    }).length;

    const rejected = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      return status === 'No' || status === 'Reject';
    }).length;

    const pendingTop = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      const tier = getEvalField(c, 'tier');
      const isPending = (!status || status === 'Pending');
      return isPending && TOP_TIERS.includes(tier);
    }).length;

    const pendingLow = candidates.filter(c => {
      const status = getEvalField(c, 'app_status');
      const tier = getEvalField(c, 'tier');
      const isPending = (!status || status === 'Pending');
      return isPending && LOW_TIERS.includes(tier);
    }).length;

    stats = [
      { title: 'Applications Reviewed', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
      { title: 'HR Round Cleared', value: approvedR1, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Pending for manual review from Tier 1, Tier 1-, Tier 2 and Tier 2-', value: pendingTop, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
      { title: 'Rejected', value: rejected, icon: XCircle, color: 'text-red-500 bg-red-500/10' },
      { title: 'Pending Applications from Tier 3 and Tier 4', value: pendingLow, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' }
    ];
  }

  return (
    <div"""
    
    content = content.replace(old_else_block.group(0), new_else_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated StatsBanner:", file_path)


def update_overall_dashboard(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Subtitle
    # In master-portal:
    # {awaitingEvaluation} awaiting evaluation · v2 rubric (max score 30)
    # -> {awaitingEvaluation} Application Pending review rubric
    # In recruiter-portal:
    # {duplicatesRemoved} duplicates removed · v2 rubric (max score 30)
    # Wait, the user said: "0 awaiting evaluation · v2 rubric (max score 30) change to (number) Application Pending review rubric"
    
    content = content.replace(
        "{awaitingEvaluation} awaiting evaluation · v2 rubric (max score 30)",
        "{awaitingEvaluation} Application Pending review rubric"
    )
    # Just in case for recruiter portal which might have a different string format
    content = content.replace(
        "duplicates removed · v2 rubric (max score 30)",
        "duplicates removed · {awaitingEvaluation} Application Pending review rubric"
    )

    # 2. Update Tiers
    content = content.replace("Tier 1+", "Tier 1-")
    content = content.replace("Tier 2+", "Tier 2-")
    
    # Check for T1+ and T2+ abbreviations in master portal
    content = content.replace("T1+", "T1-")
    content = content.replace("T2+", "T2-")
    
    # Fix the duplicate replace if it caused issues (e.g., if there's Tier 1-+)
    # Tier 1- was Tier 1+, so replacing Tier 1+ -> Tier 1- is clean.

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated OverallFunnelDashboard:", file_path)


# Apply changes
update_stats_banner(r'c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\StatsBanner.jsx')
update_stats_banner(r'c:\Users\Dhanush\Music\aviatorsclaude\recruiter-portal\src\components\StatsBanner.jsx')

update_overall_dashboard(r'c:\Users\Dhanush\Music\aviatorsclaude\master-portal\src\components\OverallFunnelDashboard.jsx')
update_overall_dashboard(r'c:\Users\Dhanush\Music\aviatorsclaude\recruiter-portal\src\components\OverallFunnelDashboard.jsx')
