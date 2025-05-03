import supabase from '../supabase/supabaseClient.js'

export async function runSchedulingEngine(userId) {
  console.log(`⚙️ Running engine for user ${userId}`)

  // Get preferences
  const { data: prefResults, error: prefError } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .limit(1)

  const preferences = prefResults?.[0]

  if (prefError) {
    console.error('❌ Error fetching preferences:', prefError)
    return
  }

  if (!preferences) {
    console.warn('⚠️ No preferences found for user.')
    return
  }

  // Get availability
  const { data: availability, error: availError } = await supabase
    .from('user_availability')
    .select('*')
    .eq('user_id', userId)

  if (availError) {
    console.error('❌ Error fetching availability:', availError)
    return
  }

  if (!availability || availability.length === 0) {
    console.warn('⚠️ No availability found.')
    return
  }

  // Get tasks
  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .order('priority', { ascending: false })

  if (taskError) {
    console.error('❌ Error fetching tasks:', taskError)
    return
  }

  if (!tasks || tasks.length === 0) {
    console.warn('⚠️ No tasks found to schedule.')
    return
  }

  const task = tasks[0]

  // Find free slot (simplified for Monday)
  const freeMonday = availability.find(a => a.day_of_week === 'Monday')
  if (!freeMonday) {
    console.warn('⚠️ No Monday availability block found.')
    return
  }

  // Schedule block at 10:00 AM on Monday
  const startTime = new Date()
  startTime.setHours(10, 0, 0)

  const endTime = new Date(startTime)
  endTime.setMinutes(startTime.getMinutes() + task.estimated_duration)

  const block = {
    user_id: userId,
    course_id: task.course_id,
    task_id: task.id,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: 'scheduled',
    created_by_engine: true,
    color: task.color || '#aaaaaa',
    created_at: new Date().toISOString()
  }

  const { error: insertError } = await supabase
    .from('study_blocks')
    .insert([block])

  if (insertError) {
    console.error('❌ Failed to insert study block:', insertError)
  } else {
    console.log('✅ Study block created successfully.')
  }
}
