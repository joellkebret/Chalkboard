// server/services/seedTestData.js
import supabase from '../supabase/supabaseClient.js'


async function seed() {
  const userId = '62ea13af-c8d8-4668-83fd-ae1e4641e82c'

  const { error: prefErr } = await supabase.from('preferences').upsert({
    user_id: userId,
    start_study_time: 480,
    end_study_time: 1320,
    best_study_time: 'morning',
    preferred_session_length: 60,
    preferred_break_length: 10,
    max_classes_per_day: 3,
    difficulty_order_preference: 'easy_to_hard'
  })

  const { error: courseErr } = await supabase.from('courses').upsert({
    id: '11111111-aaaa-aaaa-aaaa-111111111111',
    course_code: 'CSC108',
    title: 'Intro to Computer Programming',
    university: 'UofT',
    avg_difficulty_score: 3.2,
    created_at: new Date().toISOString()
  })

  const { error: linkErr } = await supabase.from('user_courses').upsert({
    id: '22222222-bbbb-bbbb-bbbb-222222222222',
    user_id: userId,
    course_id: '11111111-aaaa-aaaa-aaaa-111111111111',
    priority: 4,
    difficulty: 3,
    total_weight: 20.0,
    color_override: '#0055FF',
    created_at: new Date().toISOString()
  })

  const { error: taskErr } = await supabase.from('tasks').upsert({
    id: '33333333-cccc-cccc-cccc-333333333333',
    user_id: userId,
    course_id: '11111111-aaaa-aaaa-aaaa-111111111111',
    title: 'Assignment 1',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_duration: 120,
    completed: false,
    priority: 5,
    color: '#FF8800',
    created_at: new Date().toISOString()
  })

  const { error: availErr } = await supabase.from('user_availability').upsert({
    id: '44444444-dddd-dddd-dddd-444444444444',
    user_id: userId,
    day_of_week: 'Monday',
    start_time: '14:00',
    end_time: '16:00',
    type: 'gym',
    recurring: true,
    created_at: new Date().toISOString()
  })

  const { error: blockErr } = await supabase.from('study_blocks').upsert({
    id: '55555555-eeee-eeee-eeee-555555555555',
    user_id: userId,
    course_id: '11111111-aaaa-aaaa-aaaa-111111111111',
    task_id: '33333333-cccc-cccc-cccc-333333333333',
    start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    created_by_engine: true,
    color: '#00AA88',
    created_at: new Date().toISOString()
  })

  if (prefErr || courseErr || linkErr || taskErr || availErr || blockErr) {
    console.error('❌ Errors:', { prefErr, courseErr, linkErr, taskErr, availErr, blockErr })
  } else {
    console.log('✅ Test data seeded successfully.')
  }
}

seed()
