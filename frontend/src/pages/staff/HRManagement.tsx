import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

import {
  Search,
  UserPlus,
  Briefcase,
  Edit,
  Trash,
  Loader2,
  AlertTriangle,
  History,
  Calendar,
  Building2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../api/userApi";

export const HRManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedStaffHistory, setSelectedStaffHistory] = useState<any[]>([]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "DOCTOR",
    branchId: profile?.MaCN || "",
    dob: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["staffs", page, term, profile?.MaCN],
    queryFn: async () => {
      const res = await usersApi.getAll({
        page,
        limit,
        search: term,
        type: "NV",
      });

      if (res.data && res.pagination) {
        return res;
      }
      return {
        data: Array.isArray(res) ? res : [],
        pagination: { totalPages: 1, totalItems: 0 },
      };
    },

    refetchInterval: 30000,
  });

  const staffs = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode && editingId) {
        return await usersApi.updateStaff(editingId, data);
      } else {
        return await usersApi.createStaff(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      setIsModalOpen(false);
      setSuccessMsg(
        isEditMode
          ? "Cập nhật nhân viên thành công!"
          : "Thêm nhân viên mới thành công!"
      );
      setShowSuccess(true);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(
        err.response?.data?.message || err.message || "Có lỗi xảy ra"
      );
      setErrorModalOpen(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      setDeleteModalOpen(false);
      setSuccessMsg("Đã xóa nhân viên và dữ liệu liên quan.");
      setShowSuccess(true);
    },
    onError: (err: any) => {
      setDeleteModalOpen(false);
      setErrorMsg(
        err.response?.data?.message || "Không thể xóa nhân viên này."
      );
      setErrorModalOpen(true);
    },
  });

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: any) => {
    setIsEditMode(true);
    setEditingId(staff.MaND);
    setFormData({
      fullName: staff.HoTen,
      email: staff.Email || "",
      phone: staff.SDT,
      password: "",
      role:
        staff.ChucVu === "Bác sĩ"
          ? "DOCTOR"
          : staff.ChucVu === "Tiếp tân"
          ? "RECEPTIONIST"
          : "ADMIN",
      branchId: staff.MaCN || profile?.MaCN || "",
      dob: staff.NgaySinh ? staff.NgaySinh.split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const handleViewHistory = async (staffId: string) => {
    try {
      const history = await usersApi.getBranchHistory(staffId);
      setSelectedStaffHistory(Array.isArray(history) ? history : []);
      setHistoryModalOpen(true);
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      alert("Không thể tải lịch sử công tác.");
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "DOCTOR",
      branchId: profile?.MaCN || "",
      dob: "",
    });
  };

  return (
    <div className="space-y-6 fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" /> Quản lý Nhân sự
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý danh sách Bác sĩ, Lễ tân và phân quyền hệ thống.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="shadow-lg shadow-primary/20">
          <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
          className="flex-1 outline-none text-slate-700 placeholder:text-gray-400"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Danh sách nhân viên */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                    <th className="p-4">Nhân viên</th>
                    <th className="p-4">Chức vụ / Vai trò</th>
                    <th className="p-4">Chi nhánh</th>
                    <th className="p-4">Liên hệ</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staffs.length > 0 ? (
                    staffs.map((s: any) => (
                      <tr
                        key={s.MaND}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              {s.HoTen.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">
                                {s.HoTen}
                              </div>
                              <div className="text-xs text-slate-400">
                                ID: {s.MaND.slice(0, 6)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              s.ChucVu === "Bác sĩ"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : s.ChucVu === "Tiếp tân"
                                ? "bg-pink-50 text-pink-700 border-pink-100"
                                : "bg-purple-50 text-purple-700 border-purple-100"
                            }`}
                          >
                            {s.ChucVu || "Chưa phân công"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {s.TenCN ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-gray-400" />
                              {s.TenCN}
                            </div>
                          ) : (
                            <span className="text-orange-500 text-xs italic">
                              Chưa có CN
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2">
                              {s.SDT}
                            </span>
                            <span className="text-xs text-slate-400">
                              {s.Email}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewHistory(s.MaND)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Lịch sử công tác"
                            >
                              <History className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {/* Chỉ Admin mới được xóa */}
                            {profile?.Role === "ADMIN" && (
                              <button
                                onClick={() => handleDeleteClick(s.MaND)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Xóa nhân viên"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-10 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <UserPlus className="w-12 h-12 text-gray-200 mb-3" />
                          <p>Chưa tìm thấy nhân viên nào.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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

      {/* --- MODAL 1: THÊM / SỬA NHÂN VIÊN --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isEditMode ? "Cập nhật thông tin nhân viên" : "Thêm nhân viên mới"
        }
      >
        <div className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            placeholder="Nguyễn Văn A"
          />

          {/* ✅ ĐÃ THÊM Ô NHẬP NGÀY SINH Ở ĐÂY */}
          <Input
            label="Ngày sinh"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email (Tên đăng nhập)"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="nhanvien@petcare.com"
              disabled={isEditMode}
            />
            <Input
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="0909..."
            />
          </div>

          {!isEditMode && (
            <Input
              label="Mật khẩu khởi tạo"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="******"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò / Chức vụ
              </label>
              <select
                className="w-full h-11 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="DOCTOR">Bác sĩ</option>
                <option value="RECEPTIONIST">Tiếp tân</option>
                <option value="ADMIN">Quản lý Chi nhánh</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => mutation.mutate(formData)}
              isLoading={mutation.isPending}
              disabled={!formData.fullName || !formData.phone}
            >
              {isEditMode ? "Lưu thay đổi" : "Tạo nhân viên"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 2: LỊCH SỬ CÔNG TÁC --- */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Lịch sử công tác & Luân chuyển"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
          {selectedStaffHistory.length > 0 ? (
            selectedStaffHistory.map((h: any, idx: number) => (
              <div
                key={idx}
                className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 relative"
              >
                {/* Timeline Line */}
                {idx !== selectedStaffHistory.length - 1 && (
                  <div className="absolute left-[29px] top-10 bottom-[-20px] w-0.5 bg-gray-200"></div>
                )}

                <div className="w-8 h-8 rounded-full bg-white border-2 border-primary flex items-center justify-center flex-shrink-0 z-10">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{h.TenCN}</h4>
                  <p className="text-sm text-primary font-medium mb-1">
                    {h.ChucVu}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(h.NgayBatDau).toLocaleDateString("vi-VN")}
                    </span>
                    <span>—</span>
                    <span className="flex items-center gap-1">
                      {h.NgayKetThuc ? (
                        <>
                          <Clock className="w-3 h-3" />
                          {new Date(h.NgayKetThuc).toLocaleDateString("vi-VN")}
                        </>
                      ) : (
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                          Hiện tại
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Chưa có lịch sử công tác nào.</p>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button onClick={() => setHistoryModalOpen(false)}>Đóng</Button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 3: XÁC NHẬN XÓA --- */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa nhân viên"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-lg text-slate-800">
              Bạn có chắc chắn muốn xóa?
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Hành động này sẽ xóa vĩnh viễn tài khoản và toàn bộ lịch sử làm
              việc. Nhân viên này sẽ không thể truy cập hệ thống nữa.
            </p>
          </div>
          <div className="flex gap-3 w-full pt-4">
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={confirmDelete}
              isLoading={deleteMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200"
            >
              Xóa nhân viên
            </Button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 4: BÁO LỖI --- */}
      <Modal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Đã có lỗi xảy ra"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-600 mb-6">{errorMsg}</p>
          <Button onClick={() => setErrorModalOpen(false)} className="w-full">
            Đã hiểu
          </Button>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
      />
    </div>
  );
};
