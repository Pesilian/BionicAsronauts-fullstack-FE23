import React, { useState } from 'react';
import MenuList from './components/menu';
import LandingPage from './components/LandingPage';

import './App.css';

function App() {
  const [showLandingPage,] = useState(true);

  return (
    <div className="App">
      <header className="App-header">
        {showLandingPage ? (
          <LandingPage />
        ) : (
          <MenuList />
        )}
      </header>
    </div>
  );
}

export default App;
