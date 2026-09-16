import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const Admin = lazy(() => import("./admin/Admin"));
const isAdmin = /^\/admin(?:\/|$)/.test(window.location.pathname);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Loading…</p>}>
      {isAdmin ? <Admin /> : <App />}
    </Suspense>
  </StrictMode>,
);
