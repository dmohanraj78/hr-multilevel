import { createClient } from '@supabase/supabase-js';

const url = 'https://mujqmdmzloizqhglayxe.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(url, key);

async function run() {
  // 1. Revert the 5 evaluated candidates to their original evaluators
  const reverts = [
    { id: 575, eval_group: 'Sachin' },
    { id: 371, eval_group: 'Akash' },
    { id: 716, eval_group: 'Akash' },
    { id: 817, eval_group: 'Anmol' },
    { id: 459, eval_group: 'Vedant' }
  ];

  console.log("Restoring original reviewers for evaluated candidates...");
  for (const item of reverts) {
    const { error } = await supabase
      .from('round_1_evaluation')
      .update({ eval_group: item.eval_group })
      .eq('id', item.id);
    if (error) {
      console.error(`Failed to revert id ${item.id}:`, error);
    } else {
      console.log(`Reverted id ${item.id} to ${item.eval_group}`);
    }
  }

  // 2. Fetch candidates who cleared R1
  const { data: r1Data, error: r1Error } = await supabase
    .from('round_1_evaluation')
    .select('*')
    .eq('app_status', 'Yes');
  
  if (r1Error) {
    console.error("Failed to fetch R1 approved candidates:", r1Error);
    process.exit(1);
  }

  // 3. Fetch R2 evaluation records
  const { data: r2Data, error: r2Error } = await supabase
    .from('round_2_evaluation')
    .select('*');

  if (r2Error) {
    console.error("Failed to fetch R2 evaluations:", r2Error);
    process.exit(1);
  }

  const r2Map = {};
  r2Data.forEach(row => {
    r2Map[row.id] = row;
  });

  // Find candidates with no R2 decision yet (moved_to_round_3 is null/empty)
  const undecidedCandidates = r1Data.filter(c => {
    const r2 = r2Map[c.id];
    return !r2 || !r2.moved_to_round_3;
  });

  console.log(`Found ${undecidedCandidates.length} undecided candidates in R2.`);

  // 4. Set 5 of these undecided candidates to unassigned (eval_group = null)
  const targetUndecided = undecidedCandidates.slice(0, 5);
  console.log("Setting 5 undecided candidates to unassigned...");
  for (const c of targetUndecided) {
    const { error } = await supabase
      .from('round_1_evaluation')
      .update({ eval_group: null })
      .eq('id', c.id);
    if (error) {
      console.error(`Failed to update undecided id ${c.id}:`, error);
    } else {
      console.log(`Set undecided candidate id ${c.id} to unassigned (eval_group = null)`);
    }
  }
}

run();
