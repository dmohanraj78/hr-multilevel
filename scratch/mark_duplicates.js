// Script to mark duplicate entries in raw_submissions.Analysis_status
// Duplicates = raw_submissions with Analysis_status='Completed' but NO round_1_evaluation row

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mujqmdmzloizqhglayxe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchAll(buildQuery) {
  const all = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await buildQuery().range(from, from + 999);
    if (error) throw error;
    all.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return all;
}

async function main() {
  // 1. Fetch all raw_submissions
  const rawData = await fetchAll(() =>
    supabase.from('raw_submissions').select('id, Analysis_status').order('id', { ascending: true })
  );
  console.log(`Total raw_submissions: ${rawData.length}`);

  // 2. Fetch all round_1_evaluation IDs
  const r1Data = await fetchAll(() =>
    supabase.from('round_1_evaluation').select('id').order('id', { ascending: true })
  );
  const r1Ids = new Set(r1Data.map(r => r.id));
  console.log(`Total round_1_evaluation rows: ${r1Ids.size}`);

  // 3. Find duplicates: Analysis_status='Completed' but no R1 row
  const duplicates = rawData.filter(r => 
    (r.Analysis_status || '') === 'Completed' && !r1Ids.has(r.id)
  );
  console.log(`\nFound ${duplicates.length} duplicate entries (Analysis_status='Completed' but no R1 row):`);
  duplicates.forEach(d => console.log(`  ID: ${d.id}`));

  // 4. Update those to Analysis_status = 'Duplicate'
  if (duplicates.length === 0) {
    console.log('No duplicates to update.');
    return;
  }

  const ids = duplicates.map(d => d.id);
  console.log(`\nUpdating ${ids.length} rows: Analysis_status -> 'Duplicate'...`);

  const { data, error } = await supabase
    .from('raw_submissions')
    .update({ Analysis_status: 'Duplicate' })
    .in('id', ids)
    .select('id, Analysis_status');

  if (error) {
    console.error('Update failed:', error);
    return;
  }

  console.log(`Successfully updated ${data.length} rows to Analysis_status='Duplicate'`);
  data.forEach(d => console.log(`  ID: ${d.id} -> ${d.Analysis_status}`));
}

main().catch(console.error);
