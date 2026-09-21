import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// User pages
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import PracticeTest from "./pages/PracticeTest";
import Subscription from "./pages/Subscription";
import DSA from "./pages/DSA";

// Route guards
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// Layouts
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminDSA from "./pages/admin/AdminDSA";
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
              PROTECTED USER ROUTES
          ========================= */}

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

            {/* Mock Test */}
            <Route
              path="/practice-test"
              element={
                <AppLayout>
                  <PracticeTest />
                </AppLayout>
              }
            />

            {/* Subscription */}
            <Route
              path="/subscription"
              element={
                <AppLayout>
                  <Subscription />
                </AppLayout>
              }
            />

            {/* DSA */}
            <Route
              path="/dsa"
              element={
                <AppLayout>
                  <DSA />
                </AppLayout>
              }
            />

            {/* =========================
                ADMIN ROUTES
            ========================= */}

            <Route element={<AdminRoute />}>
              {/* Admin Dashboard */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                }
              />

              {/* Admin Users */}
              <Route
                path="/admin/users"
                element={
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                }
              />

              {/* Admin Questions */}
              <Route
                path="/admin/questions"
                element={
                  <AdminLayout>
                    <AdminQuestions />
                  </AdminLayout>
                }
              />

              {/* Admin DSA Questions */}
              <Route
                path="/admin/dsa"
                element={
                  <AdminLayout>
                    <AdminDSA />
                  </AdminLayout>
                }
              />

              {/* Admin Topics */}
              <Route
                path="/admin/topics"
                element={
                  <AdminLayout>
                    <AdminTopics />
                  </AdminLayout>
                }
              />

              {/* Admin Companies */}
              <Route
                path="/admin/companies"
                element={
                  <AdminLayout>
                    <AdminCompanies />
                  </AdminLayout>
                }
              />

              {/* Admin Subscriptions */}
              <Route
                path="/admin/subscriptions"
                element={
                  <AdminLayout>
                    <AdminSubscriptions />
                  </AdminLayout>
                }
              />

              {/* Admin Payments */}
              <Route
                path="/admin/payments"
                element={
                  <AdminLayout>
                    <AdminPayments />
                  </AdminLayout>
                }
              />

              {/* Admin Analytics */}
              <Route
                path="/admin/analytics"
                element={
                  <AdminLayout>
                    <AdminAnalytics />
                  </AdminLayout>
                }
              />
            </Route>
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