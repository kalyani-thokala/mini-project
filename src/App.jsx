import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Pages
import Dashboard from "./pages/Dashboard";
import ExamsPage from "./pages/ExamsPage";
import ExamSessionPage from "./pages/ExamSessionPage";
import ExamResultPage from "./pages/ExamResultPage";
import InterviewsPage from "./pages/InterviewsPage";
import InterviewSessionPage from "./pages/InterviewSessionPage";
import InterviewResultPage from "./pages/InterviewResultPage";
import CodingPage from "./pages/CodingPage";
import CodingWorkspacePage from "./pages/CodingWorkspacePage";
import CodingReviewPage from "./pages/CodingReviewPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Leaderboard from "./pages/Leaderboard";
import HistoryPage from "./pages/HistoryPage";
import FeaturesPage from "./pages/FeaturesPage";

import { Toaster } from "react-hot-toast";

// Layout for guest/public pages (Full width)
const GuestLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow pt-24 px-4 md:px-8 pb-12">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

// Layout wrapper for authenticated users (pushes content to the right of fixed Sidebar)
const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-darkBg transition-colors duration-300">
      <Sidebar />
      <div className="main-content flex-grow">
        <div className="page-content pt-24 px-4 md:px-8 pb-12">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Reset Scroll position on navigation */}
      <ScrollToTop />

      {/* Global Navbar */}
      <Navbar />

      {/* Main Pages Router */}
      <main className="flex-grow">
        <Routes>
          {/* Public/Guest Routes */}
          <Route element={<GuestLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/features" element={<FeaturesPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/exams/take/:id" element={<ExamSessionPage />} />
              <Route path="/exams/result/:id" element={<ExamResultPage />} />
              <Route path="/interviews" element={<InterviewsPage />} />
              <Route path="/interviews/take" element={<InterviewSessionPage />} />
              <Route path="/interviews/result/:id" element={<InterviewResultPage />} />
              <Route path="/coding" element={<CodingPage />} />
              <Route path="/coding/solve/:id" element={<CodingWorkspacePage />} />
              <Route path="/coding/review/:id" element={<CodingReviewPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Settings />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Toast Notification Hub */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "glass-panel text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-darkBorder shadow-premium font-sans text-sm font-semibold rounded-2xl",
          duration: 4000
        }}
      />
    </div>
  );
}
