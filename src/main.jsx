import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ERPProvider } from './context/ERPContext'
import { CartProvider } from './context/CartContext'

import ErrorBoundary from './components/ErrorBoundary'

console.log('Main.jsx: Rendering application tree...');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ERPProvider>
          <CartProvider>
            <Router>
              <App />
            </Router>
          </CartProvider>
        </ERPProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
