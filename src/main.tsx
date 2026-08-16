import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { applyTheme, getStoredThemePreference } from './lib/theme';

// Apply stored theme immediately before rendering to eliminate flash
applyTheme(getStoredThemePreference());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
