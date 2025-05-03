import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import '../styles/Onboarding.css';
import { FaSun, FaMoon, FaSortAmountDown, FaSortAmountUp, FaClock, FaListOl } from 'react-icons/fa';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [courseRatings, setCourseRatings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch courses from the database
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*');
        
        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }
        
        setCourses(data || []);
      } catch (error) {
        console.error('Error in fetchCourses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const questions = [
    {
      id: 'is_early_bird',
      question: 'Are you an early bird or a night owl?',
      options: [
        { label: 'Early Bird', icon: <FaSun className="option-icon" /> },
        { label: 'Night Owl', icon: <FaMoon className="option-icon" /> }
      ],
      type: 'boolean'
    },
    {
      id: 'preferred_session_length',
      question: 'How long do you prefer to study in one session?',
      options: [
        { label: '30 minutes', icon: <FaClock className="option-icon" /> },
        { label: '45 minutes', icon: <FaClock className="option-icon" /> },
        { label: '60 minutes', icon: <FaClock className="option-icon" /> },
        { label: '90 minutes', icon: <FaClock className="option-icon" /> },
        { label: '120 minutes', icon: <FaClock className="option-icon" /> }
      ],
      type: 'number'
    },
    {
      id: 'preferred_break_length',
      question: 'How long should breaks between sessions be?',
      options: [
        { label: '5 minutes', icon: <FaClock className="option-icon" /> },
        { label: '10 minutes', icon: <FaClock className="option-icon" /> },
        { label: '15 minutes', icon: <FaClock className="option-icon" /> },
        { label: '20 minutes', icon: <FaClock className="option-icon" /> },
        { label: '30 minutes', icon: <FaClock className="option-icon" /> }
      ],
      type: 'number'
    },
    {
      id: 'max_classes_per_day',
      question: 'What is the max number of courses you want to study in one day?',
      options: [
        { label: '1', icon: <FaListOl className="option-icon" /> },
        { label: '2', icon: <FaListOl className="option-icon" /> },
        { label: '3', icon: <FaListOl className="option-icon" /> },
        { label: '4', icon: <FaListOl className="option-icon" /> },
        { label: '5', icon: <FaListOl className="option-icon" /> }
      ],
      type: 'number'
    },
    {
      id: 'fatigue_threshold',
      question: 'After how many hours of class do you feel tired?',
      options: [
        { label: '2 hours', icon: <FaClock className="option-icon" /> },
        { label: '3 hours', icon: <FaClock className="option-icon" /> },
        { label: '4 hours', icon: <FaClock className="option-icon" /> },
        { label: '5 hours', icon: <FaClock className="option-icon" /> },
        { label: '6+ hours', icon: <FaClock className="option-icon" /> }
      ],
      type: 'number'
    },
    {
      id: 'difficulty_order_preference',
      question: 'How should your tasks be ordered?',
      options: [
        { label: 'Easy to Hard', icon: <FaSortAmountUp className="option-icon" /> },
        { label: 'Hard to Easy', icon: <FaSortAmountDown className="option-icon" /> }
      ],
      type: 'select'
    }
  ];

  const totalCards = questions.length + 1;

  const handleContinue = () => {
    setCurrentCard(1);
  };

  const handleAnswer = (questionId, answer) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    setTimeout(() => {
      if (currentCard < questions.length) {
        setCurrentCard(prev => prev + 1);
      } else if (courses.length > 0) {
        setCurrentCard(prev => prev + 1);
      } else {
        savePreferences();
      }
      setIsAnimating(false);
    }, 400);
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
          difficulty_order_preference: answers.difficulty_order_preference?.toLowerCase().replace(' ', '_')
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

  if (isLoading) {
    return (
      <div className="onboarding-container">
        <div className="card-deck">
          <div className="card active">
            <h2 className="card-question">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="card-deck">
        {/* Welcome Card */}
        {currentCard === 0 && (
          <div className="card active welcome-card" style={{ zIndex: totalCards }}>
            <h2 className="card-question" style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Welcome to Chalkboard!</h2>
            <p className="welcome-desc">Let's personalize your study experience. We'll ask a few quick questions to get started.</p>
            <button className="continue-btn" onClick={handleContinue}>Continue</button>
          </div>
        )}
        {/* Question Cards */}
        {questions.map((q, index) => (
          <div
            key={q.id}
            className={`card ${index + 1 === currentCard ? 'active' : index + 1 < currentCard ? 'hidden' : ''}`}
            style={{
              zIndex: totalCards - (index + 1),
              display: index + 1 > currentCard ? 'none' : 'flex',
            }}
          >
            <h2 className="card-question">{q.question}</h2>
            <div className="card-options">
              {q.options.map((option) => (
                <button
                  key={option.label}
                  className={`card-option ${answers[q.id] === option.label ? 'selected' : ''}`}
                  onClick={() => handleAnswer(q.id, option.label)}
                >
                  {option.icon && <span className="option-icon-wrap">{option.icon}</span>}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {/* Course Rating Section */}
        {currentCard === totalCards && courses.length > 0 && (
          <div className="card active" style={{ zIndex: 1 }}>
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
