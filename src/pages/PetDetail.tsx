import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { petsApi } from "../api/pets";
import { userDataApi } from "../api/user-data";
import { ThuCung } from "../types/schema";
import { ArrowLeft, Activity, Calendar, Dna, Stethoscope } from "lucide-react";

export const PetDetail: React.FC = () => {
  const { id } = useParams();

  const { data: pet } = useQuery<ThuCung>({
    queryKey: ["pet", id],
    queryFn: async () => {
      // Vì Mock API trả về mảng [pet], nên lấy phần tử đầu tiên
      const res = await petsApi.getOne(Number(id));
      return Array.isArray(res) ? res[0] : res;
    },
    enabled: !!id && id !== "add", // Chặn nếu id='add' lọt vào
  });

  const { data: history } = useQuery<any[]>({
    queryKey: ["pet-history", id],
    queryFn: async () => {
      const res = await userDataApi.getKhamBenh("mock-id");
      return (res as any).data || [];
    },
    enabled: !!id,
  });

  if (!pet) return <div className="p-10 text-center">Đang tải...</div>;

  const isCat = pet.Loai?.toLowerCase().includes("mèo");
  const avatar = isCat
    ? `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80`
    : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80`;

  return (
    <div className="pb-20">
      {/* 1. Banner Tràn Viền (Full Width) - Không bị cắt nữa */}
      <div className="h-64 bg-gradient-to-br from-primary via-teal-500 to-emerald-600 relative">
        <Link
          to="/dashboard"
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* 2. Profile Card - Kéo lên đè lên banner */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-24 relative z-10 border border-gray-100">
          <img
            src={avatar}
            alt={pet.TenTC}
            className="w-40 h-40 rounded-3xl object-cover border-4 border-white shadow-lg -mt-20 sm:-mt-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {pet.TenTC}
            </h1>
            <p className="text-gray-500 font-medium text-lg flex items-center justify-center sm:justify-start gap-2">
              {pet.Loai === "Chó" ? "🐶" : "🐱"} {pet.Loai} • {pet.GioiTinh}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="px-5 py-2.5 bg-green-50 text-green-700 rounded-2xl font-bold text-sm flex items-center border border-green-100">
              <Activity className="w-4 h-4 mr-2" />
              {pet.TinhTrang || "Khỏe mạnh"}
            </span>
          </div>
        </div>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center">
              <Dna className="w-4 h-4 mr-1.5" /> Giống
            </div>
            <div className="font-bold text-gray-800 text-lg">{pet.Giong}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" /> Sinh nhật
            </div>
            <div className="font-bold text-gray-800 text-lg">
              {pet.NgaySinh}
            </div>
          </div>
        </div>

        {/* 4. Medical History */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 px-1 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary" /> Hồ sơ bệnh án
        </h2>
        <div className="space-y-4">
          {history?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-dashed border-2 border-gray-200 text-gray-400">
              Chưa có lịch sử khám bệnh
            </div>
          ) : (
            history?.map((h: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition group"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900 text-lg">
                        {new Date(h.NgayKham).toLocaleDateString("vi-VN")}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium border border-gray-200">
                        Khám bệnh
                      </span>
                    </div>
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">
                        Triệu chứng:
                      </span>{" "}
                      {h.TrieuChung}
                    </p>
                  </div>
                </div>

                {h.ChanDoan && (
                  <div className="md:w-1/3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                      Chẩn đoán
                    </p>
                    <p className="text-gray-800 font-medium">{h.ChanDoan}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
