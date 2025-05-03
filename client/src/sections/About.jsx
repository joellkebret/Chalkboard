import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaUserPlus, FaQuestionCircle, FaCalendarAlt } from 'react-icons/fa';

const About = () => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    margin: '-100px 0px',
    amount: 0.3,
  });

  const cards = [
    {
      icon: <FaUserPlus className="text-7xl text-lime-400" />,
      title: 'Create Your Account',
      desc: 'Sign up in seconds and get started with your personalized dashboard.',
    },
    {
      icon: <FaQuestionCircle className="text-7xl text-lime-400" />,
      title: 'Answer a Few Questions',
      desc: 'Tell us about your courses and study preferences to tailor your schedule.',
    },
    {
      icon: <FaCalendarAlt className="text-7xl text-lime-400" />,
      title: 'Start Your Smart Schedule',
      desc: 'Generate a dynamic plan that adapts to your goals and keeps you on track.',
    },
  ];

  return (
    <motion.section
      ref={ref}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 40 }}
      transition={{ duration: 0.6 }}
      id="about"
      className="py-10 px-8 bg-[#292f36]"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-6xl font-extrabold text-white mb-12">How It Works</h2>
        <p className="text-2xl text-gray-300 mb-24">
          Chalkboard helps you take control of your learning with a smart, streamlined process.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="bg-[#1e232a] p-14 rounded-3xl shadow-2xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.6)] transition-shadow duration-300 flex flex-col items-center text-center"
              whileHover={{ scale: 1.07 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 flex justify-center items-center">
                {card.icon}
              </div>
              <h3 className="text-4xl font-bold text-white mb-4">{card.title}</h3>
              <p className="text-xl text-gray-400">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default About;
