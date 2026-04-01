import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: problems, error } = await supabase.from('problems').select('id, title, created_at').order('created_at', { ascending: false }).limit(20);
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("Recent 20 problems:");
  problems.forEach(p => console.log(`- ${p.title} (${p.id}) [${p.created_at}]`));
}

check();
