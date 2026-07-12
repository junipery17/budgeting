import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Google } from '@mui/icons-material'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId='861413183276-o6092b0v2u47n4gi4atqb2lb7683u1ne.apps.googleusercontent.com'>
    <BrowserRouter>
      <StrictMode>
        <App />
      </StrictMode>
    </BrowserRouter>
  </GoogleOAuthProvider>

)
