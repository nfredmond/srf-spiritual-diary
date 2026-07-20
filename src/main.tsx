import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Top-level boundary: any render error degrades to a calm reload screen
        instead of a white page. reducedMotion="user" makes every framer-motion
        animation honor the reader's OS "reduce motion" setting. */}
    <ErrorBoundary variant="screen">
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>,
)
