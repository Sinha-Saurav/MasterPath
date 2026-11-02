import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiCompass,
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiBookOpen,
  FiZap,
  FiActivity,
  FiShield,
} from "react-icons/fi";
import authCharacter from "../assets/illustrations/masterpath-auth-character.svg";

function BrandMark({ compact = false }) {
  return (
    <Link to="/login" className="inline-flex items-center gap-3">
      <span
        className={`flex shrink-0 items-center justify-center rounded-2xl bg-brand text-white shadow-sm ${
          compact ? "h-10 w-10" : "h-12 w-12"
        }`}
      >
        <FiCompass size={compact ? 22 : 25} />
      </span>
      <span>
        <span className="block font-heading text-xl font-bold tracking-tight text-primary">
          MasterPath
        </span>
        <span className="block text-xs text-secondary">
          Your learning companion
        </span>
      </span>
    </Link>
  );
}

function CharacterPlaceholder() {
  return (
    <div className="relative mx-auto flex h-[38vh] min-h-0 w-full max-w-[560px] items-center justify-center">
      {/* Import your downloaded illustration from src/assets/illustrations/.
          The image is intentionally the visual focus of the left panel. */}
      <img
        src={authCharacter}
        alt="A student learning with MasterPath"
        className="h-full w-full object-contain drop-shadow-xl"
      />
    </div>
  );
}

function AuthBrandPanel({ mode = "signup" }) {
  const isLogin = mode === "login";

  return (
    <aside className="relative hidden h-screen min-h-0 overflow-hidden bg-brand px-7 py-6 text-white lg:flex lg:flex-col lg:justify-between xl:px-10 2xl:px-14">
      {/* Subtle decorative accents */}
      <div className="pointer-events-none absolute -left-32 -top-28 h-96 w-96 rounded-full border border-white/70" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 flex shrink-0 items-center justify-between">
        <BrandMark />
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90">
          <FiZap size={14} />
          {isLogin ? "Welcome back" : "Start learning"}
        </span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col justify-center py-3">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <CharacterPlaceholder />
          <div className="mt-1 text-center">
            <h2 className="font-heading text-3xl font-bold leading-tight tracking-tight xl:text-4xl 2xl:text-5xl">
              Learn smarter. Grow faster.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/80 xl:text-base">
              Bring your courses, AI tutoring, and progress tracking together in
              one focused learning space.
            </p>
          </div>
        </div>

        <div className="mt-4 grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4">
          {[
            { icon: FiBookOpen, label: "Structured courses" },
            { icon: FiZap, label: "AI-powered learning" },
            { icon: FiCheckCircle, label: "Track progress" },
            { icon: FiShield, label: "Focused workspace" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2 text-xs text-white/95"
            >
              <Icon size={15} className="shrink-0" />
              <span className="whitespace-nowrap">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 shrink-0 pt-2 text-[11px] text-white/60">
        © {new Date().getFullYear()} MasterPath. Keep moving forward.
      </p>
    </aside>
  );
}

function AuthLayout({ children, title, subtitle, mode = "signup", showBack = false }) {
  const navigate = useNavigate();

  return (
    <div className="grid h-[100dvh] w-full grid-cols-1 overflow-hidden bg-app text-primary lg:grid-cols-2">
      <AuthBrandPanel mode={mode} />

      <main className="flex h-[100dvh] min-h-0 items-center justify-center overflow-hidden px-5 py-5 sm:px-8 lg:px-8 xl:px-12 2xl:px-16">
        <div className="w-full max-w-[430px]">
          <div className="mb-5 lg:hidden">
            <BrandMark compact />
          </div>

          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-4 inline-flex items-center gap-2 text-sm text-secondary transition hover:text-brand"
            >
              <FiArrowLeft size={16} />
              Back
            </button>
          )}

          <div className="mb-5">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand">
              {mode === "login" ? "Welcome back" : "Get started"}
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-sm leading-5 text-secondary">{subtitle}</p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}

function FormField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  icon: Icon,
  minLength,
  hideLabel = false,
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  return (
    <label className="block">
      {!hideLabel && <span className="mb-2 block text-sm font-medium text-primary">{label}</span>}
      <span className="relative block">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary"
          />
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          className={`w-full rounded-xl border border-border bg-surface py-3.5 text-sm text-primary outline-none transition placeholder:text-secondary/70 focus:border-brand focus:ring-4 focus:ring-brand/10 ${
            Icon ? "pl-10" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"}`}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary transition hover:text-brand"
          >
            {visible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
          </button>
        )}
      </span>
    </label>
  );
}

function PrimaryButton({ children, type = "submit" }) {
  return (
    <button
      type={type}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-brand/20"
    >
      {children}
      <FiArrowRight size={16} />
    </button>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Connect to the existing Express/Supabase login API.
    navigate("/dashboard");
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
            <span className="text-sm font-medium text-primary">Password</span>
            <Link to="/forgot-password" className="text-xs font-semibold text-brand hover:underline">
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

        <PrimaryButton>Sign in</PrimaryButton>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-secondary">NEW TO MASTERPATH?</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-secondary">
        Don’t have an account?{" "}
        <Link to="/signup" className="font-semibold text-brand hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    // TODO: Connect to signup API; after success, route to email verification.
    navigate("/verify-email", { state: { email } });
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
          <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <p className="text-xs leading-5 text-secondary">
          By creating an account, you agree to the terms of use and privacy policy.
        </p>
        <PrimaryButton>Create account</PrimaryButton>
      </form>

      <p className="mt-6 text-center text-sm text-secondary">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

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
        <h2 className="mt-5 text-lg font-semibold">Verification email sent</h2>
        <p className="mt-2 text-sm leading-6 text-secondary">
          We sent a verification link to
        </p>
        <p className="mt-1 break-all text-sm font-semibold text-primary">{email}</p>
        <p className="mt-4 text-sm leading-6 text-secondary">
          Open the email and click the verification link to activate your account.
          If it doesn’t arrive, check your spam folder.
        </p>
        <button
          type="button"
          onClick={() => {
            // TODO: Connect to the resend-verification API.
            setResent(true);
          }}
          className="mt-6 w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand-wash"
        >
          {resent ? "Verification email requested" : "Resend verification email"}
        </button>
        {resent && (
          <p className="mt-3 text-xs text-secondary">
            Demo action only — connect this to your auth service.
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-secondary">
        Already verified?{" "}
        <Link to="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Connect to the password-reset email endpoint.
    setSubmitted(true);
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
          <p className="mt-1 break-all text-sm font-semibold text-primary">{email}</p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
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
          <PrimaryButton>Send reset link</PrimaryButton>
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

export function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    // TODO: Validate reset token and submit new password to auth API.
    navigate("/login", { state: { passwordReset: true } });
  };

  return (
    <AuthLayout
      mode="login"
      title="Create a new password"
      subtitle="Choose a strong password you haven’t used before."
      showBack
    >
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
          <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {error}
          </p>
        )}

        <PrimaryButton>Update password</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
