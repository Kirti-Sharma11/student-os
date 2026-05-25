import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";

import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Placement from "./pages/Placement/Placement";
import Notes from "./pages/Notes/Notes";
import Analytics from "./pages/Analytics/Analytics";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MAIN APP ROUTES */}
        <Route
          path="*"
          element={
            <div className="flex bg-black min-h-screen">

              <Sidebar />

              <div className="flex-1">

                <Navbar />

                <div className="p-6">

                  <Routes>
                    <Route
                       path="/"
                       element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                  }
                />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/placement" element={<Placement />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Routes>

                </div>

              </div>

            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;