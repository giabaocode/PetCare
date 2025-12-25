import React, { useState, useEffect } from "react";
// ... (Các import icon giữ nguyên)
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
// IMPORT DATA PROVIDER
import {
  getSharedAppointments,
  getSharedInventory,
} from "../../utils/dataProvider";

// ... (Giữ nguyên BASE_CHART_DATA)
const BASE_CHART_DATA = [
  { day: "CN", service: 2500000, retail: 1500000 },
  { day: "T2", service: 1200000, retail: 500000 },
  { day: "T3", service: 1800000, retail: 800000 },
  { day: "T4", service: 1500000, retail: 1200000 },
  { day: "T5", service: 2500000, retail: 1000000 },
  { day: "T6", service: 2000000, retail: 1500000 },
  { day: "T7", service: 3500000, retail: 2500000 },
];

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lowStock, setLowStock] = useState<any[]>([]); // Không dùng INITIAL_LOW_STOCK nữa
  const [showSuccess, setShowSuccess] = useState(false);

  // ... (State chartData, realStats giữ nguyên)
  const [realStats, setRealStats] = useState({
    revenue: 0,
    appointments: 0,
    newPatients: 0,
  });
  const [chartData, setChartData] = useState<any[]>(BASE_CHART_DATA);

  // 1. TÍNH TOÁN DỮ LIỆU APPOINTMENT (Giữ nguyên logic cũ)
  const calculateRealData = () => {
    const appointments = getSharedAppointments();
    let todayRevenue = 0;
    let todayAppts = 0;
    let todayNew = 0;

    if (Array.isArray(appointments)) {
      appointments.forEach((apt: any) => {
        if (apt.paymentStatus === "PAID") {
          const amount = apt.actualAmount ? Number(apt.actualAmount) : 500000;
          todayRevenue += amount;
        }
        if (apt.status !== "CANCELLED") todayAppts++;
        if (apt.id && apt.id.toString().includes("WALK-IN")) todayNew++;
      });
    }

    setRealStats({
      revenue: todayRevenue,
      appointments: todayAppts,
      newPatients: todayNew,
    });

    const currentDayIndex = new Date().getDay();
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const currentDayLabel = days[currentDayIndex];

    const updatedChartData = BASE_CHART_DATA.map((d) => {
      if (d.day === currentDayLabel) {
        return {
          ...d,
          service: todayRevenue > 0 ? todayRevenue * 0.7 : d.service,
          retail: todayRevenue > 0 ? todayRevenue * 0.3 : d.retail,
        };
      }
      return d;
    });
    setChartData(updatedChartData);
  };

  // 2. HÀM MỚI: TÍNH TOÁN TỒN KHO THẤP
  const calculateLowStock = () => {
    const inventory = getSharedInventory();
    // Lọc ra các sản phẩm có stock <= minStock
    const low = inventory.filter((item: any) => {
      const min = item.minStock || 10;
      return item.stock <= min;
    });
    setLowStock(low);
  };

  useEffect(() => {
    calculateRealData();
    calculateLowStock(); // Gọi ngay lần đầu

    const handleUpdate = () => {
      calculateRealData();
      calculateLowStock(); // Gọi khi có update
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("local-storage-update", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("local-storage-update", handleUpdate);
    };
  }, []);

  const handleQuickImport = (id: string) => {
    // Logic mới: Tăng tồn kho thực tế lên 10 đơn vị
    const inventory = getSharedInventory();
    const updatedInventory = inventory.map((item: any) =>
      item.id === id
        ? { ...item, stock: item.stock + 10, status: "In Stock" }
        : item
    );

    // Lưu lại vào localStorage và bắn sự kiện
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
      {/* ... Giữ nguyên phần Header và Cards ... */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tổng quan Chi nhánh
          </h1>
          <p className="text-slate-500 text-sm">Số liệu kinh doanh hôm nay</p>
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
        {/* ... Giữ nguyên phần Biểu đồ ... */}
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
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    Tổng: {(total / 1000000).toFixed(1)} tr
                  </div>
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

        {/* 3. CẢNH BÁO TỒN KHO (Đã cập nhật logic lấy từ state lowStock) */}
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
