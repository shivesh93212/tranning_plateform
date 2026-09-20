import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import { getAdminPayments } from "../../services/adminApi";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminPayments();

      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load payments:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to load payments"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const getStatus = (payment) => {
    return (
      payment.status ||
      payment.payment_status ||
      payment.state ||
      "unknown"
    ).toString().toLowerCase();
  };

  const getUserName = (payment) => {
    return (
      payment.user?.name ||
      payment.user_name ||
      payment.name ||
      `User #${payment.user_id ?? "-"}`
    );
  };

  const getUserEmail = (payment) => {
    return (
      payment.user?.email ||
      payment.user_email ||
      payment.email ||
      "-"
    );
  };

  const getAmount = (payment) => {
    const value =
      payment.amount ??
      payment.total_amount ??
      payment.paid_amount ??
      0;

    const numericValue = Number(value);

    return Number.isNaN(numericValue)
      ? value
      : numericValue;
  };

  const getPlan = (payment) => {
    return (
      payment.plan_name ||
      payment.plan ||
      payment.subscription_plan ||
      payment.plan_type ||
      "Premium"
    );
  };

  const getPaymentId = (payment) => {
    return (
      payment.razorpay_payment_id ||
      payment.payment_id ||
      payment.transaction_id ||
      payment.id ||
      "-"
    );
  };

  const getOrderId = (payment) => {
    return (
      payment.razorpay_order_id ||
      payment.order_id ||
      "-"
    );
  };

  const getPaymentDate = (payment) => {
    return (
      payment.created_at ||
      payment.payment_date ||
      payment.paid_at ||
      payment.updated_at
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return amount;
    }

    return `₹${numericAmount.toLocaleString("en-IN")}`;
  };

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const status = getStatus(payment);

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const userName =
        getUserName(payment).toLowerCase();

      const userEmail =
        getUserEmail(payment).toLowerCase();

      const plan =
        getPlan(payment).toLowerCase();

      const paymentId =
        String(getPaymentId(payment)).toLowerCase();

      const orderId =
        String(getOrderId(payment)).toLowerCase();

      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        plan.includes(query) ||
        paymentId.includes(query) ||
        orderId.includes(query) ||
        String(payment.user_id || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [payments, search, statusFilter]);

  const successfulCount = payments.filter(
    (payment) => {
      const status = getStatus(payment);

      return (
        status === "success" ||
        status === "successful" ||
        status === "paid" ||
        status === "completed"
      );
    }
  ).length;

  const failedCount = payments.filter(
    (payment) => {
      const status = getStatus(payment);

      return (
        status === "failed" ||
        status === "failure"
      );
    }
  ).length;

  const totalRevenue = payments
    .filter((payment) => {
      const status = getStatus(payment);

      return (
        status === "success" ||
        status === "successful" ||
        status === "paid" ||
        status === "completed"
      );
    })
    .reduce((total, payment) => {
      const amount = Number(getAmount(payment));

      return Number.isNaN(amount)
        ? total
        : total + amount;
    }, 0);

  const renderStatus = (status) => {
    if (
      status === "success" ||
      status === "successful" ||
      status === "paid" ||
      status === "completed"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          <CheckCircle2 size={13} />
          Successful
        </span>
      );
    }

    if (
      status === "failed" ||
      status === "failure"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
          <XCircle size={13} />
          Failed
        </span>
      );
    }

    if (
      status === "pending" ||
      status === "processing"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
          <Loader2 size={13} />
          Pending
        </span>
      );
    }

    return (
      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-400">
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="min-h-full bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <CreditCard size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Payments
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Monitor subscription payments and
                transactions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* Error */}
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Total Payments
            </p>

            <p className="mt-1 text-2xl font-bold">
              {payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Successful
            </p>

            <p className="mt-1 text-2xl font-bold text-emerald-400">
              {successfulCount}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/10 bg-slate-900/70 p-4">
            <p className="text-sm text-slate-400">
              Failed
            </p>

            <p className="mt-1 text-2xl font-bold text-red-400">
              {failedCount}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-indigo-500/10 bg-slate-900/70 p-4 lg:col-span-1">
            <p className="text-sm text-slate-400">
              Revenue
            </p>

            <p className="mt-1 flex items-center gap-1 text-2xl font-bold text-indigo-400">
              <IndianRupee size={20} />
              {totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
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
                placeholder="Search user, email, payment ID or order ID..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 lg:w-48"
            >
              <option value="all">
                All Status
              </option>

              <option value="success">
                Successful
              </option>

              <option value="failed">
                Failed
              </option>

              <option value="pending">
                Pending
              </option>
            </select>
          </div>
        </div>

        {/* Payments */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-indigo-400"
              />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-4 text-center">
              <CreditCard
                size={46}
                className="mb-4 text-slate-700"
              />

              <h3 className="font-semibold text-slate-300">
                No payments found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No payment records match the current
                filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-4">
                        User
                      </th>

                      <th className="px-5 py-4">
                        Plan
                      </th>

                      <th className="px-5 py-4">
                        Amount
                      </th>

                      <th className="px-5 py-4">
                        Payment ID
                      </th>

                      <th className="px-5 py-4">
                        Date
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.map(
                      (payment) => (
                        <tr
                          key={
                            payment.id ??
                            getPaymentId(payment)
                          }
                          className="border-b border-slate-800/70 last:border-0 hover:bg-slate-800/30"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                                <CreditCard
                                  size={17}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium text-slate-100">
                                  {getUserName(
                                    payment
                                  )}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {getUserEmail(
                                    payment
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                              {getPlan(payment)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-200">
                            {formatAmount(
                              getAmount(payment)
                            )}
                          </td>

                          <td className="max-w-[220px] px-5 py-4">
                            <p
                              className="truncate font-mono text-xs text-slate-400"
                              title={String(
                                getPaymentId(payment)
                              )}
                            >
                              {getPaymentId(payment)}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {formatDate(
                              getPaymentDate(payment)
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {renderStatus(
                              getStatus(payment)
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-3 md:hidden">
                {filteredPayments.map(
                  (payment) => (
                    <div
                      key={
                        payment.id ??
                        getPaymentId(payment)
                      }
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                          <CreditCard size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold text-slate-100">
                              {getUserName(payment)}
                            </h3>

                            {renderStatus(
                              getStatus(payment)
                            )}
                          </div>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {getUserEmail(payment)}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[11px] uppercase text-slate-600">
                                Plan
                              </p>

                              <p className="mt-1 text-sm font-medium text-indigo-300">
                                {getPlan(payment)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase text-slate-600">
                                Amount
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-200">
                                {formatAmount(
                                  getAmount(payment)
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase text-slate-600">
                                Date
                              </p>

                              <p className="mt-1 text-sm text-slate-300">
                                {formatDate(
                                  getPaymentDate(
                                    payment
                                  )
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase text-slate-600">
                                User ID
                              </p>

                              <p className="mt-1 text-sm text-slate-300">
                                {payment.user_id ??
                                  "-"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-slate-800 pt-3">
                            <p className="text-[11px] uppercase text-slate-600">
                              Payment ID
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-slate-400">
                              {getPaymentId(payment)}
                            </p>
                          </div>

                          <div className="mt-3">
                            <p className="text-[11px] uppercase text-slate-600">
                              Order ID
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-slate-500">
                              {getOrderId(payment)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPayments;