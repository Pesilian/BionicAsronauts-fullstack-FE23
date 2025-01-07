import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';
import amplifyconfig from './amplifyconfiguration.json';
import LandingPage from "./components/LandingPage";
import ProfilePage from "./components/ProfilePage";
import "./App.css";

Amplify.configure(amplifyconfig);
Amplify.configure(awsmobile);

function App() {
  const [showLandingPage,] = useState(true);

  return (
    <Router>
      <div className="App">
        {showLandingPage ? (
          <LandingPage />
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;