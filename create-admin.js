const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  console.log('Signing up pavan@darion.in as admin...');
  const { data, error } = await supabase.auth.signUp({
    email: 'pavan@darion.in',
    password: 'AdminPassword123!',
    options: {
      data: {
        full_name: 'Pavan',
        role: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('Successfully created admin user!');
    console.log('Email: pavan@darion.in');
    console.log('Password: AdminPassword123!');
    console.log('\nNOTE: If email confirmations are enabled on your Supabase project, you must check your email to confirm the account before you can log in, or disable email confirmations in the Supabase Dashboard -> Authentication -> Providers -> Email.');
  }
}

createAdmin();
