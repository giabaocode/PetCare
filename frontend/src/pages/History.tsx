import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { userDataApi } from "../api/user-data";
import { invoicesApi } from "../api/invoices";
import { useAuth } from "../context/AuthContext";
import { Stethoscope, Syringe, FileText, CalendarDays } from "lucide-react";

export const History: React.FC = () => {
  const [tab, setTab] = useState<"EXAM" | "VACCINE" | "INVOICE">("EXAM");
  const { profile } = useAuth();

  const exams = useQuery({
    queryKey: ["exams", profile?.MaKH],
    queryFn: () => userDataApi.getKhamBenh(profile?.MaKH!).then((r) => r.data),
    enabled: !!profile?.MaKH,
  });
  const vaccines = useQuery({
    queryKey: ["vaccines", profile?.MaKH],
    queryFn: () => userDataApi.getTiemPhong(profile?.MaKH!).then((r) => r.data),
    enabled: !!profile?.MaKH,
  });
  const invoices = useQuery({
    queryKey: ["invoices", profile?.MaKH],
    queryFn: () => invoicesApi.getAll(profile?.MaKH!).then((r) => r.data),
    enabled: !!profile?.MaKH,
  });

  const tabs = [
    {
      id: "EXAM",
      label: "Khám bệnh",
      icon: Stethoscope,
      color: "text-blue-500 bg-blue-50",
    },
    {
      id: "VACCINE",
      label: "Tiêm phòng",
      icon: Syringe,
      color: "text-green-500 bg-green-50",
    },
    {
      id: "INVOICE",
      label: "Hóa đơn",
      icon: FileText,
      color: "text-orange-500 bg-orange-50",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Lịch sử hoạt động
      </h1>

      {/* Tabs Styled */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                isActive
                  ? `border-primary bg-white shadow-md`
                  : "border-transparent bg-white/50 hover:bg-white"
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${t.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span
                className={`font-bold ${
                  isActive ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline Content */}
      <div className="space-y-6">
        {/* EXAMS */}
        {tab === "EXAM" &&
          exams.data?.map((i: any) => (
            <div key={i.MaDV} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>
                <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-800">
                    {new Date(i.NgayKham).toLocaleDateString("vi-VN")}
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-medium">
                    Khám bệnh
                  </span>
                </div>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium text-gray-900">
                    Triệu chứng:
                  </span>{" "}
                  {i.TrieuChung}
                </p>
                {i.ChanDoan && (
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">
                      Chẩn đoán:
                    </span>{" "}
                    {i.ChanDoan}
                  </p>
                )}
              </div>
            </div>
          ))}

        {/* VACCINES */}
        {tab === "VACCINE" &&
          vaccines.data?.map((i: any) => (
            <div key={i.MaDV} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>
                <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex-1 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-800">
                    {new Date(i.NgayTiem).toLocaleDateString("vi-VN")}
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                    Tiêm phòng
                  </span>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Liều lượng:</span>{" "}
                  {i.LieuLuong || "Tiêu chuẩn"}
                </p>
              </div>
            </div>
          ))}

        {/* INVOICES */}
        {tab === "INVOICE" &&
          invoices.data?.map((i: any) => (
            <div
              key={i.MaHD}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-primary/30 transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    Hóa đơn #{i.MaHD}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    {new Date(i.NgayLap).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-primary">
                  {Number(i.TongTien).toLocaleString()} đ
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {i.HinhThucThanhToan}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
