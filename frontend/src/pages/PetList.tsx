import React from "react";
import { useQuery } from "@tanstack/react-query";

import { usersApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { PetCard } from "../components/features/PetCard";
import { Button } from "../components/ui/Button";
import { Plus, PawPrint, Loader2 } from "lucide-react";

export const PetList: React.FC = () => {
  const { profile } = useAuth();

  const { data: pets = [], isLoading } = useQuery({
    queryKey: ["pets", profile?.MaKH],
    queryFn: async () => {
      const res = await usersApi.getMyPets();
      return (res as any).data || res || [];
    },

    enabled: !!profile,
  });

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="bg-primary/10 p-2 rounded-xl text-primary">
              <PawPrint className="w-8 h-8" />
            </span>
            Hồ sơ Thú cưng
          </h1>
          <p className="text-gray-500 mt-2 ml-1">
            Danh sách tất cả các bé trong gia đình
          </p>
        </div>
        <Link to="/pets/add">
          <Button className="shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" /> Thêm bé mới
          </Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PawPrint className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Chưa có hồ sơ nào
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Hãy tạo hồ sơ để bắt đầu theo dõi sức khỏe, lịch tiêm phòng và đặt
            lịch khám.
          </p>
          <Link to="/pets/add">
            <Button>Tạo hồ sơ ngay</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((p: any) => (
            <PetCard key={p.MaTC} pet={p} />
          ))}

          {/* Card "Add New" dạng lưới */}
          <Link
            to="/pets/add"
            className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[140px]"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
            </div>
            <span className="font-medium text-gray-500 group-hover:text-primary">
              Thêm thú cưng khác
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};
