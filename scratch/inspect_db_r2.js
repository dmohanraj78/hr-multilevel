import { createClient } from '@supabase/supabase-js';

const url = 'https://mujqmdmzloizqhglayxe.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(url, key);

async function run() {
  const { data: r1Data } = await supabase.from('round_1_evaluation').select('*').eq('app_status', 'Yes');
  const { data: r2Data } = await supabase.from('round_2_evaluation').select('*');
  const { data: r3Data } = await supabase.from('round_3_evaluation').select('*');

  const r2Map = {}; r2Data.forEach(r => r2Map[r.id] = r);
  const r3Map = {}; r3Data.forEach(r => r3Map[r.id] = r);

  console.log(`Total R1 'Yes' Candidates: ${r1Data.length}`);

  let r2YesCount = 0;
  let r2MaybeCount = 0;
  let r2NoCount = 0;
  let r2PendingCount = 0;

  let r2DraftCount = 0;
  let r2FinalizedCount = 0;

  r1Data.forEach(c => {
    const r2 = r2Map[c.id];
    const dec = r2 ? r2.moved_to_round_3 : null;

    if (!dec) {
      r2PendingCount++;
      r2DraftCount++;
    } else if (dec.endsWith('_draft')) {
      r2PendingCount++;
      r2DraftCount++;
    } else {
      r2FinalizedCount++;
      if (dec === 'Yes') r2YesCount++;
      else if (dec === 'Maybe') r2MaybeCount++;
      else r2NoCount++;
    }
  });

  console.log(`R2 Decisions Breakdown:
    Total Assigned R2: ${r1Data.length}
    Finalized: ${r2FinalizedCount}
    Draft: ${r2DraftCount}
    Finalized Yes: ${r2YesCount}
    Finalized Maybe: ${r2MaybeCount}
    Finalized No: ${r2NoCount}
    Pending (Draft): ${r2PendingCount}
  `);

  console.log("\nChecking R3 candidates:");
  // Let's check how many candidates are in R3 table and their status
  console.log(`Total rows in round_3_evaluation table: ${r3Data.length}`);
  
  // Find which candidates in R3 table do not have R2 decision as Yes/Maybe or R1 status as Yes
  let mismatchCount = 0;
  r3Data.forEach(r3 => {
    const r1 = r1Data.find(c => c.id === r3.id);
    const r2 = r2Map[r3.id];
    if (!r1) {
      console.log(`  Mismatch: Candidate ID ${r3.id} in R3 does not have R1 status 'Yes'!`);
      mismatchCount++;
    }
    const dec = r2 ? r2.moved_to_round_3 : null;
    if (dec !== 'Yes' && dec !== 'Maybe') {
      console.log(`  Mismatch: Candidate ID ${r3.id} in R3 has R2 decision '${dec}' instead of Yes/Maybe!`);
      mismatchCount++;
    }
  });

  console.log(`Total mismatches in R3: ${mismatchCount}`);
}

run();
