
import { FiBell, FiMenu, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import api from "../services/api";
import { AVATARS, DEFAULT_AVATAR_ID } from "../constants/avatars";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const response = await api.get("/me");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const fullName = profile?.full_name || "Student";

  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const role = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "Learner";

  const avatarId = profile?.avatar_id || DEFAULT_AVATAR_ID;

  const currentAvatar =
    AVATARS.find((avatar) => avatar.id === avatarId) || AVATARS[0];

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
          onClick={() => navigate("/settings")}
          aria-label="Open profile"
          className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-brand-wash sm:gap-3"
        >
          <div className="h-9 w-9 overflow-hidden rounded-xl bg-brand-soft">
            <img
              src={currentAvatar.src}
              alt="Profile avatar"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[140px] truncate text-xs font-semibold text-foreground">
              {fullName}
            </p>
            <p className="text-[11px] text-muted">{role}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
