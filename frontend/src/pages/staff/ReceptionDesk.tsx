import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  DollarSign,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";

import { servicesApi } from "../../api/services";
import { invoicesApi } from "../../api/invoicesApi";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const ReceptionDesk: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [walkInGuest, setWalkInGuest] = useState({
    name: "",
    phone: "",
    petName: "Chưa đặt tên",
    petType: "Chó",
    service: "EXAMINATION",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reception-queue", profile?.MaCN, page, debouncedSearch],
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
    refetchInterval: 10000,
  });

  const queue = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-700";
      case "WAITING_PAYMENT":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleOpenPayment = async (bookingId: string) => {
    try {
      const invoice = await invoicesApi.getByBookingId(bookingId);
      setSelectedInvoice(invoice);
      setShowPaymentModal(true);
    } catch (error) {
      alert("Chưa tìm thấy hóa đơn. Vui lòng đợi bác sĩ hoàn tất.");
    }
  };

  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInvoice) return;
      return await invoicesApi.payInvoice(selectedInvoice.MaHD);
    },
    onSuccess: () => {
      setShowPaymentModal(false);
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["reception-queue"] });
    },
    onError: (err: any) => {
      alert("Lỗi thanh toán: " + (err.response?.data?.error || err.message));
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (id: string) => {
      return await servicesApi.updateStatus(id, "WAITING");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reception-queue"] });
    },
  });

  const handleAddWalkIn = async () => {
    console.log(walkInGuest);
    setShowAddModal(false);
    setShowSuccess(true);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 fade-in">
      {/* Header Toolbar */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm tên khách, SĐT hoặc Mã lịch hẹn..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
            {searchTerm !== debouncedSearch && (
              <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="w-5 h-5 mr-2" /> Khách vãng lai
        </Button>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-auto p-6 flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="text-center py-20 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                Đang tải dữ liệu...
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-gray-500 text-sm uppercase font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-4 pl-6">Thông tin Khách hàng</th>
                    <th className="p-4">Thú cưng</th>
                    <th className="p-4">Dịch vụ & Bác sĩ</th>
                    <th className="p-4">Giờ hẹn</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right pr-6">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queue.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-gray-400"
                      >
                        Không tìm thấy lịch hẹn.
                      </td>
                    </tr>
                  ) : (
                    queue.map((item: any) => (
                      <tr
                        key={item.MaLichHen}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="p-4 pl-6">
                          <div className="font-bold text-gray-900">
                            {item.TenKhachHang}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.SDTKhachHang || item.SDT}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-800">
                            {item.TenTC}
                          </div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit mt-1">
                            {item.LoaiTC || item.Loai} - {item.Giong}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-primary">
                            {item.LoaiDichVu === "EXAMINATION"
                              ? "Khám bệnh"
                              : item.LoaiDichVu}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-0.5">
                            BS. {item.TenBacSi || "Chưa chỉ định"}
                          </div>
                        </td>
                        <td className="p-4">
                          {new Date(item.ThoiGianHen).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                              item.TrangThai
                            )}`}
                          >
                            {item.TrangThai}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {item.TrangThai === "PENDING" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                checkInMutation.mutate(item.MaLichHen)
                              }
                              isLoading={checkInMutation.isPending}
                            >
                              Check-in
                            </Button>
                          )}
                          {item.TrangThai === "WAITING_PAYMENT" && (
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                              onClick={() => handleOpenPayment(item.MaLichHen)}
                            >
                              <DollarSign className="w-4 h-4 mr-1" /> Thanh toán
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
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

      {/* Modal Payment (Giữ nguyên) */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Xác nhận thanh toán"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
              <p className="text-gray-500 mb-1">Tổng tiền cần thanh toán</p>
              <h2 className="text-3xl font-bold text-primary">
                {Number(selectedInvoice.TongTien).toLocaleString()} đ
              </h2>
            </div>
            <div className="pt-4 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                Hủy
              </Button>
              <Button
                className="flex-[2] bg-green-600 hover:bg-green-700"
                onClick={() => confirmPaymentMutation.mutate()}
                isLoading={confirmPaymentMutation.isPending}
              >
                <CreditCard className="w-4 h-4 mr-2" /> Xác nhận đã thu tiền
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Success & Add (Giữ nguyên) */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Thao tác thành công!"
      />
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tiếp nhận Khách vãng lai"
      >
        {/* Nội dung form giữ nguyên */}
        <div className="p-4 text-center">
          Tính năng đang cập nhật...{" "}
          <Button onClick={() => setShowAddModal(false)}>Đóng</Button>
        </div>
      </Modal>
    </div>
  );
};
