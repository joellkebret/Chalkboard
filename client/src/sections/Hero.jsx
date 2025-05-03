import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-40 pb-32 bg-[#292f36]">
      <div className="w-full px-6 flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="px-8 py-10 w-full lg:w-1/2">
          <h1 className="text-8xl font-extrabold text-white leading-tight mb-8">
            Organize your <span className="text-lime-300">study schedule</span>
          </h1>
          <p className="text-2xl text-gray-300 max-w-2xl leading-relaxed mb-6">
            Upload your course outlines and set your preferences to create personalized study plans.
          </p>

          {/* ✅ Dropbox Button */}
          <button
            onClick={() => navigate('/dropbox')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Dropbox
          </button>
        </div>

        <div className="w-full lg:w-1/2 px-8">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="rounded-xl shadow-xl w-full h-auto aspect-video object-cover"
          >
            <source src="/videos/IMG_7047.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

export default Hero;
