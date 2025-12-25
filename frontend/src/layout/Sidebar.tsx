import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Cat,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { clsx } from "clsx";

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menu = [
    { name: "Tổng quan", path: "/dashboard", icon: LayoutDashboard },
    { name: "Hồ sơ Thú cưng", path: "/pets", icon: Cat },
    { name: "Đặt lịch khám", path: "/booking", icon: CalendarDays },
    { name: "Gói dịch vụ", path: "/packages", icon: ShieldCheck },
    { name: "Lịch sử & Hóa đơn", path: "/invoices", icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-xl text-primary">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <span className="text-2xl font-heading font-bold text-slate-800 tracking-tight">
          PetCare<span className="text-primary">X</span>
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
        {menu.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/30 translate-x-1"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Icon
                className={clsx(
                  "w-5 h-5",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-primary"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 m-4 bg-slate-50 rounded-2xl">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <Settings className="w-4 h-4" /> Cài đặt tài khoản
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </div>
  );
};
