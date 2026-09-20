import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Play,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  getPracticeTopics,
  getPracticeCompanies,
  startPracticeSession,
  getPracticeSession,
  submitPracticeSession,
  finishPracticeSession,
  getPracticeSessionResult,
  getPracticeSessionQuestions,
} from "../services/practiceApi";

function PracticeTest() {
  // -----------------------------------------
  // SETUP STATE
  // -----------------------------------------

  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedCompanyYear, setSelectedCompanyYear] = useState("");
  const [questionCount, setQuestionCount] = useState("3");

  // -----------------------------------------
  // GENERAL STATE
  // -----------------------------------------

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [runnerLoading, setRunnerLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [error, setError] = useState("");

  // -----------------------------------------
  // SESSION STATE
  // -----------------------------------------

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  const [questionStartedAt, setQuestionStartedAt] = useState(
    Date.now()
  );

  // -----------------------------------------
  // FINAL RESULT
  // -----------------------------------------

  const [finalResult, setFinalResult] = useState(null);

  // -----------------------------------------
  // LOAD SETUP DATA
  // -----------------------------------------

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [topicsData, companiesData] =
          await Promise.all([
            getPracticeTopics(),
            getPracticeCompanies(),
          ]);

        setTopics(
          Array.isArray(topicsData)
            ? topicsData
            : []
        );

        setCompanies(
          Array.isArray(companiesData)
            ? companiesData
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load session setup:",
          err
        );

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
            detail ||
              "Failed to load practice test setup"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // -----------------------------------------
  // COMPANY YEARS
  // -----------------------------------------

  const companyYears = [
    ...new Set(
      companies
        .map((company) => company.year)
        .filter(Boolean)
    ),
  ].sort(
    (a, b) => Number(b) - Number(a)
  );

  // -----------------------------------------
  // START TEST
  // -----------------------------------------

  const handleStartTest = async () => {
    if (starting) return;

    setStarting(true);
    setError("");
    setFinalResult(null);

    try {
      const sessionData = {
        topic_id: selectedTopic
          ? Number(selectedTopic)
          : null,

        total_questions: Number(
          questionCount
        ),
      };

      const createdSession =
        await startPracticeSession(
          sessionData
        );

      setSession(createdSession);

      await loadSessionQuestions(
        createdSession.id
      );
    } catch (err) {
      console.error(
        "Failed to start session:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .filter(Boolean)
            .join(", ")
        );
      } else {
        setError(
          detail ||
            "Unable to start practice test"
        );
      }

      setSession(null);
    } finally {
      setStarting(false);
    }
  };

  // -----------------------------------------
  // LOAD QUESTIONS FOR SESSION
  // -----------------------------------------

const loadSessionQuestions = async (sessionId) => {
  try {
    setRunnerLoading(true);
    setError("");

    const sessionData = await getPracticeSession(
      Number(sessionId)
    );

    setSession(sessionData);

    const sessionQuestions =
      await getPracticeSessionQuestions(
        Number(sessionId)
      );

    if (
      !Array.isArray(sessionQuestions) ||
      sessionQuestions.length === 0
    ) {
      throw new Error(
        "No questions found in this session"
      );
    }

    setQuestions(sessionQuestions);

    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmissionResult(null);
    setQuestionStartedAt(Date.now());
  } catch (err) {
    console.error(
      "Failed to load session questions:",
      err
    );

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
        detail ||
          err.message ||
          "Failed to load test questions"
      );
    }
  } finally {
    setRunnerLoading(false);
  }
};

  // -----------------------------------------
  // CURRENT QUESTION
  // -----------------------------------------

  const currentQuestion =
    questions[currentIndex];

  const isLastQuestion =
    currentIndex ===
    questions.length - 1;

  // -----------------------------------------
  // OPTION SELECT
  // -----------------------------------------

  const handleOptionSelect = (optionId) => {
    if (
      submitting ||
      submissionResult
    ) {
      return;
    }

    setSelectedOption(optionId);
  };

  // -----------------------------------------
  // SUBMIT CURRENT ANSWER
  // -----------------------------------------

  const handleSubmitAnswer = async () => {
    if (
      !currentQuestion ||
      !selectedOption ||
      submitting ||
      submissionResult
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const timeTaken = Math.max(
        0,
        Math.floor(
          (Date.now() -
            questionStartedAt) /
            1000
        )
      );

      const response =
        await submitPracticeSession(
          session.id,
          {
            question_id:
              Number(
                currentQuestion.id
              ),

            selected_option_id:
              Number(selectedOption),

            time_taken_seconds:
              timeTaken,
          }
        );

      setSubmissionResult(response);
    } catch (err) {
      console.error(
        "Failed to submit answer:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to submit answer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------
  // NEXT QUESTION
  // -----------------------------------------

  const handleNext = () => {
    if (
      currentIndex >=
      questions.length - 1
    ) {
      return;
    }

    setCurrentIndex(
      (previous) => previous + 1
    );

    setSelectedOption(null);
    setSubmissionResult(null);
    setQuestionStartedAt(Date.now());
    setError("");
  };

  // -----------------------------------------
  // PREVIOUS QUESTION
  // -----------------------------------------

  const handlePrevious = () => {
    if (currentIndex <= 0) {
      return;
    }

    setCurrentIndex(
      (previous) => previous - 1
    );

    setSelectedOption(null);
    setSubmissionResult(null);
    setQuestionStartedAt(Date.now());
    setError("");
  };

  // -----------------------------------------
  // FINISH TEST
  // -----------------------------------------

  const handleFinishTest = async () => {
    if (
      !session ||
      finishing
    ) {
      return;
    }

    try {
      setFinishing(true);
      setError("");

      await finishPracticeSession(
        session.id
      );

      const result =
        await getPracticeSessionResult(
          session.id
        );

      setFinalResult(result);

      setSession((previous) => ({
        ...previous,
        status: "completed",
      }));
    } catch (err) {
      console.error(
        "Failed to finish test:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to finish practice test"
      );
    } finally {
      setFinishing(false);
    }
  };

  // -----------------------------------------
  // RESET
  // -----------------------------------------

  const handleCreateAnother = () => {
    setSession(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmissionResult(null);
    setFinalResult(null);
    setError("");
  };

  // -----------------------------------------
  // OPTION STYLE
  // -----------------------------------------

  const getOptionClass = (option) => {
    const optionId = Number(
      option.id
    );

    const selectedId = Number(
      selectedOption
    );

    if (!submissionResult) {
      if (
        optionId === selectedId
      ) {
        return "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100";
      }

      return "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md";
    }

    if (option.is_correct) {
      return "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100";
    }

    if (
      optionId === selectedId &&
      !submissionResult.is_correct
    ) {
      return "border-red-500 bg-red-50 shadow-lg shadow-red-100";
    }

    return "border-slate-200 bg-slate-50 opacity-60";
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
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

  // -----------------------------------------
  // FINAL RESULT
  // -----------------------------------------

  if (
    finalResult &&
    session
  ) {
    return (
      <div className="min-h-[calc(100vh-2rem)] bg-slate-100 px-3 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-10 text-center text-white sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <Trophy size={32} />
              </div>

              <h1 className="mt-5 text-2xl font-bold sm:text-3xl">
                Test Completed 🎉
              </h1>

              <p className="mt-2 text-sm text-indigo-100">
                Here is your practice test
                performance.
              </p>
            </div>

            <div className="p-5 sm:p-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <ResultCard
                  label="Score"
                  value={`${finalResult.score}/${finalResult.total_questions}`}
                />

                <ResultCard
                  label="Accuracy"
                  value={`${finalResult.accuracy}%`}
                />

                <ResultCard
                  label="Correct"
                  value={finalResult.correct_answers}
                />

                <ResultCard
                  label="Wrong"
                  value={finalResult.wrong_answers}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Answered
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {finalResult.answered_questions}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Unanswered
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {finalResult.unanswered_questions}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  handleCreateAnother
                }
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Play size={18} />
                Create Another Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // SESSION QUESTION RUNNER
  // -----------------------------------------

  if (
    session &&
    questions.length > 0
  ) {
    if (runnerLoading) {
      return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
              <Loader2
                size={28}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading your questions...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-2rem)] bg-slate-100 px-3 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          {/* Top Header */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Practice Test
                </p>

                <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                  Question{" "}
                  {currentIndex + 1}{" "}
                  <span className="text-slate-400">
                    / {questions.length}
                  </span>
                </h1>
              </div>

              <div className="rounded-xl bg-indigo-50 px-4 py-2 text-center">
                <p className="text-xs font-semibold text-indigo-500">
                  Score
                </p>

                <p className="text-lg font-bold text-indigo-700">
                  {submissionResult?.score ??
                    session.score ??
                    0}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500"
                style={{
                  width: `${
                    ((currentIndex + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200">
                  {currentIndex + 1}
                </div>

                <div className="min-w-0">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Choose the correct answer
                  </p>

                  <h2 className="text-lg font-bold leading-7 text-slate-900 sm:text-xl sm:leading-8">
                    {currentQuestion.question_text}
                  </h2>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 p-4 sm:p-8">
              {currentQuestion.options?.map(
                (option, index) => {
                  const isSelected =
                    Number(
                      selectedOption
                    ) ===
                    Number(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={
                        !!submissionResult ||
                        submitting
                      }
                      onClick={() =>
                        handleOptionSelect(
                          option.id
                        )
                      }
                      className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300 sm:gap-4 sm:p-5 ${getOptionClass(
                        option
                      )}`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          submissionResult
                            ? option.is_correct
                              ? "bg-emerald-500 text-white"
                              : Number(
                                    option.id
                                  ) ===
                                  Number(
                                    selectedOption
                                  )
                                ? "bg-red-500 text-white"
                                : "bg-slate-200 text-slate-500"
                            : isSelected
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                              : "bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                        }`}
                      >
                        {option.option_label ||
                          String.fromCharCode(
                            65 + index
                          )}
                      </span>

                      <span
                        className={`text-sm font-medium leading-6 sm:text-base ${
                          submissionResult
                            ? option.is_correct
                              ? "text-emerald-800"
                              : Number(
                                    option.id
                                  ) ===
                                  Number(
                                    selectedOption
                                  )
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

            {/* Answer Feedback */}
            {submissionResult && (
              <div
                className={`mx-4 mb-5 rounded-2xl border p-4 sm:mx-8 sm:p-5 ${
                  submissionResult.is_correct
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {submissionResult.is_correct ? (
                    <CheckCircle2
                      size={25}
                      className="shrink-0 text-emerald-600"
                    />
                  ) : (
                    <XCircle
                      size={25}
                      className="shrink-0 text-red-600"
                    />
                  )}

                  <div>
                    <h3
                      className={`font-bold ${
                        submissionResult.is_correct
                          ? "text-emerald-800"
                          : "text-red-800"
                      }`}
                    >
                      {submissionResult.is_correct
                        ? "Correct Answer! 🎉"
                        : "Wrong Answer"}
                    </h3>

                    {!submissionResult.is_correct && (
                      <p className="mt-1 text-sm text-red-700">
                        The correct answer is highlighted above.
                      </p>
                    )}

                    {currentQuestion.explanation && (
                      <div className="mt-3 rounded-xl bg-white/70 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                          Explanation
                        </p>

                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                          {
                            currentQuestion.explanation
                          }
                        </p>
                      </div>
                    )}

                    {currentQuestion.shortcut && (
                      <div className="mt-3 rounded-xl bg-white/70 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                          Shortcut
                        </p>

                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                          {
                            currentQuestion.shortcut
                          }
                        </p>
                      </div>
                    )}

                    {currentQuestion.solution_steps && (
                      <div className="mt-3 rounded-xl bg-white/70 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                          Solution
                        </p>

                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                          {
                            currentQuestion.solution_steps
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-4 mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600 sm:mx-8">
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={
                  currentIndex === 0 ||
                  submitting
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                <ArrowLeft size={18} />
                Previous
              </button>

              {!submissionResult ? (
                <button
                  type="button"
                  onClick={
                    handleSubmitAnswer
                  }
                  disabled={
                    !selectedOption ||
                    submitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
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
                      <Check size={18} />
                      Submit Answer
                    </>
                  )}
                </button>
              ) : isLastQuestion ? (
                <button
                  type="button"
                  onClick={
                    handleFinishTest
                  }
                  disabled={finishing}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {finishing ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Finishing...
                    </>
                  ) : (
                    <>
                      <Trophy size={18} />
                      Finish Test
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl sm:w-auto"
                >
                  Next Question
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // SETUP SCREEN
  // -----------------------------------------

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-slate-100 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
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
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          {/* Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 py-7 text-white sm:px-8 sm:py-9">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

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
                Select your preferences and create a focused practice test.
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
                      setSelectedTopic(
                        e.target.value
                      )
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
                      setSelectedDifficulty(
                        e.target.value
                      )
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
                      setSelectedCompanyYear(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">
                      All Company Years
                    </option>

                    {companyYears.map(
                      (year) => (
                        <option
                          key={year}
                          value={year}
                        >
                          {year}
                        </option>
                      )
                    )}
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
                      setQuestionCount(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="3">
                      3 Questions
                    </option>
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {(selectedDifficulty ||
              selectedCompanyYear) && (
              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-xs leading-5 text-indigo-700">
                  Difficulty and company-year
                  filters are currently displayed
                  in the interface. They will be
                  connected to session filtering
                  when the backend session API
                  supports them.
                </p>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="mt-7 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={handleStartTest}
                disabled={starting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}

// -----------------------------------------
// RESULT CARD
// -----------------------------------------

function ResultCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

export default PracticeTest;