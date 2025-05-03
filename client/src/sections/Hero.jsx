import React from 'react';

const Hero = () => {
  return (
    <section className="relative pt-60 pb-40 max-lg:pt-52 max-lg:pb-36 max-md:pt-36 max-md:pb-32 bg-[#292f36]">
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-10">

        {/* Left: Text Section */}
        <div className="px-8 py-10 max-w-4xl">
          <h1 className="text-7xl max-w-[65ch] font-bold text-white leading-tight mb-6">
            Organize your <span className="text-sky-400">study schedule</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-md">
            Upload your course outlines and set your preferences to create personalized study plans.
          </p>
        </div>

        {/* Right: Autoplay .mp4 Video */}
        <div className="w-full max-w-xl">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full rounded-lg shadow-lg"
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
