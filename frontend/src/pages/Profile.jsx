
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiUser,
  FiMail,
  FiBookOpen,
  FiCalendar,
  FiEdit2,
  FiCheck,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../services/api";

const inputClass =
  "w-full rounded-xl border border-border bg-app px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-focus/30";

function SectionHeading({ title, description }) {
  return (
    <div className="mb-5">
      <h2 className="font-heading text-base font-bold text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-xs text-muted">{description}</p>
    </div>
  );
}

function ProfileField({
  label,
  icon: Icon,
  value,
  editing,
  onChange,
  placeholder,
  readOnly = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-muted">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        )}

        {editing && !readOnly ? (
          <input
            value={value ?? ""}
            onChange={onChange}
            placeholder={placeholder || label}
            className={`${inputClass} ${Icon ? "pl-10" : ""}`}
          />
        ) : (
          <div
            className={`flex min-h-[46px] items-center rounded-xl border border-border bg-app px-4 text-sm text-foreground ${
              Icon ? "pl-10" : ""
            }`}
          >
            {value || <span className="text-muted">Not provided</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function Profile() {
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch actual profile data.
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const { data } = await api.get("/me");
      return data;
    },
  });

  // Update profile through PATCH /api/me.
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const { data } = await api.patch("/me", updates);
      return data;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["myProfile"], updatedProfile);
      setDraft(null);
      setEditing(false);
      setSaveSuccess(true);
    },
  });

  const startEditing = () => {
    setDraft({
      full_name: profile.full_name || "",
      branch: profile.branch || "",
      semester: profile.semester ?? "",
    });

    setSaveSuccess(false);
    updateMutation.reset();
    setEditing(true);
  };

  const updateField = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaveSuccess(false);
    updateMutation.reset();
  };

  const handleCancel = () => {
    setDraft(null);
    setEditing(false);
    updateMutation.reset();
    setSaveSuccess(false);
  };

  const handleSave = () => {
    const updates = {};

    const fullName = draft.full_name.trim();
    const branch = draft.branch.trim();
    const semester = Number(draft.semester);

    if (fullName !== (profile.full_name || "")) {
      updates.full_name = fullName;
    }

    if (branch !== (profile.branch || "")) {
      updates.branch = branch;
    }

    if (semester !== Number(profile.semester)) {
      updates.semester = semester;
    }

    // Avoid sending an empty PATCH request.
    if (Object.keys(updates).length === 0) {
      setEditing(false);
      setDraft(null);
      return;
    }

    updateMutation.mutate(updates);
  };

  const initials = (profile?.full_name || "S")
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "User";

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted">
          <FiRefreshCw className="animate-spin" size={18} />
          Loading your profile...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Couldn't load your profile
        </h2>

        <p className="mt-2 text-sm text-muted">
          {getErrorMessage(error)}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          <FiRefreshCw size={15} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Account
          </p>

          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-muted">
            View and manage your personal and academic information.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={startEditing}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover"
          >
            <FiEdit2 size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-muted transition hover:bg-brand-wash disabled:opacity-50"
            >
              <FiX size={16} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending ? (
                <FiRefreshCw className="animate-spin" size={16} />
              ) : (
                <FiCheck size={17} />
              )}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          <FiCheck size={17} />
          Your profile has been updated successfully.
        </div>
      )}

      {updateMutation.isError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {getErrorMessage(updateMutation.error)}
        </div>
      )}

      {/* Profile overview */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-soft/50 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-soft font-heading text-2xl font-bold text-brand-hover">
            {initials || "S"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-foreground">
                {profile.full_name}
              </h2>

              <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-hover">
                {roleLabel}
              </span>
            </div>

            <p className="mt-1 break-all text-sm text-muted">
              {profile.email || "Email unavailable"}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <FiBookOpen size={14} />
                {profile.branch || "Branch not provided"}
              </span>

              <span className="flex items-center gap-1.5">
                <FiCalendar size={14} />
                {profile.semester
                  ? `Semester ${profile.semester}`
                  : "Semester not provided"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Personal information */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <SectionHeading
          title="Personal Information"
          description="Your account and academic details."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProfileField
            label="Full Name"
            icon={FiUser}
            value={editing ? draft.full_name : profile.full_name}
            editing={editing}
            onChange={(e) => updateField("full_name", e.target.value)}
          />

          <ProfileField
            label="Email Address"
            icon={FiMail}
            value={profile.email}
            editing={false}
            readOnly
          />

          <ProfileField
            label="Branch"
            icon={FiBookOpen}
            value={editing ? draft.branch : profile.branch}
            editing={editing}
            onChange={(e) => updateField("branch", e.target.value)}
            placeholder="Enter your branch"
          />

          <div>
            <label className="mb-2 block text-xs font-semibold text-muted">
              Semester
            </label>

            {editing ? (
              <select
                value={draft.semester}
                onChange={(e) =>
                  updateField("semester", e.target.value)
                }
                className={inputClass}
              >
                <option value="">Select semester</option>
                {Array.from({ length: 8 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Semester {index + 1}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex min-h-[46px] items-center rounded-xl border border-border bg-app px-4 text-sm text-foreground">
                {profile.semester ? (
                  `Semester ${profile.semester}`
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Account information */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <SectionHeading
          title="Account Information"
          description="Your MasterPath account details."
        />

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-wash text-brand">
            <FiUser size={18} />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Account Role
            </p>
            <p className="mt-1 text-xs text-muted">
              Your assigned role in MasterPath.
            </p>
          </div>

          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-hover">
            {roleLabel}
          </span>
        </div>
      </section>
    </div>
  );
}
