import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RoomProvider } from "./context/RoomContext";
import Spinner from "./components/ui/Spinner";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const OnboardingPage = lazy(() => import("./pages/onboarding/OnboardingPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const ExpensesPage = lazy(() => import("./pages/expenses/ExpensesPage"));
const ChoresPage = lazy(() => import("./pages/chores/ChoresPage"));
const ShoppingPage = lazy(() => import("./pages/shopping/ShoppingPage"));
const FoodPage = lazy(() => import("./pages/food/FoodPage"));
const MaintenancePage = lazy(() => import("./pages/maintenance/MaintenancePage"));
const NoisePage = lazy(() => import("./pages/noise/NoisePage"));
const AttendancePage = lazy(() => import("./pages/attendance/AttendancePage"));
const MoodPage = lazy(() => import("./pages/advanced/MoodPage"));
const CalendarPage = lazy(() => import("./pages/advanced/CalendarPage"));
const PollsPage = lazy(() => import("./pages/advanced/PollsPage"));

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const RoomRoute = ({ children }) => {
  const { profile, loading } = useAuth();
  if (loading) return <Spinner fullScreen />;
  if (!profile?.roomId) return <Navigate to="/onboarding" replace />;
  return children;
};

const AppRoutes = () => (
  <Suspense fallback={<Spinner fullScreen />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <DashboardPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <ExpensesPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chores"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <ChoresPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopping"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <ShoppingPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/food"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <FoodPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/maintenance"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <MaintenancePage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/noise"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <NoisePage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <AttendancePage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mood"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <MoodPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <CalendarPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/polls"
        element={
          <ProtectedRoute>
            <RoomRoute>
              <PollsPage />
            </RoomRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoomProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a35",
                color: "#fff",
                border: "1px solid rgba(108,34,255,0.3)",
              },
            }}
          />
        </RoomProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
