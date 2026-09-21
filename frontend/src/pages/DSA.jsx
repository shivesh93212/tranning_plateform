import { useEffect, useMemo, useState } from "react";

import {
  Search,
  ExternalLink,
  Code2,
  Building2,
  Tag,
  ChevronDown,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

function DSA() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] =
    useState("All");

  const loadProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/practice/dsa");

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid DSA response");
      }

      setProblems(response.data);
    } catch (err) {
      console.error("Failed to load DSA problems:", err);

      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 403) {
        setError(
          "Active premium subscription is required to access DSA."
        );
      } else if (status === 401) {
        setError("Please login to access DSA.");
      } else {
        setError(
          detail ||
            err.message ||
            "Failed to load DSA problems."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const companies = useMemo(() => {
    return [
      "All",
      ...new Set(
        problems
          .map((problem) => problem.company)
          .filter(Boolean)
      ),
    ];
  }, [problems]);

  const topics = useMemo(() => {
    return [
      "All",
      ...new Set(
        problems
          .map((problem) => problem.topic)
          .filter(Boolean)
      ),
    ];
  }, [problems]);

  const difficulties = useMemo(() => {
    return [
      "All",
      ...new Set(
        problems
          .map((problem) => problem.difficulty)
          .filter(Boolean)
      ),
    ];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return problems.filter((problem) => {
      const matchesSearch =
        !searchText ||
        problem.title
          ?.toLowerCase()
          .includes(searchText) ||
        problem.company
          ?.toLowerCase()
          .includes(searchText) ||
        problem.topic
          ?.toLowerCase()
          .includes(searchText);

      const matchesCompany =
        companyFilter === "All" ||
        problem.company === companyFilter;

      const matchesTopic =
        topicFilter === "All" ||
        problem.topic === topicFilter;

      const matchesDifficulty =
        difficultyFilter === "All" ||
        problem.difficulty === difficultyFilter;

      return (
        matchesSearch &&
        matchesCompany &&
        matchesTopic &&
        matchesDifficulty
      );
    });
  }, [
    problems,
    search,
    companyFilter,
    topicFilter,
    difficultyFilter,
  ]);

  const resetFilters = () => {
    setSearch("");
    setCompanyFilter("All");
    setTopicFilter("All");
    setDifficultyFilter("All");
  };

  const getDifficultyClass = (difficulty) => {
    const value = difficulty?.toLowerCase();

    if (value === "easy") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (value === "medium") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (value === "hard") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const openProblem = (link) => {
    if (!link) {
      return;
    }

    window.open(
      link,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * Premium API protection is already handled
   * by the backend.
   *
   * If backend returns 403, show subscription CTA.
   */
  if (
    !loading &&
    error &&
    error.toLowerCase().includes("premium")
  ) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
              <Lock size={30} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
              DSA is a Premium Feature
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Access company-wise DSA problems, topics,
              difficulty levels and coding problem links
              with an active premium subscription.
            </p>

            <button
              type="button"
              onClick={() => navigate("/subscription")}
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:scale-[1.02] hover:shadow-xl"
            >
              View Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                <Code2 size={14} />
                Premium DSA
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                DSA Practice
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Practice coding problems from top
                companies and important DSA topics.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-slate-400">
                Problems
              </p>

              <p className="text-xl font-bold text-slate-900">
                {filteredProblems.length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search problems..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Company */}
            <div className="relative">
              <Building2
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={companyFilter}
                onChange={(e) =>
                  setCompanyFilter(e.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {companies.map((company) => (
                  <option
                    key={company}
                    value={company}
                  >
                    {company === "All"
                      ? "All Companies"
                      : company}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Topic */}
            <div className="relative">
              <Tag
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={topicFilter}
                onChange={(e) =>
                  setTopicFilter(e.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {topics.map((topic) => (
                  <option
                    key={topic}
                    value={topic}
                  >
                    {topic === "All"
                      ? "All Topics"
                      : topic}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Difficulty */}
            <div className="relative">
              <select
                value={difficultyFilter}
                onChange={(e) =>
                  setDifficultyFilter(e.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              >
                {difficulties.map((difficulty) => (
                  <option
                    key={difficulty}
                    value={difficulty}
                  >
                    {difficulty === "All"
                      ? "All Difficulties"
                      : difficulty}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {(search ||
            companyFilter !== "All" ||
            topicFilter !== "All" ||
            difficultyFilter !== "All") && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={30}
                className="animate-spin text-indigo-600"
              />

              <p className="text-sm font-medium">
                Loading DSA problems...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <h3 className="font-semibold text-red-800">
                  Unable to load DSA
                </h3>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadProblems}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredProblems.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Code2
                size={38}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No problems found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Reset Filters
              </button>
            </div>
          )}

        {/* Desktop Table */}
        {!loading &&
          !error &&
          filteredProblems.length > 0 && (
            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Problem
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Company
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Topic
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Difficulty
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProblems.map(
                      (problem) => (
                        <tr
                          key={problem.id}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {problem.title ||
                                "Untitled Problem"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
                              <Building2 size={15} />
                              {problem.company ||
                                "Unknown"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">
                              {problem.topic ||
                                "Unknown"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${getDifficultyClass(
                                problem.difficulty
                              )}`}
                            >
                              {problem.difficulty ||
                                "Unknown"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              disabled={!problem.link}
                              onClick={() =>
                                openProblem(
                                  problem.link
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Solve
                              <ExternalLink
                                size={15}
                              />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Mobile Cards */}
        {!loading &&
          !error &&
          filteredProblems.length > 0 && (
            <div className="space-y-3 lg:hidden">
              {filteredProblems.map(
                (problem) => (
                  <div
                    key={problem.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">
                          {problem.title ||
                            "Untitled Problem"}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Building2 size={15} />

                          <span className="truncate">
                            {problem.company ||
                              "Unknown"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${getDifficultyClass(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty ||
                          "Unknown"}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
                        <Tag
                          size={15}
                          className="shrink-0"
                        />

                        <span className="truncate">
                          {problem.topic ||
                            "Unknown"}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={!problem.link}
                        onClick={() =>
                          openProblem(
                            problem.link
                          )
                        }
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Solve
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export default DSA;