import React from "react";
import { ThuCung } from "../../types/schema";
import { Link } from "react-router-dom";
import { Dog, Cat, ArrowRight, Activity } from "lucide-react";

export const PetCard: React.FC<{ pet: ThuCung }> = ({ pet }) => {
  const isCat = pet.Loai?.toLowerCase().includes("mèo");

  const randomImage = isCat
    ? `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80`
    : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80`;

  return (
    <Link to={`/pets/${pet.MaTC}`} className="group block">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
        <div className="flex gap-4">
          {/* Avatar Ảnh thật */}
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
            <img
              src={randomImage}
              alt={pet.TenTC}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute bottom-0 right-0 bg-white p-1 rounded-tl-lg">
              {isCat ? (
                <Cat className="w-4 h-4 text-orange-500" />
              ) : (
                <Dog className="w-4 h-4 text-blue-500" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 py-1">
            <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors">
              {pet.TenTC}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {pet.Giong} • {pet.GioiTinh}
            </p>

            <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
              <Activity className="w-3 h-3 mr-1" />
              {pet.TinhTrang || "Sức khỏe tốt"}
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="self-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
};
