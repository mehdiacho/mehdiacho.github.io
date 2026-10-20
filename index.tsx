import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './sections.css';
import './records.css';
import { initAnalytics } from './lib/firebase';

// The initializer does nothing unless the visitor explicitly opted in.
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
