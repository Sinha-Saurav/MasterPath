import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiCheckCircle } from "react-icons/fi";
import api from "../../services/api";

import { AuthLayout } from "../../components/AuthComponents";
import { FormField } from "../../components/AuthComponents";
import { PrimaryButton } from "../../components/AuthComponents";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send reset instructions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title={submitted ? "Check your inbox" : "Forgot your password?"}
      subtitle={
        submitted
          ? "If an account exists for this email, reset instructions will be sent."
          : "Enter the email address associated with your account."
      }
      showBack
    >
      {submitted ? (
        <div className="rounded-2xl border border-border bg-surface p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <FiCheckCircle size={30} />
          </div>

          <p className="mt-4 text-sm leading-6 text-secondary">
            Password reset instructions requested for
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-primary">
            {email}
          </p>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setError("");
            }}
            className="mt-6 text-sm font-semibold text-brand hover:underline"
          >
            Try another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            icon={FiMail}
          />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <PrimaryButton disabled={loading}>
            {loading ? "Sending reset link..." : "Send reset link"}
          </PrimaryButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-secondary">
        Remember your password?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
