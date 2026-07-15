import { createClient } from '@supabase/supabase-js';

const url = 'https://mujqmdmzloizqhglayxe.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('round_1_evaluation').select('*').eq('app_status', 'Yes');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log("Total R2 candidates count:", data.length);
  const evalGroups = {};
  data.forEach(r => {
    const g = r.eval_group;
    evalGroups[g] = (evalGroups[g] || 0) + 1;
  });

  console.log("eval_group distribution:");
  for (const [g, count] of Object.entries(evalGroups)) {
    console.log(`  ${g}: ${count}`);
  }
}

run();
