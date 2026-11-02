
import { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiCalendar,
  FiEdit2,
  FiCamera,
  FiTarget,
  FiClock,
  FiAward,
  FiShield,
  FiLock,
  FiChevronRight,
  FiCheck,
  FiX,
} from "react-icons/fi";

const initialProfile = {
  fullName: "Saurav Sinha",
  email: "saurav@example.com",
  phone: "",
  college: "HMR Institute of Technology & Management",
  degree: "B.Tech — Information Technology",
  academicYear: "3rd Year",
  studyGoal: "2 hours",
  learningStyle: "Visual learning",
};

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

function ProfileField({ label, icon: Icon, value, editing, onChange, placeholder }) {
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
          />)
        }

        {editing ? (
          <input
            value={value}
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

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Connect to PATCH /api/me
    setEditing(false);
    setSaved(true);
  };

  const handleCancel = () => {
    setProfile(initialProfile);
    setEditing(false);
    setSaved(false);
  };

  const initials = profile.fullName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
            Manage your personal information and learning preferences.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
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
              className="flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-muted transition hover:bg-brand-wash"
            >
              <FiX size={16} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              <FiCheck size={17} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          <FiCheck size={17} />
          Profile changes saved locally. Backend integration is pending.
        </div>
      )}

      {/* Profile overview */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-soft/50 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-soft font-heading text-2xl font-bold text-brand-hover">
            {initials || "S"}

            <button
              type="button"
              title="Change profile picture"
              className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-muted shadow-sm transition hover:text-brand"
            >
              <FiCamera size={15} />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-foreground">
                {profile.fullName}
              </h2>

              <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-hover">
                Student
              </span>
            </div>

            <p className="mt-1 text-sm text-muted">{profile.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <FiBookOpen size={14} />
                {profile.degree}
              </span>
              <span className="flex items-center gap-1.5">
                <FiCalendar size={14} />
                {profile.academicYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl bg-brand-wash px-3 py-2 sm:self-center">
            <FiAward size={18} className="text-brand" />
            <span className="text-xs font-semibold text-brand-hover">
              Active Learner
            </span>
          </div>
        </div>
      </section>

      {/* Personal information */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <SectionHeading
          title="Personal Information"
          description="Your basic details and academic information."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProfileField
            label="Full Name"
            icon={FiUser}
            value={profile.fullName}
            editing={editing}
            onChange={(e) => updateField("fullName", e.target.value)}
          />

          <ProfileField
            label="Email Address"
            icon={FiMail}
            value={profile.email}
            editing={editing}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <ProfileField
            label="Phone Number"
            icon={FiPhone}
            value={profile.phone}
            editing={editing}
            placeholder="Enter phone number"
            onChange={(e) => updateField("phone", e.target.value)}
          />

          <ProfileField
            label="College / University"
            icon={FiBookOpen}
            value={profile.college}
            editing={editing}
            onChange={(e) => updateField("college", e.target.value)}
          />

          <ProfileField
            label="Degree / Course"
            value={profile.degree}
            editing={editing}
            onChange={(e) => updateField("degree", e.target.value)}
          />

          <ProfileField
            label="Academic Year"
            value={profile.academicYear}
            editing={editing}
            onChange={(e) => updateField("academicYear", e.target.value)}
          />
        </div>
      </section>

      {/* Learning preferences */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <SectionHeading
          title="Learning Preferences"
          description="Customize how you want to learn with MasterPath."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
              <FiTarget size={15} />
              Daily Study Goal
            </label>

            <select
              disabled={!editing}
              value={profile.studyGoal}
              onChange={(e) => updateField("studyGoal", e.target.value)}
              className={`${inputClass} disabled:cursor-default disabled:opacity-100`}
            >
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>3 hours</option>
              <option>4 hours</option>
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
              <FiBookOpen size={15} />
              Preferred Learning Style
            </label>

            <select
              disabled={!editing}
              value={profile.learningStyle}
              onChange={(e) => updateField("learningStyle", e.target.value)}
              className={`${inputClass} disabled:cursor-default disabled:opacity-100`}
            >
              <option>Visual learning</option>
              <option>Reading and notes</option>
              <option>Practice-based learning</option>
              <option>Video learning</option>
              <option>Mixed learning</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-brand-wash p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-brand">
            <FiClock size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Your learning journey
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              MasterPath can use these preferences to personalize your study
              sessions, AI tutor responses, and learning recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Account security */}
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <SectionHeading
          title="Account & Security"
          description="Manage your account security."
        />

        <div className="divide-y divide-border">
          <button
            type="button"
            className="flex w-full items-center gap-4 py-4 text-left transition hover:bg-brand-wash/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-wash text-brand">
              <FiLock size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Change Password
              </p>
              <p className="mt-1 text-xs text-muted">
                Update your account password
              </p>
            </div>

            <FiChevronRight size={18} className="text-muted" />
          </button>

          <div className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-wash text-brand">
              <FiShield size={18} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Account Status
              </p>
              <p className="mt-1 text-xs text-muted">
                Your MasterPath account is active.
              </p>
            </div>

            <span className="rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold text-success">
              Active
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
