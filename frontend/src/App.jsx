import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

import Dashboard from "./pages/Dashboard";
import PracticeTest from "./pages/PracticeTest";
import Practice from "./pages/Practice";

import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

import AdminTopics from "./pages/admin/AdminTopics";
import AdminCompanies from "./pages/admin/AdminCompanies";

import AdminSubscriptions from "./pages/admin/AdminSubscriptions";

import AdminPayments from "./pages/admin/AdminPayments";

import AdminAnalytics from "./pages/admin/AdminAnalytics";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              PROTECTED ROUTES
          ========================= */}

          <Route element={<ProtectedRoute />}>
            {/* =========================
                USER DASHBOARD
            ========================= */}

            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />

            {/* =========================
                PRACTICE
            ========================= */}

            <Route
              path="/practice"
              element={
                <AppLayout>
                  <Practice />
                </AppLayout>
              }
            />

            {/* =========================
                PRACTICE TEST
            ========================= */}

            <Route
              path="/practice-test"
              element={
                <AppLayout>
                  <PracticeTest />
                </AppLayout>
              }
            />

            {/* =========================
                ADMIN ROUTES
            ========================= */}

            <Route element={<AdminRoute />}>
              {/* ADMIN DASHBOARD */}

              <Route
                path="/admin/dashboard"
                element={
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                }
              />

              {/* ADMIN USERS */}

              <Route
                path="/admin/users"
                element={
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                }
              />
            </Route>

            <Route
  path="/admin/topics"
  element={
    <AdminLayout>
      <AdminTopics />
    </AdminLayout>
  }
/>

<Route
  path="/admin/companies"
  element={
    <AdminLayout>
      <AdminCompanies />
    </AdminLayout>
  }
/>

<Route
  path="/admin/subscriptions"
  element={
    <AdminLayout>
      <AdminSubscriptions />
    </AdminLayout>
  }
/>

<Route
  path="/admin/payments"
  element={
    <AdminLayout>
      <AdminPayments />
    </AdminLayout>
  }
/>

<Route
  path="/admin/analytics"
  element={
    <AdminLayout>
      <AdminAnalytics />
    </AdminLayout>
  }
/>

          </Route>

          {/* =========================
              DEFAULT ROUTE
          ========================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

          {/* =========================
              UNKNOWN ROUTE
          ========================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;