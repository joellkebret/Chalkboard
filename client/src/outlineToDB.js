import { supabase } from './supabase/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// This function will be called with the processed PDF data
export const processOutlineData = async (data) => {
  console.log('Processing outline data:', data);
  
  if (data.courses && Array.isArray(data.courses)) {
    for (const course of data.courses) {
      try {
        // Generate a UUID for the course
        const courseId = uuidv4();

        // First, write to the courses table
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .insert([
            {
              id: courseId,
              course_name: course.courseName,
              title: course.courseName,
              topics: course.topics.join(' '), // Join topics with spaces
              weight: 1.0, // Default weight
              priority: 1, // Default priority
              difficulty: 1 // Default difficulty
            }
          ])
          .select()
          .single();

        if (courseError) throw courseError;

        // Then write to user_courses table
        const { error: userCourseError } = await supabase
          .from('user_courses')
          .insert([
            {
              course_id: courseId,
              course_name: course.courseName,
              topics: course.topics.join(' '), // Join topics with spaces
              total_weight: 1.0 // Default weight
            }
          ]);

        if (userCourseError) throw userCourseError;

        // Finally, write to tasks table for each lecture time
        if (course.lectureTimes && course.lectureTimes.length > 0) {
          for (const lectureTime of course.lectureTimes) {
            if (lectureTime === 'ASYNC') continue; // Skip async courses
            
            // Parse the lecture time (format: "DAYHHMM-HHMM")
            const day = lectureTime.substring(0, 3);
            const startTime = lectureTime.substring(3, 7);
            const endTime = lectureTime.substring(8, 12);

            // Format times for database (HH:MM:SS)
            const formattedStartTime = `${startTime.substring(0, 2)}:${startTime.substring(2, 4)}:00`;
            const formattedEndTime = `${endTime.substring(0, 2)}:${endTime.substring(2, 4)}:00`;

            const { error: taskError } = await supabase
              .from('tasks')
              .insert([
                {
                  course_id: courseId,
                  course_name: course.courseName,
                  task_type: 'lecture',
                  start_time: formattedStartTime,
                  end_time: formattedEndTime,
                  color: '#4CAF50' // Default green color for lectures
                }
              ]);

            if (taskError) throw taskError;
          }
        }

        console.log(`Successfully processed course: ${course.courseName}`);
      } catch (error) {
        console.error(`Error processing course ${course.courseName}:`, error);
      }
    }
  }
};
