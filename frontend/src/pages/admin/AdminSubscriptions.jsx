import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import {
  getAdminSubscriptions,
} from "../../services/adminApi";

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getErrorMessage = (err, fallback) => {
    const detail = err?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    return err?.message || fallback;
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminSubscriptions();

      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Failed to load subscriptions:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load subscriptions"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const getSubscriptionStatus = (subscription) => {
    if (subscription.status) {
      return subscription.status.toLowerCase();
    }

    if (subscription.is_active === false) {
      return "expired";
    }

    const endDate =
      subscription.end_date ||
      subscription.expires_at ||
      subscription.expiry_date;

    if (endDate) {
      const expiry = new Date(endDate);

      if (!Number.isNaN(expiry.getTime())) {
        return expiry >= new Date()
          ? "active"
          : "expired";
      }
    }

    return "active";
  };

  const getUserName = (subscription) => {
    return (
      subscription.user?.name ||
      subscription.user_name ||
      subscription.name ||
      `User #${subscription.user_id ?? "-"}`
    );
  };

  const getUserEmail = (subscription) => {
    return (
      subscription.user?.email ||
      subscription.user_email ||
      subscription.email ||
      "-"
    );
  };

  const getPlanName = (subscription) => {
    return (
      subscription.plan_name ||
      subscription.plan ||
      subscription.subscription_plan ||
      subscription.plan_type ||
      "Premium"
    );
  };

  const getStartDate = (subscription) => {
    return (
      subscription.start_date ||
      subscription.started_at ||
      subscription.created_at
    );
  };

  const getEndDate = (subscription) => {
    return (
      subscription.end_date ||
      subscription.expires_at ||
      subscription.expiry_date
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subscriptions.filter((subscription) => {
      const status =
        getSubscriptionStatus(subscription);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const userName =
        getUserName(subscription).toLowerCase();

      const userEmail =
        getUserEmail(subscription).toLowerCase();

      const planName =
        getPlanName(subscription).toLowerCase();

      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        planName.includes(query) ||
        String(subscription.user_id || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [subscriptions, search, statusFilter]);

  const activeCount = subscriptions.filter(
    (subscription) =>
      getSubscriptionStatus(subscription) ===
      "active"
  ).length;

  const expiredCount = subscriptions.filter(
    (subscription) =>
      getSubscriptionStatus(subscription) ===
      "expired"
  ).length;

  const cancelledCount = subscriptions.filter(
    (subscription) =>
      getSubscriptionStatus(subscription) ===
      "cancelled"
  ).length;

  return (
    <div className="min-h-full bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <CreditCard size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Subscriptions
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                View and monitor user subscriptions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSubscriptions}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            <span>Refresh</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <p className="flex-1">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-300 transition hover:text-white"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold">
              {subscriptions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Active
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/10 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Expired
            </p>

            <p className="mt-1 text-2xl font-bold text-amber-400">
              {expiredCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/10 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Cancelled
            </p>

            <p className="mt-1 text-2xl font-bold text-red-400">
              {cancelledCount}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search user, email or plan..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 lg:w-48"
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="expired">
                Expired
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {/* Subscription List */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-indigo-400"
              />
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
              <CreditCard
                size={46}
                className="mb-4 text-slate-700"
              />

              <h3 className="font-semibold text-slate-300">
                No subscriptions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No subscriptions match the current
                filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">
                        User
                      </th>

                      <th className="px-5 py-4">
                        Plan
                      </th>

                      <th className="px-5 py-4">
                        Start Date
                      </th>

                      <th className="px-5 py-4">
                        End Date
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubscriptions.map(
                      (subscription) => {
                        const status =
                          getSubscriptionStatus(
                            subscription
                          );

                        return (
                          <tr
                            key={
                              subscription.id ??
                              `${subscription.user_id}-${getStartDate(
                                subscription
                              )}`
                            }
                            className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/30"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                                  <CreditCard
                                    size={17}
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium text-slate-100">
                                    {getUserName(
                                      subscription
                                    )}
                                  </p>

                                  <p className="truncate text-xs text-slate-500">
                                    {getUserEmail(
                                      subscription
                                    )}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                                {getPlanName(
                                  subscription
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-300">
                              {formatDate(
                                getStartDate(
                                  subscription
                                )
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-300">
                              {formatDate(
                                getEndDate(
                                  subscription
                                )
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {status === "active" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                  <CheckCircle2
                                    size={13}
                                  />
                                  Active
                                </span>
                              ) : status ===
                                "cancelled" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                                  <XCircle
                                    size={13}
                                  />
                                  Cancelled
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
                                  <CalendarDays
                                    size={13}
                                  />
                                  Expired
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-3 md:hidden">
                {filteredSubscriptions.map(
                  (subscription) => {
                    const status =
                      getSubscriptionStatus(
                        subscription
                      );

                    return (
                      <div
                        key={
                          subscription.id ??
                          `${subscription.user_id}-${getStartDate(
                            subscription
                          )}`
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <CreditCard size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-100">
                                {getUserName(
                                  subscription
                                )}
                              </h3>

                              {status === "active" ? (
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                  ACTIVE
                                </span>
                              ) : status ===
                                "cancelled" ? (
                                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                                  CANCELLED
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                                  EXPIRED
                                </span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {getUserEmail(
                                subscription
                              )}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[11px] uppercase text-slate-600">
                                  Plan
                                </p>

                                <p className="mt-1 text-sm font-medium text-indigo-300">
                                  {getPlanName(
                                    subscription
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] uppercase text-slate-600">
                                  User ID
                                </p>

                                <p className="mt-1 text-sm text-slate-300">
                                  {subscription.user_id ??
                                    "-"}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] uppercase text-slate-600">
                                  Start
                                </p>

                                <p className="mt-1 text-sm text-slate-300">
                                  {formatDate(
                                    getStartDate(
                                      subscription
                                    )
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] uppercase text-slate-600">
                                  End
                                </p>

                                <p className="mt-1 text-sm text-slate-300">
                                  {formatDate(
                                    getEndDate(
                                      subscription
                                    )
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSubscriptions;