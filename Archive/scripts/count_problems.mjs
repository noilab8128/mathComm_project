import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function countProblems() {
    const { count, error } = await supabase
        .from('problems')
        .select('*', { count: 'exact', head: true })

    if (error) {
        console.error('Error fetching count:', error)
        return
    }

    console.log(`Total rows in 'problems' table: ${count}`)
}

countProblems()
