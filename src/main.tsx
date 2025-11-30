import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logBundleSize } from './utils/performance'
import { reportWebVitals } from './utils/performanceMonitor'

// Log performance metrics in development
if (import.meta.env.DEV) {
  window.addEventListener('load', logBundleSize);
  reportWebVitals((metrics) => {
    console.log('Web Vitals:', metrics);
  });
}

// Use concurrent rendering for better performance
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
