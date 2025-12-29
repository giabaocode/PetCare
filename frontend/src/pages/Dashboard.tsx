import React from "react";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { PetCard } from "../components/features/PetCard";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import {
  Plus,
  Calendar,
  Star,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  PawPrint,
} from "lucide-react";

import { usersApi } from "../api/userApi";
import { packageApi } from "../api/packagesApi";

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const { data: pets = [], isLoading: isLoadingPets } = useQuery({
    queryKey: ["my-pets", profile?.MaKH],
    queryFn: async () => {
      const res = await usersApi.getMyPets();
      return Array.isArray(res) ? res : (res as any).data || [];
    },
    enabled: !!profile,
  });

  const { data: activePkg, isLoading: isLoadingPkg } = useQuery({
    queryKey: ["active-package", profile?.MaKH],
    queryFn: async () => {
      if (!pets[0]?.MaTC) return null;
      return await packageApi.checkActivePackage(pets[0].MaTC);
    },
    enabled: pets.length > 0,
  });

  return (
    <div className="p-6 md:p-8 pb-20 max-w-7xl mx-auto">
      {/* 1. HERO SECTION */}
      <div className="bg-gradient-to-r from-[#00BFA5] to-[#00796B] text-white p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-teal-50 font-medium mb-1 opacity-90">
              Chào ngày mới,
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              {profile?.HoTen} 👋
            </h1>
            <div className="flex flex-wrap gap-3">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center border border-white/10">
                <Star className="w-4 h-4 mr-1.5 text-yellow-300 fill-yellow-300" />
                {profile?.TenHang || "Thành viên mới"}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center border border-white/10">
                <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-200" />
                {profile?.DiemTichLuy || 0} điểm tích lũy
              </span>
            </div>
          </div>

          <Link to="/booking">
            <Button
              variant="ghost"
              className="bg-white text-teal-700 hover:bg-teal-50 hover:text-teal-800 font-bold shadow-lg border-none px-6 py-3 h-auto text-base rounded-xl transition-transform hover:scale-105 active:scale-95 flex items-center"
            >
              <Calendar className="w-5 h-5 mr-2" /> Đặt lịch khám
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              activePkg
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-50 text-gray-400"
            }`}
          >
            {activePkg ? (
              <ShieldCheck className="w-7 h-7" />
            ) : (
              <ShieldAlert className="w-7 h-7" />
            )}
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Gói dịch vụ</p>
            <p className="text-xl font-bold text-gray-900">
              {isLoadingPkg
                ? "Đang kiểm tra..."
                : activePkg
                ? "Đang hoạt động"
                : "Chưa đăng ký"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. PETS LIST */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thú cưng của tôi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Theo dõi sức khỏe và lịch trình của các bé
          </p>
        </div>
        <Link to="/pets/add">
          <Button
            variant="outline"
            className="border-dashed border-2 hover:bg-primary/5 hover:border-primary transition-all"
          >
            <Plus className="w-4 h-4 mr-1" /> Thêm bé mới
          </Button>
        </Link>
      </div>

      {isLoadingPets ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.length > 0 ? (
            pets.map((pet: any) => <PetCard key={pet.MaTC} pet={pet} />)
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium text-lg">
                Bạn chưa có thú cưng nào trong danh sách
              </p>
              <Link to="/pets/add">
                <Button className="mt-4 px-8">Tạo hồ sơ đầu tiên ngay</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
