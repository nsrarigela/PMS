import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// This is the actual line that turns plain HTML into a React app:
// it finds <div id="root"> in index.html and renders <App /> inside it.
// BrowserRouter enables client-side routing (react-router-dom) so
// navigating between pages never triggers a full page reload.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
