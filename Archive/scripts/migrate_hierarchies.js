import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching hierarchies with null parent_solution_id...');
  
  const { data: hierarchies, error: fetchErr } = await supabase
    .from('problem_hierarchies')
    .select('id, parent_problem_id')
    .is('parent_solution_id', null);

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }

  if (!hierarchies || hierarchies.length === 0) {
    console.log('No hierarchies found needing update.');
    return;
  }

  console.log(`Found ${hierarchies.length} hierarchies to update.`);

  let successCount = 0;
  let failCount = 0;

  for (const h of hierarchies) {
    // get first solution of parent
    const { data: sols, error: solErr } = await supabase
      .from('solutions')
      .select('id')
      .eq('problem_id', h.parent_problem_id)
      .order('sequence_order', { ascending: true })
      .limit(1);

    if (solErr || !sols || sols.length === 0) {
      console.log(`No solutions found for parent problem ${h.parent_problem_id}. Skipping hierarchy ${h.id}.`);
      failCount++;
      continue;
    }

    const solId = sols[0].id;

    // update hierarchy
    const { error: upErr } = await supabase
      .from('problem_hierarchies')
      .update({ parent_solution_id: solId })
      .eq('id', h.id);

    if (upErr) {
      console.error(`Failed to update hierarchy ${h.id}:`, upErr);
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`Migration complete. Success: ${successCount}. Failed: ${failCount}.`);
}

run();
