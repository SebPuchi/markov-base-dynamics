import { useState } from 'react';
import './App.css';
import Navbar  from './components/Navbar';
import Info from './components/Info';

import type { ViewState } from './components/Navbar';

function App() {
  const [currentView, setView] = useState<ViewState>('intro');

  // Simple render logic for now to test navigation
  const renderContent = () => {
    switch (currentView) {
      case 'intro':
        return <Info/>;
      case 'model':
        return <div><h1>The Markov Model</h1><p>Transition Matrices & State Diagram</p></div>;
      case 'visualizer':
        return <div><h1>3D Visualizer</h1><p>Live Game View</p></div>;
      case 'simulation':
        return <div><h1>Monte Carlo Simulation</h1><p>High-speed iteration engine</p></div>;
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
          <button onClick={() => alert("Go Sox!")}>
            Test Theme Button
          </button>
        </div>
      </main>
    </>
  );
}

export default App;

