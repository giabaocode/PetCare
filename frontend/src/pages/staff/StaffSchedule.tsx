import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import {
  Search,
  Play,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { servicesApi } from "../../api/services";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const StaffSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["staff-bookings", profile?.MaCN, page, debouncedSearch],
    queryFn: async () => {
      const res = await servicesApi.getBranchAppointments({
        page,
        limit,
        search: debouncedSearch,
      });

      if (res.data && res.pagination) return res;
      return {
        data: Array.isArray(res) ? res : [],
        pagination: { totalPages: 1 },
      };
    },
    refetchInterval: 15000,
  });

  const appointments = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const formatTime = (isoString: string) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="p-6 h-full flex flex-col fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch làm việc</h1>
          <p className="text-slate-500 text-sm">
            Khu vực:{" "}
            <span className="font-bold text-primary">
              {profile?.TenCN || "Chi nhánh"}
            </span>
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none w-64 focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Tìm tên khách, thú cưng..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
          {searchTerm !== debouncedSearch && (
            <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-primary" />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-primary" />
              <p>Đang tải lịch hẹn...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-sm font-semibold text-slate-600">
                    Thời gian
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600">
                    Khách hàng
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600">
                    Dịch vụ
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600">
                    Bác sĩ
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600">
                    Trạng thái
                  </th>
                  <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-12 text-center text-slate-400 italic"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="w-10 h-10 text-slate-200" />
                        <span>Chưa có lịch hẹn nào phù hợp.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt: any) => (
                    <tr
                      key={apt.MaLichHen}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-lg font-mono">
                            {formatTime(apt.ThoiGianHen)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(apt.ThoiGianHen)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">
                          {apt.TenKhachHang}
                        </p>
                        <p className="text-xs text-slate-500">
                          {apt.TenTC} <span className="text-slate-300">|</span>{" "}
                          {apt.LoaiTC}
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            apt.LoaiDichVu === "Tiêm phòng"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {apt.LoaiDichVu}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {apt.TenBacSi || "---"}
                      </td>
                      <td className="p-4">
                        {/* Logic hiển thị trạng thái giữ nguyên */}
                        {apt.TrangThai === "WAITING" && (
                          <span className="text-orange-500 font-bold text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            Chờ khám
                          </span>
                        )}
                        {apt.TrangThai === "COMPLETED" && (
                          <span className="text-green-600 font-bold text-xs">
                            ✓ Hoàn thành
                          </span>
                        )}
                        {apt.TrangThai === "PENDING" && (
                          <span className="text-gray-400 font-bold text-xs">
                            Chưa đến
                          </span>
                        )}
                        {apt.TrangThai === "CANCELLED" && (
                          <span className="text-red-400 font-bold text-xs">
                            Đã hủy
                          </span>
                        )}
                        {apt.TrangThai === "WAITING_PAYMENT" && (
                          <span className="text-blue-500 font-bold text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Chờ thanh toán
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {apt.TrangThai !== "COMPLETED" &&
                        apt.TrangThai !== "CANCELLED" &&
                        apt.TrangThai !== "WAITING_PAYMENT" ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(`/staff/exam/${apt.MaLichHen}`)
                            }
                            className={
                              apt.TrangThai === "WAITING"
                                ? "shadow-md shadow-primary/20 animate-pulse"
                                : "opacity-80 hover:opacity-100"
                            }
                          >
                            <Play className="w-3 h-3 mr-1" /> Khám
                          </Button>
                        ) : (
                          <span className="text-slate-300 text-xs italic">
                            Không khả dụng
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Trước
            </Button>
            <span className="text-sm text-gray-600 font-medium">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              size="sm"
            >
              Sau <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
