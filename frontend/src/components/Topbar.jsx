
import { FiBell, FiMenu, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-brand-wash md:hidden"
        >
          <FiMenu size={22} />
        </button>

        <div className="relative w-full max-w-[420px]">
          <FiSearch
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder="Search courses, topics..."
            aria-label="Search courses and topics"
            className="h-11 w-full rounded-xl border border-border bg-app pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-focus/50"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted transition hover:bg-brand-wash hover:text-brand-hover"
        >
          <FiBell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-surface bg-error" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-brand-wash sm:gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand-hover">
            S
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-foreground">Student</p>
            <p className="text-[11px] text-muted">Learner account</p>
          </div>
        </button>
      </div>
    </header>
  );
}
