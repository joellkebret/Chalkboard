import supabase from '../supabase/supabaseClient.js'

// Helper to add minutes to a time string (HH:MM:SS)
function addMinutes(time, mins) {
  const [h, m, s] = time.split(':').map(Number)
  const date = new Date(0, 0, 0, h, m, s || 0)
  date.setMinutes(date.getMinutes() + mins)
  return date.toTimeString().slice(0, 8)
}

// Helper to compare time strings
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export async function runSchedulingEngine(userId) {
  console.log(`⚙️ Running engine for user ${userId}`)

  // 1. Fetch preferences
  const { data: prefResults, error: prefError } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
  const preferences = prefResults?.[0]
  if (prefError || !preferences) {
    console.error('❌ Error fetching preferences:', prefError)
    return
  }

  // 2. Fetch user_courses
  const { data: userCourses, error: ucError } = await supabase
    .from('user_courses')
    .select('*')
    .eq('user_id', userId)
  if (ucError) {
    console.error('❌ Error fetching user_courses:', ucError)
    return
  }

  // 3. Fetch tasks
  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
  if (taskError) {
    console.error('❌ Error fetching tasks:', taskError)
    return
  }
  if (!tasks || tasks.length === 0) {
    console.warn('⚠️ No tasks found to schedule.')
    return
  }

  // 4. Fetch availability
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

  // 5. Sort tasks by due date, then priority
  tasks.sort((a, b) => {
    if (a.due_date !== b.due_date) return new Date(a.due_date) - new Date(b.due_date)
    return (b.priority || 0) - (a.priority || 0)
  })

  // 6. Build available slots for the next 7 days
  let slots = []
  const daysOfWeek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(now.getDate() + i)
    const dayName = daysOfWeek[date.getDay()]
    const dayAvail = availability.filter(a => a.day_of_week === dayName)
    for (const avail of dayAvail) {
      let start = avail.start_time
      let end = avail.end_time
      let sessionLen = preferences.preferred_session_length
      while (timeToMinutes(start) + sessionLen <= timeToMinutes(end)) {
        slots.push({
          date: date.toISOString().slice(0,10),
          day_of_week: dayName,
          start_time: start,
          end_time: addMinutes(start, sessionLen),
        })
        start = addMinutes(start, sessionLen + preferences.preferred_break_length)
      }
    }
  }

  // 7. Assign tasks to slots, respecting max_classes_per_day
  let scheduledBlocks = []
  let slotIndex = 0
  let dailyClassCount = {}
  for (const task of tasks) {
    let duration = task.estimated_duration || preferences.preferred_session_length
    let assigned = false
    while (!assigned && slotIndex < slots.length) {
      const slot = slots[slotIndex]
      const day = slot.date
      dailyClassCount[day] = (dailyClassCount[day] || 0)
      if (dailyClassCount[day] >= preferences.max_classes_per_day) {
        slotIndex++
        continue
      }
      // Check if slot is long enough
      if (timeToMinutes(slot.end_time) - timeToMinutes(slot.start_time) >= duration) {
        // Schedule the block
        scheduledBlocks.push({
          user_id: userId,
          course_id: task.course_id,
          task_id: task.id,
          start_time: `${slot.date}T${slot.start_time}`,
          end_time: `${slot.date}T${addMinutes(slot.start_time, duration)}`,
          status: 'scheduled',
          created_by_engine: true,
          color: userCourses.find(c => c.course_id === task.course_id)?.color_override || task.color || '#aaaaaa',
          created_at: new Date().toISOString()
        })
        // Update slot and daily count
        slot.start_time = addMinutes(slot.start_time, duration + preferences.preferred_break_length)
        dailyClassCount[day]++
        assigned = true
      } else {
        slotIndex++
      }
    }
  }

  // 8. Save study_blocks to DB
  for (const block of scheduledBlocks) {
    const { error: insertError } = await supabase
      .from('study_blocks')
      .insert([block])
    if (insertError) {
      console.error('❌ Failed to insert study block:', insertError)
    } else {
      console.log('✅ Study block created:', block.start_time, '-', block.end_time)
    }
  }

  return scheduledBlocks
}
