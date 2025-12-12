import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Stethoscope,
  LayoutGrid,
  CalendarCheck,
  LogOut,
  Users,
  ConciergeBell,
  Briefcase,
  Package,
} from "lucide-react";
import { clsx } from "clsx";
import { userRole } from "../types/schema";

// Định nghĩa Menu Item có thêm trường 'allowedRoles'
interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  allowedRoles: userRole[]; // Mảng các role được phép xem
}

export const StaffLayout = () => {
  const { logout, profile } = useAuth();
  const location = useLocation();

  // Danh sách Menu kèm quyền hạn
  const MENU_ITEMS: MenuItem[] = [
    {
      name: "Bàn làm việc",
      path: "/staff/dashboard",
      icon: LayoutGrid,
      allowedRoles: ["ADMIN", "DOCTOR"], // Bác sĩ & Admin được xem
    },
    {
      name: "Quầy Lễ Tân",
      path: "/staff/reception",
      icon: ConciergeBell,
      allowedRoles: ["ADMIN", "RECEPTIONIST"], // Lễ tân & Admin được xem
    },
    {
      name: "Lịch khám (BS)",
      path: "/staff/schedule",
      icon: CalendarCheck,
      allowedRoles: ["ADMIN", "DOCTOR"],
    },
    {
      name: "Quản lý Bệnh nhân",
      path: "/staff/patients",
      icon: Users,
      allowedRoles: ["ADMIN", "DOCTOR", "RECEPTIONIST"], // Ai cũng được xem
    },
    {
      name: "Kho & Sản phẩm",
      path: "/staff/inventory",
      icon: Package,
      allowedRoles: ["ADMIN", "RECEPTIONIST"], // Lễ tân có thể xem để bán hàng
    },
    {
      name: "Nhân sự (HR)",
      path: "/staff/hr",
      icon: Briefcase,
      allowedRoles: ["ADMIN"], // CHỈ ADMIN MỚI ĐƯỢC XEM
    },
  ];

  // Lọc menu dựa trên Role hiện tại của user
  const userRole = profile?.Role || "CUSTOMER";
  const visibleMenu = MENU_ITEMS.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-primary p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg leading-none">
              PetCareX
            </h1>
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              {userRole} PORTAL {/* Hiển thị Role hiện tại */}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleMenu.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon
                  className={clsx(
                    "w-5 h-5",
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-white"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm border-2 border-slate-600">
              {profile?.HoTen?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-200">
                {profile?.HoTen}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {profile?.Email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header giữ nguyên */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="font-bold text-slate-700 text-lg">
            {visibleMenu.find((m) => location.pathname.startsWith(m.path))
              ?.name || "Hệ thống quản lý"}
          </h2>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm text-slate-500 font-medium">
              Hệ thống hoạt động
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
