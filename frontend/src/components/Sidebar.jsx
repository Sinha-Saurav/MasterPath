
import { NavLink } from "react-router-dom";
import {
  FiActivity,
  FiBookOpen,
  FiCalendar,
  FiCheckSquare,
  FiChevronRight,
  FiCompass,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiTarget,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: FiGrid },
  { label: "My Courses", path: "/courses", icon: FiBookOpen },
  { label: "AI Tutor", path: "/ai-tutor", icon: FiZap },
  { label: "Quizzes", path: "/quizzes", icon: FiCheckSquare },
  { label: "My Progress", path: "/progress", icon: FiActivity },
  { label: "Study Planner", path: "/planner", icon: FiCalendar },
];

const secondaryNavigation = [
  { label: "Explore Courses", path: "/courses/explore", icon: FiCompass },
  { label: "My Profile", path: "/profile", icon: FiUser },
  { label: "Settings", path: "/settings", icon: FiSettings },
];

function NavigationLink({ item, onClose }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      title={item.label}
      className={({ isActive }) =>
        `flex h-11 items-center gap-3 overflow-hidden rounded-xl px-3 transition-colors ${
          isActive
            ? "bg-brand-soft font-semibold text-brand-hover"
            : "text-muted hover:bg-brand-wash hover:text-brand-hover"
        }`
      }
    >
      <Icon size={20} className="shrink-0" />
      <span className="whitespace-nowrap text-[13px] opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover/sidebar:opacity-100">
        {item.label}
      </span>
    </NavLink>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
        />
      )}

      <aside
        className={`group/sidebar fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-border bg-surface transition-[width,transform] duration-200 ease-out md:w-16 md:hover:w-[248px] ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center gap-3 overflow-hidden border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <FiCompass size={21} />
          </div>

          <div className="min-w-0 flex-1 opacity-100 transition-opacity duration-150 md:opacity-0 md:group-hover/sidebar:opacity-100">
            <p className="whitespace-nowrap font-heading text-[17px] font-bold tracking-tight text-foreground">
              MasterPath
            </p>
            <p className="whitespace-nowrap text-[11px] text-muted">
              Your learning companion
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1 text-muted hover:bg-brand-wash md:hidden"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Primary navigation */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-5">
          <p className="mb-3 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100">
            Learning
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavigationLink
                key={item.path}
                item={item}
                onClose={onClose}
              />
            ))}
          </nav>

          <p className="mb-3 mt-8 whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100">
            Personal
          </p>

          <nav className="space-y-1">
            {secondaryNavigation.map((item) => (
              <NavigationLink
                key={item.path}
                item={item}
                onClose={onClose}
              />
            ))}
          </nav>
        </div>

        {/* Bottom card */}
        <div className="shrink-0 border-t border-border p-2">
          <div className="flex items-center gap-3 overflow-hidden rounded-card bg-brand-wash p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-brand">
              <FiTarget size={18} />
            </div>

            <div className="min-w-0 flex-1 opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100">
              <p className="whitespace-nowrap text-xs font-semibold text-foreground">
                Keep learning!
              </p>
              <p className="whitespace-nowrap text-[10px] text-muted">
                Small steps add up
              </p>
            </div>

            <FiChevronRight
              size={16}
              className="shrink-0 text-muted opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100"
            />
          </div>

          <button
            type="button"
            title="Log out"
            onClick={() => {
              // Connect to the actual authentication logout flow later.
            }}
            className="mt-2 flex h-10 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-muted transition-colors hover:bg-error/10 hover:text-error"
          >
            <FiLogOut size={19} className="shrink-0" />
            <span className="whitespace-nowrap text-[13px] opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100">
              Log out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
