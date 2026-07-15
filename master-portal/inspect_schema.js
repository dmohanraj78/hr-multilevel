import { createClient } from '@supabase/supabase-js';

const url = 'https://mujqmdmzloizqhglayxe.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(url, key);

async function run() {
  const { data: r1Data } = await supabase.from('round_1_evaluation').select('*').limit(1);
  const { data: r2Data } = await supabase.from('round_2_evaluation').select('*').limit(1);

  console.log("round_1_evaluation keys:", r1Data && r1Data[0] ? Object.keys(r1Data[0]) : "None");
  console.log("round_2_evaluation keys:", r2Data && r2Data[0] ? Object.keys(r2Data[0]) : "None");
}

run();
