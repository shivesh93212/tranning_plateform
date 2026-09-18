import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Loader2,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  getPracticeQuestions,
  submitAttempt,
} from "../services/practiceApi";

function Practice() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getPracticeQuestions();
        setQuestions(data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Failed to load practice questions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (optionId) => {
    if (result || submitting) {
      return;
    }

    setSelectedOption(optionId);
  };

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

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setResult(null);
    setError("");
  };

  const handlePrevious = () => {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((prev) => prev - 1);
    setSelectedOption(null);
    setResult(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Loader2
              size={28}
              className="animate-spin text-indigo-400"
            />
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Loading practice questions...
          </p>
        </div>
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <XCircle
            size={40}
            className="mx-auto text-red-400"
          />

          <p className="mt-3 font-medium text-red-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="text-center">
          <BookOpen
            size={45}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            No questions available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try again after adding some practice questions.
          </p>
        </div>
      </div>
    );
  }

  const progress =
    ((currentIndex + 1) / questions.length) * 100;

  const getOptionClass = (option) => {
    if (!result) {
      if (selectedOption === option.id) {
        return "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100";
      }

      return "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md";
    }

    if (option.id === result.correct_option_id) {
      return "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100";
    }

    if (
      option.id === result.selected_option_id &&
      !result.is_correct
    ) {
      return "border-red-500 bg-red-50 shadow-lg shadow-red-100";
    }

    return "border-slate-200 bg-slate-50 opacity-70";
  };

  const getOptionIcon = (option) => {
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

    if (option.id === result.correct_option_id) {
      return <CheckCircle2 size={20} />;
    }

    if (
      option.id === result.selected_option_id &&
      !result.is_correct
    ) {
      return <XCircle size={20} />;
    }

    return option.option_label;
  };

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">

      <div className="mx-auto max-w-4xl">

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
              Solve the question and test your knowledge.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm">
            <Sparkles size={16} />

            Question {currentIndex + 1} / {questions.length}
          </div>
        </div>

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

            </div>

            <p className="mt-5 text-base font-semibold leading-7 text-slate-900 sm:mt-6 sm:text-xl sm:leading-8">
              {currentQuestion.question_text}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 p-4 sm:p-8">

            {currentQuestion.options.map((option, index) => {
              const isSelected =
                selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={!!result || submitting}
                  onClick={() =>
                    handleOptionSelect(option.id)
                  }
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 sm:gap-4 sm:p-5 ${getOptionClass(
                    option
                  )}`}
                  style={{
                    animation: `optionEnter 450ms ${
                      index * 80
                    }ms both`,
                  }}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 sm:h-10 sm:w-10 ${
                      result
                        ? option.id ===
                          result.correct_option_id
                          ? "bg-emerald-500 text-white"
                          : option.id ===
                            result.selected_option_id
                          ? "bg-red-500 text-white"
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
                        ? option.id ===
                          result.correct_option_id
                          ? "text-emerald-800"
                          : option.id ===
                            result.selected_option_id
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
            })}
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
              disabled={currentIndex === 0 || submitting}
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