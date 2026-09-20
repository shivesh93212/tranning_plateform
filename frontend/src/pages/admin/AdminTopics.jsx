import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Edit3,
  FolderTree,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminSubtopic,
  createAdminTopic,
  deleteAdminSubtopic,
  deleteAdminTopic,
  getAdminSubtopics,
  getAdminTopics,
  updateAdminSubtopic,
  updateAdminTopic,
} from "../../services/adminApi";

function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState(null);

  const [loading, setLoading] = useState(true);
  const [subtopicLoading, setSubtopicLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showSubtopicModal, setShowSubtopicModal] = useState(false);

  const [editingTopic, setEditingTopic] = useState(null);
  const [editingSubtopic, setEditingSubtopic] = useState(null);

  const [topicForm, setTopicForm] = useState({
    name: "",
    description: "",
  });

  const [subtopicForm, setSubtopicForm] = useState({
    name: "",
    description: "",
  });

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

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

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminTopics();

      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load topics:", err);
      setError(getErrorMessage(err, "Failed to load topics"));
    } finally {
      setLoading(false);
    }
  };

  const loadSubtopics = async (topicId) => {
    if (!topicId) {
      setSubtopics([]);
      return;
    }

    try {
      setSubtopicLoading(true);
      setError("");

      const data = await getAdminSubtopics(topicId);

      setSubtopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load subtopics:", err);
      setError(
        getErrorMessage(err, "Failed to load subtopics")
      );
      setSubtopics([]);
    } finally {
      setSubtopicLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic?.id) {
      loadSubtopics(selectedTopic.id);
    } else {
      setSubtopics([]);
    }
  }, [selectedTopic]);

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return topics;
    }

    return topics.filter((topic) => {
      return (
        topic.name?.toLowerCase().includes(query) ||
        topic.description?.toLowerCase().includes(query)
      );
    });
  }, [topics, search]);

  const activeTopics = topics.filter(
    (topic) => topic.is_active
  ).length;

  const activeSubtopics = subtopics.filter(
    (subtopic) => subtopic.is_active
  ).length;

  const openCreateTopic = () => {
    clearMessages();

    setEditingTopic(null);

    setTopicForm({
      name: "",
      description: "",
    });

    setShowTopicModal(true);
  };

  const openEditTopic = (topic) => {
    clearMessages();

    setEditingTopic(topic);

    setTopicForm({
      name: topic.name || "",
      description: topic.description || "",
    });

    setShowTopicModal(true);
  };

  const closeTopicModal = () => {
    if (saving) return;

    setShowTopicModal(false);
    setEditingTopic(null);

    setTopicForm({
      name: "",
      description: "",
    });
  };

  const handleTopicSubmit = async (event) => {
    event.preventDefault();

    const name = topicForm.name.trim();
    const description = topicForm.description.trim();

    if (!name) {
      setError("Topic name is required.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      if (editingTopic) {
        await updateAdminTopic(editingTopic.id, {
          name,
          description: description || null,
        });

        setSuccess("Topic updated successfully.");
      } else {
        await createAdminTopic({
          name,
          description: description || null,
        });

        setSuccess("Topic created successfully.");
      }

      closeTopicModal();

      await loadTopics();
    } catch (err) {
      console.error("Failed to save topic:", err);

      setError(
        getErrorMessage(err, "Failed to save topic")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topic) => {
    const action = topic.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${topic.name}"?`
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await deleteAdminTopic(topic.id);

      setSuccess(
        topic.is_active
          ? "Topic deactivated successfully."
          : "Topic activated successfully."
      );

      if (selectedTopic?.id === topic.id) {
        setSelectedTopic(null);
        setSubtopics([]);
      }

      await loadTopics();
    } catch (err) {
      console.error("Failed to update topic status:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to update topic status"
        )
      );
    }
  };

  const openCreateSubtopic = () => {
    if (!selectedTopic) {
      setError("Please select a topic first.");
      return;
    }

    clearMessages();

    setEditingSubtopic(null);

    setSubtopicForm({
      name: "",
      description: "",
    });

    setShowSubtopicModal(true);
  };

  const openEditSubtopic = (subtopic) => {
    clearMessages();

    setEditingSubtopic(subtopic);

    setSubtopicForm({
      name: subtopic.name || "",
      description: subtopic.description || "",
    });

    setShowSubtopicModal(true);
  };

  const closeSubtopicModal = () => {
    if (saving) return;

    setShowSubtopicModal(false);
    setEditingSubtopic(null);

    setSubtopicForm({
      name: "",
      description: "",
    });
  };

  const handleSubtopicSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTopic) {
      setError("Please select a topic first.");
      return;
    }

    const name = subtopicForm.name.trim();
    const description = subtopicForm.description.trim();

    if (!name) {
      setError("Subtopic name is required.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      if (editingSubtopic) {
        await updateAdminSubtopic(editingSubtopic.id, {
          name,
          description: description || null,
        });

        setSuccess(
          "Subtopic updated successfully."
        );
      } else {
        await createAdminSubtopic({
          topic_id: selectedTopic.id,
          name,
          description: description || null,
        });

        setSuccess(
          "Subtopic created successfully."
        );
      }

      closeSubtopicModal();

      await loadSubtopics(selectedTopic.id);
    } catch (err) {
      console.error(
        "Failed to save subtopic:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to save subtopic"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubtopic = async (subtopic) => {
    const action = subtopic.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${subtopic.name}"?`
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await deleteAdminSubtopic(subtopic.id);

      setSuccess(
        subtopic.is_active
          ? "Subtopic deactivated successfully."
          : "Subtopic activated successfully."
      );

      await loadSubtopics(selectedTopic.id);
    } catch (err) {
      console.error(
        "Failed to update subtopic status:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update subtopic status"
        )
      );
    }
  };

  const handleRefresh = async () => {
    clearMessages();

    await loadTopics();

    if (selectedTopic?.id) {
      await loadSubtopics(selectedTopic.id);
    }
  };

  return (
    <div className="min-h-full bg-slate-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                <FolderTree size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Topics & Subtopics
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Manage practice topics and their
                  subtopics.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={openCreateTopic}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              Add Topic
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">{error}</div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-300 transition hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <Check size={19} />

            <div className="flex-1">{success}</div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-emerald-300 transition hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Total Topics
            </p>

            <p className="mt-1 text-2xl font-bold">
              {topics.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Active Topics
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {activeTopics}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:col-span-1">
            <p className="text-sm text-slate-400">
              Active Subtopics
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-400">
              {activeSubtopics}
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Topics */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="border-b border-slate-800 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    Topics
                  </h2>

                  <p className="text-xs text-slate-500">
                    Select a topic to manage subtopics.
                  </p>
                </div>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {filteredTopics.length}
                </span>
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search topics..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="max-h-[650px] overflow-y-auto p-3">
              {loading ? (
                <div className="flex min-h-60 items-center justify-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-indigo-400"
                  />
                </div>
              ) : filteredTopics.length === 0 ? (
                <div className="flex min-h-60 flex-col items-center justify-center text-center">
                  <FolderTree
                    size={40}
                    className="mb-3 text-slate-700"
                  />

                  <p className="font-medium text-slate-300">
                    No topics found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a topic to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTopics.map((topic) => {
                    const isSelected =
                      selectedTopic?.id === topic.id;

                    return (
                      <div
                        key={topic.id}
                        className={`rounded-xl border p-3 transition ${
                          isSelected
                            ? "border-indigo-500/50 bg-indigo-500/10"
                            : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTopic(topic)
                            }
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <h3 className="truncate font-semibold text-slate-100">
                                {topic.name}
                              </h3>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  topic.is_active
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-slate-800 text-slate-500"
                                }`}
                              >
                                {topic.is_active
                                  ? "ACTIVE"
                                  : "INACTIVE"}
                              </span>
                            </div>

                            {topic.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                {topic.description}
                              </p>
                            )}
                          </button>

                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openEditTopic(topic)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                              title="Edit topic"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteTopic(topic)
                              }
                              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                topic.is_active
                                  ? "text-red-400 hover:bg-red-500/10"
                                  : "text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                              title={
                                topic.is_active
                                  ? "Deactivate topic"
                                  : "Activate topic"
                              }
                            >
                              {topic.is_active ? (
                                <Trash2 size={16} />
                              ) : (
                                <Check size={17} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Subtopics */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
            <div className="border-b border-slate-800 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-semibold">
                    Subtopics
                  </h2>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {selectedTopic
                      ? `Topic: ${selectedTopic.name}`
                      : "Select a topic first"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateSubtopic}
                  disabled={!selectedTopic}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={17} />
                  Add Subtopic
                </button>
              </div>
            </div>

            <div className="p-4">
              {!selectedTopic ? (
                <div className="flex min-h-80 flex-col items-center justify-center text-center">
                  <FolderTree
                    size={48}
                    className="mb-4 text-slate-700"
                  />

                  <h3 className="font-semibold text-slate-300">
                    Select a topic
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Choose a topic from the left to view
                    and manage its subtopics.
                  </p>
                </div>
              ) : subtopicLoading ? (
                <div className="flex min-h-80 items-center justify-center">
                  <Loader2
                    size={28}
                    className="animate-spin text-indigo-400"
                  />
                </div>
              ) : subtopics.length === 0 ? (
                <div className="flex min-h-80 flex-col items-center justify-center text-center">
                  <FolderTree
                    size={42}
                    className="mb-3 text-slate-700"
                  />

                  <p className="font-medium text-slate-300">
                    No subtopics found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Add the first subtopic for this
                    topic.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subtopics.map((subtopic) => (
                    <div
                      key={subtopic.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                          <FolderTree size={17} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-100">
                              {subtopic.name}
                            </h3>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                subtopic.is_active
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {subtopic.is_active
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>
                          </div>

                          {subtopic.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {subtopic.description}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditSubtopic(subtopic)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            title="Edit subtopic"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteSubtopic(
                                subtopic
                              )
                            }
                            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                              subtopic.is_active
                                ? "text-red-400 hover:bg-red-500/10"
                                : "text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                            title={
                              subtopic.is_active
                                ? "Deactivate subtopic"
                                : "Activate subtopic"
                            }
                          >
                            {subtopic.is_active ? (
                              <Trash2 size={16} />
                            ) : (
                              <Check size={17} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {editingTopic
                    ? "Edit Topic"
                    : "Create Topic"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingTopic
                    ? "Update topic information."
                    : "Create a new practice topic."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTopicModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleTopicSubmit}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Topic Name
                </label>

                <input
                  type="text"
                  value={topicForm.name}
                  onChange={(event) =>
                    setTopicForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Quantitative Aptitude"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={topicForm.description}
                  onChange={(event) =>
                    setTopicForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Short description..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeTopicModal}
                  disabled={saving}
                  className="min-h-11 rounded-xl border border-slate-700 px-5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingTopic
                    ? "Update Topic"
                    : "Create Topic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtopic Modal */}
      {showSubtopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {editingSubtopic
                    ? "Edit Subtopic"
                    : "Create Subtopic"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Topic: {selectedTopic?.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSubtopicModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubtopicSubmit}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Subtopic Name
                </label>

                <input
                  type="text"
                  value={subtopicForm.name}
                  onChange={(event) =>
                    setSubtopicForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Percentage"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={subtopicForm.description}
                  onChange={(event) =>
                    setSubtopicForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Short description..."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeSubtopicModal}
                  disabled={saving}
                  className="min-h-11 rounded-xl border border-slate-700 px-5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {editingSubtopic
                    ? "Update Subtopic"
                    : "Create Subtopic"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTopics;