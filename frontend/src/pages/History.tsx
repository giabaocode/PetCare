import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "../api/services";
import { invoicesApi } from "../api/invoicesApi";
import { useAuth } from "../context/AuthContext";
import {
  Stethoscope,
  Syringe,
  FileText,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { Button } from "../components/ui/Button";

export const History: React.FC = () => {
  const [tab, setTab] = useState<"UPCOMING" | "COMPLETED" | "INVOICE">(
    "UPCOMING"
  );
  const { profile } = useAuth();

  const { data: appointments = [], isLoading: isLoadingApt } = useQuery({
    queryKey: ["my-appointments", profile?.MaKH],
    queryFn: async () => {
      const res = await servicesApi.getMyAppointments();
      return (res as any).data || res || [];
    },
    enabled: !!profile?.MaKH,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices", profile?.MaKH],
    queryFn: async () => {
      const res = await invoicesApi.getAll();
      return (res as any).data || res || [];
    },
    enabled: !!profile?.MaKH,
  });

  const upcomingList = appointments.filter((a: any) =>
    ["PENDING", "CONFIRMED", "WAITING", "WAITING_PAYMENT"].includes(a.TrangThai)
  );

  const completedList = appointments.filter((a: any) =>
    ["COMPLETED", "CANCELLED"].includes(a.TrangThai)
  );

  const tabs = [
    {
      id: "UPCOMING",
      label: "Sắp tới",
      icon: Clock,
      count: upcomingList.length,
    },
    { id: "COMPLETED", label: "Lịch sử khám", icon: CheckCircle2, count: 0 },
    { id: "INVOICE", label: "Hóa đơn", icon: FileText, count: 0 },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold">
            Chờ xác nhận
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold">
            Đã xác nhận
          </span>
        );
      case "WAITING":
        return (
          <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold">
            Đang chờ khám
          </span>
        );
      case "WAITING_PAYMENT":
        return (
          <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs font-bold">
            Chờ thanh toán
          </span>
        );
      case "COMPLETED":
        return (
          <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
            Hoàn thành
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Hồ sơ sức khỏe</h1>

      {/* Tabs Header */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all text-sm whitespace-nowrap",
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full ml-1">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* TAB UPCOMING */}
        {tab === "UPCOMING" && (
          <div>
            {upcomingList.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Bạn không có lịch hẹn nào sắp tới.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = "/booking")}
                >
                  Đặt lịch ngay
                </Button>
              </div>
            ) : (
              upcomingList.map((item: any) => (
                <div
                  key={item.MaLichHen}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 hover:border-primary/30 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          item.LoaiDichVu === "VACCINATION"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {item.LoaiDichVu === "VACCINATION" ? (
                          <Syringe className="w-5 h-5" />
                        ) : (
                          <Stethoscope className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.TenTC || "Thú cưng"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.LoaiDichVu === "VACCINATION"
                            ? "Tiêm phòng"
                            : "Khám bệnh"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(item.TrangThai)}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-slate-800">
                        {new Date(item.ThoiGianHen).toLocaleString("vi-VN", {
                          dateStyle: "full",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">Phòng khám:</span>
                      <span>{item.TenCN}</span>
                    </div>
                    {item.TenBacSi && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">Bác sĩ:</span>
                        <span>{item.TenBacSi}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB COMPLETED */}
        {tab === "COMPLETED" && (
          <div>
            {completedList.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Chưa có lịch sử khám.
              </p>
            ) : (
              completedList.map((item: any) => (
                <div
                  key={item.MaLichHen}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 opacity-75 hover:opacity-100 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-slate-700">{item.TenTC}</div>
                    {getStatusBadge(item.TrangThai)}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {new Date(item.ThoiGianHen).toLocaleDateString("vi-VN")}
                  </div>
                  {(item.ChanDoan || item.TrieuChung) && (
                    <div className="text-sm bg-gray-50 p-2 rounded-lg italic">
                      "{item.ChanDoan || item.TrieuChung}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB INVOICE */}
        {tab === "INVOICE" &&
          invoices.map((i: any) => (
            <div
              key={i.MaHD || i.MaHoaDon}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-primary/30 transition cursor-pointer"
              onClick={() =>
                (window.location.href = `/invoices/${i.MaHD || i.MaHoaDon}`)
              }
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    #{(i.MaHD || i.MaHoaDon || "").slice(0, 8)}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    {new Date(i.NgayLap).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-primary">
                  {Number(i.TongTien).toLocaleString()} đ
                </div>
                <div
                  className={`text-[10px] font-bold mt-1 ${
                    i.TrangThai === "PAID"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {i.TrangThai === "PAID" ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
