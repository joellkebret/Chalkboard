import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import '../styles/Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseRatings, setCourseRatings] = useState({});

  useEffect(() => {
    // Fetch courses from the database
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*');
      
      if (error) {
        console.error('Error fetching courses:', error);
        return;
      }
      
      setCourses(data);
    };

    fetchCourses();
  }, []);

  const questions = [
    {
      id: 'is_early_bird',
      question: 'Are you an early bird or a night owl?',
      options: ['Early Bird', 'Night Owl'],
      type: 'boolean'
    },
    {
      id: 'preferred_session_length',
      question: 'How long do you prefer to study in one session?',
      options: ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes'],
      type: 'number'
    },
    {
      id: 'preferred_break_length',
      question: 'How long should breaks between sessions be?',
      options: ['5 minutes', '10 minutes', '15 minutes', '20 minutes', '30 minutes'],
      type: 'number'
    },
    {
      id: 'max_classes_per_day',
      question: 'What is the max number of courses you want to study in one day?',
      options: ['1', '2', '3', '4', '5'],
      type: 'number'
    },
    {
      id: 'fatigue_threshold',
      question: 'After how many hours of class do you feel tired?',
      options: ['2 hours', '3 hours', '4 hours', '5 hours', '6+ hours'],
      type: 'number'
    },
    {
      id: 'difficulty_order_preference',
      question: 'How should your tasks be ordered?',
      options: ['Easy to Hard', 'Hard to Easy'],
      type: 'select'
    }
  ];

  const handleAnswer = (questionId, answer) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    setTimeout(() => {
      if (currentCard < questions.length - 1) {
        setCurrentCard(prev => prev + 1);
      } else if (courses.length > 0) {
        // Move to course rating section
        setCurrentCard(prev => prev + 1);
      } else {
        savePreferences();
      }
      setIsAnimating(false);
    }, 500);
  };

  const handleCourseRating = (courseId, difficulty, importance) => {
    setCourseRatings(prev => ({
      ...prev,
      [courseId]: { difficulty, importance }
    }));
  };

  const savePreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save preferences
      const { error: prefError } = await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          is_early_bird: answers.is_early_bird === 'Early Bird',
          preferred_session_length: parseInt(answers.preferred_session_length),
          preferred_break_length: parseInt(answers.preferred_break_length),
          max_classes_per_day: parseInt(answers.max_classes_per_day),
          fatigue_threshold: parseInt(answers.fatigue_threshold),
          difficulty_order_preference: answers.difficulty_order_preference.toLowerCase().replace(' ', '_')
        });

      if (prefError) throw prefError;

      // Save course ratings
      for (const [courseId, ratings] of Object.entries(courseRatings)) {
        const { error: courseError } = await supabase
          .from('user_courses')
          .upsert({
            user_id: user.id,
            course_id: courseId,
            difficulty: ratings.difficulty,
            priority: ratings.importance
          });

        if (courseError) throw courseError;
      }

      navigate('/home');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const renderRatingStars = (value, onChange, type) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${value >= star ? 'active' : ''}`}
            onClick={() => onChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="onboarding-container">
      <div className="card-deck">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`card ${index === currentCard ? 'active' : ''} ${
              index < currentCard ? 'swiped' : ''
            } ${isAnimating ? 'animating' : ''}`}
            style={{
              transform: `translateX(${(index - currentCard) * 20}px) rotate(${
                (index - currentCard) * 5
              }deg)`,
              zIndex: questions.length - index,
            }}
          >
            <h2 className="card-question">{q.question}</h2>
            <div className="card-options">
              {q.options.map((option) => (
                <button
                  key={option}
                  className={`card-option ${answers[q.id] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswer(q.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Course Rating Section */}
        {currentCard === questions.length && courses.length > 0 && (
          <div className="card active">
            <h2 className="card-question">Rate your courses</h2>
            <div className="course-ratings">
              {courses.map((course) => (
                <div key={course.id} className="course-rating">
                  <h3>{course.course_code} - {course.title}</h3>
                  <div className="rating-section">
                    <span>Difficulty:</span>
                    {renderRatingStars(
                      courseRatings[course.id]?.difficulty || 0,
                      (value) => handleCourseRating(course.id, value, courseRatings[course.id]?.importance || 0),
                      'difficulty'
                    )}
                  </div>
                  <div className="rating-section">
                    <span>Importance:</span>
                    {renderRatingStars(
                      courseRatings[course.id]?.importance || 0,
                      (value) => handleCourseRating(course.id, courseRatings[course.id]?.difficulty || 0, value),
                      'importance'
                    )}
                  </div>
                </div>
              ))}
              <button 
                className="save-button"
                onClick={savePreferences}
                disabled={Object.keys(courseRatings).length !== courses.length}
              >
                Complete Onboarding
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
