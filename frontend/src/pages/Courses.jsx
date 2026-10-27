
import { useMemo, useState } from "react";
import { FiBookOpen, FiSearch, FiSliders } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import CoursesHero from "../components/courses/coursesHero";
import CourseCard from "../components/courses/CourseCard";
import LearningOverview from "../components/courses/LearningOverview";
import RecommendedCourses from "../components/courses/RecommendedCourses";
import RecentlyAccessed from "../components/courses/RecentlyAccessed";

// Temporary data. We'll replace this with API data later.
const enrolledCourses = [
  {
    id: "dsa",
    name: "Data Structures and Algorithms",
    category: "Computer Science",
    subject: "DSA",
    icon: "dsa",
    completedTopics: 24,
    totalTopics: 28,
    progress: 85,
    iconBg: "bg-brand-soft",
    iconColor: "text-brand-hover",
    progressColor: "bg-brand",
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    category: "Computer Science",
    subject: "DBMS",
    icon: "dbms",
    completedTopics: 16,
    totalTopics: 23,
    progress: 70,
    iconBg: "bg-info/10",
    iconColor: "text-info",
    progressColor: "bg-info",
  },
  {
    id: "os",
    name: "Operating Systems",
    category: "Computer Science",
    subject: "OS",
    icon: "os",
    completedTopics: 15,
    totalTopics: 25,
    progress: 60,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    progressColor: "bg-success",
  },
  {
    id: "networks",
    name: "Computer Networks",
    category: "Computer Science",
    subject: "CN",
    icon: "networks",
    completedTopics: 18,
    totalTopics: 24,
    progress: 75,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    progressColor: "bg-warning",
  },
  {
    id: "software",
    name: "Software Engineering",
    category: "Computer Science",
    subject: "SE",
    icon: "software",
    completedTopics: 10,
    totalTopics: 20,
    progress: 50,
    iconBg: "bg-brand-soft",
    iconColor: "text-brand-hover",
    progressColor: "bg-brand",
  },
];

const exploreCourses = [
  {
    id: "ml-fundamentals",
    name: "Machine Learning Fundamentals",
    category: "Artificial Intelligence",
    subject: "AI/ML",
    icon: "software",
    completedTopics: 0,
    totalTopics: 18,
    progress: 0,
    iconBg: "bg-error/10",
    iconColor: "text-error",
    progressColor: "bg-error",
    level: "Beginner",
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing Basics",
    category: "Cloud Computing",
    subject: "Cloud",
    icon: "cloud",
    completedTopics: 0,
    totalTopics: 12,
    progress: 0,
    iconBg: "bg-info/10",
    iconColor: "text-info",
    progressColor: "bg-info",
    level: "Beginner",
  },
  {
    id: "web-development",
    name: "Full Stack Web Development",
    category: "Web Development",
    subject: "Web Dev",
    icon: "software",
    completedTopics: 0,
    totalTopics: 20,
    progress: 0,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    progressColor: "bg-success",
    level: "Intermediate",
  },
];

const recentItems = [
  {
    id: "dsa-arrays",
    title: "Data Structures - Arrays",
    accessed: "Last accessed 2 hours ago",
    icon: "dsa",
    iconStyle: "bg-brand-soft text-brand-hover",
    courseId: "dsa",
  },
  {
    id: "dbms-sql",
    title: "DBMS - SQL Queries",
    accessed: "Last accessed 1 day ago",
    icon: "dbms",
    iconStyle: "bg-info/10 text-info",
    courseId: "dbms",
  },
  {
    id: "os-scheduling",
    title: "OS - Process Scheduling",
    accessed: "Last accessed 2 days ago",
    icon: "os",
    iconStyle: "bg-success/10 text-success",
    courseId: "os",
  },
];

const subjectOptions = [
  "All Subjects",
  "DSA",
  "DBMS",
  "OS",
  "CN",
  "SE",
  "AI/ML",
  "Cloud",
  "Web Dev",
];

function EmptyCourses({ isExplore, onReset }) {
  return (
    <div className="col-span-full flex min-h-64 flex-col items-center justify-center rounded-panel border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <FiBookOpen size={25} />
      </div>

      <h3 className="mt-4 font-heading text-base font-bold text-foreground">
        No courses found
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        {isExplore
          ? "Try another search or subject to discover more courses."
          : "Try changing your search or subject filter to find your courses."}
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-xl bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-hover transition hover:bg-brand/15"
      >
        Clear filters
      </button>
    </div>
  );
}

export default function Courses() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("enrolled");
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All Subjects");

  const sourceCourses =
    activeTab === "enrolled" ? enrolledCourses : exploreCourses;

  const visibleCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sourceCourses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.name.toLowerCase().includes(normalizedSearch) ||
        course.category.toLowerCase().includes(normalizedSearch) ||
        course.subject.toLowerCase().includes(normalizedSearch);

      const matchesSubject =
        subject === "All Subjects" || course.subject === subject;

      return matchesSearch && matchesSubject;
    });
  }, [sourceCourses, search, subject]);

  function changeTab(tab) {
    setActiveTab(tab);
    setSearch("");
    setSubject("All Subjects");
  }

  function openCourse(course) {
    // Course details route will be implemented next.
    navigate(`/courses/${course.id}`);
  }

  function handleCourseMenu(course) {
    // Reserved for a course actions menu in a later UI pass.
    console.info("Course actions:", course.name);
  }

  function handleRecentSelect(item) {
    navigate(`/courses/${item.courseId}`);
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="grid grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="min-w-0 space-y-5">
          <CoursesHero
            activeTab={activeTab}
            onTabChange={changeTab}
          />

          {/* Search and filter */}
          <section className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <FiSearch
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "enrolled"
                    ? "Search your enrolled courses..."
                    : "Search courses to explore..."
                }
                aria-label="Search courses"
                className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-focus/50"
              />
            </label>

            <label className="relative flex h-12 shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3">
              <FiSliders size={16} className="text-muted" />

              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                aria-label="Filter courses by subject"
                className="h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-5 text-sm font-medium text-foreground outline-none"
              >
                {subjectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {/* Course grid heading */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                {activeTab === "enrolled"
                  ? "Your enrolled courses"
                  : "Explore courses"}
              </h2>

              <p className="mt-1 text-xs text-muted">
                {visibleCourses.length}{" "}
                {visibleCourses.length === 1 ? "course" : "courses"} found
              </p>
            </div>

            {activeTab === "explore" && (
              <span className="rounded-lg bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-hover">
                Discover something new
              </span>
            )}
          </div>

          {/* Cards */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {visibleCourses.length > 0 ? (
              visibleCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onContinue={openCourse}
                  onMenu={handleCourseMenu}
                />
              ))
            ) : (
              <EmptyCourses
                isExplore={activeTab === "explore"}
                onReset={() => {
                  setSearch("");
                  setSubject("All Subjects");
                }}
              />
            )}
          </section>

          {/* Recently accessed only on enrolled tab */}
          {activeTab === "enrolled" && (
            <RecentlyAccessed
              items={recentItems}
              onSelect={handleRecentSelect}
              onViewAll={() => navigate("/progress")}
            />
          )}
        </div>

        {/* Right column */}
        <aside className="space-y-5">
          <LearningOverview />

          {activeTab === "enrolled" && (
            <RecommendedCourses
              onSelect={() => changeTab("explore")}
              onViewAll={() => changeTab("explore")}
            />
          )}

          {activeTab === "explore" && (
            <section className="rounded-panel border border-border bg-brand-wash p-5">
              <h2 className="font-heading text-base font-bold text-foreground">
                Find your next skill
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Explore courses, build a learning habit, and track your
                progress as you go.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSubject("All Subjects");
                }}
                className="mt-4 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
              >
                Browse all courses
              </button>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
