import type React from 'react';
import type { GameScreenProps } from './types';

/**
 * Screens for the games in lib/arcade/registry.ts, by id, with the one-line
 * pitch the arcade header shows. Each screen is a dynamic import so it ships
 * as its own chunk and stays out of the page's main bundle.
 */
export const SCREENS: Record<string, { load: () => Promise<{ default: React.ComponentType<GameScreenProps> }>; pitch: string }> = {
  'box-rush': { load: () => import('./BoxRush'), pitch: 'You are the object detector. Box every drone before it leaves the frame; tighter boxes score more.' },
};
