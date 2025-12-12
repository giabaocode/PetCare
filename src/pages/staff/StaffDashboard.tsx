import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  DollarSign,
  Package,
} from "lucide-react";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { useNavigate } from "react-router-dom";

// Mock Data Thống kê
const STATS = [
  {
    label: "Doanh thu hôm nay",
    value: "15.200.000đ",
    change: "+12%",
    icon: DollarSign,
    color: "text-green-600 bg-green-50",
  },
  {
    label: "Lịch hẹn mới",
    value: "24",
    change: "+4",
    icon: Calendar,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Bệnh nhân mới",
    value: "8",
    change: "+2",
    icon: Users,
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Cảnh báo tồn kho",
    value: "3",
    change: "Cần nhập",
    icon: AlertTriangle,
    color: "text-red-600 bg-red-50",
  },
];

const INITIAL_LOW_STOCK = [
  { id: 1, name: "Vaccine Dại (Rabies)", stock: 2, unit: "Lọ" },
  { id: 2, name: "Cát vệ sinh Mèo (10kg)", stock: 5, unit: "Bao" },
  { id: 3, name: "Thuốc nhỏ tai Dexoryl", stock: 1, unit: "Chai" },
];

const REVENUE_DATA = [
  { day: "T2", value: 40 },
  { day: "T3", value: 65 },
  { day: "T4", value: 30 },
  { day: "T5", value: 85 },
  { day: "T6", value: 50 },
  { day: "T7", value: 95 },
  { day: "CN", value: 70 },
];

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lowStock, setLowStock] = useState(INITIAL_LOW_STOCK);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleQuickImport = (id: number) => {
    // Xóa khỏi danh sách cảnh báo (giả lập đã nhập hàng)
    setLowStock(lowStock.filter((i) => i.id !== id));
    setShowSuccess(true);
  };

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Tổng quan Chi nhánh
      </h1>

      {/* 1. Cards Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow cursor-default"
            >
              <div>
                <p className="text-slate-500 text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </h3>
                <span
                  className={`text-xs font-bold ${
                    stat.change.includes("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {stat.change}{" "}
                  <span className="text-slate-400 font-normal">
                    so với hôm qua
                  </span>
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Biểu đồ Doanh thu (Đã khôi phục) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Biểu đồ doanh thu
              tuần
            </h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 outline-none">
              <option>Tuần này</option>
              <option>Tháng này</option>
            </select>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 px-2">
            {REVENUE_DATA.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 flex-1 group"
              >
                <div className="w-full bg-slate-100 rounded-t-lg relative h-48 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-t-lg relative"
                    style={{ height: `${item.value}%` }}
                  ></div>
                  {/* Tooltip hiển thị khi hover */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.value}tr
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Cảnh báo Tồn kho (Safety Stock) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" /> Sắp hết hàng
          </h3>
          <div className="space-y-4">
            {lowStock.length === 0 ? (
              <p className="text-sm text-green-600 font-medium py-4 text-center">
                Kho hàng ổn định!
              </p>
            ) : (
              lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100"
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      Chỉ còn: {item.stock} {item.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickImport(item.id)}
                    className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition font-bold"
                  >
                    Nhập
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => navigate("/staff/inventory")}
            className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-primary font-medium border-t border-slate-100 transition-colors"
          >
            Xem tất cả kho hàng →
          </button>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Đã tạo phiếu nhập kho tự động!"
      />
    </div>
  );
};
