import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { FaArrowRight, FaArrowLeft, FaSun, FaMoon, FaClock, FaCoffee, FaBook, FaBrain, FaRandom, FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Filter from '../sections/Filter';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [answers, setAnswers] = useState({});
  const [customBreak, setCustomBreak] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const checkPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user exists in our database
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          auth_provider: user.app_metadata?.provider || 'email',
          created_at: new Date().toISOString()
        });

      if (userError) {
        console.error('Error creating user:', userError);
        return;
      }

      const { data: preferences, error } = await supabase
        .from('preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (preferences) {
        navigate('/calendar');
        return;
      }

      setIsLoading(false);
    };

    checkPreferences();
  }, [navigate]);

  // Questions mapped to your preferences table
  const questions = [
    {
      id: 'best_time',
      question: 'When do you study best?',
      description: 'Choose the time of day when you feel most productive and focused',
      options: [
        { label: 'Morning (6am-12pm)', icon: <FaSun className="text-yellow-500" /> },
        { label: 'Afternoon (12pm-5pm)', icon: <FaSun className="text-orange-500" /> },
        { label: 'Evening (5pm-10pm)', icon: <FaMoon className="text-blue-500" /> },
        { label: 'Night (10pm-6am)', icon: <FaMoon className="text-indigo-500" /> }
      ]
    },
    {
      id: 'preferred_session_length',
      question: 'How long do you prefer to study in one session?',
      description: 'Select your ideal study session duration. Longer sessions allow for deeper focus but may lead to fatigue',
      options: [
        { label: '30 minutes', icon: <FaClock className="text-gray-500" /> },
        { label: '45 minutes', icon: <FaClock className="text-gray-500" /> },
        { label: '60 minutes', icon: <FaClock className="text-gray-500" /> },
        { label: '90 minutes', icon: <FaClock className="text-gray-500" /> },
        { label: '120 minutes', icon: <FaClock className="text-gray-500" /> }
      ]
    },
    {
      id: 'preferred_break_length',
      question: 'How long do you need for breaks between sessions?',
      description: 'Choose how long you need to rest and recharge between study sessions',
      options: [
        { label: '5 minutes', icon: <FaCoffee className="text-brown-500" /> },
        { label: '10 minutes', icon: <FaCoffee className="text-brown-500" /> },
        { label: '15 minutes', icon: <FaCoffee className="text-brown-500" /> },
        { label: '20 minutes', icon: <FaCoffee className="text-brown-500" /> },
        { label: 'Custom', icon: <FaCoffee className="text-brown-500" /> }
      ]
    },
    {
      id: 'max_classes_per_day',
      question: 'How many different subjects do you want to study per day?',
      description: 'This helps us create a balanced study schedule without overwhelming you',
      options: [
        { label: '1 subject', icon: <FaBook className="text-green-500" /> },
        { label: '2 subjects', icon: <FaBook className="text-green-500" /> },
        { label: '3 subjects', icon: <FaBook className="text-green-500" /> },
        { label: '4 subjects', icon: <FaBook className="text-green-500" /> }
      ]
    },
    {
      id: 'fatigue_threshold',
      question: 'How long can you maintain focus before needing a break?',
      description: 'This helps us determine when to schedule breaks to maintain your productivity',
      options: [
        { label: '30 minutes', icon: <FaBrain className="text-blue-500" /> },
        { label: '1 hour', icon: <FaBrain className="text-blue-500" /> },
        { label: '2 hours', icon: <FaBrain className="text-blue-500" /> },
        { label: '3+ hours', icon: <FaBrain className="text-blue-500" /> }
      ]
    },
    {
      id: 'difficulty_order_preference',
      question: 'How do you want to organize your study tasks?',
      description: 'Choose how you want to approach your study materials',
      options: [
        { label: 'Start with easier topics', icon: <FaArrowRight className="text-green-500" /> },
        { label: 'Tackle harder topics first', icon: <FaArrowRight className="text-red-500" /> },
        { label: 'Mix it up randomly', icon: <FaRandom className="text-purple-500" /> }
      ]
    },
    {
      id: 'study_time_range',
      question: 'What are your available study hours?',
      description: 'Set your preferred study schedule window',
      type: 'time_range',
      icon: <FaCalendarAlt className="text-gray-500" />
    }
  ];

  const cards = [{ id: 'welcome' }, ...questions, { id: 'filter' }];

  const handleNext = async () => {
    // If this is the last question (before filter), save preferences
    if (currentCard === cards.length - 2) { // -2 because last is filter, before that is last question
      await savePreferences(false); // false means don't navigate yet
    }
    if (currentCard < cards.length - 1) {
      setDirection(1);
      setCurrentCard(currentCard + 1);
    }
  };

  const handleBack = () => {
    if (currentCard > 0) {
      setDirection(-1);
      setCurrentCard(currentCard - 1);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const savePreferences = async (shouldNavigate = true) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Not logged in!");
      return;
    }

    // Prepare data for the preferences table
    const preferences = {
      user_id: user.id,
      best_time: answers.best_time || null,
      preferred_session_length: answers.preferred_session_length ? parseInt(answers.preferred_session_length) : null,
      preferred_break_length: customBreak ? parseInt(customBreak) : (answers.preferred_break_length ? parseInt(answers.preferred_break_length) : null),
      max_classes_per_day: answers.max_classes_per_day ? parseInt(answers.max_classes_per_day) : null,
      fatigue_threshold: answers.fatigue_threshold ? parseInt(answers.fatigue_threshold) : null,
      difficulty_order_preference: answers.difficulty_order_preference || null,
      start_time: answers.start_time || null,
      end_time: answers.end_time || null
    };

    // Upsert into preferences
    const { error: prefError } = await supabase
      .from('preferences')
      .upsert(preferences, { onConflict: ['user_id'] });

    if (prefError) {
      console.error("Error saving preferences:", prefError);
      alert("Failed to save preferences.");
      return;
    }

    // Mark onboarding as complete
    const { error: userError } = await supabase
      .from('users')
      .update({ first_login_complete: true })
      .eq('id', user.id);

    if (userError) {
      console.error("Error updating user:", userError);
      alert("Failed to update user profile.");
      return;
    }

    if (shouldNavigate) {
      navigate('/calendar');
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1, zIndex: 10 },
    exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.95 })
  };

  if (isLoading) return <div className="text-white text-center p-10 bg-[#292f36]">Loading...</div>;

  const card = cards[currentCard];

  return (
    <div className="min-h-screen bg-[#292f36] flex justify-center px-4 py-12">
      <div className="relative w-full max-w-xl mt-12">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          {cards.map((c, index) => (
            index === currentCard && (
              <motion.div
                key={c.id || index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="absolute w-full"
              >
                <div className="bg-white rounded-2xl shadow-xl px-8 py-10 text-center space-y-6 flex flex-col justify-start">
                  {c.id === 'welcome' && (
                    <>
                      <h2 className="text-3xl font-bold text-[#292f36]">Welcome to Chalkboard</h2>
                      <p className="text-gray-600">Let's personalize your study experience.</p>
                      <button onClick={handleNext} className="bg-lime-400 hover:bg-lime-500 px-6 py-3 rounded-xl text-black font-semibold">Continue</button>
                    </>
                  )}
                  {c.id === 'filter' && (
                    <>
                      <h2 className="text-2xl font-bold text-[#292f36] mb-4">Upload and Organize Your Courses</h2>
                      <div className="bg-[#f9f9f9] rounded-xl p-4">
                        <Filter onFinish={() => savePreferences(true)} />
                      </div>
                      <div className="flex justify-start pt-4">
                        <button onClick={handleBack} className="text-[#292f36] flex items-center gap-2">
                          <FaArrowLeft /> Back
                        </button>
                      </div>
                    </>
                  )}
                  {questions.find(q => q.id === c.id) && (() => {
                    const q = questions.find(q => q.id === c.id);
                    return (
                      <>
                        <h2 className="text-2xl font-bold text-[#292f36] mt-2">{q.question}</h2>
                        {q.description && (
                          <p className="text-gray-600 text-sm mb-4">{q.description}</p>
                        )}

                        {/* Time range input */}
                        {q.type === 'time_range' && (
                          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <div className="flex items-center gap-2">
                              {q.icon}
                              <div>
                                <label className="block text-sm mb-1 text-[#292f36]">Start Time</label>
                                <input type="time" className="border rounded-xl px-4 py-2" value={answers.start_time || ''} onChange={e => setAnswers(prev => ({ ...prev, start_time: e.target.value }))} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {q.icon}
                              <div>
                                <label className="block text-sm mb-1 text-[#292f36]">End Time</label>
                                <input type="time" className="border rounded-xl px-4 py-2" value={answers.end_time || ''} onChange={e => setAnswers(prev => ({ ...prev, end_time: e.target.value }))} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Option buttons */}
                        {!q.type && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map(option => (
                              <button
                                key={option.label}
                                onClick={() => {
                                  if (option.label === 'Custom') {
                                    handleAnswer(q.id, '');
                                  } else {
                                    handleAnswer(q.id, option.label);
                                    if (q.id === 'preferred_break_length') setCustomBreak('');
                                  }
                                }}
                                className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium border ${answers[q.id] === option.label ? 'bg-lime-400 text-black' : 'border-gray-300 text-[#292f36] hover:bg-gray-100'}`}
                              >
                                {option.icon}
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Custom break input */}
                        {q.id === 'preferred_break_length' && answers[q.id] === '' && (
                          <div className="mt-4">
                            <input
                              type="number"
                              placeholder="Enter custom break in minutes"
                              className="border rounded-xl px-4 py-2 w-full"
                              value={customBreak}
                              onChange={e => setCustomBreak(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="flex justify-between pt-4">
                          <button onClick={handleBack} className="text-[#292f36] flex items-center gap-2">
                            <FaArrowLeft /> Back
                          </button>
                          <button onClick={handleNext} className="text-[#292f36] flex items-center gap-2">
                            Next <FaArrowRight />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;