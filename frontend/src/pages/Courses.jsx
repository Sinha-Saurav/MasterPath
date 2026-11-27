
import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import CoursesHero from "../components/courses/coursesHero";
import CourseCard from "../components/courses/CourseCard";

export default function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [deEnrollingId, setDeEnrollingId] = useState(null);
  const [deEnrollError, setDeEnrollError] = useState("");

  // Fetch only the logged-in student's enrolled courses
  useEffect(() => {
    let isMounted = true;

    async function fetchMyCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/me/courses");

        if (isMounted) {
          setCourses(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.error?.message ||
              "Unable to load your courses. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMyCourses();

    return () => {
      isMounted = false;
    };
  }, [retry]);

  // Search enrolled courses
  const visibleCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return courses.filter((course) => {
      return (
        course.name.toLowerCase().includes(normalizedSearch) ||
        course.code.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [courses, search]);

  function openCourse(course) {
    navigate(`/courses/${course.id}`);
  }

  // De-enroll from a course
  async function handleDeEnroll(course) {
    const confirmed = window.confirm(
      `Are you sure you want to de-enroll from "${course.name}"?\n\nYou will no longer see this course in your enrolled courses.`
    );

    if (!confirmed) return;

    try {
      setDeEnrollingId(course.id);
      setDeEnrollError("");

      await api.delete(`/courses/${course.id}/enroll`);

      // Remove the course from the current list
      setCourses((previousCourses) =>
        previousCourses.filter((item) => item.id !== course.id)
      );
    } catch (err) {
      setDeEnrollError(
        err.response?.data?.error?.message ||
          `Unable to de-enroll from ${course.name}. Please try again.`
      );
    } finally {
      setDeEnrollingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <CoursesHero />

      {/* Search */}
      <section>
        <label className="relative block">
          <FiSearch
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your enrolled courses..."
            aria-label="Search enrolled courses"
            className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-focus/50"
          />
        </label>
      </section>

      {/* Course heading */}
      <div>
        <h2 className="font-heading text-base font-bold text-foreground">
          Your enrolled courses
        </h2>

        {!loading && !error && (
          <p className="mt-1 text-xs text-muted">
            {visibleCourses.length}{" "}
            {visibleCourses.length === 1 ? "course" : "courses"} found
          </p>
        )}
      </div>

      {/* De-enrollment error */}
      {deEnrollError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          <FiAlertCircle size={17} className="shrink-0" />
          {deEnrollError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-panel border border-border bg-surface">
          <div className="flex items-center gap-3 text-sm text-muted">
            <FiRefreshCw className="animate-spin" size={18} />
            Loading your courses...
          </div>
        </div>
      )}

      {/* Fetch error */}
      {!loading && error && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-panel border border-border bg-surface px-6 py-10 text-center">
          <FiAlertCircle size={28} className="text-danger" />

          <h3 className="mt-3 font-heading font-bold text-foreground">
            Couldn't load your courses
          </h3>

          <p className="mt-2 text-sm text-muted">{error}</p>

          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            Try again
          </button>
        </div>
      )}

      {/* Courses */}
      {!loading && !error && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {visibleCourses.length > 0 ? (
            visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onContinue={openCourse}
                onDeEnroll={handleDeEnroll}
                isDeEnrolling={deEnrollingId === course.id}
              />
            ))
          ) : (
            <div className="col-span-full flex min-h-64 flex-col items-center justify-center rounded-panel border border-dashed border-border bg-surface px-6 py-12 text-center">
              <h3 className="font-heading text-base font-bold text-foreground">
                {courses.length === 0
                  ? "You haven't enrolled in any courses yet"
                  : "No matching courses found"}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                {courses.length === 0
                  ? "Explore Courses to find and enroll in courses. They will appear here."
                  : "Try searching with a different course name or code."}
              </p>

              {courses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 rounded-xl bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-hover transition hover:bg-brand/15"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
