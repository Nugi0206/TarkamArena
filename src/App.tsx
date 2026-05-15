import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TournamentList from "./pages/TournamentList";
import TournamentDetail from "./pages/TournamentDetail";
import ClubList from "./pages/ClubList";
import PlayerList from "./pages/PlayerList";
import Profile from "./pages/Profile";
import Navigation from "./components/Navigation";
import MobileNav from "./components/MobileNav";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-display text-2xl animate-pulse">Tarkam Arena...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-50 pb-20 md:pb-0 md:pl-0">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route path="/clubs" element={<ClubList />} />
              <Route path="/players" element={<PlayerList />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
