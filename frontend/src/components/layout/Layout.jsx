import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="app-main-wrapper">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="app-content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
