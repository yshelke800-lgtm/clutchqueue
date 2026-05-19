import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111127',
              color: '#f0f0ff',
              border: '1px solid #2e2e5a',
              fontFamily: 'Outfit, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
