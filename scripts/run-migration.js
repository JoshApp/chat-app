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
  console.log('🚀 Running migration: 001_add_display_name.sql')

  const migrationPath = path.join(__dirname, '../supabase/migrations/001_add_display_name.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  // Split SQL by statements (basic split on semicolons, excluding comments)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))

  console.log(`📝 Found ${statements.length} SQL statements`)

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`)
    console.log(`   ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`)

    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })

      if (error) {
        // Try direct execution if RPC fails
        console.log('   Trying direct execution...')
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: statement + ';' })
        })

        if (!response.ok) {
          throw new Error(`Failed to execute statement: ${error.message}`)
        }
      }

      console.log('   ✅ Success')
    } catch (error) {
      console.error('   ❌ Error:', error.message)
      console.error('\n⚠️  Migration failed. You may need to run this migration manually in the Supabase SQL Editor.')
      console.error('Migration file location:', migrationPath)
      process.exit(1)
    }
  }

  console.log('\n✨ Migration completed successfully!')
  console.log('\n📋 Next steps:')
  console.log('   1. Verify the migration in Supabase dashboard')
  console.log('   2. Check that display_name field exists in the users table')
  console.log('   3. Test signup and display name editing')
}

runMigration().catch(error => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
