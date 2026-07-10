import os

def update_stats(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Round 2 Stats Swap
    old_r2 = """    stats = [
      { title: 'Total in Review', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
      { title: 'Pending Review', value: pendingReview, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
      { title: 'Promoted (R3)', value: promoted, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Review Declined', value: declined, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    ];"""

    new_r2 = """    stats = [
      { title: 'Total in Review', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
      { title: 'Promoted (R3)', value: promoted, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Pending Review', value: pendingReview, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
      { title: 'Review Declined', value: declined, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    ];"""

    content = content.replace(old_r2, new_r2)

    # Round 1 Stats Swap
    old_r1 = """    stats = [
      { title: 'Total Candidates', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10', subtitle: rawCount > total ? `${rawCount - total} duplicates filtered` : null },
      { title: 'Review Passed (R2)', value: approvedR1, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Rejected Submissions', value: rejected, icon: XCircle, color: 'text-red-500 bg-red-500/10' },
      { title: 'Pending Reviews', value: pendingScreen, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' }
    ];"""

    new_r1 = """    stats = [
      { title: 'Total Candidates', value: total, icon: Users, color: 'text-blue-500 bg-blue-500/10', subtitle: rawCount > total ? `${rawCount - total} duplicates filtered` : null },
      { title: 'Review Passed (R2)', value: approvedR1, icon: CheckCircle2, color: 'text-green-500 bg-green-500/10' },
      { title: 'Pending Reviews', value: pendingScreen, icon: Hourglass, color: 'text-amber-500 bg-amber-500/10' },
      { title: 'Rejected Submissions', value: rejected, icon: XCircle, color: 'text-red-500 bg-red-500/10' }
    ];"""

    content = content.replace(old_r1, new_r1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated StatsBanner in {filepath}")

update_stats('master-portal/src/components/StatsBanner.jsx')
update_stats('recruiter-portal/src/components/StatsBanner.jsx')
