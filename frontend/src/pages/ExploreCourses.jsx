
import { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";

import api from "../services/api"; // Adjust this path to your Axios instance

function CourseCard({
  course,
  enrolled,
  enrolling,
  onEnroll,
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
      {/* Course visual */}
      <div className="relative flex h-36 items-center justify-center bg-brand-soft">
        <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
          📚
        </span>

        <span className="absolute left-4 top-4 rounded-lg bg-surface/90 px-3 py-1 text-xs font-medium text-secondary backdrop-blur">
          {course.code}
        </span>
      </div>

      {/* Course content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-primary transition-colors group-hover:text-brand">
          {course.name}
        </h3>

        <div className="mt-4 flex items-center gap-2 text-xs text-secondary">
          <FiBookOpen size={15} />
          <span>
            {course.topic_count}{" "}
            {course.topic_count === 1 ? "topic" : "topics"}
          </span>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-secondary">
            Course Code
          </p>
          <p className="mt-1 text-sm font-medium text-primary">
            {course.code}
          </p>
        </div>

        <button
          onClick={() => onEnroll(course)}
          disabled={enrolled || enrolling}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
            enrolled
              ? "cursor-default border border-border bg-app text-secondary"
              : enrolling
              ? "cursor-wait bg-brand/70 text-white"
              : "bg-brand text-white hover:opacity-90"
          }`}
        >
          {enrolled ? (
            <>
              <FiCheckCircle size={16} />
              Enrolled
            </>
          ) : enrolling ? (
            "Enrolling..."
          ) : (
            <>
              Enroll Now
              <FiArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default function ExploreCourses() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Fetch available courses and enrolled courses
  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      try {
        setLoading(true);
        setError("");

        const [coursesResponse, enrolledResponse] =
          await Promise.all([
            api.get("/courses"),
            api.get("/me/courses"),
          ]);

        if (!cancelled) {
          setCourses(coursesResponse.data);
          setEnrolledCourses(enrolledResponse.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error?.message ||
              "Failed to load courses. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  // Filter courses using name or course code
  const filteredCourses = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return courses.filter((course) => {
      return (
        course.name.toLowerCase().includes(searchValue) ||
        course.code.toLowerCase().includes(searchValue)
      );
    });
  }, [courses, search]);

  // Check whether a course is already enrolled
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(
      (course) => String(course.id) === String(courseId)
    );
  };

  // Enroll in a course
  const handleEnroll = async (course) => {
    try {
      setEnrollingId(course.id);
      setEnrollError("");

      await api.post(`/courses/${course.id}/enroll`);

      setEnrolledCourses((prev) => {
        const alreadyEnrolled = prev.some(
          (item) => String(item.id) === String(course.id)
        );

        return alreadyEnrolled ? prev : [...prev, course];
      });
    } catch (err) {
      setEnrollError(
        err.response?.data?.error?.message ||
          "Failed to enroll in this course. Please try again."
      );
    } finally {
      setEnrollingId(null);
    }
  };

  const totalTopics = courses.reduce(
    (total, course) => total + (course.topic_count || 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-brand">
          <FiBookOpen size={20} />
          <span className="text-sm font-medium">
            Course Catalog
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Explore Courses
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
          Discover courses, strengthen your knowledge, and take
          the next step in your learning journey.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-secondary">
            Available Courses
          </p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {courses.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-secondary">
            Total Topics
          </p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {totalTopics}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-border bg-surface p-4 sm:col-span-1">
          <p className="text-xs text-secondary">
            My Enrollments
          </p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {enrolledCourses.length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses by name or course code..."
          className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-secondary focus:border-brand"
        />
      </div>

      {/* Course results */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            All Courses
          </h2>

          <span className="text-sm text-secondary">
            {filteredCourses.length} courses found
          </span>
        </div>

        {enrollError && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {enrollError}
          </p>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-secondary">
            Loading courses...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <p className="text-sm text-secondary">{error}</p>

            <button
              onClick={() => setRetryCount((prev) => prev + 1)}
              className="mt-5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={isEnrolled(course.id)}
                enrolling={enrollingId === course.id}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <FiSearch size={24} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-primary">
              No courses found
            </h3>

            <p className="mt-2 max-w-sm text-sm text-secondary">
              Try searching with a different course name or code.
            </p>

            <button
              onClick={() => setSearch("")}
              className="mt-5 rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-medium text-brand transition hover:opacity-80"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
