import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.tsx'
import { store } from './store/store'
import { login } from './store/authSlice'
import { getCurrentUser } from './services/api'

// Ask the backend who is logged in before showing the app. The login lives in a
// session cookie, so this is how it survives a page refresh.
async function start() {
  const user = await getCurrentUser()
  if (user) store.dispatch(login(user))

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>,
  )
}

start()
