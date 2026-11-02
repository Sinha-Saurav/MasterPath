
import { useEffect, useState } from "react";
import {
  FiSettings,
  FiSun,
  FiBell,
  FiBookOpen,
  FiSliders,
  FiRotateCcw,
  FiCheck,
} from "react-icons/fi";

const DEFAULT_SETTINGS = {
  appearance: "light",
  emailNotifications: false,
  studyReminders: true,
  quizReminders: true,
  learningStyle: "visual",
  defaultDifficulty: "adaptive",
  questionCount: 10,
};

function getSavedSettings() {
  try {
    const saved = localStorage.getItem("masterpath-settings");

    return saved
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon size={20} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-primary">
            {title}
          </h2>
          <p className="mt-1 text-sm text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="mt-1 text-xs text-secondary">{description}</p>
      </div>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SelectRow({ title, description, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-primary">{title}</p>
        <p className="mt-1 text-xs text-secondary">{description}</p>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-app px-3 py-2.5 text-sm text-primary outline-none transition focus:border-brand sm:w-48"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(getSavedSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "masterpath-settings",
      JSON.stringify(settings)
    );

    // This is a frontend preference only.
    // Actual notification delivery needs backend support.
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "masterpath-settings",
      JSON.stringify(settings)
    );

    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-brand">
            <FiSettings size={20} />
            <span className="text-sm font-medium">
              Preferences
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Customize your MasterPath learning experience.
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <FiCheck size={17} />
          {saved ? "Saved" : "Save preferences"}
        </button>
      </div>

      {/* Appearance */}
      <SettingsSection
        icon={FiSun}
        title="Appearance"
        description="Customize how MasterPath looks."
      >
        <SelectRow
          title="Theme"
          description="Choose your preferred interface theme."
          value={settings.appearance}
          onChange={(value) => updateSetting("appearance", value)}
          options={[
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
            { label: "System", value: "system" },
          ]}
        />

        <div className="rounded-xl bg-brand-wash p-3 text-xs text-secondary">
          Theme preference is saved locally. Dark mode will
          require matching dark theme tokens in your global CSS.
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        icon={FiBell}
        title="Notifications"
        description="Manage your learning reminders and preferences."
      >
        <ToggleRow
          title="Email notifications"
          description="Preference for receiving updates through email."
          checked={settings.emailNotifications}
          onChange={(value) =>
            updateSetting("emailNotifications", value)
          }
        />

        <ToggleRow
          title="Study reminders"
          description="Enable reminders for your study sessions."
          checked={settings.studyReminders}
          onChange={(value) =>
            updateSetting("studyReminders", value)
          }
        />

        <ToggleRow
          title="Quiz reminders"
          description="Enable reminders to practice quizzes."
          checked={settings.quizReminders}
          onChange={(value) =>
            updateSetting("quizReminders", value)
          }
        />
      </SettingsSection>

      {/* Learning preferences */}
      <SettingsSection
        icon={FiBookOpen}
        title="Learning Preferences"
        description="Set your preferred learning and quiz experience."
      >
        <SelectRow
          title="Learning style"
          description="Your preferred way to study."
          value={settings.learningStyle}
          onChange={(value) => updateSetting("learningStyle", value)}
          options={[
            { label: "Visual", value: "visual" },
            { label: "Reading", value: "reading" },
            { label: "Practice-based", value: "practice" },
          ]}
        />

        <SelectRow
          title="Default quiz difficulty"
          description="Difficulty used when starting a quiz."
          value={settings.defaultDifficulty}
          onChange={(value) =>
            updateSetting("defaultDifficulty", value)
          }
          options={[
            { label: "Adaptive", value: "adaptive" },
            { label: "Easy", value: "easy" },
            { label: "Medium", value: "medium" },
            { label: "Hard", value: "hard" },
          ]}
        />

        <SelectRow
          title="Default question count"
          description="Number of questions in a quiz."
          value={String(settings.questionCount)}
          onChange={(value) =>
            updateSetting("questionCount", Number(value))
          }
          options={[
            { label: "5 Questions", value: "5" },
            { label: "10 Questions", value: "10" },
            { label: "15 Questions", value: "15" },
            { label: "20 Questions", value: "20" },
          ]}
        />
      </SettingsSection>

      {/* Preferences management */}
      <SettingsSection
        icon={FiSliders}
        title="Preferences Management"
        description="Manage your locally stored preferences."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">
              Reset preferences
            </p>
            <p className="mt-1 text-xs text-secondary">
              Restore all settings to their default values.
            </p>
          </div>

          <button
            onClick={resetSettings}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-app"
          >
            <FiRotateCcw size={15} />
            Reset to defaults
          </button>
        </div>
      </SettingsSection>

      <p className="text-center text-xs text-secondary">
        Your preferences are stored on this device.
      </p>
    </div>
  );
}
