import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const questionDeck = [
  {
    id: 'is_early_bird',
    question: 'Are you an early bird?',
    type: 'boolean',
  },
  {
    id: 'preferred_session_length',
    question: 'How long do you prefer to study in one session? (minutes)',
    type: 'number',
  },
  {
    id: 'preferred_break_length',
    question: 'How long should breaks between sessions be? (minutes)',
    type: 'number',
  },
  {
    id: 'max_classes_per_day',
    question: 'What is the max number of courses you want to study in one day?',
    type: 'number',
  },
  {
    id: 'fatigue_threshold',
    question: 'After how many hours of class do you feel tired?',
    type: 'number',
  },
  {
    id: 'difficulty_order_preference',
    question: 'How should your tasks be ordered?',
    type: 'select',
    options: ['easy_to_hard', 'hard_to_easy']
  }
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleNext = async () => {
    const current = questionDeck[step];

    // Validation
    if (
      (current.type === 'number' && (!input || isNaN(input))) ||
      (current.type === 'boolean' && input === '') ||
      (current.type === 'select' && !input)
    ) {
      setError('Please enter a valid answer.');
      return;
    }

    setError(null);
    setAnswers({ ...answers, [current.id]: current.type === 'number' ? parseInt(input) : input });
    setInput('');

    if (step + 1 < questionDeck.length) {
      setStep(step + 1);
    } else {
      // Submit to DB
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        console.error(userErr);
        return;
      }

      const { error: insertError } = await supabase
        .from('preferences')
        .insert({ user_id: user.id, ...answers });

      if (insertError) {
        console.error('Error inserting preferences:', insertError);
        return;
      }

      // Optional: flag onboarding complete
      await supabase.from('users').update({ onboarding_complete: true }).eq('id', user.id);

      navigate('/onboarding/next-step');
    }
  };

  const renderInput = (q) => {
    if (q.type === 'boolean') {
      return (
        <div className="space-x-4">
          <button onClick={() => setInput(true)} className="btn">Yes</button>
          <button onClick={() => setInput(false)} className="btn">No</button>
        </div>
      );
    } else if (q.type === 'number') {
      return (
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
        />
      );
    } else if (q.type === 'select') {
      return (
        <select value={input} onChange={(e) => setInput(e.target.value)} className="input">
          <option value="">Select</option>
          {q.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
  };

  const currentQuestion = questionDeck[step];

  return (
    <div className="max-w-xl mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Welcome to Chalkboard 🎓</h1>
      <p className="mb-6">Let's ask a few quick questions to personalize your schedule.</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md mb-4"
        >
          <p className="text-lg font-semibold mb-4">{currentQuestion.question}</p>
          {renderInput(currentQuestion)}
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {currentQuestion.type !== 'boolean' && (
            <button onClick={handleNext} className="btn mt-4">Next</button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
