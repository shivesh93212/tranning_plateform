import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";

import {
  getAdminUsers,
  updateAdminUserStatus,
} from "../../services/adminApi";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminUsers();

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    users,
    search,
    statusFilter,
    roleFilter,
  ]);

  const handleStatusChange = async (
    userId,
    isActive
  ) => {
    try {
      setUpdatingId(userId);
      setError("");

      const updatedUser =
        await updateAdminUserStatus(
          userId,
          isActive
        );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? updatedUser
            : user
        )
      );
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to update user status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCount = users.filter(
    (user) => user.is_active
  ).length;

  const inactiveCount = users.filter(
    (user) => !user.is_active
  ).length;

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length;

  return (
    <div className="min-h-full bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={24}
                className="text-blue-400"
              />

              <h1 className="text-2xl font-bold sm:text-3xl">
                Users
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              Manage registered users and account
              status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={16}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              {users.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-sm text-slate-400">
              Active Users
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <p className="text-sm text-slate-400">
              Admins
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-400">
              {adminCount}
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* FILTERS */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px]">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            {/* ROLE */}

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-blue-500"
            >
              <option value="all">
                All Roles
              </option>

              <option value="user">
                User
              </option>

              <option value="admin">
                Admin
              </option>
            </select>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Showing {filteredUsers.length} of{" "}
            {users.length} users
          </div>
        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />

              Loading users...
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-6 text-center">
            <Search
              size={32}
              className="text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold text-slate-200">
              No users found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b border-slate-800 bg-slate-950/70">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        User
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Role
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Joined
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((user) => {
                      const isUpdating =
                        updatingId === user.id;

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-medium text-white">
                                {user.name || "Unnamed User"}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {user.role === "admin" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                                <ShieldCheck size={13} />
                                Admin
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                                User
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {user.is_active ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                <CheckCircle2 size={13} />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                                <XCircle size={13} />
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {user.created_at
                              ? new Date(
                                  user.created_at
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={
                                isUpdating ||
                                user.role === "admin"
                              }
                              onClick={() =>
                                handleStatusChange(
                                  user.id,
                                  !user.is_active
                                )
                              }
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                user.is_active
                                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : user.is_active ? (
                                <UserX size={14} />
                              ) : (
                                <UserCheck size={14} />
                              )}

                              {user.is_active
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}

            <div className="grid gap-3 md:hidden">
              {filteredUsers.map((user) => {
                const isUpdating =
                  updatingId === user.id;

                return (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {user.name || "Unnamed User"}
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      {user.role === "admin" ? (
                        <span className="shrink-0 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                          Admin
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                          User
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle2 size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
                            <XCircle size={14} />
                            Inactive
                          </span>
                        )}

                        <p className="mt-1 text-xs text-slate-600">
                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={
                          isUpdating ||
                          user.role === "admin"
                        }
                        onClick={() =>
                          handleStatusChange(
                            user.id,
                            !user.is_active
                          )
                        }
                        className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.is_active
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : user.is_active ? (
                          <UserX size={14} />
                        ) : (
                          <UserCheck size={14} />
                        )}

                        {user.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* INACTIVE INFO */}

        {inactiveCount > 0 && (
          <p className="text-xs text-slate-600">
            {inactiveCount} inactive user
            {inactiveCount !== 1 ? "s" : ""} hidden
            when Active filter is selected.
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;