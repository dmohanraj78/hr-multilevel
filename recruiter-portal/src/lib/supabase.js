import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://mujqmdmzloizqhglayxe.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11anFtZG16bG9penFoZ2xheXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgxNTk0OCwiZXhwIjoyMDk4MzkxOTQ4fQ.G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc';

const getCredentials = () => {
  const url = localStorage.getItem('supabase_url') || defaultUrl;
  let key = localStorage.getItem('supabase_key');
  
  if (key && (key.includes('ImFub24i') || key.includes('dqPKhwzhBvuL7gNuoNC9Bl-iCOfzZV61qM0whZLfXaA') || key.includes('G7AmEylxPwm6TWZ3xjCcBhvhfNPYHdj0V08My0A_rEc'))) {
    localStorage.removeItem('supabase_key');
    key = null;
  }
  
  return { url, key: key || defaultKey };
};

const creds = getCredentials();
export const supabase = createClient(creds.url, creds.key);

// The SSO token hand-off (access_token + refresh_token from the URL) is applied
// in App.jsx's auth check. Doing it here too would strip the params from the URL
// before App.jsx can read them.

export const updateCredentials = (url, key) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  window.location.reload();
};


// PostgREST caps every request at 1000 rows. The funnel tables keep growing,
// so page through with .range() — otherwise the app silently truncates once a
// table crosses 1000 rows and the frontend drifts out of sync with Supabase.
const PAGE_SIZE = 1000;
const fetchAllRows = async (buildQuery) => {
  const all = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    all.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return all;
};

// App 1 (Recruiter): Fetch from round_1_evaluation and join raw_submissions, round_2, and round_3
export const fetchCandidates = async () => {
  // 1. Fetch round 1 screening and raw submission details
  const r1Data = await fetchAllRows(() => supabase
    .from('round_1_evaluation')
    .select('*, raw_submissions(*)')
    .order('id', { ascending: true }));
  if (!r1Data || r1Data.length === 0) return [];

  // 2. Fetch round 2 tech review records
  const r2Data = await fetchAllRows(() => supabase
    .from('round_2_evaluation')
    .select('*')
    .order('id', { ascending: true }));

  // 3. Fetch round 3 final verdict records
  const r3Data = await fetchAllRows(() => supabase
    .from('round_3_evaluation')
    .select('*')
    .order('id', { ascending: true }));

  // 4. Map and merge relationally on client-side
  const r2Map = {};
  (r2Data || []).forEach(row => {
    r2Map[row.id] = row;
  });

  const r3Map = {};
  (r3Data || []).forEach(row => {
    r3Map[row.id] = row;
  });

  return r1Data.map(c => ({
    ...c,
    round_2_evaluation: r2Map[c.id] || null,
    round_3_evaluation: r3Map[c.id] || null
  }));
};

export const upsertRound1 = async (id, r1Data) => {
  const payload = {};
  if (r1Data.app_status !== undefined) payload.app_status = r1Data.app_status;
  if (r1Data.eval_group !== undefined) payload.eval_group = r1Data.eval_group;
  if (r1Data.review_comments !== undefined) payload.review_comments = r1Data.review_comments;

  const { data, error } = await supabase
    .from('round_1_evaluation')
    .update(payload)
    .eq('id', id);
  if (error) throw error;
  return data;
};

// App 2 (Evaluator): Fetch round_1_evaluation candidates passed screening, with raw_submissions & round_2_evaluation
export const fetchRound2Candidates = async () => {
  // 1. Fetch screening passed candidates
  const r1Data = await fetchAllRows(() => supabase
    .from('round_1_evaluation')
    .select('*, raw_submissions(*)')
    .eq('app_status', 'Yes')
    .order('id', { ascending: true }));
  if (!r1Data || r1Data.length === 0) return [];

  // 2. Fetch all tech review records (round_2_evaluation)
  const r2Data = await fetchAllRows(() => supabase
    .from('round_2_evaluation')
    .select('*')
    .order('id', { ascending: true }));

  // 3. Map tech review by ID and merge in JS to bypass relationship restrictions
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
      product_depth: r2Data.product_depth,
      contact_status: r2Data.contact_status,
      problem_fit: r2Data.problem_fit,
      tech_depth: r2Data.tech_depth,
      latency_considerations: r2Data.latency_considerations
    });
  if (error) throw error;
  return data;
};

// Global Funnel: Fetch all raw_submissions and left-join all evaluation rounds
export const fetchGlobalFunnelData = async () => {
  const rawData = await fetchAllRows(() => supabase
    .from('raw_submissions')
    .select('*')
    .order('id', { ascending: true }));

  const r1Data = await fetchAllRows(() => supabase
    .from('round_1_evaluation')
    .select('*')
    .order('id', { ascending: true }));

  const r2Data = await fetchAllRows(() => supabase
    .from('round_2_evaluation')
    .select('*')
    .order('id', { ascending: true }));

  const r3Data = await fetchAllRows(() => supabase
    .from('round_3_evaluation')
    .select('*')
    .order('id', { ascending: true }));

  const r1Map = {};
  (r1Data || []).forEach(row => { r1Map[row.id] = row; });

  const r2Map = {};
  (r2Data || []).forEach(row => { r2Map[row.id] = row; });

  const r3Map = {};
  (r3Data || []).forEach(row => { r3Map[row.id] = row; });

  return (rawData || []).map(c => ({
    ...c,
    round_1_evaluation: r1Map[c.id] || null,
    round_2_evaluation: r2Map[c.id] || null,
    round_3_evaluation: r3Map[c.id] || null
  }));
};

// App 3 (Executive): Fetch round_1_evaluation with raw_submissions, round_2_evaluation, round_3_evaluation
export const fetchRound3Candidates = async () => {
  // 1. Fetch round 1 screening and raw submission details
  const r1Data = await fetchAllRows(() => supabase
    .from('round_1_evaluation')
    .select('*, raw_submissions(*)')
    .order('id', { ascending: true }));
  if (!r1Data || r1Data.length === 0) return [];

  // 2. Fetch round 2 tech review records
  const r2Data = await fetchAllRows(() => supabase
    .from('round_2_evaluation')
    .select('*')
    .order('id', { ascending: true }));

  // 3. Fetch round 3 final verdict records
  const r3Data = await fetchAllRows(() => supabase
    .from('round_3_evaluation')
    .select('*')
    .order('id', { ascending: true }));

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

  // 5. Filter for candidates who passed round 2 review
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
      final_status: r3Data.final_status
    });
  if (error) throw error;
  return data;
};
