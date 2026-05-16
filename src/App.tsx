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
import CreateTournament from "./pages/CreateTournament";
import ManageMatch from "./pages/ManageMatch";
import SparingBoard from "./pages/SparingBoard";
import ManageUsers from "./pages/ManageUsers";
import ManageVenues from "./pages/ManageVenues";
import ManageClub from "./pages/ManageClub";
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
              <Route path="/tournaments/create" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
              <Route path="/tournaments/edit/:id" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
              <Route path="/matches/:matchId/manage" element={<ProtectedRoute><ManageMatch /></ProtectedRoute>} />
              <Route path="/sparing" element={<SparingBoard />} />
              <Route path="/clubs" element={<ClubList />} />
              <Route path="/players" element={<PlayerList />} />
              <Route path="/admin/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
              <Route path="/admin/venues" element={<ProtectedRoute><ManageVenues /></ProtectedRoute>} />
              <Route path="/admin/clubs/:clubId/manage" element={<ProtectedRoute><ManageClub /></ProtectedRoute>} />
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
