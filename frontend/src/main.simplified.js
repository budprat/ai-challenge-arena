import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// A simplified version just to test that the server works
function App() {
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '20px' 
    }}>
      <h1>EliteBuilders</h1>
      <p>AI Builders Competition Platform</p>
      <p>This is a simplified version for testing that the server works correctly.</p>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
