import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports';
import amplifyconfig from './amplifyconfiguration.json';
import './App.css';

import AdminPage from './pages/admin/adminPage';

Amplify.configure(amplifyconfig);
Amplify.configure(awsmobile);

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            {/* Redirect admin base path to Orders */}
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/" element={<Navigate to="/admin" />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
};

export default App;
