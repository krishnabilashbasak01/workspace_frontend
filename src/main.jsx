import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import { CookieProvider } from "./hooks/cookie-provider.jsx";
import { ThemeProvider } from "./hooks/theme-provider.jsx";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <CookieProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </CookieProvider>
    </Provider>
  </StrictMode>,
);
