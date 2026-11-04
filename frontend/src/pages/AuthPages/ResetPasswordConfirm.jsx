
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLock } from "react-icons/fi";

import api from "../../services/api";

import { AuthLayout } from "../../components/AuthComponents";
import { FormField } from "../../components/AuthComponents";
import { PrimaryButton } from "../../components/AuthComponents";

export function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const establishRecoverySession = async () => {
      const params = new URLSearchParams(location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (!tokenHash || type !== "recovery") {
        if (!cancelled) {
          setError(
            "Invalid or expired password reset link. Please request a new one."
          );
          setCheckingRecovery(false);
        }
        return;
      }

      try {
        await api.post("/auth/recovery-session", {
          token_hash: tokenHash,
          type,
        });

        if (!cancelled) {
          setRecoveryReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error?.message ||
              "Unable to validate the reset link. Please request a new one."
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingRecovery(false);
        }
      }
    };

    establishRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must contain 8–128 characters.");
      return;
    }

    if (!recoveryReady) {
      setError("Your recovery session is not valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.put("/auth/update-password", {
        password,
      });

      navigate("/login", {
        state: { passwordReset: true },
      });
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          "Unable to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Create a new password"
      subtitle="Choose a strong password you haven’t used before."
      showBack
    >
      {checkingRecovery ? (
        <p className="text-center text-sm text-secondary">
          Validating your password reset link...
        </p>
      ) : recoveryReady ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="New password"
            type="password"
            placeholder="Enter new password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            icon={FiLock}
            minLength={8}
          />

          <FormField
            label="Confirm new password"
            type="password"
            placeholder="Re-enter new password"
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

          <PrimaryButton disabled={loading}>
            {loading ? "Updating password..." : "Update password"}
          </PrimaryButton>
        </form>
      ) : (
        <div className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="w-full text-sm font-semibold text-brand hover:underline"
          >
            Request a new reset link
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
