import os

filepath = 'evaluator-portal/src/components/CandidateProfileDossier.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace state hooks block
orig_states = """  const [r2Start, setR2Start] = useState(r2.when_can_they_start || '');
  const [r2Duration, setR2Duration] = useState(r2.duration_months || '');
  const [r2Complexity, setR2Complexity] = useState(r2.complexity || '');
  const [r2Solves, setR2Solves] = useState(r2.solves_business_problem || '');
  const [r2Stack, setR2Stack] = useState(r2.tech_stack || '');
  const [r2Comments, setR2Comments] = useState(r2.demo_review_comment || '');
  const [r2NextStep, setR2NextStep] = useState(r2.moved_to_round_3 ? r2.moved_to_round_3.replace('_draft', '') : '');
  const [r2ProductDepth, setR2ProductDepth] = useState(r2.product_depth || '');"""

new_states = """  const [r2Start, setR2Start] = useState(r2.when_can_they_start || '');
  const [r2Duration, setR2Duration] = useState(r2.duration_months || '');
  const [r2Complexity, setR2Complexity] = useState(r2.complexity || '');
  
  // Custom combined column parsing for Contact Status and Problem Fit
  const rawSolves = r2.solves_business_problem || '';
  const initialContact = rawSolves.includes('Contact: ') ? rawSolves.split('Contact: ')[1].split(' | ')[0] : (['Yet to Speak', 'Spoke', 'Scheduled', 'No response'].includes(rawSolves) ? rawSolves : '');
  const initialFit = rawSolves.includes('Fit: ') ? rawSolves.split('Fit: ')[1] : (['Yes', 'Maybe', 'No'].includes(rawSolves) ? rawSolves : '');
  
  const [r2Solves, setR2Solves] = useState(initialContact);
  const [r2ProblemFit, setR2ProblemFit] = useState(initialFit);
  
  const [r2Stack, setR2Stack] = useState(r2.tech_stack || '');
  const [r2Comments, setR2Comments] = useState(r2.demo_review_comment || '');
  const [r2NextStep, setR2NextStep] = useState(r2.moved_to_round_3 ? r2.moved_to_round_3.replace('_draft', '') : '');
  
  // Custom combined column parsing for Tech Depth and Latency Considered
  const rawDepth = r2.product_depth || '';
  const initialDepth = rawDepth.includes('Depth: ') ? rawDepth.split('Depth: ')[1].split(' | ')[0] : (['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : '');
  const initialLatency = rawDepth.includes('Latency: ') ? rawDepth.split('Latency: ')[1] : (!['High', 'Medium', 'Low', 'None'].includes(rawDepth) ? rawDepth : '');
  
  const [r2ProductDepth, setR2ProductDepth] = useState(initialDepth);
  const [r2Latency, setR2Latency] = useState(initialLatency);"""

content = content.replace(orig_states, new_states)

# 2. Replace mandatory checks
orig_checks = """      if (isPromote) {
        const missing = [];
        if (!activeEvaluator) missing.push("Tech Evaluator");
        if (!r2Start.trim()) missing.push("Earliest date they can start the internship");
        if (!r2Duration.trim()) missing.push("How long the candidate can be part of the internship");
        if (!r2Complexity.trim()) missing.push("Any concerns / restrictions");
        if (!r2ProductDepth) missing.push("Technical depth of demo / product");
        if (!r2Solves) missing.push("Contact Status");
        if (!r2Stack.trim()) missing.push("Tech stack used");
        if (!r2NextStep) missing.push("Decision");
        if (!r2Comments.trim()) missing.push("Reason for decision");"""

new_checks = """      if (isPromote) {
        const missing = [];
        if (!r2Start.trim()) missing.push("Earliest date they can start the internship");
        if (!r2Duration.trim()) missing.push("Duration for which they are available");
        if (!r2Complexity.trim()) missing.push("Any concerns / restrictions");
        if (!r2ProductDepth) missing.push("Technical depth of demo / product");
        if (!r2Solves) missing.push("Contact Status");
        if (!r2Stack.trim()) missing.push("Tech stack used");
        if (!r2ProblemFit) missing.push("Problem-solution fit");
        if (!r2Latency.trim()) missing.push("Areas like latency, cost, security, etc");
        if (!r2NextStep) missing.push("Decision");
        if (!r2Comments.trim()) missing.push("Reason for decision");"""

content = content.replace(orig_checks, new_checks)

# 3. Replace save payload
orig_save = """            complexity: r2Complexity,
            solves_business_problem: r2Solves,
            tech_stack: r2Stack,
            demo_review_comment: r2Comments,
            moved_to_round_3: finalDecision,
            product_depth: r2ProductDepth"""

new_save = """            complexity: r2Complexity,
            solves_business_problem: r2Solves || r2ProblemFit ? `Contact: ${r2Solves || ''} | Fit: ${r2ProblemFit || ''}` : '',
            tech_stack: r2Stack,
            demo_review_comment: r2Comments,
            moved_to_round_3: finalDecision,
            product_depth: r2ProductDepth || r2Latency ? `Depth: ${r2ProductDepth || ''} | Latency: ${r2Latency || ''}` : ''"""

content = content.replace(orig_save, new_save)

# 4. Replace form fields block
orig_form = """              {/* Round 2 Vetting Form */}
              {round === 2 && (
                <div className="flex flex-col gap-3 text-sm">
                  
                  {/* Candidate Tier Display */}
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Candidate Review Tier:</span>
                      <Badge variant="outline" className="font-mono font-bold text-xs border-primary/30 text-[#800020] bg-primary/5">
                        {r1.tier || 'N/A'} (Score: {r1.total || 0})
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r1Group" className="font-semibold text-xs">Assign Tech Evaluator</Label>
                    <Select value={r1Group || r1.eval_group} onValueChange={setR1Group}>
                      <SelectTrigger id="r1Group" className="rounded-md">
                        <SelectValue placeholder="Select Tech Evaluator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {reviewers.map((name) => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Start" className="font-semibold text-xs">Earliest date they can start the internship</Label>
                    <Input
                      id="r2Start"
                      placeholder="e.g. 15-08-2026"
                      value={r2Start}
                      onChange={(e) => setR2Start(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Duration" className="font-semibold text-xs">How long the candidate can be part of the internship</Label>
                    <Input
                      id="r2Duration"
                      placeholder="e.g. 6 months"
                      value={r2Duration}
                      onChange={(e) => setR2Duration(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Complexity" className="font-semibold text-xs">Any concerns / restrictions (with college commitment, personal, others)</Label>
                    <Input
                      id="r2Complexity"
                      placeholder="e.g. exams in Oct, college NOC required"
                      value={r2Complexity}
                      onChange={(e) => setR2Complexity(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="r2ProductDepth" className="font-semibold text-xs">Technical depth of demo / product</Label>
                      <Select value={r2ProductDepth} onValueChange={setR2ProductDepth}>
                        <SelectTrigger id="r2ProductDepth" className="rounded-md">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="r2Solves" className="font-semibold text-xs">Contact Status</Label>
                      <Select value={r2Solves} onValueChange={setR2Solves}>
                        <SelectTrigger id="r2Solves" className="rounded-md">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yet to Speak">Yet to Speak</SelectItem>
                          <SelectItem value="Spoke">Spoke</SelectItem>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="No response">No response</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Stack" className="font-semibold text-xs">Tech stack used</Label>
                    <Input
                      id="r2Stack"
                      placeholder="e.g. React, FastApi, Postgres"
                      value={r2Stack}
                      onChange={(e) => setR2Stack(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Next" className="font-semibold text-xs">Decision</Label>
                    <Select value={r2NextStep} onValueChange={setR2NextStep}>
                      <SelectTrigger id="r2Next" className="rounded-md">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="Maybe">Maybe</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Comments" className="font-semibold text-xs">Reason for decision (detailed notes)</Label>
                    <Textarea
                      id="r2Comments"
                      placeholder="Enter detailed notes explaining the review outcome..."
                      value={r2Comments}
                      onChange={(e) => setR2Comments(e.target.value)}
                      rows={3}
                      className="rounded-md"
                    />
                  </div>"""

new_form = """              {/* Round 2 Vetting Form */}
              {round === 2 && (
                <div className="flex flex-col gap-3 text-sm">
                  
                  {/* Candidate Tier Display */}
                  <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Candidate Review Tier:</span>
                      <Badge variant="outline" className="font-mono font-bold text-xs border-primary/30 text-[#800020] bg-primary/5">
                        {r1.tier || 'N/A'} (Score: {r1.total || 0})
                      </Badge>
                    </div>
                  </div>

                  {/* 1. Contact Status */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Solves" className="font-semibold text-xs">Contact Status</Label>
                    <Select value={r2Solves} onValueChange={setR2Solves}>
                      <SelectTrigger id="r2Solves" className="rounded-md">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yet to Speak">Yet to Speak</SelectItem>
                        <SelectItem value="Spoke">Spoke</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="No response">No response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. Earliest date they can start the internship */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Start" className="font-semibold text-xs">Earliest date they can start the internship</Label>
                    <Input
                      id="r2Start"
                      placeholder="e.g. 15-08-2026"
                      value={r2Start}
                      onChange={(e) => setR2Start(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 3. Duration for which they are available */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Duration" className="font-semibold text-xs">Duration for which they are available</Label>
                    <Input
                      id="r2Duration"
                      placeholder="e.g. 6 months"
                      value={r2Duration}
                      onChange={(e) => setR2Duration(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 4. Any concerns / restrictions */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Complexity" className="font-semibold text-xs">Any concerns / restrictions (with college commitment, personal, others)</Label>
                    <Input
                      id="r2Complexity"
                      placeholder="e.g. exams in Oct, college NOC required"
                      value={r2Complexity}
                      onChange={(e) => setR2Complexity(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 5. Technical depth of demo / product */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2ProductDepth" className="font-semibold text-xs">Technical depth of demo / product</Label>
                    <Select value={r2ProductDepth} onValueChange={setR2ProductDepth}>
                      <SelectTrigger id="r2ProductDepth" className="rounded-md">
                        <SelectValue placeholder="Select Depth" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 6. Tech stack used */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Stack" className="font-semibold text-xs">Tech stack used</Label>
                    <Input
                      id="r2Stack"
                      placeholder="e.g. React, FastApi, Postgres"
                      value={r2Stack}
                      onChange={(e) => setR2Stack(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 7. Problem-solution fit */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2ProblemFit" className="font-semibold text-xs">Problem-solution fit</Label>
                    <Select value={r2ProblemFit} onValueChange={setR2ProblemFit}>
                      <SelectTrigger id="r2ProblemFit" className="rounded-md">
                        <SelectValue placeholder="Select Fit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="Maybe">Maybe</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 8. Areas like latency, cost, security, etc been considered */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Latency" className="font-semibold text-xs">Areas like latency, cost, security, etc been considered</Label>
                    <Input
                      id="r2Latency"
                      placeholder="e.g. Rate limits, cost estimates, basic encryption"
                      value={r2Latency}
                      onChange={(e) => setR2Latency(e.target.value)}
                      className="rounded-md"
                    />
                  </div>

                  {/* 9. Decision */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Next" className="font-semibold text-xs">Decision</Label>
                    <Select value={r2NextStep} onValueChange={setR2NextStep}>
                      <SelectTrigger id="r2Next" className="rounded-md">
                        <SelectValue placeholder="Select Decision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="Maybe">Maybe</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Declined">Declined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 10. Reason for decision (detailed notes) */}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="r2Comments" className="font-semibold text-xs">Reason for decision (detailed notes)</Label>
                    <Textarea
                      id="r2Comments"
                      placeholder="Enter detailed notes explaining the review outcome..."
                      value={r2Comments}
                      onChange={(e) => setR2Comments(e.target.value)}
                      rows={3}
                      className="rounded-md"
                    />
                  </div>"""

content = content.replace(orig_form, new_form)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated evaluator CandidateProfileDossier.jsx successfully!")

# Copy to other portals
portals = ['recruiter-portal', 'master-portal', 'executive-portal']
for p in portals:
    target = f'{p}/src/components/CandidateProfileDossier.jsx'
    with open(target, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Copied to {target}")
