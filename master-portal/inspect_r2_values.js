import { createClient } from '@supabase/supabase-js';

const url = 'https://mujqmdmzloizqhglayxe.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('round_2_evaluation').select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log("Total rows in round_2_evaluation:", data.length);
  const decisions = {};
  const statuses = {};

  data.forEach(r => {
    const dec = r.moved_to_round_3 || 'null';
    const st = r.contact_status || 'null';
    decisions[dec] = (decisions[dec] || 0) + 1;
    statuses[st] = (statuses[st] || 0) + 1;
  });

  console.log("moved_to_round_3 distribution:");
  for (const [k, count] of Object.entries(decisions)) {
    console.log(`  ${k}: ${count}`);
  }

  console.log("contact_status distribution:");
  for (const [k, count] of Object.entries(statuses)) {
    console.log(`  ${k}: ${count}`);
  }
}

run();
