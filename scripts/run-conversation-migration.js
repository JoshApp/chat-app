const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Running migration: 20250117000002_add_get_or_create_conversation.sql')

  const migrationPath = path.join(__dirname, '../supabase/migrations/20250117000002_add_get_or_create_conversation.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  console.log('📝 Executing migration SQL...')
  console.log(migrationSQL)

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      throw new Error(`Failed to execute migration: ${error.message}`)
    }

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('\n⚠️  You need to run this migration manually in the Supabase SQL Editor.')
    console.error('Migration file location:', migrationPath)
    process.exit(1)
  }
}

runMigration().catch(error => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
