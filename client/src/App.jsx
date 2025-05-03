import { Routes, Route } from 'react-router-dom';
import Hero from './sections/Hero';
import Calendar from './sections/Calendar';
import Login from './sections/Login';
import Navbar from './sections/Navbar';
import Filter from './sections/Filter';
import Onboarding from './pages/Onboarding'; // ⬅️ Import Onboarding

const App = () => {
  return (
    <>
      <Navbar />
      
      <Routes>
        <Route
          path="/"
          element={
            <main className="overflow-hidden">
              <Hero />
            </main>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} /> {/* ⬅️ Add this */}
        <Route path="/dropbox" element={<Filter />} />
        {/* You can also add <Route path="/calendar" element={<Calendar />} /> if needed */}
      </Routes>
    </>
  );
};

export default App;
