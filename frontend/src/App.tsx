import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/sidebar/Sidebar";
import Navbar from "./components/navbar/Navbar";

import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Placement from "./pages/Placement/Placement";
import Notes from "./pages/Notes/Notes";
import Analytics from "./pages/Analytics/Analytics";
import Pomodoro from "./pages/Pomodoro/Pomodoro";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ========================= */}
        {/* AUTH ROUTES */}
        {/* ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ========================= */}
        {/* MAIN APP ROUTES */}
        {/* ========================= */}

        <Route
          path="*"
          element={

            <ProtectedRoute>

              <div className="flex bg-black min-h-screen">

                {/* Sidebar */}

                <Sidebar />

                {/* Main Content */}

                <div className="flex-1">

                  {/* Navbar */}

                  <Navbar />

                  {/* Pages */}

                  <div className="p-6">

                    <Routes>

                      <Route
                        path="/"
                        element={<Dashboard />}
                      />

                      <Route
                        path="/profile"
                        element={<Profile />}
                      />

                      <Route
                        path="/placement"
                        element={<Placement />}
                      />

                      <Route
                        path="/notes"
                        element={<Notes />}
                      />

                      <Route
                        path="/pomodoro"
                        element={<Pomodoro />}
                      />

                      <Route
                        path="/analytics"
                        element={<Analytics />}
                      />

                    </Routes>

                  </div>

                </div>

              </div>

            </ProtectedRoute>

          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;
