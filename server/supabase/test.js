import supabase from './supabaseClient.js'

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) console.error('Error:', error)
  else console.log('Sample user:', data)
}

testConnection()