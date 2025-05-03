import { Routes, Route } from 'react-router-dom';
import Hero from './sections/Hero';
import About from './sections/About';
import Features from './sections/Features';
import Faq from './sections/Faq';
import Login from './sections/Login';
import Navbar from './sections/Navbar';
import Filter from './sections/Filter';
import Footer from './sections/Footer';



const App = () => {
  return (
    <>
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
    </>
  );
};

export default App;
