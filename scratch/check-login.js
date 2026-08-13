const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'pavan@darion.in',
    password: 'AdminPassword123!'
  });
  
  if (error) {
    console.error('Login error:', error.message);
  } else {
    console.log('User metadata:', data.user.user_metadata);
  }
}
check();
