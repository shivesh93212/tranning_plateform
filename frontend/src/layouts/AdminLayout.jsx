import { useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import {
  BarChart3,
  Building2,
  Code2,
  CreditCard,
  FileQuestion,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Questions",
    path: "/admin/questions",
    icon: FileQuestion,
  },
  {
    label: "DSA Questions",
    path: "/admin/dsa",
    icon: Code2,
  },
  {
    label: "Topics",
    path: "/admin/topics",
    icon: BarChart3,
  },
  {
    label: "Companies",
    path: "/admin/companies",
    icon: Building2,
  },
  {
    label: "Subscriptions",
    path: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Payments",
    path: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
];

function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login", { replace: true });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* LOGO */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-white">
              Aptitude Admin
            </h1>

            <p className="text-xs text-slate-500">
              Control Panel
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setCollapsed((value) => !value)
          }
          className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:block"
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* ADMIN PROFILE */}
      <div
        className={`border-b border-slate-800 p-4 ${
          collapsed ? "lg:px-3" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            collapsed ? "lg:justify-center" : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() ||
              "A"}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "Admin"}
              </p>

              <p className="truncate text-xs text-slate-500">
                Administrator
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            Management
          </p>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                } ${
                  collapsed
                    ? "lg:justify-center lg:px-0"
                    : ""
                }`
              }
            >
              <Icon
                size={19}
                className="shrink-0"
              />

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 ${
            collapsed
              ? "lg:justify-center lg:px-0"
              : ""
          }`}
        >
          <LogOut
            size={19}
            className="shrink-0"
          />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur lg:hidden">
        <div>
          <h1 className="font-bold text-white">
            Aptitude Admin
          </h1>

          <p className="text-xs text-slate-500">
            Control Panel
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2.5 text-slate-300 transition hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-800 bg-slate-900 transition-all duration-300 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* MAIN */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed
            ? "lg:pl-20"
            : "lg:pl-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;