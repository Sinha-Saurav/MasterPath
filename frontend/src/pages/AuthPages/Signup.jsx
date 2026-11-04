
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import api from "../../services/api";

import { AuthLayout } from "../../components/AuthComponents";
import { FormField } from "../../components/AuthComponents";
import { PrimaryButton } from "../../components/AuthComponents";

export function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        full_name: name,
        email,
        password,
      });

      navigate("/verify-email", {
        state: { email },
        replace: true,
      });
    } catch (err) {
      const message =
        err.response?.data?.error?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="signup"
      title="Create your account"
      subtitle="Create an account and make every study session count."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          icon={FiUser}
        />

        <FormField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          icon={FiMail}
        />

        <FormField
          label="Password"
          type="password"
          placeholder="Create a password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          icon={FiLock}
          minLength={8}
        />

        <FormField
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          icon={FiLock}
          minLength={8}
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
          >
            {error}
          </p>
        )}

        <p className="text-xs leading-5 text-secondary">
          By creating an account, you agree to the terms of use and privacy policy.
        </p>

        <PrimaryButton disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
