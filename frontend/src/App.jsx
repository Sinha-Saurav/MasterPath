
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import TopicWorkspace from "./pages/TopicWorkspace";
import Quizzes from "./pages/Quizzes";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResults from "./pages/QuizResults";
import Progress from "./pages/Progress";
import AITutor from "./pages/AITutor";

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app p-6">
      <div className="w-full max-w-md rounded-panel border border-border bg-surface p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft font-heading text-xl font-bold text-brand-hover">
          M
        </div>

        <h1 className="mt-5 text-center font-heading text-2xl font-bold text-foreground">
          Welcome to MasterPath
        </h1>

        <p className="mt-2 text-center text-sm text-muted">
          Your learning journey starts here.
        </p>

        <p className="mt-6 rounded-xl bg-brand-wash p-4 text-center text-xs text-muted">
          Login and authentication UI will be implemented in a later step.
        </p>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }) {
  return (
    <section className="rounded-panel border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">
        MasterPath
      </p>

      <h1 className="mt-3 font-heading text-2xl font-bold text-foreground">
        {title}
      </h1>

      <p className="mt-2 text-sm text-muted">
        This page is ready for implementation. We'll build it next.
      </p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route
          path="/courses/explore"
          element={<PlaceholderPage title="Explore Courses" />}
        />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route
          path="/courses/:courseId/topics/:topicId/learn"
          element={<TopicWorkspace />}
        />
        <Route path="/ai-tutor" element={<AITutor/>} />
        <Route path="/quizzes" element={<Quizzes/>} />
        <Route path="/quizzes/:quizId/attempt" element={<QuizAttempt />} />
        <Route path="/quizzes/:quizId/results" element={<QuizResults />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/planner" element={<PlaceholderPage title="Study Planner" />} />
        <Route path="/profile" element={<PlaceholderPage title="My Profile" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
