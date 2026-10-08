import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initAnalytics } from './lib/firebase';

// Analytics is optional and starts after the document has loaded.
window.addEventListener('load', () => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(() => initAnalytics());
  else setTimeout(() => initAnalytics(), 0);
}, { once: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const app = <React.StrictMode><App /></React.StrictMode>;
if (rootElement.hasChildNodes()) ReactDOM.hydrateRoot(rootElement, app);
else ReactDOM.createRoot(rootElement).render(app);
