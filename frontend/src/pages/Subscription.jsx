import { useEffect, useState } from "react";

import {
  Check,
  CreditCard,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

import {
  createSubscriptionOrder,
  getSubscription,
  getSubscriptionPlans,
  verifySubscriptionPayment,
} from "../services/subscriptionApi";

function Subscription() {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError("");

      const [plansData, subscriptionData] =
        await Promise.all([
          getSubscriptionPlans(),
          getSubscription(),
        ]);

      setPlans(
        Array.isArray(plansData)
          ? plansData
          : []
      );

      setSubscription(subscriptionData);
    } catch (err) {
      console.error(
        "Failed to load subscription:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load subscription details."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (
        document.getElementById(
          "razorpay-checkout-script"
        )
      ) {
        resolve(true);
        return;
      }

      const script = document.createElement(
        "script"
      );

      script.id =
        "razorpay-checkout-script";

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    try {
      setProcessingPlan(plan.plan);
      setError("");
      setSuccess("");

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay checkout."
        );
      }

      const order =
        await createSubscriptionOrder(
          plan.plan
        );

      if (!order?.order_id) {
        throw new Error(
          "Invalid Razorpay order response."
        );
      }

      const options = {
        key: order.razorpay_key_id,

        amount: order.amount,

        currency:
          order.currency || "INR",

        name: "Aptitude Prep",

        description:
          plan.description ||
          "Premium Practice Subscription",

        order_id: order.order_id,

        theme: {
          color: "#2563eb",
        },

        handler: async function (response) {
          try {
            setError("");

            const result =
              await verifySubscriptionPayment(
                {
                  plan: plan.plan,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                }
              );

            setSuccess(
              result?.message ||
                "Payment successful. Your subscription is now active."
            );

            await loadSubscriptionData();
          } catch (err) {
            console.error(
              "Payment verification failed:",
              err
            );

            setError(
              err.response?.data?.detail ||
                "Payment verification failed."
            );
          } finally {
            setProcessingPlan(null);
          }
        },

        modal: {
          ondismiss: function () {
            setProcessingPlan(null);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response
          );

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setProcessingPlan(null);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(
        "Subscription payment error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to start payment."
      );

      setProcessingPlan(null);
    }
  };

  const formatPlanName = (plan) => {
    if (!plan) return "Premium";

    return plan
      .replace("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDaysRemaining = (expiresAt) => {
    if (!expiresAt) return 0;

    const expiry = new Date(expiresAt);
    const now = new Date();

    const difference =
      expiry.getTime() - now.getTime();

    return Math.max(
      0,
      Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2
            size={22}
            className="animate-spin"
          />
          <span>
            Loading subscription plans...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-400">
            <Crown size={28} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Upgrade Your Practice
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Unlock premium practice sessions,
            DSA questions and extended access.
          </p>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* CURRENT SUBSCRIPTION */}

        {subscription && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 via-slate-900 to-slate-900 p-5 shadow-xl sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Crown size={23} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">
                      Active Subscription
                    </h2>

                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                      Active
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    {formatPlanName(
                      subscription.plan
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays
                      size={14}
                    />
                    Expires
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {formatDate(
                      subscription.expires_at
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="mb-1 text-xs text-slate-500">
                    Remaining
                  </p>

                  <p className="text-sm font-semibold text-white">
                    {getDaysRemaining(
                      subscription.expires_at
                    )}{" "}
                    days
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-3 sm:col-span-1">
                  <p className="mb-1 text-xs text-slate-500">
                    Amount
                  </p>

                  <p className="text-sm font-semibold text-white">
                    ₹{subscription.amount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLANS */}

        <div className="mb-4 flex items-center gap-2">
          <Sparkles
            size={19}
            className="text-blue-400"
          />

          <h2 className="text-lg font-bold sm:text-xl">
            Choose Your Plan
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const isProcessing =
              processingPlan === plan.plan;

            const isPopular =
              plan.plan === "2_months";

            return (
              <div
                key={plan.plan}
                className={`relative flex flex-col rounded-3xl border p-5 transition duration-300 hover:-translate-y-1 sm:p-6 ${
                  isPopular
                    ? "border-blue-500/50 bg-blue-500/[0.07] shadow-xl shadow-blue-500/10"
                    : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Crown size={21} />
                  </div>

                  <h3 className="text-xl font-bold">
                    {formatPlanName(
                      plan.plan
                    )}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold">
                    ₹{plan.amount}
                  </span>

                  <span className="ml-2 text-sm text-slate-500">
                    / {plan.duration_days} days
                  </span>
                </div>

                <div className="mb-7 space-y-3">
                  {[
                    "Premium practice access",
                    "DSA practice access",
                    "Unlimited practice attempts",
                    "Progress tracking",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                        <Check size={13} />
                      </div>

                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() =>
                    handleSubscribe(plan)
                  }
                  className={`mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
                    isProcessing
                      ? "cursor-not-allowed bg-slate-700 text-slate-400"
                      : isPopular
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                      : "bg-slate-800 text-white hover:bg-slate-700"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard
                        size={18}
                      />
                      Subscribe Now
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* TRUST */}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center text-xs text-slate-500 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className="text-emerald-400"
            />
            Secure payment
          </div>

          <div className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />

          <div>
            Powered by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subscription;