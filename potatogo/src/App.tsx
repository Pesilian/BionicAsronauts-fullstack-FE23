import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';
import amplifyconfig from './amplifyconfiguration.json';
import LandingPage from "./components/LandingPage";
import ProfilePage from "./components/ProfilePage";
import AdminPage from './pages/admin/adminPage';
import "./App.css";

Amplify.configure(amplifyconfig);
Amplify.configure(awsmobile);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          {/* Redirect all other paths to the landing page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
