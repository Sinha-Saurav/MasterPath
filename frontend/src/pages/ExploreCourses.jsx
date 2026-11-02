
import { useMemo, useState } from "react";
import {
  FiSearch,
  FiBookOpen,
  FiClock,
  FiUsers,
  FiArrowRight,
  FiFilter,
  FiCheckCircle,
} from "react-icons/fi";

const mockCourses = [
  {
    id: "1",
    title: "Data Structures & Algorithms",
    description:
      "Master fundamental data structures, algorithms, problem-solving techniques, and complexity analysis.",
    category: "Computer Science",
    instructor: "MasterPath Team",
    topics: 18,
    difficulty: "Intermediate",
    students: 1240,
    color: "bg-brand-soft",
    icon: "🧩",
  },
  {
    id: "2",
    title: "Database Management Systems",
    description:
      "Learn relational databases, SQL queries, normalization, transactions, and database design.",
    category: "Computer Science",
    instructor: "MasterPath Team",
    topics: 14,
    difficulty: "Intermediate",
    students: 980,
    color: "bg-blue-50",
    icon: "🗄️",
  },
  {
    id: "3",
    title: "Operating Systems",
    description:
      "Explore process management, scheduling algorithms, memory management, and synchronization.",
    category: "Computer Science",
    instructor: "MasterPath Team",
    topics: 12,
    difficulty: "Intermediate",
    students: 850,
    color: "bg-orange-50",
    icon: "⚙️",
  },
  {
    id: "4",
    title: "Computer Networks",
    description:
      "Understand networking fundamentals, TCP/IP, routing, protocols, and network security.",
    category: "Computer Science",
    instructor: "MasterPath Team",
    topics: 15,
    difficulty: "Intermediate",
    students: 760,
    color: "bg-green-50",
    icon: "🌐",
  },
  {
    id: "5",
    title: "Object Oriented Programming",
    description:
      "Build a strong foundation in classes, objects, inheritance, polymorphism, and abstraction.",
    category: "Programming",
    instructor: "MasterPath Team",
    topics: 10,
    difficulty: "Beginner",
    students: 1100,
    color: "bg-pink-50",
    icon: "💻",
  },
  {
    id: "6",
    title: "Artificial Intelligence",
    description:
      "Discover AI fundamentals, intelligent agents, search algorithms, and knowledge representation.",
    category: "Artificial Intelligence",
    instructor: "MasterPath Team",
    topics: 16,
    difficulty: "Advanced",
    students: 650,
    color: "bg-indigo-50",
    icon: "🤖",
  },
];

const categories = [
  "All Courses",
  "Computer Science",
  "Programming",
  "Artificial Intelligence",
];

function CourseCard({ course, enrolled, onEnroll }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
      {/* Course visual */}
      <div
        className={`relative flex h-36 items-center justify-center ${course.color}`}
      >
        <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
          {course.icon}
        </span>

        <span className="absolute left-4 top-4 rounded-lg bg-surface/90 px-3 py-1 text-xs font-medium text-secondary backdrop-blur">
          {course.category}
        </span>

        <span className="absolute right-4 top-4 rounded-lg bg-surface/90 px-3 py-1 text-xs font-medium text-secondary">
          {course.difficulty}
        </span>
      </div>

      {/* Course content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-primary transition-colors group-hover:text-brand">
          {course.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-secondary">
          {course.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-secondary">
          <FiBookOpen size={15} />
          <span>{course.topics} topics</span>
          <span className="mx-1">•</span>
          <FiUsers size={15} />
          <span>{course.students.toLocaleString()} learners</span>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-secondary">
            Created by
          </p>
          <p className="mt-1 text-sm font-medium text-primary">
            {course.instructor}
          </p>
        </div>

        <button
          onClick={() => onEnroll(course.id)}
          disabled={enrolled}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
            enrolled
              ? "cursor-default border border-border bg-app text-secondary"
              : "bg-brand text-white hover:opacity-90"
          }`}
        >
          {enrolled ? (
            <>
              <FiCheckCircle size={16} />
              Enrolled
            </>
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
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All Courses");
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Courses" ||
        course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const handleEnroll = (courseId) => {
    setEnrolledCourses((prev) =>
      prev.includes(courseId) ? prev : [...prev, courseId]
    );
  };

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
          <p className="text-xs text-secondary">Available Courses</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {mockCourses.length}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-secondary">Categories</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {categories.length - 1}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-border bg-surface p-4 sm:col-span-1">
          <p className="text-xs text-secondary">My Enrollments</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            {enrolledCourses.length}
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <FiSearch
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by name or description..."
            className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-secondary focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <FiFilter size={18} className="shrink-0 text-secondary" />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-primary outline-none focus:border-brand sm:w-56"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course results */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            {selectedCategory === "All Courses"
              ? "All Courses"
              : selectedCategory}
          </h2>

          <span className="text-sm text-secondary">
            {filteredCourses.length} courses found
          </span>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled={enrolledCourses.includes(course.id)}
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
              Try searching with a different keyword or selecting
              another category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All Courses");
              }}
              className="mt-5 rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-medium text-brand transition hover:opacity-80"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
