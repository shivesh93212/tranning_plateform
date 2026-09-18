import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Target,
  Flame,
  Trophy,
  BookOpen,
  Clock3,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { getDashboard } from "../services/dashboardApi";

function StatCard({ icon: Icon, title, value, subtitle, iconClass }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100 opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>

        <div
          className={`rounded-xl p-3 ${iconClass} transition-transform duration-300 group-hover:rotate-6`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  const percentage = Math.min(Math.max(value || 0, 0), 100);

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(
          err.response?.data?.detail || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
          <p className="mt-4 text-sm text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <XCircle className="mx-auto text-red-400" size={40} />
          <p className="mt-3 font-medium text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const progress = dashboard?.progress;
  const topicProgress = dashboard?.topic_progress || [];
  const recentAttempts = dashboard?.recent_attempts || [];

  const accuracy = progress?.accuracy ?? 0;
  const solved = progress?.questions_solved ?? 0;
  const correct = progress?.correct_answers ?? 0;
  const wrong = progress?.wrong_answers ?? 0;
  const streak = progress?.streak_days ?? 0;

  const userName =
    dashboard?.user?.name ||
    dashboard?.name ||
    "Learner";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 text-white shadow-2xl sm:p-10">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-purple-300/10 blur-2xl" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="animate-[fadeIn_0.7s_ease-out]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
                <Sparkles size={14} />
                Keep learning, keep growing
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {userName} 👋
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                Your preparation journey continues. Stay consistent and
                turn your daily practice into progress.
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-white/20 bg-white/10 backdrop-blur">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {Math.round(accuracy)}%
                  </p>
                  <p className="text-xs text-indigo-100">Accuracy</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={BookOpen}
            title="Questions Solved"
            value={solved}
            subtitle="Total practice completed"
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={CheckCircle2}
            title="Correct Answers"
            value={correct}
            subtitle="Questions answered correctly"
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            icon={XCircle}
            title="Wrong Answers"
            value={wrong}
            subtitle="Areas to improve"
            iconClass="bg-rose-50 text-rose-600"
          />

          <StatCard
            icon={Flame}
            title="Current Streak"
            value={`${streak} days`}
            subtitle="Keep the streak alive"
            iconClass="bg-orange-50 text-orange-600"
          />

        </section>

        {/* Main content */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Topic Progress */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Topic Progress
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Track your preparation across topics
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <Target size={20} />
              </div>
            </div>

            <div className="mt-6 space-y-5">

              {topicProgress.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <BookOpen
                    className="mx-auto text-slate-300"
                    size={36}
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    Start solving questions to see your topic progress.
                  </p>
                </div>
              ) : (
                topicProgress.map((topic) => (
                  <div
                    key={topic.topic_id}
                    className="group rounded-xl p-3 transition-colors duration-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {topic.topic_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {topic.questions_solved} questions •{" "}
                          {topic.correct_answers} correct
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-bold text-indigo-600">
                        {Math.round(topic.accuracy || 0)}%
                      </span>

                    </div>

                    <ProgressBar value={topic.accuracy} />
                  </div>
                ))
              )}

            </div>
          </div>

          {/* Accuracy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <Trophy size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Performance
                </h2>
                <p className="text-xs text-slate-500">
                  Your overall statistics
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#6366f1 ${
                    accuracy * 3.6
                  }deg, #e2e8f0 0deg)`,
                }}
              >
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-3xl font-bold text-slate-900">
                    {Math.round(accuracy)}%
                  </span>
                  <span className="text-xs text-slate-400">
                    Overall Accuracy
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs text-emerald-600">Correct</p>
                <p className="mt-1 text-xl font-bold text-emerald-700">
                  {correct}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-xs text-rose-600">Wrong</p>
                <p className="mt-1 text-xl font-bold text-rose-700">
                  {wrong}
                </p>
              </div>

            </div>
          </div>

        </section>

        {/* Recent Attempts */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Attempts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest practice activity
              </p>
            </div>

            <Clock3 className="text-slate-400" size={21} />
          </div>

          <div className="mt-5 overflow-x-auto">

            {recentAttempts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <Clock3
                  className="mx-auto text-slate-300"
                  size={34}
                />
                <p className="mt-3 text-sm text-slate-500">
                  No recent attempts yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">

                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="group flex items-center justify-between rounded-xl p-4 transition-all duration-200 hover:bg-slate-50"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`rounded-xl p-2 ${
                          attempt.is_correct
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {attempt.is_correct ? (
                          <CheckCircle2 size={19} />
                        ) : (
                          <XCircle size={19} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">
                          {attempt.question_text ||
                            `Question #${attempt.question_id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {attempt.attempted_at
                            ? new Date(
                                attempt.attempted_at
                              ).toLocaleString()
                            : "Recently attempted"}
                        </p>
                      </div>

                    </div>

                    <ArrowUpRight
                      size={18}
                      className="shrink-0 text-slate-300 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />

                  </div>
                ))}

              </div>
            )}

          </div>
        </section>

      </main>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;