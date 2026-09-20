import { useEffect, useState } from "react";

import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Code2,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Brain,
  Crown,
  ClipboardCheck,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getSubscription } from "../services/subscriptionApi";

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setHasSubscription(false);
        setSubscriptionLoading(false);
        return;
      }

      // Admin automatically gets premium access
      if (user.role === "admin") {
        setHasSubscription(true);
        setSubscriptionLoading(false);
        return;
      }

      try {
        const subscription = await getSubscription();

        const active =
          subscription?.is_active === true &&
          subscription?.expires_at &&
          new Date(subscription.expires_at) > new Date();

        setHasSubscription(Boolean(active));
      } catch (error) {
        console.error(
          "Failed to check subscription:",
          error
        );

        setHasSubscription(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  /*
   * Premium features
   *
   * Admin / Premium user -> actual page
   * Free user -> Subscription page
   */

  const dsaPath =
    user?.role === "admin" || hasSubscription
      ? "/dsa"
      : "/subscription";

  const mockTestPath =
    user?.role === "admin" || hasSubscription
      ? "/practice-test"
      : "/subscription";

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },

    {
      name: "Practice",
      icon: BookOpen,
      path: "/practice",
    },

    {
      name: "Mock Test",
      icon: ClipboardCheck,
      path: mockTestPath,
      premium: true,
    },

    {
      name: "DSA",
      icon: Code2,
      path: dsaPath,
      premium: true,
    },

    {
      name: "Leaderboard",
      icon: Trophy,
      path: "/leaderboard",
    },

    {
      name: "Progress",
      icon: BarChart3,
      path: "/progress",
    },

    {
      name: "Subscription",
      icon: Crown,
      path: "/subscription",
      premium: true,
    },

    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
              <Brain size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                PrepMaster
              </h1>

              <p className="text-[11px] text-slate-400">
                Aptitude • DSA
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* User Profile */}
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      item.premium
                        ? isActive
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20"
                          : "border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 text-amber-300 hover:border-amber-400/30 hover:bg-amber-500/15"
                        : isActive
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon
                    size={19}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />

                  <span>{item.name}</span>

                  {item.premium && (
                    <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-slate-950">
                      PRO
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="lg:pl-72">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
          >
            <Menu size={24} />
          </button>

          <div className="ml-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Brain size={17} />
            </div>

            <span className="font-bold text-slate-900">
              PrepMaster
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;