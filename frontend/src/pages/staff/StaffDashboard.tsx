import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { getSharedInventory } from "../../utils/dataProvider";
import { dashboardApi } from "../../api/dashboardApi";
const BASE_CHART_DATA = [
  { day: "CN", service: 1200000, retail: 500000 },
  { day: "T2", service: 1500000, retail: 300000 },
  { day: "T3", service: 1800000, retail: 800000 },
  { day: "T4", service: 2200000, retail: 600000 },
  { day: "T5", service: 1700000, retail: 400000 },
  { day: "T6", service: 2500000, retail: 900000 },
  { day: "T7", service: 3000000, retail: 1200000 },
];

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [realStats, setRealStats] = useState({
    revenue: 0,
    appointments: 0,
    newPatients: 0,
  });
  const [chartData, setChartData] = useState<any[]>(BASE_CHART_DATA);

  const calculateRealData = async () => {
    // GỌI API DASHBOARD (Gọn hơn rất nhiều)
    const stats = await dashboardApi.getStats(
      profile?.MaCN || "CN01",
      profile?.Role || "STAFF"
    );
    setRealStats(stats);

    // CẬP NHẬT BIỂU ĐỒ
    const currentDayIndex = new Date().getDay();
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const currentDayLabel = days[currentDayIndex];
    const updatedChartData = BASE_CHART_DATA.map((d) => {
      if (d.day === currentDayLabel) {
        return {
          ...d,
          service: stats.revenue * 0.7,
          retail: stats.revenue * 0.3,
        };
      }
      return d;
    });
    setChartData(updatedChartData);
  };

  const calculateLowStock = () => {
    const inventory = getSharedInventory();
    const low = inventory.filter((item: any) => {
      const min = item.minStock || 10;
      return item.stock <= min;
    });
    setLowStock(low);
  };

  useEffect(() => {
    calculateRealData();
    calculateLowStock();
    const handleUpdate = () => {
      calculateRealData();
      calculateLowStock();
    };
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("local-storage-update", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("local-storage-update", handleUpdate);
    };
  }, [profile]);

  const handleQuickImport = (id: string) => {
    const inventory = getSharedInventory();
    const updatedInventory = inventory.map((item: any) =>
      item.id === id
        ? { ...item, stock: item.stock + 10, status: "In Stock" }
        : item
    );
    localStorage.setItem("pcx_inventory", JSON.stringify(updatedInventory));
    window.dispatchEvent(new Event("local-storage-update"));
    setShowSuccess(true);
  };

  const maxChartValue = Math.max(
    ...chartData.map((d) => d.service + d.retail),
    1000000
  );

  return (
    <div className="pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tổng quan Chi nhánh
          </h1>
          <p className="text-slate-500 text-sm">
            {profile?.MaCN === "CN01"
              ? "PetCare Quận 1"
              : profile?.MaCN === "CN02"
              ? "PetCare Quận 7"
              : "Toàn hệ thống"}{" "}
            • Số liệu hôm nay
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="p-3 rounded-xl border bg-green-50 text-green-600 border-green-100">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Doanh thu hôm nay
          </p>
          <h3 className="text-2xl font-bold text-slate-800">
            {realStats.revenue.toLocaleString()} đ
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="p-3 rounded-xl border bg-blue-50 text-blue-600 border-blue-100">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Tổng lịch hẹn</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {realStats.appointments}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="p-3 rounded-xl border bg-purple-50 text-purple-600 border-purple-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Khách vãng lai</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {realStats.newPatients}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="p-3 rounded-xl border bg-red-50 text-red-600 border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Cảnh báo tồn kho</p>
          <h3 className="text-2xl font-bold text-slate-800">
            {lowStock.length} SP
          </h3>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Biểu đồ tuần
            </h3>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>{" "}
                Dịch vụ
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>{" "}
                Bán lẻ
              </div>
            </div>
          </div>
          <div
            className="flex items-end justify-between gap-4 px-2 mt-auto border-b border-gray-100 pb-2"
            style={{ height: "300px" }}
          >
            {chartData.map((item, idx) => {
              const total = item.service + item.retail;
              const servicePct = (item.service / maxChartValue) * 100;
              const retailPct = (item.retail / maxChartValue) * 100;
              const todayLabel = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][
                new Date().getDay()
              ];
              const isToday = item.day === todayLabel;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 flex-1 group relative cursor-pointer"
                  style={{ height: "100%" }}
                >
                  <div
                    className={`w-full max-w-[40px] h-full flex flex-col justify-end relative rounded-t-lg overflow-hidden bg-slate-50 ${
                      isToday ? "ring-2 ring-blue-300" : ""
                    }`}
                  >
                    <div
                      style={{ height: `${retailPct}%` }}
                      className="w-full bg-orange-500 opacity-90 hover:opacity-100 transition-all"
                    ></div>
                    <div
                      style={{ height: `${servicePct}%` }}
                      className="w-full bg-blue-600 hover:bg-blue-700 transition-all"
                    ></div>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isToday ? "text-blue-600" : "text-slate-400"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-orange-500" /> Sắp hết hàng
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {lowStock.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Kho hàng ổn định
              </div>
            ) : (
              lowStock.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-red-50/50 rounded-xl border border-red-100 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {item.name}
                    </p>
                    <span className="text-xs font-bold text-red-600">
                      Còn {item.stock} {item.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickImport(item.id)}
                    className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded font-bold"
                  >
                    Nhập (+10)
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Đã nhập thêm 10 sản phẩm vào kho!"
      />
    </div>
  );
};
