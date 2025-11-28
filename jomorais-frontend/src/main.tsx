import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/global.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider.tsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
	<BrowserRouter>
	  <QueryProvider>
		<App />
	  </QueryProvider>
	  <ToastContainer 
	    position="top-right"
	    autoClose={3000}
	    hideProgressBar={false}
	    newestOnTop={false}
	    closeOnClick
	    rtl={false}
	    pauseOnFocusLoss
	    draggable
	    pauseOnHover
	    theme="light"
	  />
	</BrowserRouter>
  </StrictMode>,
)
