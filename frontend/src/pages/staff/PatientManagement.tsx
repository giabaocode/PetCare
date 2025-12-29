import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { usersApi } from "../../api/userApi";
import { authApi } from "../../api/authApi";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export const PatientManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    email: "",
    password: "123",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["patients", page, debouncedSearch],
    queryFn: async () => {
      const res = await usersApi.getAll({
        page,
        limit,
        search: debouncedSearch,
        type: "KH",
      });

      if (res.data && res.pagination) {
        return res;
      }
      return {
        data: Array.isArray(res) ? res : [],
        pagination: { totalPages: 1 },
      };
    },
  });

  const patients = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: async () => {
      return await authApi.register({
        HoTen: newPatient.name,
        SDT: newPatient.phone,
        Email: newPatient.email,
        password: newPatient.password,
        GioiTinh: "Khác",

        CCCD: "",
        NgaySinh: "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setIsAddOpen(false);
      setShowSuccess(true);
      setNewPatient({ name: "", phone: "", email: "", password: "123" });
    },
    onError: (err: any) => {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    },
  });

  const handleAdd = () => {
    createMutation.mutate();
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản lý bệnh nhân
          </h1>
          <p className="text-slate-500">
            Danh sách khách hàng đã đăng ký hệ thống
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Thêm bệnh nhân
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
          className="flex-1 outline-none text-slate-700 placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
        {/* Loading chỉ hiện khi đang tìm kiếm */}
        {searchTerm !== debouncedSearch && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Liên hệ</th>
                  <th className="p-4">Hạng hội viên</th>
                  <th className="p-4 text-center">Điểm</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.length > 0 ? (
                  patients.map((p: any) => (
                    <tr
                      key={p.MaND}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-800">
                          {p.HoTen}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: {p.MaND.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                          <Phone className="w-3 h-3" /> {p.SDT}
                        </div>
                        {p.Email && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="w-3 h-3" /> {p.Email}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold border border-purple-100">
                          {p.TenHang || "Thành viên"}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-primary">
                        {p.DiemTichLuy || 0}
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                        <p>Không tìm thấy khách hàng nào.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
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
          </>
        )}
      </div>

      {/* Modal Add */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Thêm khách hàng mới"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-700 mb-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Lưu ý:</p>
              <p>
                Mật khẩu mặc định cho khách hàng mới sẽ là{" "}
                <span className="font-mono font-bold">123</span>.
              </p>
            </div>
          </div>

          <Input
            label="Họ tên"
            value={newPatient.name}
            onChange={(e) =>
              setNewPatient({ ...newPatient, name: e.target.value })
            }
            placeholder="Ví dụ: Nguyễn Văn A"
          />
          <Input
            label="Số điện thoại (Bắt buộc)"
            value={newPatient.phone}
            onChange={(e) =>
              setNewPatient({ ...newPatient, phone: e.target.value })
            }
            placeholder="0901234567"
          />
          <Input
            label="Email (Tùy chọn)"
            value={newPatient.email}
            onChange={(e) =>
              setNewPatient({ ...newPatient, email: e.target.value })
            }
            placeholder="email@example.com"
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAdd}
              isLoading={createMutation.isPending}
              disabled={!newPatient.name || !newPatient.phone}
            >
              Tạo hồ sơ
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Đã tạo hồ sơ khách hàng thành công!"
      />
    </div>
  );
};
