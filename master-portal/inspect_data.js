import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('../.env', 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.substring(line.indexOf('=') + 1).trim().replace(/['"\r]/g, '');
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.substring(line.indexOf('=') + 1).trim().replace(/['"\r]/g, '');
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: candidates, error } = await supabase.from('candidates').select('*');
    if (error) {
        console.error(error);
        return;
    }

    const locations = {};
    const rubrics = {};

    candidates.forEach(c => {
        let r1 = c.round_1_evaluation || {};
        if (Array.isArray(r1)) r1 = r1[0] || {};
        let r2 = c.round_2_evaluation || {};
        if (Array.isArray(r2)) r2 = r2[0] || {};

        const loc = c.location || c.Location || r1.location || r1.Location || c.current_location || 'Unknown';
        locations[loc] = (locations[loc] || 0) + 1;

        const reason = r1.reason_for_status || r1.reason || 'None';
        if (reason !== 'None') {
            rubrics[reason] = (rubrics[reason] || 0) + 1;
        }
    });

    console.log("Locations:");
    Object.entries(locations).sort((a,b) => b[1]-a[1]).slice(0, 30).forEach(([k,v]) => console.log(`${k}: ${v}`));

    console.log("\nRubrics/Reasons:");
    Object.entries(rubrics).sort((a,b) => b[1]-a[1]).slice(0, 30).forEach(([k,v]) => console.log(`${k}: ${v}`));
}

checkData();
