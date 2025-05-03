import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: "What is Chalkboard?",
    answer: "Chalkboard is an AI-powered study planning tool that helps you organize your academic life. It creates personalized study schedules, tracks your progress, and adapts to your learning style."
  },
  {
    question: "How does the AI scheduling work?",
    answer: "Our AI analyzes your course schedule, deadlines, and study preferences to create an optimal study plan. It considers factors like your available time, course difficulty, and preferred study times to generate a balanced schedule."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. All your information is encrypted and stored securely. We never share your data with third parties without your explicit consent."
  },
  {
    question: "Can I use Chalkboard on multiple devices?",
    answer: "Absolutely! Chalkboard is accessible from any device with an internet connection. Your study plans and progress sync automatically across all your devices."
  },
  {
    question: "How do I get started?",
    answer: "Simply sign up for an account, add your courses and schedule, and let Chalkboard create your personalized study plan. You can customize your preferences and adjust the schedule as needed."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#1e232a]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-white mb-3">Frequently asked questions</h2>
          <p className="text-gray-400">
            Everything you need to know about Chalkboard. Can't find what you're looking for?{' '}
            <a href="#contact" className="text-lime-400 hover:text-lime-300">Contact us</a>
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-gray-700 rounded-lg overflow-hidden bg-[#292f36]"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center"
              >
                <span className="text-base text-white font-medium pr-8">
                  {faq.question}
                </span>
                <span className="text-lime-400 flex-shrink-0">
                  {openIndex === index ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                </span>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
