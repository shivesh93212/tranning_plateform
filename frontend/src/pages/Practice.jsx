import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  getPracticeQuestions,
  submitAttempt,
  getPracticeTopics,
  getPracticeCompanies,
} from "../services/practiceApi";

function Practice() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCompanyYear, setSelectedCompanyYear] = useState("");

  const [filtersLoading, setFiltersLoading] = useState(true);

  // --------------------------------
  // Load filters
  // --------------------------------

  useEffect(() => {
    const loadFilters = async () => {
      try {
        setFiltersLoading(true);

        const [topicsData, companiesData] = await Promise.all([
          getPracticeTopics(),
          getPracticeCompanies(),
        ]);

        setTopics(topicsData || []);
        setCompanies(companiesData || []);
      } catch (error) {
        console.error("Failed to load practice filters:", error);
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilters();
  }, []);

  // --------------------------------
  // Load questions
  // --------------------------------

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (selectedTopic) {
        params.topic_id = Number(selectedTopic);
      }

      if (selectedDifficulty) {
        params.difficulty = Number(selectedDifficulty);
      }

      if (selectedCompanyYear) {
        params.company_year = Number(selectedCompanyYear);
      }

      const data = await getPracticeQuestions(params);

      setQuestions(data || []);
      setCurrentIndex(0);
      setSelectedOption(null);
      setResult(null);
    } catch (err) {
      setQuestions([]);

      setError(
        err.response?.data?.detail ||
          "Failed to load practice questions"
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Apply filters
  // --------------------------------

  useEffect(() => {
    if (!filtersLoading) {
      fetchQuestions();
    }
  }, [
    selectedTopic,
    selectedDifficulty,
    selectedCompanyYear,
    filtersLoading,
  ]);

  const currentQuestion = questions[currentIndex];

  // --------------------------------
  // Clear filters
  // --------------------------------

  const clearFilters = () => {
    setSelectedTopic("");
    setSelectedDifficulty("");
    setSelectedCompanyYear("");
  };

  // --------------------------------
  // Option select
  // --------------------------------

  const handleOptionSelect = (optionId) => {
    if (result || submitting) {
      return;
    }

    setSelectedOption(optionId);
  };

  // --------------------------------
  // Submit answer
  // --------------------------------

  const handleSubmit = async () => {
    if (!selectedOption || !currentQuestion || submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await submitAttempt({
        question_id: currentQuestion.id,
        selected_option_id: selectedOption,
      });

      console.log("ATTEMPT RESPONSE:", response);

      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to submit answer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // Next question
  // --------------------------------

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setResult(null);
    setError("");
  };

  // --------------------------------
  // Previous question
  // --------------------------------

  const handlePrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((prev) => prev - 1);
    setSelectedOption(null);
    setResult(null);
    setError("");
  };

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading || filtersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
            <Loader2
              size={30}
              className="animate-spin text-indigo-600"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading practice...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------
  // No questions
  // --------------------------------

  const progress =
    questions.length > 0
      ? ((currentIndex + 1) / questions.length) * 100
      : 0;

  // --------------------------------
  // Normalize result IDs
  // --------------------------------

  const correctOptionId = Number(
    result?.correct_option_id
  );

  const selectedResultOptionId = Number(
    result?.selected_option_id
  );

  // --------------------------------
  // Option styling
  // --------------------------------

  const getOptionClass = (option) => {
    const optionId = Number(option.id);

    if (!result) {
      if (selectedOption === option.id) {
        return "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100";
      }

      return "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md";
    }

    // Correct answer ALWAYS green
    if (optionId === correctOptionId) {
      return "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100";
    }

    // Selected wrong answer
    if (
      optionId === selectedResultOptionId &&
      !result.is_correct
    ) {
      return "border-red-500 bg-red-50 shadow-lg shadow-red-100";
    }

    return "border-slate-200 bg-slate-50 opacity-70";
  };

  // --------------------------------
  // Option icon
  // --------------------------------

  const getOptionIcon = (option) => {
    const optionId = Number(option.id);

    if (!result) {
      if (selectedOption === option.id) {
        return (
          <Check
            size={19}
            className="animate-[pop_300ms_ease-out]"
          />
        );
      }

      return option.option_label;
    }

    if (optionId === correctOptionId) {
      return <CheckCircle2 size={20} />;
    }

    if (
      optionId === selectedResultOptionId &&
      !result.is_correct
    ) {
      return <XCircle size={20} />;
    }

    return option.option_label;
  };

  // --------------------------------
  // Unique company years
  // --------------------------------

  const companyYears = [
    ...new Set(
      companies
        .map((company) => company.year)
        .filter(Boolean)
    ),
  ].sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                <BookOpen size={20} />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Practice
              </h1>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Solve questions and improve your skills.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm">
            <Sparkles size={16} />

            Question{" "}
            {questions.length > 0 ? currentIndex + 1 : 0} /{" "}
            {questions.length}
          </div>
        </div>

        {/* Filters */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                <Filter size={17} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Practice Filters
                </h2>

                <p className="text-xs text-slate-500">
                  Choose what you want to practice
                </p>
              </div>
            </div>

            {(selectedTopic ||
              selectedDifficulty ||
              selectedCompanyYear) && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                <RotateCcw size={14} />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

            {/* Topic */}

            <div className="relative">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Topic
              </label>

              <div className="relative">
                <select
                  value={selectedTopic}
                  onChange={(e) =>
                    setSelectedTopic(e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">All Topics</option>

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

            <div className="relative">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Difficulty
              </label>

              <div className="relative">
                <select
                  value={selectedDifficulty}
                  onChange={(e) =>
                    setSelectedDifficulty(e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">
                    All Difficulties
                  </option>

                  <option value="1">Easy</option>
                  <option value="2">Medium</option>
                  <option value="3">Hard</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Company Year */}

            <div className="relative sm:col-span-2 lg:col-span-1">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Company Year
              </label>

              <div className="relative">
                <select
                  value={selectedCompanyYear}
                  onChange={(e) =>
                    setSelectedCompanyYear(e.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">
                    All Company Years
                  </option>

                  {companyYears.map((year) => (
                    <option key={year} value={year}>
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
          </div>
        </div>

        {/* No Questions */}

        {!questions.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-14 text-center shadow-xl shadow-slate-200/50">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <BookOpen
                size={32}
                className="text-slate-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No questions found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              No questions match the selected filters.
              Try changing the topic, difficulty or company
              year.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              <RotateCcw size={17} />
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}

            <div className="mb-5 sm:mb-6">
              <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                <span>Your progress</span>

                <span>{Math.round(progress)}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}

            <div
              key={currentQuestion.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 sm:rounded-3xl"
              style={{
                animation:
                  "questionEnter 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >

              {/* Question */}

              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-wrap gap-2">

                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {currentQuestion.question_type}
                  </span>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {currentQuestion.source_type}
                  </span>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Difficulty {currentQuestion.difficulty}
                  </span>

                  {currentQuestion.company_year && (
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                      Company {currentQuestion.company_year}
                    </span>
                  )}
                </div>

                <p className="mt-5 text-base font-semibold leading-7 text-slate-900 sm:mt-6 sm:text-xl sm:leading-8">
                  {currentQuestion.question_text}
                </p>
              </div>

              {/* Options */}

              <div className="space-y-3 p-4 sm:p-8">
                {currentQuestion.options.map(
                  (option, index) => {
                    const isSelected =
                      selectedOption === option.id;

                    const optionId = Number(option.id);

                    const isCorrect =
                      result &&
                      optionId === correctOptionId;

                    const isWrongSelected =
                      result &&
                      optionId === selectedResultOptionId &&
                      !result.is_correct;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        disabled={!!result || submitting}
                        onClick={() =>
                          handleOptionSelect(option.id)
                        }
                        className={`group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 sm:gap-4 sm:p-5 ${
                          getOptionClass(option)
                        }`}
                        style={{
                          animation: `optionEnter 450ms ${
                            index * 80
                          }ms both`,
                        }}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 sm:h-10 sm:w-10 ${
                            result
                              ? isCorrect
                                ? "scale-105 bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                                : isWrongSelected
                                ? "scale-105 bg-red-500 text-white shadow-lg shadow-red-200"
                                : "bg-slate-200 text-slate-500"
                              : isSelected
                              ? "scale-110 bg-indigo-600 text-white shadow-lg shadow-indigo-300"
                              : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                          }`}
                        >
                          {getOptionIcon(option)}
                        </span>

                        <span
                          className={`text-sm font-medium sm:text-base ${
                            result
                              ? isCorrect
                                ? "text-emerald-800"
                                : isWrongSelected
                                ? "text-red-800"
                                : "text-slate-500"
                              : isSelected
                              ? "text-indigo-900"
                              : "text-slate-700"
                          }`}
                        >
                          {option.option_text}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Result */}

              {result && (
                <div
                  className={`mx-4 mb-4 rounded-2xl border p-4 sm:mx-8 sm:mb-6 sm:p-5 ${
                    result.is_correct
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                  style={{
                    animation:
                      "resultEnter 450ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <div className="flex items-start gap-3">

                    {result.is_correct ? (
                      <CheckCircle2
                        size={24}
                        className="shrink-0 text-emerald-600"
                      />
                    ) : (
                      <XCircle
                        size={24}
                        className="shrink-0 text-red-600"
                      />
                    )}

                    <div>
                      <h3
                        className={`font-bold ${
                          result.is_correct
                            ? "text-emerald-800"
                            : "text-red-800"
                        }`}
                      >
                        {result.is_correct
                          ? "Correct Answer! 🎉"
                          : "Wrong Answer"}
                      </h3>

                      {result.explanation && (
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {result.explanation}
                        </p>
                      )}

                      {result.shortcut && (
                        <div className="mt-3 rounded-xl bg-white/70 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                            Shortcut
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {result.shortcut}
                          </p>
                        </div>
                      )}

                      {result.solution_steps && (
                        <div className="mt-3 rounded-xl bg-white/70 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                            Solution
                          </p>

                          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                            {result.solution_steps}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}

              {error && (
                <div className="mx-4 mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 sm:mx-8">
                  {error}
                </div>
              )}

              {/* Footer */}

              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={
                    currentIndex === 0 || submitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>

                {!result ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedOption || submitting}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Checking...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <Check size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      currentIndex === questions.length - 1
                    }
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto"
                  >
                    Next Question
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes questionEnter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes optionEnter {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes resultEnter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(0.5);
          }

          70% {
            transform: scale(1.2);
          }

          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default Practice;