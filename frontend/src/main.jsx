import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import Reg from './Newreg.jsx'
import Conn from './Conn.jsx'
import Det from './Detail.jsx'
import Sell from './Sell.jsx'
import Card from './Card.jsx'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/detail/:did/:id',
    element: <Det />
  },
  {
    path: '/:id/sell',
    element: <Sell />
  },
  {
    path: '/newreg',
    element: <Reg />
  },
  {
    path: '/:id/product',
    element: <Conn />
  },
  {
    path: '/:id/card',
    element: <Card />
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="566246317175-9fg7rfhl2slk4g3pf7s3qj6svdtaq280.apps.googleusercontent.com">
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>
);