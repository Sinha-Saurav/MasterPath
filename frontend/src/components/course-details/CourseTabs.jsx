
import {
  FiBookOpen,
  FiFileText,
  FiLayers,
  FiTrendingUp,
  FiClipboard,
} from "react-icons/fi";

const tabs = [
  { id: "overview", label: "Overview", icon: FiBookOpen },
  { id: "topics", label: "Topics", icon: FiLayers },
  { id: "quizzes", label: "Quizzes", icon: FiClipboard },
  { id: "progress", label: "Progress", icon: FiTrendingUp },
  { id: "resources", label: "Resources", icon: FiFileText },
];

export default function CourseTabs({
  activeTab = "overview",
  onTabChange,
}) {
  return (
    <nav
      aria-label="Course sections"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange?.(id)}
            className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-semibold transition sm:px-6 ${
              active
                ? "text-brand-hover"
                : "text-muted hover:bg-brand-wash hover:text-foreground"
            }`}
          >
            <Icon size={16} className="sm:hidden" />
            {label}

            {active && (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand sm:inset-x-3" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
