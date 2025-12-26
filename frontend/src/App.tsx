// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layouts
import { MainLayout } from "./layout/MainLayout";
import { StaffLayout } from "./layout/StaffLayout";

// Pages - Auth
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

// Pages - Customer
import { Dashboard } from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage"; // Default export
import { PetList } from "./pages/PetList";
import { AddPet } from "./pages/AddPet";
import { PetDetail } from "./pages/PetDetail";
import { Profile } from "./pages/Profile";
import { History } from "./pages/History";
import { Invoices } from "./pages/Invoices";
import { InvoiceDetail } from "./pages/InvoiceDetail";
import { Packages } from "./pages/Packages";
import { PackageDetail } from "./pages/PackageDetail";
import { LandingPage } from "./pages/LandingPage";
import { Feedback } from "./pages/Feedback";

// Pages - Staff
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { StaffSchedule } from "./pages/staff/StaffSchedule";
import { ExamPage } from "./pages/staff/ExamPage";
import { ReceptionDesk } from "./pages/staff/ReceptionDesk";
import { InventoryPage } from "./pages/staff/InventoryPage";
import { PatientManagement } from "./pages/staff/PatientManagement";
import { HRManagement } from "./pages/staff/HRManagement";

const queryClient = new QueryClient();

// Route Guard Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: string[];
}) => {
  const { token, profile, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && profile) {
    if (!allowedRoles.includes(profile.Role)) {
      // Nếu Staff cố vào trang Customer hoặc ngược lại
      if (profile.Role === "CUSTOMER") return <Navigate to="/dashboard" />;
      return <Navigate to="/staff/dashboard" />;
    }
  }

  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes (MainLayout) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["CUSTOMER"]}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/pets" element={<PetList />} />
        <Route path="/pets/add" element={<AddPet />} />
        <Route path="/pets/:id" element={<PetDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
        <Route path="/feedback" element={<Feedback />} />
      </Route>

      {/* Staff Routes (StaffLayout) */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "DOCTOR", "RECEPTIONIST"]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/staff/dashboard" />} />
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="schedule" element={<StaffSchedule />} />
        <Route path="exam/:id" element={<ExamPage />} />
        <Route path="reception" element={<ReceptionDesk />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="patients" element={<PatientManagement />} />
        <Route path="hr" element={<HRManagement />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
