import React, { useState } from 'react';
import MenuList from './components/menu';
import LandingPage from './components/LandingPage';

import './App.css';

function App() {
  const [showLandingPage, setShowLandingPage] = useState(true);

  return (
    <div className="App">
      <header className="App-header">
        {showLandingPage ? (
          <LandingPage />
        ) : (
          <MenuList />
        )}
        <button onClick={() => setShowLandingPage(!showLandingPage)}>
          {showLandingPage ? 'Go to Menu' : 'Back to Landing Page'}
        </button>
      </header>
    </div>
  );
}

export default App;
