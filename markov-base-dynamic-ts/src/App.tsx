import { useState } from 'react';
import './App.css';
// components
import Navbar  from './components/Navbar';
import Info from './components/Info';
import Model from './components/Model';
import Simulation from './components/Simulation';
import MonteCarloDash from './components/MonteCarloDashboard';

import type { ViewState } from './components/Navbar';

function App() {
  const [currentView, setView] = useState<ViewState>('intro');

  // Simple render logic for now to test navigation
  const renderContent = () => {
    switch (currentView) {
      case 'intro':
        return <Info setView={setView} />;
      case 'model':
        return <Model />;
      case 'game-sim':
        return <Simulation />;
      case 'monte-carlo':
        return <MonteCarloDash />
      case 'results':
        return <div><h1>Final Results</h1><p>Who wins the series?</p></div>;
      default:
        return <div><h1>Welcome</h1></div>;
    }
  };

  return (
    <>
      <Navbar currentView={currentView} setView={setView} />
      
      <main className="content-container">
        {renderContent()}
        
        <div style={{ marginTop: '2rem' }}>
        </div>
      </main>
    </>
  );
}

export default App;

