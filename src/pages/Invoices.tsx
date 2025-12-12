import React from "react";
import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FileText, ChevronRight, DollarSign } from "lucide-react";
// FIX: Import HoaDon
import { HoaDon } from "../types/schema";

export const Invoices: React.FC = () => {
  const { profile } = useAuth();

  const { data: invoices = [], isLoading } = useQuery<HoaDon[]>({
    queryKey: ["invoices", profile?.MaKH],
    queryFn: async () => {
      if (!profile?.MaKH) return [];

      const res = await invoicesApi.getAll(profile.MaKH);
      return (res as any).data || res || [];
    },
    enabled: !!profile?.MaKH,
  });

  const totalSpent = invoices.reduce(
    (sum, inv) => sum + Number(inv.TongTien),
    0
  );

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lịch sử giao dịch
            </h1>
            <p className="text-gray-500">Theo dõi chi tiêu và hóa đơn</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-4 text-green-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Tổng chi tiêu
              </p>
              <p className="text-xl font-bold text-gray-900">
                {totalSpent.toLocaleString()} đ
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              Chưa có hóa đơn nào.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-5 font-semibold text-gray-600">Mã HĐ</th>
                    <th className="p-5 font-semibold text-gray-600">
                      Ngày lập
                    </th>
                    <th className="p-5 font-semibold text-gray-600">
                      Thanh toán
                    </th>
                    <th className="p-5 font-semibold text-gray-600">
                      Trạng thái
                    </th>
                    <th className="p-5 font-semibold text-gray-600 text-right">
                      Tổng tiền
                    </th>
                    <th className="p-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.MaHD}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="p-5 font-mono font-medium text-primary">
                        #{inv.MaHD}
                      </td>
                      <td className="p-5 text-gray-700">
                        {new Date(inv.NgayLap).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-5 text-gray-700">
                        {inv.HinhThucThanhToan}
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                          Thành công
                        </span>
                      </td>
                      <td className="p-5 text-right font-bold text-gray-900 text-lg">
                        {Number(inv.TongTien).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-5 text-right">
                        <Link
                          to={`/invoices/${inv.MaHD}`}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-400 group-hover:bg-primary group-hover:text-white transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
