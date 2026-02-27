import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import HistoryPage from "./components/HistoryPage";
import { Satellite, Clock, Upload } from "lucide-react";

function Navbar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
      ? "bg-accent-green/10 text-accent-green"
      : "text-gray-400 hover:text-gray-200 hover:bg-navy-700/50"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-navy-900/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-accent-green flex items-center justify-center">
            <Satellite size={18} className="text-navy-900" />
          </div>
          <span className="text-lg font-bold text-white hidden sm:block">
            Land<span className="text-accent-green">Suit</span>
          </span>
        </NavLink>

        <div className="flex items-center gap-1">
          <NavLink to="/" className={linkClass} end>
            <Upload size={16} />
            <span className="hidden sm:inline">Analyze</span>
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            <Clock size={16} />
            <span className="hidden sm:inline">History</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-navy-900">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/results" element={<Results />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
