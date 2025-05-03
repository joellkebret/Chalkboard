import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    navigate('/', { state: { scrollTo: id } });
  };

  return (
    <footer className="bg-[#1e232a] text-gray-300 py-12 px-6">
      {/* Grid Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-start text-center md:text-left">
        {/* Brand/Info */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Chalkboard</h2>
          <p className="text-lg">Smart study planning made simple.</p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-lg">
            <li><button onClick={() => scrollToSection('about')} className="hover:text-lime-400 transition">How It Works</button></li>
            <li><button onClick={() => scrollToSection('features')} className="hover:text-lime-400 transition">Features</button></li>
            <li><button onClick={() => scrollToSection('faq')} className="hover:text-lime-400 transition">FAQ</button></li>
          </ul>
        </div>

        {/* GitHub Only */}
        <div className="flex justify-center md:justify-end text-2xl">
          <a
            href="https://github.com/joellkebret/Chalkboard"
            className="hover:text-lime-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="max-w-7xl mx-auto mt-10 px-2">
        <div className="text-sm text-gray-500 text-center md:text-right">
          © 2025 Chalkboard. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
