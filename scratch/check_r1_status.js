import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('../.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim().replace(/['"]/g, '');
const supabaseKey = keyMatch[1].trim().replace(/['"]/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('round_1_evaluation')
    .select('app_status');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const counts = {};
  for (const row of data) {
    counts[row.app_status] = (counts[row.app_status] || 0) + 1;
  }
  console.log('Round 1 app_status counts:', counts);
}

run();
