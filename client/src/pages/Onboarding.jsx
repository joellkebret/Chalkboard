import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
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
    setIsLoading(false);
  }, []);

  const questions = [
    {
      id: 'study_time_range',
      question: 'What time can you start and end studying?',
      type: 'time_range'
    },
    {
      id: 'daily_study_hours',
      question: 'How many hours can you study a day?',
      type: 'dual_input',
      labels: ['Preferred Hours', 'Max Hours']
    },
    {
      id: 'best_study_time',
      question: 'What time do you study best?',
      options: ['Morning', 'Afternoon', 'Evening', 'Night']
    },
    {
      id: 'preferred_session_length',
      question: 'Preferred session length?',
      options: ['30', '45', '60', '90', '120'].map(time => `${time} minutes`)
    },
    {
      id: 'preferred_break_length',
      question: 'How long of a break do you like after a session?',
      options: ['5', '10', '15', '20', '30'].map(time => `${time} minutes`).concat('Custom')
    },
    {
      id: 'max_classes_per_day',
      question: 'How many classes can you study a day?',
      options: ['1', '2', '3', '4', '5']
    }
  ];

  const cards = [{ id: 'welcome' }, ...questions, { id: 'filter' }];

  const handleNext = () => {
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

  const savePreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('preferences').upsert({
      user_id: user.id,
      start_time: answers.start_time,
      end_time: answers.end_time,
      preferred_hours: parseFloat(answers.preferred_hours),
      max_hours: parseFloat(answers.max_hours),
      best_study_time: answers.best_study_time,
      preferred_session_length: parseInt(answers.preferred_session_length),
      preferred_break_length: parseInt(customBreak || answers.preferred_break_length),
      max_classes_per_day: parseInt(answers.max_classes_per_day)
    });

    navigate('/calendar');
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
                      <p className="text-gray-600">Let’s personalize your study experience.</p>
                      <button onClick={handleNext} className="bg-lime-400 hover:bg-lime-500 px-6 py-3 rounded-xl text-black font-semibold">Continue</button>
                    </>
                  )}
                  {c.id === 'filter' && (
                    <>
                      <h2 className="text-2xl font-bold text-[#292f36] mb-4">Upload and Organize Your Courses</h2>
                      <div className="bg-[#f9f9f9] rounded-xl p-4">
                        <Filter onFinish={savePreferences} />
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

                        {q.type === 'time_range' && (
                          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <div>
                              <label className="block text-sm mb-1 text-[#292f36]">Start Time</label>
                              <input type="time" className="border rounded-xl px-4 py-2" value={answers.start_time || ''} onChange={e => setAnswers(prev => ({ ...prev, start_time: e.target.value }))} />
                            </div>
                            <div>
                              <label className="block text-sm mb-1 text-[#292f36]">End Time</label>
                              <input type="time" className="border rounded-xl px-4 py-2" value={answers.end_time || ''} onChange={e => setAnswers(prev => ({ ...prev, end_time: e.target.value }))} />
                            </div>
                          </div>
                        )}

                        {q.type === 'dual_input' && (
                          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                            {q.labels.map((label, i) => {
                              const field = i === 0 ? 'preferred_hours' : 'max_hours';
                              return (
                                <div key={label}>
                                  <label className="block text-sm mb-1 text-[#292f36]">{label}</label>
                                  <input type="number" className="border rounded-xl px-4 py-2 w-32" value={answers[field] || ''} onChange={e => setAnswers(prev => ({ ...prev, [field]: e.target.value }))} />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {!q.type && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map(option => (
                              <button
                                key={option}
                                onClick={() => {
                                  if (option === 'Custom') {
                                    handleAnswer(q.id, '');
                                  } else {
                                    handleAnswer(q.id, option);
                                    if (q.id === 'preferred_break_length') setCustomBreak('');
                                  }
                                }}
                                className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium border ${answers[q.id] === option ? 'bg-lime-400 text-black' : 'border-gray-300 text-[#292f36] hover:bg-gray-100'}`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}

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
