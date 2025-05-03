import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Hero from './sections/Hero';
import About from './sections/About';
import Features from './sections/Features';
import Faq from './sections/Faq';
import Login from './sections/Login';
import Navbar from './sections/Navbar';
import Filter from './sections/Filter';
import Footer from './sections/Footer';

const App = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const target = document.getElementById(location.state.scrollTo);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const isLogin = location.pathname === '/login';

  return (
    <div className={`${isLogin ? 'h-screen overflow-hidden' : 'overflow-auto'}`}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <main className="overflow-hidden">
              <section id="home">
                <Hero />
              </section>
              <section id="about" className="py-20">
                <About />
              </section>
              <section id="features" className="py-20">
                <Features />
              </section>
              <section id="faq" className="py-20">
                <Faq />
              </section>
              <Footer />
            </main>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/filter" element={<Filter />} />
      </Routes>
    </div>
  );
};

export default App;
