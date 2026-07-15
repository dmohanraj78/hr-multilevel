import { createClient } from '@supabase/supabase-js';

const url = 'https://mujqmdmzloizqhglayxe.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase
    .from('round_1_evaluation')
    .select('id')
    .eq('app_status', 'Yes')
    .limit(5);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  const ids = data.map(r => r.id);
  console.log("Found 5 approved candidates to set unassigned:", ids);

  for (const id of ids) {
    const { error: updateError } = await supabase
      .from('round_1_evaluation')
      .update({ eval_group: null })
      .eq('id', id);

    if (updateError) {
      console.error(`Failed to update id ${id}:`, updateError);
    } else {
      console.log(`Successfully updated id ${id} to unassigned`);
    }
  }
}

run();
