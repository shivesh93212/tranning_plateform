import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Edit3,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminQuestions,
  getAdminSubtopics,
  getAdminTopics,
  updateAdminQuestion,
} from "../../services/adminApi";

const emptyOption = (label) => ({
  option_label: label,
  option_text: "",
  is_correct: false,
});

const initialForm = {
  topic_id: "",
  subtopic_id: "",
  question_text: "",
  difficulty: 1,
  question_type: "mcq",
  source_type: "practice",
  company_year: "",
  explanation: "",
  shortcut: "",
  solution_steps: "",
  options: [
    emptyOption("A"),
    emptyOption("B"),
    emptyOption("C"),
    emptyOption("D"),
  ],
};

const difficultyLabel = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
};

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    topic_id: "",
    subtopic_id: "",
    difficulty: "",
    source_type: "",
    company_year: "",
    is_active: "true",
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [topicData, questionData] =
        await Promise.all([
          getAdminTopics(),
          getAdminQuestions(),
        ]);

      setTopics(
        Array.isArray(topicData)
          ? topicData
          : []
      );

      setQuestions(
        Array.isArray(questionData)
          ? questionData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load admin questions:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load questions"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (filters.topic_id) {
        params.topic_id = Number(
          filters.topic_id
        );
      }

      if (filters.subtopic_id) {
        params.subtopic_id = Number(
          filters.subtopic_id
        );
      }

      if (filters.difficulty) {
        params.difficulty = Number(
          filters.difficulty
        );
      }

      if (filters.source_type) {
        params.source_type =
          filters.source_type;
      }

      if (filters.company_year) {
        params.company_year = Number(
          filters.company_year
        );
      }

      if (filters.is_active !== "") {
        params.is_active =
          filters.is_active === "true";
      }

      const data = await getAdminQuestions(
        params
      );

      setQuestions(
        Array.isArray(data) ? data : []
      );

      setPage(1);
    } catch (err) {
      console.error(
        "Failed to load questions:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load questions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadSubtopics = async (topicId) => {
    if (!topicId) {
      setSubtopics([]);
      return;
    }

    try {
      const data = await getAdminSubtopics(
        Number(topicId)
      );

      setSubtopics(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load subtopics:",
        err
      );

      setSubtopics([]);
    }
  };

  const filteredQuestions = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase();

    if (!term) {
      return questions;
    }

    return questions.filter((question) =>
      String(
        question.question_text || ""
      )
        .toLowerCase()
        .includes(term)
    );
  }, [questions, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredQuestions.length / pageSize
    )
  );

  const paginatedQuestions =
    filteredQuestions.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const getTopicName = (topicId) => {
    const topic = topics.find(
      (item) =>
        Number(item.id) === Number(topicId)
    );

    return topic?.name || `Topic #${topicId}`;
  };

  const getSubtopicName = (subtopicId) => {
    const subtopic = subtopics.find(
      (item) =>
        Number(item.id) ===
        Number(subtopicId)
    );

    return subtopic?.name ||
      `Subtopic #${subtopicId}`;
  };

  const openCreateModal = async () => {
    setEditingId(null);
    setForm(initialForm);
    setSubtopics([]);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = async (question) => {
    try {
      setEditingId(question.id);

      const topicId = question.topic_id;

      await loadSubtopics(topicId);

      const existingOptions =
        Array.isArray(question.options)
          ? question.options
          : [];

      const labels = ["A", "B", "C", "D"];

      const normalizedOptions =
        labels.map((label) => {
          const existing =
            existingOptions.find(
              (option) =>
                String(
                  option.option_label
                ).toUpperCase() === label
            );

          return {
            option_label: label,
            option_text:
              existing?.option_text || "",
            is_correct:
              Boolean(existing?.is_correct),
          };
        });

      setForm({
        topic_id:
          question.topic_id ?? "",
        subtopic_id:
          question.subtopic_id ?? "",
        question_text:
          question.question_text || "",
        difficulty:
          question.difficulty ?? 1,
        question_type:
          question.question_type || "mcq",
        source_type:
          question.source_type || "practice",
        company_year:
          question.company_year ?? "",
        explanation:
          question.explanation || "",
        shortcut:
          question.shortcut || "",
        solution_steps:
          question.solution_steps || "",
        options: normalizedOptions,
      });

      setError("");
      setSuccess("");
      setShowModal(true);
    } catch (err) {
      setError(
        err.message ||
          "Failed to open question"
      );
    }
  };

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setSubtopics([]);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTopicChange = async (value) => {
    setForm((prev) => ({
      ...prev,
      topic_id: value,
      subtopic_id: "",
    }));

    await loadSubtopics(value);
  };

  const handleOptionChange = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const options = [...prev.options];

      options[index] = {
        ...options[index],
        [field]: value,
      };

      return {
        ...prev,
        options,
      };
    });
  };

  const selectCorrectOption = (index) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map(
        (option, optionIndex) => ({
          ...option,
          is_correct:
            optionIndex === index,
        })
      ),
    }));
  };

  const validateForm = () => {
    if (!form.topic_id) {
      return "Please select a topic";
    }

    if (!form.subtopic_id) {
      return "Please select a subtopic";
    }

    if (!form.question_text.trim()) {
      return "Question text is required";
    }

    if (!form.difficulty) {
      return "Please select difficulty";
    }

    const validOptions =
      form.options.filter(
        (option) =>
          option.option_text.trim()
      );

    if (validOptions.length < 2) {
      return "At least 2 options are required";
    }

    const correctOptions =
      form.options.filter(
        (option) => option.is_correct
      );

    if (correctOptions.length !== 1) {
      return "Please select exactly one correct option";
    }

    return "";
  };

  const buildPayload = () => {
    const options = form.options
      .filter(
        (option) =>
          option.option_text.trim()
      )
      .map((option) => ({
        option_label:
          option.option_label,
        option_text:
          option.option_text.trim(),
        is_correct:
          Boolean(option.is_correct),
      }));

    return {
      topic_id: Number(form.topic_id),
      subtopic_id: Number(
        form.subtopic_id
      ),
      question_text:
        form.question_text.trim(),
      difficulty: Number(
        form.difficulty
      ),
      question_type:
        form.question_type,
      source_type:
        form.source_type,
      company_year:
        form.company_year === ""
          ? null
          : Number(form.company_year),
      explanation:
        form.explanation.trim() || null,
      shortcut:
        form.shortcut.trim() || null,
      solution_steps:
        form.solution_steps.trim() || null,
      options,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      const payload = buildPayload();

      if (editingId) {
        await updateAdminQuestion(
          editingId,
          payload
        );

        setSuccess(
          "Question updated successfully"
        );
      } else {
        await createAdminQuestion(
          payload
        );

        setSuccess(
          "Question created successfully"
        );
      }

      await loadQuestions();

      setShowModal(false);
      setEditingId(null);
      setForm(initialForm);
      setSubtopics([]);
    } catch (err) {
      console.error(
        "Failed to save question:",
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
            err.message ||
            "Failed to save question"
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (question) => {
    const confirmed =
      window.confirm(
        "Deactivate this question?"
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteAdminQuestion(
        question.id
      );

      setSuccess(
        "Question deactivated successfully"
      );

      await loadQuestions();
    } catch (err) {
      console.error(
        "Failed to deactivate question:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to deactivate question"
      );
    }
  };

  const clearFilters = () => {
    setFilters({
      topic_id: "",
      subtopic_id: "",
      difficulty: "",
      source_type: "",
      company_year: "",
      is_active: "true",
    });

    setSubtopics([]);
    setSearch("");
  };

  const handleFilterTopic = async (value) => {
    setFilters((prev) => ({
      ...prev,
      topic_id: value,
      subtopic_id: "",
    }));

    if (value) {
      await loadSubtopics(value);
    } else {
      setSubtopics([]);
    }
  };

  const formatSource = (value) => {
    if (!value) return "-";

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2
            size={32}
            className="animate-spin"
          />
          <p className="text-sm">
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Questions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, edit and manage practice
            questions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadQuestions}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Add Question
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && !showModal && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm">
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
          <Check
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p className="text-sm">
            {success}
          </p>
        </div>
      )}

      {/* Search + Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={18}
            className="text-slate-600"
          />

          <h2 className="font-semibold text-slate-900">
            Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search question..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Topic */}
          <select
            value={filters.topic_id}
            onChange={(e) =>
              handleFilterTopic(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
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

          {/* Subtopic */}
          <select
            value={filters.subtopic_id}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                subtopic_id:
                  e.target.value,
              }))
            }
            disabled={!filters.topic_id}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-50 focus:border-slate-400"
          >
            <option value="">
              All Subtopics
            </option>

            {subtopics.map((subtopic) => (
              <option
                key={subtopic.id}
                value={subtopic.id}
              >
                {subtopic.name}
              </option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                difficulty:
                  e.target.value,
              }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
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

          {/* Source */}
          <select
            value={filters.source_type}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                source_type:
                  e.target.value,
              }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option value="">
              All Sources
            </option>
            <option value="practice">
              Practice
            </option>
            <option value="company">
              Company
            </option>
            <option value="interview">
              Interview
            </option>
            <option value="previous_year">
              Previous Year
            </option>
          </select>

          {/* Company Year */}
          <input
            type="number"
            placeholder="Company year"
            value={filters.company_year}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                company_year:
                  e.target.value,
              }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          />

          {/* Status */}
          <select
            value={filters.is_active}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                is_active:
                  e.target.value,
              }))
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          >
            <option value="true">
              Active
            </option>
            <option value="false">
              Inactive
            </option>
            <option value="">
              All Status
            </option>
          </select>

          <button
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Clear Filters
          </button>

          <button
            onClick={loadQuestions}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Question Bank
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredQuestions.length}{" "}
              question
              {filteredQuestions.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">
                  ID
                </th>
                <th className="px-5 py-3">
                  Question
                </th>
                <th className="px-5 py-3">
                  Topic
                </th>
                <th className="px-5 py-3">
                  Difficulty
                </th>
                <th className="px-5 py-3">
                  Source
                </th>
                <th className="px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedQuestions.map(
                (question) => (
                  <tr
                    key={question.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                      #{question.id}
                    </td>

                    <td className="max-w-[360px] px-5 py-4">
                      <p className="line-clamp-2 text-sm font-medium text-slate-900">
                        {question.question_text}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {Array.isArray(
                          question.options
                        )
                          ? question.options
                              .length
                          : 0}{" "}
                        options
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700">
                        {getTopicName(
                          question.topic_id
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {getSubtopicName(
                          question.subtopic_id
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {difficultyLabel[
                          question.difficulty
                        ] ||
                          `Level ${question.difficulty}`}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {formatSource(
                          question.source_type
                        )}
                      </span>

                      {question.company_year && (
                        <p className="mt-1 text-xs text-slate-400">
                          {question.company_year}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {question.is_active ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            openEditModal(
                              question
                            )
                          }
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>

                        {question.is_active && (
                          <button
                            onClick={() =>
                              handleDelete(
                                question
                              )
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-600 transition hover:bg-red-50"
                            title="Deactivate"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-slate-100 md:hidden">
          {paginatedQuestions.map(
            (question) => (
              <div
                key={question.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">
                      #{question.id}
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-slate-900">
                      {question.question_text}
                    </h3>
                  </div>

                  {question.is_active ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      Active
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">
                      Topic
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {getTopicName(
                        question.topic_id
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Difficulty
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {difficultyLabel[
                        question.difficulty
                      ] ||
                        `Level ${question.difficulty}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Source
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {formatSource(
                        question.source_type
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">
                      Options
                    </p>
                    <p className="mt-1 font-medium text-slate-700">
                      {Array.isArray(
                        question.options
                      )
                        ? question.options
                            .length
                        : 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      openEditModal(
                        question
                      )
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    <Edit3 size={15} />
                    Edit
                  </button>

                  {question.is_active && (
                    <button
                      onClick={() =>
                        handleDelete(
                          question
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600"
                    >
                      <Trash2 size={15} />
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {paginatedQuestions.length ===
          0 && (
          <div className="px-5 py-14 text-center">
            <Search
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No questions found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your filters or
              create a new question.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredQuestions.length >
          pageSize && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4">
            <p className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((prev) =>
                    Math.max(1, prev - 1)
                  )
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={
                  page === totalPages
                }
                onClick={() =>
                  setPage((prev) =>
                    Math.min(
                      totalPages,
                      prev + 1
                    )
                  )
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-5">
          <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {editingId
                    ? "Edit Question"
                    : "Create Question"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add question details and
                  answer options.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto p-4 sm:p-6"
            >
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-sm">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-5">
                {/* Basic */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Topic *
                    </label>

                    <select
                      required
                      value={form.topic_id}
                      onChange={(e) =>
                        handleTopicChange(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="">
                        Select topic
                      </option>

                      {topics.map(
                        (topic) => (
                          <option
                            key={topic.id}
                            value={topic.id}
                          >
                            {topic.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Subtopic *
                    </label>

                    <select
                      required
                      value={
                        form.subtopic_id
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "subtopic_id",
                          e.target.value
                        )
                      }
                      disabled={
                        !form.topic_id
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none disabled:bg-slate-50 focus:border-slate-400"
                    >
                      <option value="">
                        Select subtopic
                      </option>

                      {subtopics.map(
                        (subtopic) => (
                          <option
                            key={
                              subtopic.id
                            }
                            value={
                              subtopic.id
                            }
                          >
                            {subtopic.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Difficulty *
                    </label>

                    <select
                      value={
                        form.difficulty
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "difficulty",
                          Number(
                            e.target.value
                          )
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value={1}>
                        Easy
                      </option>
                      <option value={2}>
                        Medium
                      </option>
                      <option value={3}>
                        Hard
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Question Type
                    </label>

                    <select
                      value={
                        form.question_type
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "question_type",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="mcq">
                        MCQ
                      </option>
                      <option value="single_choice">
                        Single Choice
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Source Type
                    </label>

                    <select
                      value={
                        form.source_type
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "source_type",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    >
                      <option value="practice">
                        Practice
                      </option>
                      <option value="company">
                        Company
                      </option>
                      <option value="interview">
                        Interview
                      </option>
                      <option value="previous_year">
                        Previous Year
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Company Year
                    </label>

                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      value={
                        form.company_year
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "company_year",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 2025"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Question */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Question *
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={
                      form.question_text
                    }
                    onChange={(e) =>
                      handleFormChange(
                        "question_text",
                        e.target.value
                      )
                    }
                    placeholder="Write the question here..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Answer Options
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Select exactly one correct
                        answer.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {form.options.map(
                      (
                        option,
                        index
                      ) => (
                        <div
                          key={
                            option.option_label
                          }
                          className={`rounded-xl border p-3 transition ${
                            option.is_correct
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                selectCorrectOption(
                                  index
                                )
                              }
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition ${
                                option.is_correct
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                              title="Mark as correct"
                            >
                              {option.is_correct
                                ? "✓"
                                : option.option_label}
                            </button>

                            <input
                              value={
                                option.option_text
                              }
                              onChange={(
                                e
                              ) =>
                                handleOptionChange(
                                  index,
                                  "option_text",
                                  e.target
                                    .value
                                )
                              }
                              placeholder={`Option ${option.option_label}`}
                              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Explanation */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Explanation
                    </label>

                    <textarea
                      rows={4}
                      value={
                        form.explanation
                      }
                      onChange={(e) =>
                        handleFormChange(
                          "explanation",
                          e.target.value
                        )
                      }
                      placeholder="Explain why the answer is correct..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Shortcut
                    </label>

                    <textarea
                      rows={4}
                      value={form.shortcut}
                      onChange={(e) =>
                        handleFormChange(
                          "shortcut",
                          e.target.value
                        )
                      }
                      placeholder="Add a shortcut or quick trick..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Solution */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Solution Steps
                  </label>

                  <textarea
                    rows={5}
                    value={
                      form.solution_steps
                    }
                    onChange={(e) =>
                      handleFormChange(
                        "solution_steps",
                        e.target.value
                      )
                    }
                    placeholder="Write the complete solution steps..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      {editingId
                        ? "Update Question"
                        : "Create Question"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;