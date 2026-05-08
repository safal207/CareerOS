import React from "react";
import { createRoot } from "react-dom/client";
import { AdminDashboard } from "./AdminDashboard.js";
import { App } from "./App.js";
import "./styles.css";

const root = document.getElementById("root");
const isAdminRoute = window.location.pathname === "/admin";

createRoot(root!).render(isAdminRoute ? <AdminDashboard /> : <App />);
