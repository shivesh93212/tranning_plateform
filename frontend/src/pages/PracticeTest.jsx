import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  Building2,
  ChevronDown,
  Clock3,
  Loader2,
  Play,
  Sparkles,
  Target,
} from "lucide-react";

import {
  getPracticeTopics,
  getPracticeCompanies,
  startPracticeSession,
} from "../services/practiceApi";

function PracticeTest() {
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCompanyYear, setSelectedCompanyYear] = useState("");
  const [questionCount, setQuestionCount] = useState("10");

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [topicsData, companiesData] = await Promise.all([
          getPracticeTopics(),
          getPracticeCompanies(),
        ]);

        setTopics(Array.isArray(topicsData) ? topicsData : []);
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      } catch (err) {
        console.error("Failed to load session setup:", err);

        const detail = err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map((item) => item.msg)
              .filter(Boolean)
              .join(", ")
          );
        } else {
          setError(
            detail || "Failed to load practice test setup"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const companyYears = [
    ...new Set(
      companies
        .map((company) => company.year)
        .filter(Boolean)
    ),
  ].sort((a, b) => Number(b) - Number(a));

  const handleStartTest = async () => {
    if (starting) return;

    setStarting(true);
    setError("");

    try {
      /*
       * Backend currently accepts:
       * topic_id
       * total_questions
       *
       * difficulty and company_year are currently UI-only.
       * They are NOT sent because the backend session schema
       * does not currently accept those fields.
       */
      const sessionData = {
        topic_id: selectedTopic
          ? Number(selectedTopic)
          : null,

        total_questions: Number(questionCount),
      };

      console.log("START SESSION:", sessionData);

      const response = await startPracticeSession(sessionData);

      console.log("SESSION RESPONSE:", response);

      /*
       * Save the created session so we don't lose it.
       */
      setSession(response);

    } catch (err) {
      console.error("Failed to start session:", err);

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .filter(Boolean)
            .join(", ")
        );
      } else {
        setError(
          detail || "Unable to start practice test"
        );
      }
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 shadow-sm">
            <Loader2
              size={28}
              className="animate-spin text-indigo-600"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading test setup...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Session successfully created.
   *
   * For now we show the session ID instead of pretending
   * that the question screen is ready. The actual question
   * runner should be connected to this session next.
   */
  if (session) {
    return (
      <div className="min-h-[calc(100vh-2rem)] bg-slate-100 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div
            className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
            style={{
              animation:
                "sessionSuccess 500ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-10 text-center text-white sm:px-10">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-10 left-1/4 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
                  <Play size={30} />
                </div>

                <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
                  Practice Session Created
                </h1>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-indigo-100">
                  Your practice session has been created successfully.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Session
                  </p>

                  <p className="mt-2 break-all text-lg font-bold text-slate-900">
                    #{session.id}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Questions
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {session.total_questions}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 text-lg font-bold capitalize text-emerald-600">
                    {session.status || "Active"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-medium leading-6 text-amber-700">
                  Session API is working. The question runner will use this
                  session to load and submit questions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSession(null)}
                className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Create Another Test
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes sessionSuccess {
            from {
              opacity: 0;
              transform: translateY(18px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-slate-100 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div
          className="mb-6"
          style={{
            animation:
              "sessionFade 500ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 shadow-sm">
              <Brain size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Practice Test
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Customize your test and start practicing.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
          style={{
            animation:
              "sessionCard 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 py-7 text-white sm:px-8 sm:py-9">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 left-1/3 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />

                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-100">
                  Test Setup
                </span>
              </div>

              <h2 className="mt-3 text-xl font-bold sm:text-2xl">
                Build your practice session
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                Select your preferences and create a focused
                practice test.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-7 lg:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

              {/* Topic */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BookOpen
                    size={16}
                    className="text-indigo-600"
                  />
                  Topic
                </label>

                <div className="relative">
                  <select
                    value={selectedTopic}
                    onChange={(e) =>
                      setSelectedTopic(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">
                      All Topics
                    </option>

                    {topics.map((topic) => (
                      <option
                        key={topic.id}
                        value={topic.id}
                      >
                        {topic.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Target
                    size={16}
                    className="text-indigo-600"
                  />
                  Difficulty
                </label>

                <div className="relative">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) =>
                      setSelectedDifficulty(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">
                      All Difficulties
                    </option>

                    <option value="1">
                      Easy
                    </option>

                    <option value="2">
                      Medium
                    </option>

                    <option value="3">
                      Hard
                    </option>
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Company Year */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Building2
                    size={16}
                    className="text-indigo-600"
                  />
                  Company Year
                </label>

                <div className="relative">
                  <select
                    value={selectedCompanyYear}
                    onChange={(e) =>
                      setSelectedCompanyYear(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">
                      All Company Years
                    </option>

                    {companyYears.map((year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock3
                    size={16}
                    className="text-indigo-600"
                  />
                  Number of Questions
                </label>

                <div className="relative">
                  <select
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="5">
                      5 Questions
                    </option>

                    <option value="10">
                      10 Questions
                    </option>

                    <option value="15">
                      15 Questions
                    </option>

                    <option value="20">
                      20 Questions
                    </option>

                    <option value="30">
                      30 Questions
                    </option>
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Backend limitation info */}
            {(selectedDifficulty || selectedCompanyYear) && (
              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-xs leading-5 text-indigo-700">
                  Difficulty and company-year filters are selected in the
                  interface. They will be applied once the session API
                  supports these filters.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Start */}
            <div className="mt-7 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleStartTest}
                disabled={starting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {starting ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Starting Test...
                  </>
                ) : (
                  <>
                    <Play
                      size={19}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    Start Practice Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sessionFade {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sessionCard {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default PracticeTest;