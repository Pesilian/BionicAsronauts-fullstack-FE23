import React from 'react';
import { Amplify } from 'aws-amplify'; // Explicit import for Amplify (tree-shaking friendly)
import awsExports from './aws-exports'; // Use a descriptive name for the configuration
import AdminPage from './pages/admin/adminPage';
import './App.css';
import awsmobile  from './aws-exports'; // Use a descriptive name for the configuration
import amplifyconfig from './amplifyconfiguration.json';
Amplify.configure(amplifyconfig);
// Configure Amplify
Amplify.configure(awsmobile);


const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <AdminPage />
      </header>
    </div>
  );
};

export default App;
