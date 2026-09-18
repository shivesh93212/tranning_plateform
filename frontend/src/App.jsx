import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./layouts/AppLayout";
import PracticeTest from "./pages/PracticeTest";
import Practice from "./pages/Practice";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />

            {/* Practice */}
            <Route
              path="/practice"
              element={
                <AppLayout>
                  <Practice />
                </AppLayout>
              }
            />

            {/* Temporary Practice API Test */}
            <Route
              path="/practice-test"
              element={
                <AppLayout>
                  <PracticeTest />
                </AppLayout>
              }
            />

          </Route>

          {/* Default Route */}
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          {/* Unknown Route */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;