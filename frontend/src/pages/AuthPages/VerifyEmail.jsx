
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { FiMail } from "react-icons/fi";

import { AuthLayout } from "../../components/AuthComponents";

export function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || "your email address";
  const [resent, setResent] = useState(false);

  return (
    <AuthLayout
      mode="signup"
      title="Check your inbox"
      subtitle="One quick step before you get started."
      showBack
    >
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <FiMail size={30} />
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          Verification email sent
        </h2>

        <p className="mt-2 text-sm leading-6 text-secondary">
          We sent a verification link to
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-primary">
          {email}
        </p>

        <p className="mt-4 text-sm leading-6 text-secondary">
          Open the email and click the verification link to activate your
          account. If it doesn’t arrive, check your spam folder.
        </p>

        <button
          type="button"
          onClick={() => setResent(true)}
          className="mt-6 w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand-wash"
        >
          {resent
            ? "Verification email requested"
            : "Resend verification email"}
        </button>

        {resent && (
          <p className="mt-3 text-xs text-secondary">
            Resending is not connected yet. Please use the original email
            or request a new confirmation email once this feature is enabled.
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-secondary">
        Already verified?{" "}
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
