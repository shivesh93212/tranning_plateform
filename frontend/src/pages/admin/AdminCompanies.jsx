import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createAdminCompany,
  deleteAdminCompany,
  getAdminCompanies,
  updateAdminCompany,
} from "../../services/adminApi";

function AdminCompanies() {
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const [form, setForm] = useState({
    name: "",
    year: "",
    source_type: "",
  });

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

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminCompanies();

      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load companies:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to load companies"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return companies;
    }

    return companies.filter((company) => {
      return (
        company.name?.toLowerCase().includes(query) ||
        String(company.year || "")
          .toLowerCase()
          .includes(query) ||
        company.source_type
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [companies, search]);

  const activeCompanies = companies.filter(
    (company) => company.is_active
  ).length;

  const openCreateModal = () => {
    clearMessages();

    setEditingCompany(null);

    setForm({
      name: "",
      year: "",
      source_type: "",
    });

    setShowModal(true);
  };

  const openEditModal = (company) => {
    clearMessages();

    setEditingCompany(company);

    setForm({
      name: company.name || "",
      year: company.year
        ? String(company.year)
        : "",
      source_type: company.source_type || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCompany(null);

    setForm({
      name: "",
      year: "",
      source_type: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const sourceType = form.source_type.trim();

    if (!name) {
      setError("Company name is required.");
      return;
    }

    if (!form.year) {
      setError("Company year is required.");
      return;
    }

    const year = Number(form.year);

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      setError("Please enter a valid year.");
      return;
    }

    if (!sourceType) {
      setError("Source type is required.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        name,
        year,
        source_type: sourceType,
      };

      if (editingCompany) {
        await updateAdminCompany(
          editingCompany.id,
          payload
        );

        setSuccess(
          "Company updated successfully."
        );
      } else {
        await createAdminCompany(payload);

        setSuccess(
          "Company created successfully."
        );
      }

      closeModal();

      await loadCompanies();
    } catch (err) {
      console.error(
        "Failed to save company:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to save company"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (company) => {
    const action = company.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${company.name}"?`
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await deleteAdminCompany(company.id);

      setSuccess(
        company.is_active
          ? "Company deactivated successfully."
          : "Company activated successfully."
      );

      await loadCompanies();
    } catch (err) {
      console.error(
        "Failed to update company status:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update company status"
        )
      );
    }
  };

  return (
    <div className="min-h-full bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <Building2 size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Companies
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage company-wise practice questions.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadCompanies}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              Add Company
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

            <p className="flex-1">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <Check size={19} />

            <p className="flex-1">{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="text-emerald-300 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Total Companies
            </p>

            <p className="mt-1 text-2xl font-bold">
              {companies.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Active Companies
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {activeCompanies}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:col-span-1">
            <p className="text-sm text-slate-400">
              Search Results
            </p>

            <p className="mt-1 text-2xl font-bold text-indigo-400">
              {filteredCompanies.length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="relative max-w-xl">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search company, year or source type..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Companies */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-indigo-400"
              />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
              <Building2
                size={46}
                className="mb-4 text-slate-700"
              />

              <h3 className="font-semibold text-slate-300">
                No companies found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add a company to start managing
                company-wise questions.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">
                        Company
                      </th>

                      <th className="px-5 py-4">
                        Year
                      </th>

                      <th className="px-5 py-4">
                        Source Type
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCompanies.map(
                      (company) => (
                        <tr
                          key={company.id}
                          className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/30"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                                <Building2
                                  size={17}
                                />
                              </div>

                              <div>
                                <p className="font-medium text-slate-100">
                                  {company.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  ID: {company.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {company.year || "-"}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                              {company.source_type ||
                                "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                company.is_active
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {company.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    company
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                title="Edit company"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    company
                                  )
                                }
                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                                  company.is_active
                                    ? "text-red-400 hover:bg-red-500/10"
                                    : "text-emerald-400 hover:bg-emerald-500/10"
                                }`}
                                title={
                                  company.is_active
                                    ? "Deactivate"
                                    : "Activate"
                                }
                              >
                                {company.is_active ? (
                                  <Trash2
                                    size={16}
                                  />
                                ) : (
                                  <Check
                                    size={17}
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-3 md:hidden">
                {filteredCompanies.map(
                  (company) => (
                    <div
                      key={company.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                          <Building2 size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-100">
                              {company.name}
                            </h3>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                company.is_active
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-slate-800 text-slate-500"
                              }`}
                            >
                              {company.is_active
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[11px] uppercase text-slate-600">
                                Year
                              </p>

                              <p className="mt-1 text-sm text-slate-300">
                                {company.year ||
                                  "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase text-slate-600">
                                Source
                              </p>

                              <p className="mt-1 truncate text-sm text-slate-300">
                                {company.source_type ||
                                  "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2 border-t border-slate-800 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(company)
                          }
                          className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 text-sm text-slate-300 transition hover:bg-slate-800"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(company)
                          }
                          className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm transition ${
                            company.is_active
                              ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                              : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          {company.is_active ? (
                            <Trash2 size={16} />
                          ) : (
                            <Check size={16} />
                          )}

                          {company.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  {editingCompany
                    ? "Edit Company"
                    : "Add Company"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage company information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Company Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. TCS"
                  autoFocus
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Year
                </label>

                <input
                  type="number"
                  value={form.year}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      year: event.target.value,
                    }))
                  }
                  placeholder="e.g. 2026"
                  min="2000"
                  max="2100"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Source Type
                </label>

                <select
                  value={form.source_type}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      source_type: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="">
                    Select source type
                  </option>

                  <option value="company">
                    Company
                  </option>

                  <option value="placement">
                    Placement
                  </option>

                  <option value="interview">
                    Interview
                  </option>

                  <option value="exam">
                    Exam
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
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

                  {editingCompany
                    ? "Update Company"
                    : "Create Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCompanies;