import { Routes, Route } from 'react-router-dom';
import Hero from './sections/Hero';
import Calendar from './sections/Calendar';
import Login from './sections/Login';
import Navbar from './sections/Navbar';
import Filter from './sections/Filter'; // ⬅️ Import your Filter component



const App = () => {
  return (
    <>
      <Navbar />
      
    <Routes>
      <Route path="/" element={
        <main className="overflow-hidden">
          <Hero />
        </main>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/dropbox" element={<Filter />} /> {/* ⬅️ Add this */}
    </Routes>

    </>
  );
};

export default App;
