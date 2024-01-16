import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./fonts.css"
import { Routes } from "@generouted/react-router/lazy";
import { AppProvider } from "./provider/app";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <Routes />
    </AppProvider>
  </React.StrictMode>
);
