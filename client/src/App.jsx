import { Routes, Route } from 'react-router-dom';
import Hero from './sections/Hero';
import Calendar from './sections/Calendar';
import Login from './sections/Login';
import Navbar from './sections/Navbar';

const App = () => {
  return (
<<<<<<< HEAD
    <main className="overflow-hidden">
      <Hero />
      <Calendar />
      <Login />
    </main>
=======
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
>>>>>>> 2c2a5946cbda869f29984e426d6a986f88ff2977
  );
};

export default App;
