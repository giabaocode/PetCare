import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// FIX: Import đúng tên file mới đổi
import { invoicesApi } from "../api/invoicesApi";
import { Button } from "../components/ui/Button";
import { ArrowLeft, ShoppingBag, Stethoscope } from "lucide-react";

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      // FIX: Gọi hàm getOne đã được thêm vào API
      return await invoicesApi.getOne(Number(id));
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="p-6 text-center">Đang tải...</div>;
  if (!invoiceData) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Không tìm thấy hóa đơn này.</p>
        <Button onClick={() => navigate("/invoices")}>Quay lại</Button>
      </div>
    );
  }

  const products = invoiceData.ChiTietHoaDonSanPham || [];
  const services = invoiceData.ChiTietHoaDonDichVu || [];

  return (
    <div className="p-6 max-w-3xl mx-auto pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate("/invoices")}
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
      </Button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-gray-100 flex justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Hóa đơn điện tử
            </p>
            <h1 className="text-3xl font-bold text-primary">
              #{invoiceData.MaHD}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ngày: {new Date(invoiceData.NgayLap).toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-block mb-2">
              {invoiceData.TrangThai}
            </div>
            <p className="text-sm font-medium">
              {invoiceData.HinhThucThanhToan}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {services.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                <Stethoscope className="w-4 h-4 mr-2 text-blue-500" /> Dịch vụ
                khám
              </h3>
              {services.map((s: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm py-2 border-b border-dashed border-gray-100 last:border-0"
                >
                  <span>{s.DichVu?.TenDV}</span>
                  <span className="font-medium">
                    {Number(s.ThanhTien).toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>
          )}
          {products.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2 text-green-500" /> Thuốc &
                Vật tư
              </h3>
              {products.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm py-2 border-b border-dashed border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-slate-700">{p.SanPham?.TenSP}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      x{p.SoLuong}
                    </span>
                  </div>
                  <span className="font-medium">
                    {Number(p.ThanhTien).toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-50 p-6 border-t border-gray-100 flex justify-between items-center">
          <span className="font-bold text-lg text-slate-700">
            Tổng thanh toán
          </span>
          <span className="font-bold text-2xl text-primary">
            {Number(invoiceData.TongTien).toLocaleString()} đ
          </span>
        </div>
      </div>
    </div>
  );
};
