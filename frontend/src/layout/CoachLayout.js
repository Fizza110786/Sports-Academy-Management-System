import Sidebar from "../components/common/Sidebar";
import { Outlet } from "react-router-dom";
import "./Layout.css";

export default function CoachLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
