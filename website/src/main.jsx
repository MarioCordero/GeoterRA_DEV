import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './router/AppRouter'
import { SessionProvider } from './hooks/useSession';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SessionProvider>
      <AppRouter />
    </SessionProvider>
  </React.StrictMode>
)