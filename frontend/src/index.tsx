import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './index.css';
import OceanApp from './OceanApp';
import Explore from './Explore';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './UserContext';

const AppWithTransition = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fade-in');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('fade-out');
    }
  }, [location, displayLocation]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Black overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
          zIndex: 9999,
          opacity: transitionStage === 'fade-out' ? 1 : 0,
          transition: transitionStage === 'fade-out' ? 'opacity 0.15s ease-out' : 'opacity 0.15s ease-in',
          pointerEvents: transitionStage === 'fade-out' ? 'all' : 'none',
        }}
        onTransitionEnd={() => {
          if (transitionStage === 'fade-out') {
            setDisplayLocation(location);
            setTransitionStage('fade-in');
          }
        }}
      />
      
      {/* Routes */}
      <Routes location={displayLocation}>
        <Route path="/" element={<OceanApp />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <AppWithTransition />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();