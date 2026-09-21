import { useEffect, useRef, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Code2,
  Building2,
  Tag,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";

import {
  getAdminDSAQuestions,
  createAdminDSAQuestion,
  updateAdminDSAQuestion,
  deleteAdminDSAQuestion,
  getAdminTopics,
  getAdminCompanies,
} from "../../services/adminApi";

function AdminDSA() {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [companySearch, setCompanySearch] = useState("");
  const [topicSearch, setTopicSearch] = useState("");

  const [companyDropdownOpen, setCompanyDropdownOpen] =
    useState(false);

  const [topicDropdownOpen, setTopicDropdownOpen] =
    useState(false);

  const companyRef = useRef(null);
  const topicRef = useRef(null);

  const emptyForm = {
    question_text: "",
    company_id: "",
    topic_id: "",
    difficulty: 1,
    problem_link: "",
    explanation: "",
  };

  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        dsaData,
        topicData,
        companyData,
      ] = await Promise.all([
        getAdminDSAQuestions(),
        getAdminTopics(),
        getAdminCompanies(),
      ]);

      setQuestions(
        Array.isArray(dsaData)
          ? dsaData
          : []
      );

      setTopics(
        Array.isArray(topicData)
          ? topicData
          : []
      );

      setCompanies(
        Array.isArray(companyData)
          ? companyData
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load DSA data:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to load DSA data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        companyRef.current &&
        !companyRef.current.contains(event.target)
      ) {
        setCompanyDropdownOpen(false);
      }

      if (
        topicRef.current &&
        !topicRef.current.contains(event.target)
      ) {
        setTopicDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
    });

    setCompanySearch("");
    setTopicSearch("");

    setCompanyDropdownOpen(false);
    setTopicDropdownOpen(false);

    setModalOpen(true);
  };

  const openEditModal = (question) => {
    setEditingId(question.id);

    setForm({
      question_text:
        question.title || "",

      company_id:
        question.company_id || "",

      topic_id:
        question.topic_id || "",

      difficulty:
        Number(question.difficulty) || 1,

      problem_link:
        question.link || "",

      explanation:
        question.explanation || "",
    });

    setCompanySearch(
      question.company || ""
    );

    setTopicSearch(
      question.topic || ""
    );

    setCompanyDropdownOpen(false);
    setTopicDropdownOpen(false);

    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setCompanySearch("");
    setTopicSearch("");

    setCompanyDropdownOpen(false);
    setTopicDropdownOpen(false);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // COMPANY SEARCH
  const filteredCompanies = companies.filter(
    (company) => {
      if (!company.is_active) {
        return false;
      }

      const searchValue =
        companySearch
          .trim()
          .toLowerCase();

      if (!searchValue) {
        return true;
      }

      return company.name
        ?.toLowerCase()
        .includes(searchValue);
    }
  );

  // TOPIC SEARCH
  const filteredTopics = topics.filter(
    (topic) => {
      if (!topic.is_active) {
        return false;
      }

      const searchValue =
        topicSearch
          .trim()
          .toLowerCase();

      if (!searchValue) {
        return true;
      }

      return topic.name
        ?.toLowerCase()
        .includes(searchValue);
    }
  );

  const handleCompanyInput = (event) => {
    const value = event.target.value;

    setCompanySearch(value);

    // Reset selected company if user changes text
    setForm((current) => ({
      ...current,
      company_id: "",
    }));

    setCompanyDropdownOpen(true);
  };

  const selectCompany = (company) => {
    setCompanySearch(
      company.name
    );

    setForm((current) => ({
      ...current,
      company_id: String(company.id),
    }));

    setCompanyDropdownOpen(false);
  };

  const handleTopicInput = (event) => {
    const value = event.target.value;

    setTopicSearch(value);

    // Reset selected topic if user changes text
    setForm((current) => ({
      ...current,
      topic_id: "",
    }));

    setTopicDropdownOpen(true);
  };

  const selectTopic = (topic) => {
    setTopicSearch(
      topic.name
    );

    setForm((current) => ({
      ...current,
      topic_id: String(topic.id),
    }));

    setTopicDropdownOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.question_text.trim()) {
      alert(
        "Problem title is required"
      );
      return;
    }

    if (!form.company_id) {
      alert(
        "Please select a valid company from the dropdown"
      );
      return;
    }

    if (!form.topic_id) {
      alert(
        "Please select a valid topic from the dropdown"
      );
      return;
    }

    if (!form.problem_link.trim()) {
      alert(
        "Problem link is required"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        question_text:
          form.question_text.trim(),

        company_id:
          Number(form.company_id),

        topic_id:
          Number(form.topic_id),

        difficulty:
          Number(form.difficulty),

        problem_link:
          form.problem_link.trim(),

        explanation:
          form.explanation.trim(),
      };

      if (editingId) {
        await updateAdminDSAQuestion(
          editingId,
          payload
        );
      } else {
        await createAdminDSAQuestion(
          payload
        );
      }

      closeModal();

      await loadData();
    } catch (error) {
      console.error(
        "Failed to save DSA question:",
        error
      );

      const detail =
        error.response?.data?.detail;

      if (Array.isArray(detail)) {
        alert(
          detail
            .map(
              (item) =>
                item.msg
            )
            .join(", ")
        );
      } else {
        alert(
          detail ||
            "Failed to save DSA question"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    questionId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to deactivate this DSA question?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminDSAQuestion(
        questionId
      );

      await loadData();
    } catch (error) {
      console.error(
        "Failed to delete DSA question:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete DSA question"
      );
    }
  };

  const filteredQuestions =
    questions.filter(
      (question) => {
        const value =
          search
            .trim()
            .toLowerCase();

        if (!value) {
          return true;
        }

        return (
          question.title
            ?.toLowerCase()
            .includes(value) ||
          question.company
            ?.toLowerCase()
            .includes(value) ||
          question.topic
            ?.toLowerCase()
            .includes(value)
        );
      }
    );

  const getDifficultyLabel = (
    value
  ) => {
    const difficulty =
      Number(value);

    if (difficulty === 1)
      return "Easy";

    if (difficulty === 2)
      return "Medium";

    if (difficulty === 3)
      return "Hard";

    return String(
      value || "-"
    );
  };

  const getDifficultyClass = (
    value
  ) => {
    const difficulty =
      Number(value);

    if (difficulty === 1) {
      return "bg-emerald-100 text-emerald-700";
    }

    if (difficulty === 2) {
      return "bg-amber-100 text-amber-700";
    }

    if (difficulty === 3) {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Code2
                size={25}
                className="text-blue-600"
              />

              <h1 className="text-2xl font-bold text-slate-900">
                DSA Questions
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Manage premium DSA problems.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={18} />

            Add DSA Question
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search DSA questions..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={30}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm text-slate-500">
                Loading DSA questions...
              </p>
            </div>
          </div>
        )}

        {/* DESKTOP */}
        {!loading && (
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
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

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredQuestions.map(
                    (question) => (
                      <tr
                        key={
                          question.id
                        }
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="max-w-xs truncate font-semibold text-slate-900">
                            {
                              question.title
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <Building2
                              size={15}
                            />

                            {
                              question.company
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <Tag
                              size={15}
                            />

                            {
                              question.topic
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyClass(
                              question.difficulty
                            )}`}
                          >
                            {getDifficultyLabel(
                              question.difficulty
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              question.is_active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {question.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {question.link && (
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    question.link,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                }
                                className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                              >
                                <ExternalLink
                                  size={17}
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  question
                                )
                              }
                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            {question.is_active && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    question.id
                                  )
                                }
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {filteredQuestions.length ===
                0 && (
                <div className="p-10 text-center text-sm text-slate-500">
                  No DSA questions found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MOBILE */}
        {!loading && (
          <div className="space-y-3 lg:hidden">
            {filteredQuestions.map(
              (question) => (
                <div
                  key={
                    question.id
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-900">
                      {
                        question.title
                      }
                    </h3>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${getDifficultyClass(
                        question.difficulty
                      )}`}
                    >
                      {getDifficultyLabel(
                        question.difficulty
                      )}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Building2
                        size={15}
                      />
                      {
                        question.company
                      }
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag
                        size={15}
                      />
                      {
                        question.topic
                      }
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          question
                        )
                      }
                      className="flex-1 rounded-lg bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      Edit
                    </button>

                    {question.link && (
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            question.link,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="rounded-lg bg-slate-100 px-3 text-slate-600"
                      >
                        <ExternalLink
                          size={17}
                        />
                      </button>
                    )}

                    {question.is_active && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            question.id
                          )
                        }
                        className="rounded-lg bg-red-50 px-3 text-red-600"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    )}
                  </div>
                </div>
              )
            )}

            {filteredQuestions.length ===
              0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                No DSA questions found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId
                    ? "Edit DSA Question"
                    : "Add DSA Question"}
                </h2>

                <p className="text-xs text-slate-500">
                  Add a premium DSA problem
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5 p-5"
            >
              {/* PROBLEM TITLE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Problem Title
                </label>

                <input
                  type="text"
                  name="question_text"
                  value={
                    form.question_text
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="off"
                  placeholder="e.g. Two Sum"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* COMPANY */}
              <div
                ref={companyRef}
                className="relative"
              >
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Company
                </label>

                <div className="relative">
                  <Building2
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      companySearch
                    }
                    onChange={
                      handleCompanyInput
                    }
                    onFocus={() =>
                      setCompanyDropdownOpen(
                        true
                      )
                    }
                    autoComplete="off"
                    placeholder="Type company name..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {companyDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-[120] mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {filteredCompanies.length >
                    0 ? (
                      filteredCompanies.map(
                        (company) => (
                          <button
                            key={
                              company.id
                            }
                            type="button"
                            onMouseDown={(
                              event
                            ) =>
                              event.preventDefault()
                            }
                            onClick={() =>
                              selectCompany(
                                company
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Building2
                              size={16}
                            />

                            <span>
                              {
                                company.name
                              }
                            </span>
                          </button>
                        )
                      )
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-slate-500">
                        No company found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TOPIC */}
              <div
                ref={topicRef}
                className="relative"
              >
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Topic
                </label>

                <div className="relative">
                  <Tag
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={
                      topicSearch
                    }
                    onChange={
                      handleTopicInput
                    }
                    onFocus={() =>
                      setTopicDropdownOpen(
                        true
                      )
                    }
                    autoComplete="off"
                    placeholder="Type topic name..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {topicDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-[120] mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {filteredTopics.length >
                    0 ? (
                      filteredTopics.map(
                        (topic) => (
                          <button
                            key={
                              topic.id
                            }
                            type="button"
                            onMouseDown={(
                              event
                            ) =>
                              event.preventDefault()
                            }
                            onClick={() =>
                              selectTopic(
                                topic
                              )
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Tag
                              size={16}
                            />

                            <span>
                              {
                                topic.name
                              }
                            </span>
                          </button>
                        )
                      )
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-slate-500">
                        No topic found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* DIFFICULTY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Difficulty
                </label>

                <select
                  name="difficulty"
                  value={
                    form.difficulty
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
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
              </div>

              {/* LINK */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Problem Link
                </label>

                <input
                  type="url"
                  name="problem_link"
                  value={
                    form.problem_link
                  }
                  onChange={
                    handleChange
                  }
                  autoComplete="off"
                  placeholder="https://leetcode.com/problems/two-sum/"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* EXPLANATION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Explanation
                  <span className="ml-1 font-normal text-slate-400">
                    Optional
                  </span>
                </label>

                <textarea
                  name="explanation"
                  value={
                    form.explanation
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Add explanation or notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingId
                    ? "Update Question"
                    : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDSA;