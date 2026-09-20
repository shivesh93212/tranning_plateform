import { useEffect, useState } from "react";
import {
  Activity,
  BookOpen,
  CreditCard,
  DollarSign,
  Loader2,
  Target,
  TrendingUp,
  Users,
  Layers,
} from "lucide-react";

import { getAdminDashboard } from "../../services/adminApi";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition group-hover:scale-110">
          <Icon size={21} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboard();

      setDashboard(data);
    } catch (err) {
      console.error(
        "Failed to load admin dashboard:",
        err
      );

      const detail = err.response?.data?.detail;

      setError(
        detail ||
          err.message ||
          "Failed to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2
            size={32}
            className="animate-spin"
          />

          <p className="text-sm">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboard || {};

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of users, questions, attempts and
            platform activity.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <Activity size={17} />
          Refresh
        </button>
      </div>

      {/* User Stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Users
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.total_users ?? 0}
            icon={Users}
            description="Registered users"
          />

          <StatCard
            title="Active Users"
            value={stats.active_users ?? 0}
            icon={TrendingUp}
            description="Currently active"
          />

          <StatCard
            title="Total Attempts"
            value={stats.total_attempts ?? 0}
            icon={Target}
            description="Questions attempted"
          />

          <StatCard
            title="Subscriptions"
            value={stats.total_subscriptions ?? 0}
            icon={CreditCard}
            description="Total subscriptions"
          />
        </div>
      </section>

      {/* Content Stats */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Practice Content
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Topics"
            value={stats.total_topics ?? 0}
            icon={Layers}
            description="Practice topics"
          />

          <StatCard
            title="Subtopics"
            value={stats.total_subtopics ?? 0}
            icon={Layers}
            description="Topic subcategories"
          />

          <StatCard
            title="Questions"
            value={stats.total_questions ?? 0}
            icon={BookOpen}
            description={`${stats.active_questions ?? 0} active questions`}
          />

          <StatCard
            title="Successful Payments"
            value={stats.successful_payments ?? 0}
            icon={CreditCard}
            description="Completed payments"
          />
        </div>
      </section>

      {/* Revenue */}
      <section>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <DollarSign
                    size={20}
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Revenue
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    ₹
                    {Number(
                      stats.total_revenue ?? 0
                    ).toLocaleString("en-IN")}
                  </h2>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">
                Successful Payments
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {stats.successful_payments ?? 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            Platform Overview
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">
                Active Questions
              </span>

              <span className="font-semibold text-slate-900">
                {stats.active_questions ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">
                Total Questions
              </span>

              <span className="font-semibold text-slate-900">
                {stats.total_questions ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Total Attempts
              </span>

              <span className="font-semibold text-slate-900">
                {stats.total_attempts ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            User & Payment Overview
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">
                Total Users
              </span>

              <span className="font-semibold text-slate-900">
                {stats.total_users ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">
                Active Users
              </span>

              <span className="font-semibold text-slate-900">
                {stats.active_users ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">
                Subscriptions
              </span>

              <span className="font-semibold text-slate-900">
                {stats.total_subscriptions ?? 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Revenue
              </span>

              <span className="font-semibold text-slate-900">
                ₹
                {Number(
                  stats.total_revenue ?? 0
                ).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;