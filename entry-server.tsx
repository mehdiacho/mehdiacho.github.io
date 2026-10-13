import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
export const render = (path = "/") => renderToString(<App path={path} />);
export { WORKS_3D } from './constants';

export { CAD_PAGES } from './lib/prints';
