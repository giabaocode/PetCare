import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Printer, ShoppingBag, Stethoscope } from "lucide-react";

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Gọi API lấy chi tiết (API này trả về mảng, lấy phần tử đầu tiên)
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoicesApi.getOne(Number(id)).then((r) => r.data[0]),
    enabled: !!id,
  });

  if (isLoading)
    return <div className="p-6 text-center">Đang tải chi tiết...</div>;
  if (!invoiceData)
    return <div className="p-6 text-center">Không tìm thấy hóa đơn.</div>;

  // Supabase trả về nested data dưới dạng property tên bảng
  // Lưu ý: Tên property phụ thuộc vào cách bạn define relation trong Supabase
  // Giả định: ChiTietHoaDonSanPham, ChiTietHoaDonDichVu
  const products = invoiceData.ChiTietHoaDonSanPham || [];
  const services = invoiceData.ChiTietHoaDonDichVu || [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/invoices")}
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
      </Button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header Hóa đơn */}
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">
              Hóa đơn thanh toán
            </p>
            <h1 className="text-3xl font-bold text-primary mt-1">
              #{invoiceData.MaHD}
            </h1>
            <p className="text-gray-600 mt-2">
              Ngày lập: {new Date(invoiceData.NgayLap).toLocaleString("vi-VN")}
            </p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
              Đã thanh toán
            </span>
            <p className="mt-2 text-sm text-gray-500">
              {invoiceData.HinhThucThanhToan}
            </p>
          </div>
        </div>

        {/* Nội dung chi tiết */}
        <div className="p-6 space-y-8">
          {/* Danh sách Dịch vụ */}
          {services.length > 0 && (
            <div>
              <h3 className="flex items-center font-bold text-gray-800 mb-3 pb-2 border-b">
                <Stethoscope className="w-4 h-4 mr-2 text-secondary" /> Dịch vụ
                sử dụng
              </h3>
              <div className="space-y-3">
                {services.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      {/* Cần join bảng DichVu để lấy tên, hoặc Supabase return nested obj */}
                      <span className="font-medium text-gray-700">
                        {item.DichVu?.TenDV || `Dịch vụ #${item.MaDV}`}
                      </span>
                      <div className="text-xs text-gray-400">
                        x{item.SoLuong}
                      </div>
                    </div>
                    <span className="font-medium">
                      {Number(item.ThanhTien).toLocaleString()} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danh sách Sản phẩm */}
          {products.length > 0 && (
            <div>
              <h3 className="flex items-center font-bold text-gray-800 mb-3 pb-2 border-b">
                <ShoppingBag className="w-4 h-4 mr-2 text-blue-500" /> Sản phẩm
                mua lẻ
              </h3>
              <div className="space-y-3">
                {products.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-700">
                        {item.SanPham?.TenSP || `Sản phẩm #${item.MaSP}`}
                      </span>
                      <div className="text-xs text-gray-400">
                        x{item.SoLuong}
                      </div>
                    </div>
                    <span className="font-medium">
                      {Number(item.ThanhTien).toLocaleString()} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Tổng tiền */}
        <div className="bg-gray-50 p-6 border-t border-gray-100">
          <div className="flex justify-between items-center text-lg">
            <span className="font-bold text-gray-700">Tổng cộng</span>
            <span className="font-bold text-2xl text-primary">
              {Number(invoiceData.TongTien).toLocaleString("vi-VN")} đ
            </span>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> In hóa đơn
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; // Invoice detail
