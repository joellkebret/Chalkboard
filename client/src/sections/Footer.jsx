import React from 'react';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
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
            <li><a href="#about" className="hover:text-lime-400 transition">How It Works</a></li>
            <li><a href="#features" className="hover:text-lime-400 transition">Features</a></li>
            <li><a href="#faq" className="hover:text-lime-400 transition">FAQ</a></li>
          </ul>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center md:justify-end space-x-6 text-2xl">
          <a href="https://twitter.com" className="hover:text-lime-400" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://github.com" className="hover:text-lime-400" target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
          <a href="https://linkedin.com" className="hover:text-lime-400" target="_blank" rel="noopener noreferrer">
            <FaLinkedin />
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
