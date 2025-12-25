import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { MainLayout } from "./layout/MainLayout";

// Import Pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { PetList } from "./pages/PetList";
import { PetDetail } from "./pages/PetDetail";
import { AddPet } from "./pages/AddPet";
import BookingPage from "./pages/BookingPage";
import { Packages } from "./pages/Packages";
import { PackageDetail } from "./pages/PackageDetail";
import { Invoices } from "./pages/Invoices";
import { InvoiceDetail } from "./pages/InvoiceDetail";
import { History } from "./pages/History";
import { Profile } from "./pages/Profile";
import { Feedback } from "./pages/Feedback";
import { StaffLayout } from "./layout/StaffLayout";
import { StaffSchedule } from "./pages/staff/StaffSchedule";
import { ExamPage } from "./pages/staff/ExamPage";
import { ReceptionDesk } from "./pages/staff/ReceptionDesk"; // Import trang mới
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { PatientManagement } from "./pages/staff/PatientManagement";
import { HRManagement } from "./pages/staff/HRManagement";
import { InventoryPage } from "./pages/staff/InventoryPage";

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center text-primary font-bold animate-pulse">
        PetCareX Loading...
      </div>
    );
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicOnly = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicOnly>
            <LandingPage />
          </PublicOnly>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />

      {/* Protected Routes (Wrapped in MainLayout) */}
      <Route
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Pets */}
        <Route path="/pets" element={<PetList />} />
        <Route path="/pets/add" element={<AddPet />} />
        <Route path="/pets/:id" element={<PetDetail />} />

        {/* Booking */}
        <Route path="/booking" element={<BookingPage />} />

        {/* Packages */}
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetail />} />

        {/* Invoices & History */}
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/history" element={<History />} />

        {/* User */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<Feedback />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route
        path="/staff"
        element={
          <Protected>
            <StaffLayout />
          </Protected>
        }
      >
        {/* FIX: Thay thế dòng "Coming Soon" bằng Component thật */}
        <Route path="dashboard" element={<StaffDashboard />} />

        <Route path="reception" element={<ReceptionDesk />} />
        <Route path="schedule" element={<StaffSchedule />} />
        <Route path="exam/:id" element={<ExamPage />} />

        {/* FIX: Thay thế dòng "Coming Soon" bằng Component thật */}
        <Route path="patients" element={<PatientManagement />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="hr" element={<HRManagement />} />
      </Route>
    </Routes>
  );
}
