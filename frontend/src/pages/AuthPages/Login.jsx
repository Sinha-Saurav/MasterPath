
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import api from "../../services/api";

import { AuthLayout } from "../../components/AuthComponents";
import { FormField } from "../../components/AuthComponents";
import { PrimaryButton } from "../../components/AuthComponents";

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        "Unable to sign in. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          icon={FiMail}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              Password
            </span>

            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <FormField
            label="Password"
            hideLabel
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            icon={FiLock}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <PrimaryButton disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-secondary">
          NEW TO MASTERPATH?
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-secondary">
        Don’t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-brand hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
