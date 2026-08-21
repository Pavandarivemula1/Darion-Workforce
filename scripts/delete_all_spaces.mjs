import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtovhnzkzvoxihtrrllv.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10b3ZobnprenZveGlodHJybGx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYwMzU2NiwiZXhwIjoyMTAyMTc5NTY2fQ.UuaHIYlyPlSZ14m8shM-GZJ3I6RFNvIpWkO7YzFfAmE'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function run() {
  console.log('Fetching all spaces/channels from database...')
  const { data: spaces, error } = await supabase
    .from('chat_conversations')
    .select('id, type, name, slug')
    .eq('type', 'channel')

  if (error) {
    console.error('Error fetching spaces:', error)
    process.exit(1)
  }

  console.log(`Found ${spaces.length} spaces:`, spaces)

  if (spaces.length > 0) {
    const spaceIds = spaces.map(s => s.id)
    console.log(`Deleting ${spaceIds.length} spaces...`)
    const { error: delError } = await supabase
      .from('chat_conversations')
      .delete()
      .in('id', spaceIds)

    if (delError) {
      console.error('Error deleting spaces:', delError)
      process.exit(1)
    }
    console.log('All spaces successfully deleted from database!')
  } else {
    console.log('No spaces found to delete.')
  }
}

run()
