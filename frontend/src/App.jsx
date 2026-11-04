
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

import { Login } from "./pages/AuthPages/Login";
import { Signup } from "./pages/AuthPages/Signup";
import { VerifyEmail } from "./pages/AuthPages/VerifyEmail";
import { ForgotPassword } from "./pages/AuthPages/ForgotPassword";
import { ResetPasswordConfirm } from "./pages/AuthPages/ResetPasswordConfirm";



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
