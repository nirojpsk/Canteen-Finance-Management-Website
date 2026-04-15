import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import App from './App.jsx'
import { store } from './app/store.js';

const THEME_STORAGE_KEY = "canteen-theme";

const getInitialTheme = () => {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) || "system";
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

document.documentElement.setAttribute("data-theme", getInitialTheme());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
