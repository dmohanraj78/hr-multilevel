import { createClient } from '@supabase/supabase-js';

const url = 'https://mujqmdmzloizqhglayxe.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('round_1_evaluation').select('id, app_status, eval_group');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log("Total candidates in round_1_evaluation:", data.length);
  const statusGroupPairs = {};
  data.forEach(r => {
    const status = r.app_status || 'null';
    const group = r.eval_group || 'null';
    const key = `${status} / ${group}`;
    statusGroupPairs[key] = (statusGroupPairs[key] || 0) + 1;
  });

  console.log("app_status / eval_group distribution:");
  for (const [key, count] of Object.entries(statusGroupPairs)) {
    console.log(`  ${key}: ${count}`);
  }
}

run();
