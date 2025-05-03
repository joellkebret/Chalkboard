import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Features = () => {
  const ref = useRef(null);
  const inView = useInView(ref, {
    margin: '-100px 0px',
    amount: 0.3,
  });

  return (
    <motion.section
      ref={ref}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 40 }}
      transition={{ duration: 0.6 }}
      className="py-10 px-10 bg-[#292f36]"
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-7xl font-extrabold text-white mb-16">Features</h2>
        <p className="text-3xl text-gray-300 mb-24">
          Smarter study planning built for students who want clarity, structure, and results.
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-10 text-left text-gray-300 text-2xl max-w-4xl mx-auto">
          <li className="flex items-start gap-5">
            ✅
            <span>
              A custom-built scheduling engine that intelligently generates your study plan by incorporating your availability, preferences, and academic deadlines—no generic templates.
            </span>
          </li>
          <li className="flex items-start gap-5">
            ✅
            <span>
              Automatic calendar population from course outlines, with key tasks, assignments, and deadlines translated into a clean, visual schedule.
            </span>
          </li>
          <li className="flex items-start gap-5">
            ✅
            <span>
              Real-time reminders and progress tracking keep you on top of every milestone without the need for manual setup.
            </span>
          </li>
          <li className="flex items-start gap-5">
            ✅
            <span>
              A beautiful, distraction-free interface that turns your calendar into a streamlined productivity tool.
            </span>
          </li>
        </ul>
      </div>
    </motion.section>
  );
};

export default Features;
