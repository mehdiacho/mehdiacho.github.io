import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
export const render = () => renderToString(<App />);
export { WORKS_3D } from './constants';
