import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logBundleSize } from './utils/performance'

// Log performance metrics in development
if (import.meta.env.DEV) {
  window.addEventListener('load', logBundleSize);
}

createRoot(document.getElementById("root")!).render(<App />);
