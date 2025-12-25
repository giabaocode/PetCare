import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  UserPlus,
  MapPin,
  Briefcase,
  MoreHorizontal,
  Edit,
  Trash,
  DollarSign,
  Clock,
  Building2,
  Calendar,
} from "lucide-react";

// 1. DỮ LIỆU NHÂN VIÊN HIỆN TẠI
const INITIAL_STAFF = [
  {
    id: "NV001",
    name: "BS. Nguyễn Văn A",
    role: "Bác sĩ",
    branch: "CN Quận 1",
    salary: "15.000.000",
    status: "Active",
    joinDate: "2022-01-15",
  },
  {
    id: "NV002",
    name: "Trần Thị B",
    role: "Tiếp tân",
    branch: "CN Quận 1",
    salary: "8.000.000",
    status: "Active",
    joinDate: "2023-05-20",
  },
  {
    id: "NV003",
    name: "Lê Văn C",
    role: "Quản lý",
    branch: "CN Quận 7",
    salary: "20.000.000",
    status: "Active",
    joinDate: "2021-11-01",
  },
];

// 2. DỮ LIỆU LỊCH SỬ CÔNG TÁC (Mock Database: LichSuCongTac)
const MOCK_HISTORY: Record<string, any[]> = {
  NV001: [
    {
      startDate: "15/01/2022",
      endDate: "01/01/2023",
      role: "Thực tập sinh",
      branch: "CN Quận 1",
      note: "Thực tập tốt nghiệp",
    },
    {
      startDate: "02/01/2023",
      endDate: "Nay",
      role: "Bác sĩ chính",
      branch: "CN Quận 1",
      note: "Ký hợp đồng chính thức",
    },
  ],
  NV003: [
    {
      startDate: "01/11/2021",
      endDate: "01/06/2023",
      role: "Bác sĩ trưởng",
      branch: "CN Quận 7",
      note: "",
    },
    {
      startDate: "02/06/2023",
      endDate: "Nay",
      role: "Quản lý chi nhánh",
      branch: "CN Quận 7",
      note: "Thăng chức quản lý",
    },
  ],
};

export const HRManagement: React.FC = () => {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [term, setTerm] = useState("");

  // Modal & Notification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "Bác sĩ",
    branch: "CN Quận 1",
    salary: "",
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(term.toLowerCase())
  );

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", role: "Bác sĩ", branch: "CN Quận 1", salary: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      role: s.role,
      branch: s.branch,
      salary: s.salary.replace(/\./g, ""),
    });
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleSave = () => {
    if (editingId) {
      // Logic Sửa
      setStaff(
        staff.map((s) =>
          s.id === editingId
            ? { ...s, ...formData, salary: formatMoney(formData.salary) }
            : s
        )
      );
      setNotificationMsg("Cập nhật hồ sơ nhân sự thành công!");
    } else {
      // Logic Thêm
      const newItem = {
        id: `NV00${staff.length + 1}`,
        name: formData.name,
        role: formData.role,
        branch: formData.branch,
        salary: formatMoney(formData.salary),
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
      };
      setStaff([...staff, newItem]);
      setNotificationMsg("Tuyển dụng nhân sự mới thành công!");
    }
    setIsModalOpen(false);
    setShowSuccess(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn sa thải nhân viên này?")) {
      setStaff(staff.filter((s) => s.id !== id));
      setActiveMenu(null);
      setNotificationMsg("Đã xóa nhân viên khỏi hệ thống.");
      setShowSuccess(true);
    }
  };

  const handleSalaryIncrease = (id: string) => {
    const newSalary = window.prompt("Nhập mức lương mới (VNĐ):");
    if (newSalary) {
      setStaff(
        staff.map((s) =>
          s.id === id ? { ...s, salary: formatMoney(newSalary) } : s
        )
      );
      setActiveMenu(null);
      setNotificationMsg("Đã cập nhật mức lương mới!");
      setShowSuccess(true);
    }
  };

  const formatMoney = (val: string) => Number(val).toLocaleString("vi-VN");

  return (
    <div className="pb-10" onClick={() => setActiveMenu(null)}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản trị Nhân sự
          </h1>
          <p className="text-slate-500 text-sm">
            Quản lý hồ sơ, điều chuyển và lương thưởng
          </p>
        </div>
        <Button
          className="bg-slate-800 hover:bg-slate-700 shadow-lg"
          onClick={handleOpenAdd}
        >
          <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm tên nhân viên, mã NV..."
              className="pl-9 h-10 bg-white"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="p-4">Nhân viên</th>
              <th className="p-4">Chức vụ & Nơi làm việc</th>
              <th className="p-4">Ngày vào làm</th>
              <th className="p-4">Lương cơ bản</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-right">#</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                      {s.id}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{s.name}</p>
                      <p className="text-xs text-slate-400">ID: {s.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />{" "}
                      {s.role}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />{" "}
                      {s.branch}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(s.joinDate).toLocaleDateString("vi-VN")}
                  </div>
                </td>
                <td className="p-4 font-mono font-medium text-slate-700">
                  {s.salary}đ
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      s.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-right relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === s.id ? null : s.id);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {activeMenu === s.id && (
                    <div className="absolute right-8 top-8 w-44 bg-white shadow-xl rounded-xl border border-slate-100 z-10 overflow-hidden animate-fade-in">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                      >
                        <Edit className="w-4 h-4" /> Sửa hồ sơ
                      </button>
                      <button
                        onClick={() => handleSalaryIncrease(s.id)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                      >
                        <DollarSign className="w-4 h-4" /> Tăng lương
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 flex items-center gap-2 text-red-500 border-t border-slate-50"
                      >
                        <Trash className="w-4 h-4" /> Sa thải
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Cập nhật hồ sơ nhân sự" : "Tuyển dụng nhân sự mới"}
      >
        <div className="space-y-5">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Họ và tên"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chức vụ
              </label>
              <select
                className="w-full h-11 border border-gray-200 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option>Bác sĩ</option>
                <option>Tiếp tân</option>
                <option>Quản lý</option>
                <option>Kế toán</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chi nhánh làm việc
              </label>
              <select
                className="w-full h-11 border border-gray-200 rounded-xl px-3 outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
              >
                <option>CN Quận 1</option>
                <option>CN Quận 7</option>
                <option>CN Thủ Đức</option>
              </select>
            </div>
          </div>

          <Input
            label="Lương cơ bản (VNĐ)"
            type="number"
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: e.target.value })
            }
          />

          {/* PHẦN QUAN TRỌNG: LỊCH SỬ CÔNG TÁC (CHỈ HIỆN KHI EDIT) */}
          {editingId && (
            <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" /> Lịch sử công tác
              </h4>

              <div className="space-y-0">
                {MOCK_HISTORY[editingId] ? (
                  MOCK_HISTORY[editingId].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 relative pb-6 last:pb-0"
                    >
                      {/* Timeline Line */}
                      <div className="absolute left-[5px] top-2 bottom-0 w-0.5 bg-gray-200 last:hidden"></div>
                      {/* Dot */}
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0 relative z-10 border-2 border-white shadow-sm"></div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-sm text-slate-800">
                            {item.role}
                          </h5>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            {item.startDate} - {item.endDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Building2 className="w-3 h-3" /> {item.branch}
                        </div>
                        {item.note && (
                          <p className="text-xs text-slate-400 mt-1 italic">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic text-center py-2">
                    Chưa có lịch sử điều chuyển nào.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Lưu thay đổi" : "Tuyển dụng"}
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={notificationMsg}
      />
    </div>
  );
};
