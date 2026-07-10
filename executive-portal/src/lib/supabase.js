import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://mujqmdmzloizqhglayxe.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const getCredentials = () => {
  const url = localStorage.getItem('supabase_url') || defaultUrl;
  let key = localStorage.getItem('supabase_key');
  
  // Automatically clear old anon keys to force the service_role key
  if (key && (key.includes('ImFub24i') || key.includes('dqPKhwzhBvuL7gNuoNC9Bl-iCOfzZV61qM0whZLfXaA'))) {
    localStorage.removeItem('supabase_key');
    key = null;
  }
  
  return { url, key: key || defaultKey };
};

const creds = getCredentials();
export const supabase = createClient(creds.url, creds.key);

export const updateCredentials = (url, key) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  window.location.reload();
};

// App 1 (Recruiter): Fetch from round_1_evaluation and join raw_submissions
export const fetchCandidates = async () => {
  const { data, error } = await supabase
    .from('round_1_evaluation')
    .select('*, raw_submissions(*)')
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
};

// App 1 Update: Update round_1_evaluation row
export const upsertRound1 = async (id, r1Data) => {
  const { data, error } = await supabase
    .from('round_1_evaluation')
    .update({
      app_status: r1Data.app_status,
      eval_group: r1Data.eval_group,
      review_comments: r1Data.review_comments
    })
    .eq('id', id);
  if (error) throw error;
  return data;
};

// App 2 (Evaluator): Fetch round_1_evaluation candidates passed screening, with raw_submissions & round_2_evaluation
export const fetchRound2Candidates = async () => {
  // 1. Fetch screening passed candidates
  const { data: r1Data, error: r1Error } = await supabase
    .from('round_1_evaluation')
    .select('*, raw_submissions(*)')
    .eq('app_status', 'Yes')
    .order('id', { ascending: true });
    
  if (r1Error) throw r1Error;
  if (!r1Data || r1Data.length === 0) return [];

  // 2. Fetch all tech vetting records (round_2_evaluation)
  const { data: r2Data, error: r2Error } = await supabase
    .from('round_2_evaluation')
    .select('*');
    
  if (r2Error) throw r2Error;

  // 3. Map tech vetting by ID and merge in JS to bypass relationship restrictions
  const r2Map = {};
  (r2Data || []).forEach(row => {
    r2Map[row.id] = row;
  });

  return r1Data.map(c => ({
    ...c,
    round_2_evaluation: r2Map[c.id] || null
  }));
};

// App 2 Update: Upsert into round_2_evaluation table
export const upsertRound2 = async (id, r2Data) => {
  const { data, error } = await supabase
    .from('round_2_evaluation')
    .upsert({
      id: id,
      when_can_they_start: r2Data.when_can_they_start,
      duration_months: r2Data.duration_months,
      complexity: r2Data.complexity,
      solves_business_problem: r2Data.solves_business_problem,
      tech_stack: r2Data.tech_stack,
      demo_review_comment: r2Data.demo_review_comment,
      moved_to_round_3: r2Data.moved_to_round_3,
      product_depth: r2Data.product_depth
    });
  if (error) throw error;
  return data;
};

// App 3 (Executive): Fetch round_1_evaluation with raw_submissions, round_2_evaluation, round_3_evaluation
export const fetchRound3Candidates = async () => {
  // 1. Fetch round 1 screening and raw submission details
  const { data: r1Data, error: r1Error } = await supabase
    .from('round_1_evaluation')
    .select('*, raw_submissions(*)')
    .order('id', { ascending: true });
    
  if (r1Error) throw r1Error;
  if (!r1Data || r1Data.length === 0) return [];

  // 2. Fetch round 2 tech vetting records
  const { data: r2Data, error: r2Error } = await supabase
    .from('round_2_evaluation')
    .select('*');
  if (r2Error) throw r2Error;

  // 3. Fetch round 3 final verdict records
  const { data: r3Data, error: r3Error } = await supabase
    .from('round_3_evaluation')
    .select('*');
  if (r3Error) throw r3Error;

  // 4. Map and merge relationally on client-side
  const r2Map = {};
  (r2Data || []).forEach(row => {
    r2Map[row.id] = row;
  });

  const r3Map = {};
  (r3Data || []).forEach(row => {
    r3Map[row.id] = row;
  });

  const merged = r1Data.map(c => ({
    ...c,
    round_2_evaluation: r2Map[c.id] || null,
    round_3_evaluation: r3Map[c.id] || null
  }));

  // 5. Filter for candidates who passed round 2 vetting
  return merged.filter(c => {
    const r2 = c.round_2_evaluation;
    const move = r2?.moved_to_round_3 || '';
    return move === 'Yes' || move === 'Maybe';
  });
};

// App 3 Update: Upsert into round_3_evaluation table
export const upsertRound3 = async (id, r3Data) => {
  const { data, error } = await supabase
    .from('round_3_evaluation')
    .upsert({
      id: id,
      review_comments: r3Data.review_comments,
      verdict: r3Data.verdict
    });
  if (error) throw error;
  return data;
};
