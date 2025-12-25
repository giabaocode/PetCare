import React from "react";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { petsApi } from "../api/pets";
import { PetCard } from "../components/features/PetCard";
import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";
import { Plus, Calendar, Star, TrendingUp, ShieldCheck } from "lucide-react";

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  const { data: pets = [] } = useQuery({
    queryKey: ["pets", profile?.MaKH],
    queryFn: async () => {
      if (!profile?.MaKH) return [];
      const res = await petsApi.getAll(profile.MaKH);
      return (res as any).data || res || [];
    },
    enabled: !!profile?.MaKH,
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
                {profile?.TenHang || "Thành viên"}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center border border-white/10">
                <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-200" />
                {profile?.DiemTichLuy || 0} điểm
              </span>
            </div>
          </div>

          <Link to="/booking">
            {/* FIX: Thêm variant="ghost" để tránh xung đột màu chữ */}
            <Button
              variant="ghost"
              className="bg-white text-teal-700 hover:bg-teal-50 hover:text-teal-800 font-bold shadow-lg border-none px-6 py-3 h-auto text-base rounded-xl transition-transform hover:scale-105 active:scale-95 flex items-center"
            >
              <Calendar className="w-5 h-5 mr-2" /> Đặt lịch ngay
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Gói tiêm chủng</p>
            <p className="text-xl font-bold text-gray-900">Đang hoạt động</p>
          </div>
        </div>
      </div>

      {/* 3. PETS LIST */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thú cưng của tôi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý hồ sơ và sức khỏe các bé
          </p>
        </div>
        <Link to="/pets/add">
          <Button variant="outline" className="border-dashed border-2">
            <Plus className="w-4 h-4 mr-1" /> Thêm bé mới
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(pets) && pets.length > 0 ? (
          pets.map((pet: any) => <PetCard key={pet.MaTC} pet={pet} />)
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">
              Chưa có thú cưng nào trong hồ sơ
            </p>
            <Link
              to="/pets/add"
              className="text-primary hover:underline font-bold mt-2 inline-block"
            >
              Tạo hồ sơ ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
