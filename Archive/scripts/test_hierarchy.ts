import { supabase } from "./src/lib/supabase";

async function test() {
  const { data, error } = await supabase
    .from('problem_hierarchies')
    .select('*');
  
  if (error) {
    console.error("Error fetching hierarchy:", error);
    return;
  }
  
  console.log("Hierarchy Data Count:", data?.length);
  console.log("Sample Data:", JSON.stringify(data?.slice(0, 3), null, 2));
}

test();
