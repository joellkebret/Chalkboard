import supabase from './supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'

const userId = '8f40c5a3-b251-4ca4-b72b-54531e805677'
const courseId = 'e24d646d-fc06-47d6-b93e-372deef3aafd'
const taskId = '6e7cc401-2d38-4fc0-9cc4-cbc610ae014d'

async function insertTestData() {
  console.log('🌱 Inserting test data...')

  // Insert user
  await supabase.from('users').insert([{
    id: userId,
    name: 'Test User',
    email: 'test@example.com',
    auth_provider: 'local',
    profile_picture: 'https://example.com/avatar.png',
    created_at: new Date().toISOString(),
  }])

  // Insert preferences
  await supabase.from('preferences').insert([{
    user_id: userId,
    start_study_time: 480,
    end_study_time: 1320,
    best_study_time: 'morning',
    preferred_session_length: 60,
    preferred_break_length: 10,
    max_classes_per_day: 3,
    difficulty_order_preference: 'easy_to_hard'
  }])

  // Insert availability
  await supabase.from('user_availability').insert([{
    user_id: userId,
    day_of_week: 'Monday',
    start_time: '10:00',
    end_time: '16:00',
    type: 'free',
    recurring: true,
    created_at: new Date().toISOString(),
  }])

  // Insert course
  await supabase.from('courses').insert([{
    id: courseId,
    course_code: 'CSC108',
    title: 'Intro to Computer Science',
    university: 'UofT',
    avg_difficulty_score: 3.2,
    created_at: new Date().toISOString()
  }])

  // Link user to course
  await supabase.from('user_courses').insert([{
    id: uuidv4(),
    user_id: userId,
    course_id: courseId,
    priority: 4,
    difficulty: 3,
    created_at: new Date().toISOString()
  }])

  // Insert task
  await supabase.from('tasks').insert([{
    id: taskId,
    user_id: userId,
    course_id: courseId,
    title: 'Read Chapter 3',
    due_date: new Date(Date.now() + 86400000).toISOString(), // due tomorrow
    estimated_duration: 60,
    completed: false,
    priority: 5,
    color: '#ff9900',
    created_at: new Date().toISOString()
  }])

  console.log('✅ Test data inserted.')
}

insertTestData()
