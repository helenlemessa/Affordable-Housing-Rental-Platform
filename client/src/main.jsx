// main.jsx
import React from "react";
import i18next from "./i18n";
import ReactDOM from "react-dom/client";
import App from "./App";
import { I18nextProvider } from "react-i18next";
import { AuthProvider } from "./context/AuthContext"; // ADD THIS IMPORT

import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <AuthProvider> {/* WRAP APP WITH AUTH PROVIDER */}
        <App />
      </AuthProvider>
    </I18nextProvider>
  </React.StrictMode>
);