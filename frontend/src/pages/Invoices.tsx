import React from "react";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { invoicesApi } from "../api/invoicesApi";
import { FileText, Calendar, ChevronRight } from "lucide-react";

export const Invoices: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      return await invoicesApi.getAll();
    },

    enabled: !!profile,
  });

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải danh sách hóa đơn...
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Lịch sử thanh toán
      </h1>

      {invoices.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-xl shadow-sm border border-dashed">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-slate-500">Bạn chưa có hóa đơn nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv: any) => {
            const invoiceId = inv.MaHoaDon || inv.MaHD;

            return (
              <div
                key={invoiceId}
                onClick={() => navigate(`/invoices/${invoiceId}`)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      Hóa đơn #{invoiceId ? invoiceId.slice(0, 8) : "..."}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 mt-1 gap-3">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />{" "}
                        {new Date(inv.NgayLap).toLocaleDateString("vi-VN")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.TrangThai === "PAID"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {inv.TrangThai === "PAID"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </span>
                      {inv.TenCN && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                          {inv.TenCN}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primary text-lg">
                    {Number(inv.TongTien).toLocaleString()} đ
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
