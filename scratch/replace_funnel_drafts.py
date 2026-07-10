import glob

files = glob.glob('*-portal/src/components/OverallFunnelDashboard.jsx')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    orig = content
    
    # Update getFunnelStage function
    old_funnel_stage = """  const getFunnelStage = (c) => {
    const r1 = getR1(c);
    const r2 = getR2(c);
    const r3 = getR3(c);

    if (r3.verdict === 'Yes') return 'Hired';
    if (r3.verdict === 'No') return 'Declined (Offer)';
    if (r2.moved_to_round_3 === 'No') return 'Declined (Review)';
    if (r1.app_status === 'Reject') return 'Declined (Review)';
    if (r1.app_status === 'Yes') return 'Tech Review';
    if (r1.app_status === 'Maybe') return 'Maybe (Reviewed)';
    if (r1.app_status === 'Duplicate') return 'Duplicate';
    return 'Pending Review';
  };"""

    new_funnel_stage = """  const getFunnelStage = (c) => {
    const r1 = getR1(c);
    const r2 = getR2(c);
    const r3 = getR3(c);

    if (r3.verdict === 'Yes') return 'Hired';
    if (r3.verdict === 'No') return 'Declined (Offer)';
    
    const r2Decision = r2.moved_to_round_3;
    const isR2Finished = r2Decision && !r2Decision.endsWith('_draft');
    
    if (isR2Finished && (r2Decision === 'No' || r2Decision === 'Declined')) return 'Declined (Review)';
    if (r1.app_status === 'Reject') return 'Declined (Review)';
    if (r1.app_status === 'Yes') return 'Tech Review';
    if (r1.app_status === 'Maybe') return 'Maybe (Reviewed)';
    if (r1.app_status === 'Duplicate') return 'Duplicate';
    return 'Pending Review';
  };"""

    content = content.replace(old_funnel_stage, new_funnel_stage)
    
    # Update promoted to R3 count
    old_promoted = """              { label: '3. Promoted to R3', count: globalData.filter(c => {
                  const r2 = getR2(c);
                  return r2.moved_to_round_3 === 'Yes' || r2.moved_to_round_3 === 'Maybe';
                }).length, percent: Math.round((globalData.filter(c => {
                  const r2 = getR2(c);
                  return r2.moved_to_round_3 === 'Yes' || r2.moved_to_round_3 === 'Maybe';
                }).length / (stats.total || 1)) * 100), color: 'bg-purple-500' }"""

    new_promoted = """              { label: '3. Promoted to R3', count: globalData.filter(c => {
                  const r2 = getR2(c);
                  const m = r2.moved_to_round_3;
                  return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
                }).length, percent: Math.round((globalData.filter(c => {
                  const r2 = getR2(c);
                  const m = r2.moved_to_round_3;
                  return m && !m.endsWith('_draft') && (m === 'Yes' || m === 'Maybe');
                }).length / (stats.total || 1)) * 100), color: 'bg-purple-500' }"""

    content = content.replace(old_promoted, new_promoted)
    
    if content != orig:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
    else:
        print(f'No changes for {filepath}')
