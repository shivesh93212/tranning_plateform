import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  CreditCard,
  FileQuestion,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { getAdminAnalytics } from "../../services/adminApi";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminAnalytics();

      setAnalytics(data);
    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load analytics"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const value = (keys, fallback = 0) => {
    if (!analytics) return fallback;

    for (const key of keys) {
      if (
        analytics[key] !== undefined &&
        analytics[key] !== null
      ) {
        return analytics[key];
      }
    }

    return fallback;
  };

  const totalUsers = value([
    "total_users",
    "users_count",
    "user_count",
  ]);

  const activeUsers = value([
    "active_users",
    "active_user_count",
  ]);

  const totalQuestions = value([
    "total_questions",
    "questions_count",
    "question_count",
  ]);

  const totalAttempts = value([
    "total_attempts",
    "attempts_count",
    "attempt_count",
  ]);

  const totalSubscriptions = value([
    "total_subscriptions",
    "subscriptions_count",
    "subscription_count",
  ]);

  const activeSubscriptions = value([
    "active_subscriptions",
    "active_subscription_count",
  ]);

  const totalPayments = value([
    "total_payments",
    "payments_count",
    "payment_count",
  ]);

  const revenue = value([
    "total_revenue",
    "revenue",
    "total_earnings",
  ]);

  const successfulPayments = value([
    "successful_payments",
    "successful_payment_count",
    "completed_payments",
  ]);

  const failedPayments = value([
    "failed_payments",
    "failed_payment_count",
  ]);

  const successRate = useMemo(() => {
    if (analytics?.success_rate !== undefined) {
      return Number(analytics.success_rate);
    }

    if (!totalAttempts) {
      return 0;
    }

    const correctAttempts = value([
      "correct_attempts",
      "correct_answers",
    ]);

    if (!correctAttempts) {
      return 0;
    }

    return (
      (Number(correctAttempts) /
        Number(totalAttempts)) *
      100
    );
  }, [analytics, totalAttempts]);

  const formatNumber = (number) => {
    const value = Number(number);

    if (Number.isNaN(value)) {
      return number ?? 0;
    }

    return value.toLocaleString("en-IN");
  };

  const formatCurrency = (number) => {
    const value = Number(number);

    if (Number.isNaN(value)) {
      return `₹${number ?? 0}`;
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatPercentage = (number) => {
    const value = Number(number);

    if (Number.isNaN(value)) {
      return "0%";
    }

    return `${value.toFixed(1)}%`;
  };

  const statCards = [
    {
      label: "Total Users",
      value: formatNumber(totalUsers),
      icon: Users,
      iconClass: "text-blue-400",
      bgClass: "bg-blue-500/10",
    },
    {
      label: "Active Users",
      value: formatNumber(activeUsers),
      icon: Activity,
      iconClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10",
    },
    {
      label: "Total Questions",
      value: formatNumber(totalQuestions),
      icon: FileQuestion,
      iconClass: "text-indigo-400",
      bgClass: "bg-indigo-500/10",
    },
    {
      label: "Total Attempts",
      value: formatNumber(totalAttempts),
      icon: BarChart3,
      iconClass: "text-purple-400",
      bgClass: "bg-purple-500/10",
    },
    {
      label: "Subscriptions",
      value: formatNumber(totalSubscriptions),
      icon: CreditCard,
      iconClass: "text-cyan-400",
      bgClass: "bg-cyan-500/10",
    },
    {
      label: "Active Subscriptions",
      value: formatNumber(activeSubscriptions),
      icon: CheckCircle2,
      iconClass: "text-green-400",
      bgClass: "bg-green-500/10",
    },
    {
      label: "Payments",
      value: formatNumber(totalPayments),
      icon: CreditCard,
      iconClass: "text-amber-400",
      bgClass: "bg-amber-500/10",
    },
    {
      label: "Revenue",
      value: formatCurrency(revenue),
      icon: TrendingUp,
      iconClass: "text-pink-400",
      bgClass: "bg-pink-500/10",
    },
  ];

  return (
    <div className="min-h-full bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <BarChart3 size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Overview of platform activity and
                performance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
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
              <X size={18} />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={32}
                className="animate-spin text-indigo-400"
              />

              <p className="text-sm text-slate-500">
                Loading analytics...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">
                          {card.label}
                        </p>

                        <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
                          {card.value}
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bgClass} ${card.iconClass}`}
                      >
                        <Icon size={19} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Performance */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Attempt Performance */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <BarChart3 size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Practice Performance
                    </h2>

                    <p className="text-xs text-slate-500">
                      Overall attempt statistics
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">
                      Total Attempts
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {formatNumber(
                        totalAttempts
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">
                      Success Rate
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-400">
                      {formatPercentage(
                        successRate
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Performance
                    </span>

                    <span className="font-medium text-slate-300">
                      {formatPercentage(
                        successRate
                      )}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            Number(successRate) || 0,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Payments Performance */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Payment Overview
                    </h2>

                    <p className="text-xs text-slate-500">
                      Payment and revenue statistics
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">
                      Successful Payments
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-400">
                      {formatNumber(
                        successfulPayments
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs text-slate-500">
                      Failed Payments
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-400">
                      {formatNumber(
                        failedPayments
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4">
                  <p className="text-xs text-slate-500">
                    Total Revenue
                  </p>

                  <p className="mt-1 text-2xl font-bold text-indigo-400">
                    {formatCurrency(revenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* User & Subscription Overview */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Users size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      User Overview
                    </h2>

                    <p className="text-xs text-slate-500">
                      Current platform users
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Active Users
                      </span>

                      <span className="font-semibold text-white">
                        {formatNumber(
                          activeUsers
                        )}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(
                            totalUsers
                              ? (Number(
                                  activeUsers
                                ) /
                                  Number(
                                    totalUsers
                                  )) *
                                  100
                              : 0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-4">
                    <span className="text-sm text-slate-400">
                      Total Users
                    </span>

                    <span className="font-bold">
                      {formatNumber(totalUsers)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <CreditCard size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Subscription Overview
                    </h2>

                    <p className="text-xs text-slate-500">
                      Current subscription status
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Active Subscriptions
                      </span>

                      <span className="font-semibold text-white">
                        {formatNumber(
                          activeSubscriptions
                        )}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{
                          width: `${Math.min(
                            totalSubscriptions
                              ? (Number(
                                  activeSubscriptions
                                ) /
                                  Number(
                                    totalSubscriptions
                                  )) *
                                  100
                              : 0,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-950/60 p-4">
                    <span className="text-sm text-slate-400">
                      Total Subscriptions
                    </span>

                    <span className="font-bold">
                      {formatNumber(
                        totalSubscriptions
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw overview if backend provides extra analytics */}
            {Array.isArray(
              analytics?.top_topics
            ) &&
              analytics.top_topics.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="mb-5">
                    <h2 className="font-semibold">
                      Top Topics
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Topics with highest activity
                    </p>
                  </div>

                  <div className="space-y-3">
                    {analytics.top_topics
                      .slice(0, 10)
                      .map((topic, index) => {
                        const topicName =
                          topic.name ||
                          topic.topic_name ||
                          `Topic ${index + 1}`;

                        const topicValue =
                          Number(
                            topic.attempts ??
                              topic.count ??
                              topic.total ??
                              0
                          );

                        const maxValue = Math.max(
                          ...analytics.top_topics.map(
                            (item) =>
                              Number(
                                item.attempts ??
                                  item.count ??
                                  item.total ??
                                  0
                              )
                          ),
                          1
                        );

                        return (
                          <div
                            key={`${topicName}-${index}`}
                            className="rounded-xl bg-slate-950/60 p-4"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="truncate text-sm text-slate-300">
                                {topicName}
                              </span>

                              <span className="shrink-0 text-sm font-semibold text-slate-200">
                                {formatNumber(
                                  topicValue
                                )}
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-indigo-500"
                                style={{
                                  width: `${
                                    (topicValue /
                                      maxValue) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;