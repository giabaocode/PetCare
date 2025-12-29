import React, { useState } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  Loader2,
  PackagePlus,
  BarChart3,
} from "lucide-react";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../../api/dashboardApi";
import { productsApi } from "../../api/productApi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const StaffDashboard: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    data: stats = { revenue: 0, appointments: 0, newPatients: 0 },
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ["dashboard-stats", profile?.MaCN],
    queryFn: async () => {
      if (!profile?.MaCN)
        return { revenue: 0, appointments: 0, newPatients: 0 };

      const res = await dashboardApi.getStats(profile.MaCN, "STAFF");
      return res.data || { revenue: 0, appointments: 0, newPatients: 0 };
    },
    enabled: !!profile?.MaCN,
    refetchInterval: 60000,
  });

  const { data: chartData = [], isLoading: isLoadingChart } = useQuery({
    queryKey: ["dashboard-chart", profile?.MaCN],
    queryFn: async () => {
      if (!profile?.MaCN) return [];
      const res = await dashboardApi.getChartData(profile.MaCN);
      return res.data || res || [];
    },
    enabled: !!profile?.MaCN,
  });

  const { data: inventoryRes, isLoading: isLoadingInventory } = useQuery({
    queryKey: ["inventory-warning", profile?.MaCN],
    queryFn: async () => await productsApi.getAll({ limit: 1000 }),
    enabled: !!profile?.MaCN,
  });

  const inventoryList = Array.isArray(inventoryRes)
    ? inventoryRes
    : inventoryRes?.data || [];

  const lowStockItems = inventoryList.filter((item: any) => {
    const currentStock = Number(item.SoLuongTon || 0);
    const minStock = Number(item.MucTonToiThieu || 10);
    return currentStock <= minStock;
  });

  const importMutation = useMutation({
    mutationFn: (id: string) =>
      productsApi.importStock({ productId: id, quantity: 10 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-warning"] });
      setShowSuccess(true);
    },
  });

  if (!profile)
    return <div className="p-10 text-center">Đang tải thông tin...</div>;

  return (
    <div className="space-y-6 pb-20 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Tổng quan chi nhánh
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Nhân viên:{" "}
            <span className="font-semibold text-primary">{profile.HoTen}</span>{" "}
            • {profile.TenCN || "Chi nhánh chính"}
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-slate-600 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Doanh thu</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {isLoadingStats
                  ? "..."
                  : Number(stats.revenue).toLocaleString("vi-VN")}{" "}
                <span className="text-sm font-normal text-gray-500">VNĐ</span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng lịch hẹn</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {isLoadingStats ? "..." : stats.appointments}{" "}
                <span className="text-sm font-normal text-gray-500">ca</span>
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Tổng khách hàng
              </p>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {isLoadingStats ? "..." : stats.newPatients}{" "}
                <span className="text-sm font-normal text-gray-500">người</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KHU VỰC BIỂU ĐỒ & CẢNH BÁO */}
      <div className="grid md:grid-cols-3 gap-6 h-full">
        {/* 1. BIỂU ĐỒ */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[400px]">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Doanh thu gần đây
          </h3>

          <div className="flex-1 w-full min-h-[300px]">
            {isLoadingChart ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
                <p>Chưa có dữ liệu doanh thu</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="Ngay"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                    tickFormatter={(value: any) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value: any) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString()} đ`,
                      "Doanh thu",
                    ]}
                  />
                  <Bar
                    dataKey="TongDoanhThu"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill="#3b82f6" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. CẢNH BÁO TỒN KHO */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Cảnh báo tồn kho
            <span className="ml-auto text-xs font-normal bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              {lowStockItems.length}
            </span>
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px] max-h-[400px]">
            {isLoadingInventory ? (
              <div className="flex justify-center py-8 text-gray-400">
                <Loader2 className="animate-spin" />
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-center py-10">
                <PackagePlus className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Kho hàng đang ổn định.</p>
              </div>
            ) : (
              lowStockItems.map((item: any) => (
                <div
                  key={item.MaSP}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100"
                >
                  <div className="min-w-0 pr-2">
                    <p
                      className="font-bold text-slate-700 text-sm truncate"
                      title={item.TenSP}
                    >
                      {item.TenSP}
                    </p>
                    <span className="text-[10px] font-bold bg-white text-red-600 px-2 py-0.5 rounded border border-red-200 mt-1 inline-block">
                      Còn: {item.SoLuongTon}
                    </span>
                  </div>
                  <button
                    onClick={() => importMutation.mutate(item.MaSP)}
                    disabled={importMutation.isPending}
                    className="p-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    {importMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PackagePlus className="w-4 h-4" />
                    )}
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
        message="Đã tạo phiếu nhập kho thành công (+10 sản phẩm)!"
      />
    </div>
  );
};
