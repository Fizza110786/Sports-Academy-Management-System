import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/common/ProtectedRoute";

// ================= LAYOUTS =================
import AdminLayout from "./layout/AdminLayout";
import CoachLayout from "./layout/CoachLayout";
import StudentLayout from "./layout/StudentLayout";

// ================= ADMIN =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminPrograms from "./pages/admin/AdminPrograms";
import ManageBatches from "./pages/admin/ManageBatches";
import ManageSchedules from "./pages/admin/ManageSchedules";
import AttendanceReport from "./pages/admin/AttendanceReport";
import FeeManagement from "./pages/admin/FeeManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import Announcements from "./pages/admin/Announcements";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

// ================= COACH =================
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachBatches from "./pages/coach/CoachBatches";
import CoachProfile from "./pages/coach/CoachProfile";
import CoachSchedule from "./pages/coach/CoachSchedule";
import StudentPerformance from "./pages/coach/StudentPerformance";
import CoachAttendance from "./pages/coach/CoachAttendance";
import UploadMaterials from "./pages/coach/UploadMaterials";
import CoachAnnouncements from "./pages/coach/CoachAnnouncements";

// ================= STUDENT =================
import StudentDashboard from "./pages/student/StudentDashboard";
import ViewAttendance from "./pages/student/ViewAttendance";
import Schedule from "./pages/student/Schedule";
import PayFees from "./pages/student/PayFees";
import PaymentHistory from "./pages/student/PaymentHistory";
import Materials from "./pages/student/Materials";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import MyProgress from "./pages/student/MyProgress";
import StudentProfile from "./pages/student/StudentProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">  {/* ✅ FIX */}
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="programs" element={<AdminPrograms />} />
          <Route path="batches" element={<ManageBatches />} />
          <Route path="schedules" element={<ManageSchedules />} />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* COACH */}
        <Route
          path="/coach"
          element={
            <ProtectedRoute allowedRole="coach">  {/* ✅ FIX */}
              <CoachLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CoachDashboard />} />
          <Route path="batches" element={<CoachBatches />} />
          <Route path="schedule" element={<CoachSchedule />} />
          <Route path="attendance" element={<CoachAttendance />} />
          <Route path="performance" element={<StudentPerformance />} />
          <Route path="materials" element={<UploadMaterials />} />
          <Route path="announcements" element={<CoachAnnouncements />} />
          <Route path="profile" element={<CoachProfile />} />
        </Route>

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">  {/* ✅ FIX */}
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="attendance" element={<ViewAttendance />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="pay-fees" element={<PayFees />} />
          <Route path="payments" element={<PaymentHistory />} />
          <Route path="materials" element={<Materials />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
          <Route path="progress" element={<MyProgress />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;