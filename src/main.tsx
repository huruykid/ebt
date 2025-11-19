import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logBundleSize } from './utils/performance'

// Register service worker for efficient caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration failed');
    });
  });
}

// Log performance metrics in development
if (import.meta.env.DEV) {
  window.addEventListener('load', logBundleSize);
}

createRoot(document.getElementById("root")!).render(<App />);
