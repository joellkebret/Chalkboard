import React from 'react';
import Hero from './sections/Hero';
import Calendar from './sections/Calendar';
import Login from './sections/Login';

const App = () => {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Calendar />
      <Login />
    </main>
  );
};

export default App;