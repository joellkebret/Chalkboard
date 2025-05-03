import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/supabaseClient';

const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleStartUploading = () => {
    if (user) {
      navigate('/filter');
    } else {
      localStorage.setItem('redirectAfterLogin', 'true');
      navigate('/login');
    }
  };

  return (
    <section className="relative bg-[#292f36] pt-40 pb-24 px-6 overflow-visible">
      {/* Background visuals */}
      <div className="absolute -top-40 -right-40 w-[300px] h-[300px] bg-lime-500 opacity-10 rounded-full blur-3xl z-0"></div>
      <div className="absolute -bottom-40 -left-40 w-[250px] h-[250px] bg-lime-300 opacity-10 rounded-full blur-2xl z-0"></div>
      <div className="absolute top-[20%] left-[45%] w-[150px] h-[150px] bg-lime-400 opacity-10 rounded-full blur-2xl z-0"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-20"
        >
          <h1 className="text-6xl xl:text-7xl font-extrabold text-white leading-[1.4] mb-8 font-fredericka text-center lg:text-left">
            Organize your <br />
            <span className="text-lime-400">study schedule</span>
          </h1>
          <p className="text-xl xl:text-2xl text-gray-300 mb-10 text-center lg:text-left max-w-xl">
            Upload your course outlines and set your preferences to create personalized study plans.
          </p>
          <div className="text-center lg:text-left">
            <button
              onClick={handleStartUploading}
              className="px-8 py-4 bg-lime-400 text-black text-lg rounded-xl hover:bg-lime-500 transition font-semibold shadow-lg"
            >
              Start Uploading
            </button>
          </div>
        </motion.div>

        {/* Video Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl lg:-mr-10">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto aspect-video object-cover"
            >
              <source src="/videos/IMG_7047.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
