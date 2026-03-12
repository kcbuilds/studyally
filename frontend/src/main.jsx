import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#111110',
            color: '#EDF4F0',
            border: '1px solid rgba(26,92,58,.4)',
            borderRadius: '50px',
            fontFamily: 'Geist, sans-serif',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
