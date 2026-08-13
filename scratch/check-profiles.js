const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error } = await supabase.from('profiles').select('*');
  console.log('Profiles:', users);
  
  // also let's just update the profile to admin to be sure
  if (users && users.length > 0) {
    const pavan = users.find(u => u.full_name.includes('Pavan') || u.id); // just update whoever is there
    if (pavan) {
       console.log('User found:', pavan);
    }
  }
}
check();
