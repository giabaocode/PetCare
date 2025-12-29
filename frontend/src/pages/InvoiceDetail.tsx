import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoicesApi";
import { Button } from "../components/ui/Button";
import {
  ArrowLeft,
  ShoppingBag,
  Stethoscope,
  FileText,
  Calendar,
} from "lucide-react";

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      return await invoicesApi.getOne(id as string);
    },
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">Đang tải chi tiết...</div>
    );

  if (!invoiceData) {
    return (
      <div className="p-10 text-center bg-gray-50 m-6 rounded-xl border border-dashed">
        <p className="mb-4 text-gray-500">Không tìm thấy hóa đơn này.</p>
        <Button onClick={() => navigate("/invoices")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const products = invoiceData.ChiTietHoaDonSanPham || [];
  const services = invoiceData.ChiTietHoaDonDichVu || [];

  const displayId = invoiceData.MaHoaDon || invoiceData.MaHD;

  return (
    <div className="p-6 max-w-3xl mx-auto pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate("/invoices")}
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
      </Button>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-white p-8 border-b border-gray-100 flex justify-between relative">
          <div className="relative z-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Hóa đơn điện tử
            </p>
            <h1 className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6" /> #
              {displayId ? displayId.slice(0, 8) : "..."}...
            </h1>
            <p className="text-sm text-slate-500 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(invoiceData.NgayLap).toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="text-right relative z-10">
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-bold inline-block mb-2 ${
                invoiceData.TrangThai === "PAID"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {invoiceData.TrangThai === "PAID"
                ? "ĐÃ THANH TOÁN"
                : "CHƯA THANH TOÁN"}
            </div>
            {invoiceData.TenCN && (
              <p className="text-xs font-medium text-slate-400 mt-1">
                {invoiceData.TenCN}
              </p>
            )}
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Dịch vụ */}
          {services.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-gray-100">
                <Stethoscope className="w-5 h-5 mr-2 text-blue-500" /> Dịch vụ
                khám
              </h3>
              <div className="space-y-3">
                {services.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm items-center"
                  >
                    <span className="text-slate-700 font-medium">
                      {s.DichVu?.TenDV}
                    </span>
                    <span className="font-bold text-slate-900">
                      {Number(s.ThanhTien).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thuốc */}
          {products.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-4 flex items-center pb-2 border-b border-gray-100">
                <ShoppingBag className="w-5 h-5 mr-2 text-green-500" /> Thuốc &
                Vật tư
              </h3>
              <div className="space-y-3">
                {products.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between text-sm items-center"
                  >
                    <div>
                      <span className="text-slate-700 font-medium block">
                        {p.SanPham?.TenSP}
                      </span>
                      <span className="text-xs text-slate-400">
                        Số lượng: x{p.SoLuong}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {Number(p.ThanhTien).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-8 border-t border-gray-100 flex justify-between items-center">
          <span className="font-bold text-lg text-slate-600">
            Tổng thanh toán
          </span>
          <span className="font-bold text-3xl text-primary">
            {Number(invoiceData.TongTien).toLocaleString()} đ
          </span>
        </div>
      </div>
    </div>
  );
};
