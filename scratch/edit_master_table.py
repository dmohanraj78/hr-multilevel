import os
import re

file_path = r"c:\Users\Dhanush\Music\aviatorsclaude\scratch\CandidateListTable_master.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update getStatusInfo for round 2 & 3 final_status references (although master-portal App/supabase.js will pass it)
content = content.replace("const verdict = r3Parsed?.verdict;", "const verdict = r3Parsed?.final_status || r3Parsed?.verdict;")
# Also for Round 2, adding 'contact_status'
# wait, contact_status is not a status info, it's just a column. 

# 2. Re-write the TableHeader
header_start = content.find("<TableHeader")
header_end = content.find("</TableHeader>") + len("</TableHeader>")
old_header = content[header_start:header_end]

# We will replace the <TableRow> inside <TableHeader> entirely
new_table_row = """<TableRow>
              {/* Common Columns */}
              <TableHead className="w-[85px] font-mono text-xs py-3 overflow-visible">
                <HeaderFilter label="ID" columnKey="id" uniqueValues={uniqueIds} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} isNumeric={true} />
              </TableHead>
              <TableHead className="overflow-visible min-w-[180px]">
                <HeaderFilter label="Candidate" columnKey="candidate" uniqueValues={uniqueCandidates} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} />
              </TableHead>
              <TableHead className="w-[125px] overflow-visible">
                <HeaderFilter label="Tier" columnKey="tier" uniqueValues={uniqueTiers} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} />
              </TableHead>
              <TableHead className="w-[110px] overflow-visible">
                <HeaderFilter label="Score" columnKey="score" uniqueValues={uniqueScores} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} isNumeric={true} />
              </TableHead>

              {/* Round 1 & 2 */}
              {round !== 3 && (
                <TableHead className="w-[155px] overflow-visible">
                  <HeaderFilter label="Demo-AI Review" columnKey="review_cat" uniqueValues={uniqueReviewCats} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} />
                </TableHead>
              )}
              {showTechEvaluatorFilter && round !== 3 && (
                <TableHead className="w-[180px] overflow-visible">
                  <HeaderFilter label="Technical Reviewer" columnKey="clan" uniqueValues={uniqueClans} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} />
                </TableHead>
              )}
              {round === 2 && (
                <TableHead className="w-[150px] overflow-visible">Contact Status</TableHead>
              )}
              {round !== 3 && (
                <TableHead className="w-[155px] overflow-visible">
                  <HeaderFilter label="Status" columnKey="status" uniqueValues={uniqueStatuses} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} />
                </TableHead>
              )}

              {/* Round 3 specific */}
              {round === 3 && (
                <>
                  <TableHead className="w-[180px] overflow-visible">
                    <HeaderFilter label="TR Name" columnKey="clan" uniqueValues={uniqueClans} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} />
                  </TableHead>
                  <TableHead className="min-w-[240px] font-semibold">TR Comments</TableHead>
                  <TableHead className="w-[120px] font-semibold">TR Decision</TableHead>
                  <TableHead className="w-[160px] font-semibold">Intern Duration</TableHead>
                </>
              )}
              
              <TableHead className="w-[150px] text-right font-semibold pr-6">Review</TableHead>
              
              {round === 3 && (
                <TableHead className="w-[155px] overflow-visible">
                  <HeaderFilter label="Final Status" columnKey="status" uniqueValues={uniqueStatuses} activeFilters={activeFilters} onApplyFilter={handleApplyFilter} sortConfig={sortConfig} onSort={handleSort} />
                </TableHead>
              )}
            </TableRow>"""

# Replace old table row in header
old_tr_start = old_header.find("<TableRow>")
old_tr_end = old_header.find("</TableRow>") + len("</TableRow>")
new_header = old_header[:old_tr_start] + new_table_row + old_header[old_tr_end:]
content = content.replace(old_header, new_header)


# 3. Rewrite TableBody
# We need to find the `sortedAndFiltered.map` block and rewrite the TableRow cells.
# I will just write a regex to replace the <TableRow> ... </TableRow> block inside the map
body_match = re.search(r'(<TableRow key=\{cand\.id\}.*?>)(.*?)(</TableRow>)', content, re.DOTALL)
if body_match:
    old_row_tag = body_match.group(1)
    old_row_content = body_match.group(2)
    old_row_end = body_match.group(3)

    new_row_content = """
                    <TableCell className="font-mono text-xs font-bold py-4">{cand.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground truncate">{getBio(cand, 'full_name')}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0.5 border-primary/20">{getEval1(cand, 'tier') || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-extrabold text-sm text-[#800020]">
                      {getEval1(cand, 'total') || 0}
                    </TableCell>

                    {/* Round 1 & 2 Specific */}
                    {round !== 3 && <TableCell>{catBadge}</TableCell>}
                    {showTechEvaluatorFilter && round !== 3 && (
                      <TableCell className="py-2">
                        {round === 1 ? (
                          <select
                            value={getEval1(cand, 'eval_group') || 'None'}
                            onChange={(e) => {
                              const val = e.target.value;
                              onUpdateTechEvaluator?.(cand.id, val === 'None' ? null : val);
                            }}
                            className="h-8 w-24 text-xs bg-card border rounded-md px-1 focus:outline-none focus:ring-1 focus:ring-[#800020] font-semibold text-[#800020] border-[#800020]/20"
                          >
                            <option value="None">None</option>
                            <option value="Tejaswini">Tejaswini</option>
                            <option value="Sohan">Sohan</option>
                            <option value="Basvaraj">Basvaraj</option>
                            <option value="Pushkaraj">Pushkaraj</option>
                            <option value="Akash">Akash</option>
                            <option value="Anmol">Anmol</option>
                            <option value="Sachin">Sachin</option>
                            <option value="Akhil L">Akhil L</option>
                            <option value="Vedant">Vedant</option>
                            <option value="Akhil M">Akhil M</option>
                            <option value="Samit">Samit</option>
                            <option value="Snehanshu">Snehanshu</option>
                            <option value="Ankita">Ankita</option>
                            <option value="Kaushik">Kaushik</option>
                            <option value="Aman">Aman</option>
                          </select>
                        ) : (
                          <Badge variant="outline" className="font-semibold text-[11px] border-primary/20 text-[#800020] bg-primary/5 rounded-full px-2">
                            {getEval1(cand, 'eval_group') || 'None'}
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    {round === 2 && (
                      <TableCell>
                        {cand.round_2_evaluation?.[0]?.contact_status || cand.round_2_evaluation?.contact_status || 'Pending'}
                      </TableCell>
                    )}
                    {round !== 3 && <TableCell>{statusBadge}</TableCell>}

                    {/* Round 3 Specific */}
                    {round === 3 && (() => {
                      const r2val = cand.round_2_evaluation;
                      const r2 = Array.isArray(r2val) ? (r2val[0] || {}) : (r2val || {});
                      const trComment = r2.demo_review_comment || '';
                      const trDecision = r2.moved_to_round_3 || '';
                      const duration = r2.when_can_they_start || '';
                      return (
                        <>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold text-[11px] border-primary/20 text-[#800020] bg-primary/5 rounded-full px-2">
                              {getEval1(cand, 'eval_group') || 'None'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[280px]">
                            <span title={trComment} className="text-xs text-muted-foreground line-clamp-2 whitespace-normal block">
                              {trComment || 'No comments left.'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-semibold">{trDecision}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs">{duration}</span>
                          </TableCell>
                        </>
                      );
                    })()}

                    {/* Actions (Review Worksheet) */}
                    <TableCell className="text-right pr-6">
                      <Button variant="outline" size="sm" onClick={() => onSelectCandidate(cand)} className="h-8 shadow-sm font-semibold rounded-lg text-[#800020] border-[#800020]/20 hover:bg-[#800020] hover:text-white transition-all">
                        {round === 1 ? 'Evaluate' : round === 2 ? 'Review' : 'Final Verdict'}
                      </Button>
                    </TableCell>

                    {/* Round 3 Final Status */}
                    {round === 3 && <TableCell>{statusBadge}</TableCell>}
    """
    
    # We also need to fix the colSpan for the "No applicants" message
    content = content.replace(
        'colSpan={round === 3 ? 8 : (showTechEvaluatorFilter ? 9 : 8)}',
        'colSpan={round === 3 ? 10 : (round === 2 ? (showTechEvaluatorFilter ? 9 : 8) : (showTechEvaluatorFilter ? 8 : 7))}'
    )
    
    # Combine everything
    content = content.replace(old_row_content, new_row_content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Master table updated in scratch")
