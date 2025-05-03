import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'What is Chalkboard?',
    answer:
      'Chalkboard is a student productivity app that helps you organize study schedules, track progress, and manage your academic tasks effectively.',
  },
  {
    question: 'Can I upload my own course outline?',
    answer:
      'Yes! You can upload your course outline directly using our upload tool. It helps personalize your study plan automatically.',
  },
  {
    question: 'Is Chalkboard free to use?',
    answer:
      'Yes, Chalkboard is free for students. We aim to make academic planning simple and accessible.',
  },
  {
    question: 'What file formats are supported for upload?',
    answer:
      'Currently, we support PDF, DOC, and DOCX formats for uploading course outlines.',
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-10 px-8 bg-[#292f36] text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-6xl font-extrabold mb-12">Frequently Asked Questions</h2>
        <p className="text-2xl text-gray-300 mb-20">
          Find answers to common questions about Chalkboard:
        </p>

        <div className="space-y-6 text-left">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-700 rounded-2xl">
              <button
                onClick={() => toggle(index)}
                className="w-full text-left px-8 py-6 font-bold text-2xl flex justify-between items-center hover:bg-[#1e232b] transition"
              >
                {faq.question}
                <span className="text-3xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden px-8 pb-6 text-gray-300 text-xl"
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
