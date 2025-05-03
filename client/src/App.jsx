import { Routes, Route } from 'react-router-dom';
import Hero from './sections/Hero';
import Calendar from './sections/Calendar';
import Login from './sections/Login';
import Navbar from './sections/Navbar';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <main className="overflow-hidden">
            <Hero />
            {/* <Calendar /> */}
          </main>
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
