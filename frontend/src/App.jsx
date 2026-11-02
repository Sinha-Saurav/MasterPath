
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
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ExploreCourses from "./pages/ExploreCourses";
import {
  Login,
  Signup,
  VerifyEmail,
  ForgotPassword,
  ResetPasswordConfirm,
} from "./pages/MasterPathAuthPages";


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
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/reset-password/confirm"
        element={<ResetPasswordConfirm />}
      />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/explore" element={<ExploreCourses />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route
          path="/courses/:courseId/topics/:topicId/learn"
          element={<TopicWorkspace />}
        />
        <Route path="/ai-tutor" element={<AITutor />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/quizzes/:quizId/attempt" element={<QuizAttempt />} />
        <Route path="/quizzes/:quizId/results" element={<QuizResults />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
