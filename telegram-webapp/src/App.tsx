import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import DreamInput from './pages/DreamInput';
import DreamResult from './pages/DreamResult';
import Journal from './pages/Journal';
import Profile from './pages/Profile';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

function App() {
  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      // Set header color
      tg.setHeaderColor('#8B5CF6');
      
      // Enable closing confirmation
      tg.enableClosingConfirmation();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/dream/new" element={<DreamInput />} />
          <Route path="/dream/result/:id" element={<DreamResult />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;