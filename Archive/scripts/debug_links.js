
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

// Read directly from .env.local if possible
const envPath = '/Volumes/T7/Projects/Mathcomm/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) env[parts[0].trim()] = parts[1].trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching problem with hierarchy links...");
  // Find a problem that has at least one parent
  const { data: samples, error: err1 } = await supabase
    .from('problem_hierarchies')
    .select('child_problem_id, parent_problem_id, parent_solution_id')
    .limit(5);
    
  if (err1) {
    console.error(err1);
    return;
  }
  
  console.log("Links found:", JSON.stringify(samples, null, 2));
  
  if (samples.length > 0) {
    const cid = samples[0].child_problem_id;
    console.log(`Checking path for problem ${cid} (as child)...`);
    const { data: paths, error: err2 } = await supabase
      .from('problem_hierarchies')
      .select('*, parent_problem:problems!parent_problem_id(title), child_problem:problems!child_problem_id(title)')
      .eq('child_problem_id', cid);
      
    console.log("Parent paths for this child:", JSON.stringify(paths, null, 2));
  }
}

run();
