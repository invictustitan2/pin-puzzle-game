import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css'; // Keep legacy styles for now if needed, but App.tsx has inline styles
import { App } from './ui/App';
import './ui/index.css';

// Remove legacy DOM elements if they exist (cleanup)
const appDiv = document.getElementById('app');
if (appDiv) {
    appDiv.innerHTML = ''; // Clear existing static HTML content
    appDiv.style.padding = '0'; // Reset padding
    appDiv.style.maxWidth = 'none'; // Reset width
}

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
