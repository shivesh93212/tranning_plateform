import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(
        form.email,
        form.password
      );

      if (loggedInUser?.role === "admin") {
        navigate("/admin/dashboard", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:px-6">

      {/* MAIN CARD */}
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_25px_70px_rgba(79,35,180,0.20)]">

        {/* PURPLE BACKGROUND */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-700" />

        {/* TOP WHITE WAVE */}
        <div className="absolute -top-20 left-[35%] h-48 w-[80%] rounded-[50%] bg-white" />

        <div className="absolute -top-10 left-[42%] h-32 w-48 rounded-full bg-white" />

        {/* BOTTOM WHITE WAVE */}
        <div className="absolute -bottom-20 left-[18%] h-48 w-[70%] rounded-[50%] bg-white" />

        {/* CLOUD SHAPES */}
        <div className="absolute left-[42%] top-[25%] h-24 w-24 rounded-full bg-white" />

        <div className="absolute left-[49%] top-[21%] h-32 w-32 rounded-full bg-white" />

        <div className="absolute left-[58%] top-[28%] h-28 w-28 rounded-full bg-white" />

        <div className="absolute left-[67%] top-[22%] h-36 w-36 rounded-full bg-white" />

        <div className="absolute left-[74%] top-[30%] h-28 w-28 rounded-full bg-white" />

        <div className="absolute bottom-[25%] left-[42%] h-28 w-28 rounded-full bg-white" />

        <div className="absolute bottom-[20%] left-[51%] h-36 w-36 rounded-full bg-white" />

        <div className="absolute bottom-[25%] left-[62%] h-28 w-28 rounded-full bg-white" />

        <div className="absolute bottom-[20%] left-[72%] h-36 w-36 rounded-full bg-white" />

        {/* CONTENT */}
        <div className="relative z-10 grid min-h-[620px] lg:grid-cols-2">

          {/* ========================================= */}
          {/* LEFT LOGIN SECTION */}
          {/* ========================================= */}

          <div className="flex items-center bg-white px-7 py-12 sm:px-12 lg:px-20">

            <div className="mx-auto w-full max-w-md">

              {/* BACK */}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-purple-600"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              {/* HEADING */}
              <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                  Hello!
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Sign in to your account
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-500">
                    E-mail
                  </label>

                  <div className="relative">

                    <div className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-md">
                      <Mail size={16} />
                    </div>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="E-mail"
                      required
                      autoComplete="email"
                      className="h-12 w-full rounded-full border border-slate-200 bg-white pl-14 pr-5 text-sm text-slate-800 shadow-[0_8px_25px_rgba(99,67,190,0.10)] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                    />

                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-500">
                    Password
                  </label>

                  <div className="relative">

                    <div className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-md">
                      <LockKeyhole size={16} />
                    </div>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                      autoComplete="current-password"
                      className="h-12 w-full rounded-full border border-slate-200 bg-white pl-14 pr-12 text-sm text-slate-800 shadow-[0_8px_25px_rgba(99,67,190,0.10)] outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-purple-600"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>
                </div>

                {/* OPTIONS */}
                <div className="flex items-center justify-between px-1">

                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-purple-600"
                    />

                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-slate-500 transition hover:text-purple-600"
                  >
                    Forgot password?
                  </button>

                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mx-auto block w-36 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition hover:-translate-y-0.5 hover:from-violet-500 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "SIGNING IN..."
                    : "SIGN IN"}
                </button>

              </form>

              {/* REGISTER */}
              <p className="mt-9 text-center text-xs text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-purple-600 transition hover:text-purple-700"
                >
                  Create
                </Link>
              </p>

            </div>
          </div>

          {/* ========================================= */}
          {/* RIGHT WELCOME SECTION */}
          {/* ========================================= */}

          <div className="relative hidden min-h-[620px] lg:block">

            <div className="absolute inset-0 flex items-center justify-center px-8 xl:px-16">

              <div className="relative z-30 w-full max-w-md text-center">

                {/* LOGO */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-2xl font-black text-white shadow-xl shadow-purple-500/30">
                  P
                </div>

                {/* HEADING */}
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
                  Welcome Back!
                </h2>

                {/* DESCRIPTION CARD */}
                <div className="mx-auto mt-6 max-w-md rounded-2xl border border-white/80 bg-white/90 px-6 py-5 shadow-[0_12px_35px_rgba(70,30,130,0.12)] backdrop-blur-md">

                  <p className="text-center text-sm font-medium leading-7 text-slate-700 sm:text-base">
                    Welcome back to PrepMaster.
                    Practice aptitude, DSA and
                    coding problems and continue
                    your preparation journey.
                  </p>

                </div>

                {/* SMALL FEATURE */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">

                  <span className="rounded-full border border-purple-200 bg-white/90 px-4 py-2 text-xs font-semibold text-purple-700 shadow-sm">
                    Aptitude
                  </span>

                  <span className="rounded-full border border-purple-200 bg-white/90 px-4 py-2 text-xs font-semibold text-purple-700 shadow-sm">
                    DSA
                  </span>

                  <span className="rounded-full border border-purple-200 bg-white/90 px-4 py-2 text-xs font-semibold text-purple-700 shadow-sm">
                    Coding
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;