
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MenuList from "./components/menu";
import LandingPage from "./components/LandingPage";
import ProfilePage from "./components/ProfilePage";
import "./App.css";


function App() {
  return (

    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
