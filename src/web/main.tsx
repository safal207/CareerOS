import React from "react";
import { createRoot } from "react-dom/client";
import { AdminDashboard } from "./AdminDashboard.js";
import { App } from "./App.js";
import "./styles.css";

const root = document.getElementById("root");
const path = window.location.pathname.replace(/\/$/, "");
const isAdminRoute = path.endsWith("/admin") || window.location.hash === "#/admin";

createRoot(root!).render(isAdminRoute ? <AdminDashboard /> : <App />);
