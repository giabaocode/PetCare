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
} from "lucide-react";

const INITIAL_STAFF = [
  {
    id: "NV001",
    name: "BS. Nguyễn Văn A",
    role: "Bác sĩ",
    branch: "CN Quận 1",
    salary: "15.000.000",
    status: "Active",
  },
  {
    id: "NV002",
    name: "Trần Thị B",
    role: "Tiếp tân",
    branch: "CN Quận 1",
    salary: "8.000.000",
    status: "Active",
  },
  {
    id: "NV003",
    name: "Lê Văn C",
    role: "Quản lý",
    branch: "CN Quận 7",
    salary: "20.000.000",
    status: "Active",
  },
];

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
    salary: "",
  });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filtered = staff.filter((s) =>
    s.name.toLowerCase().includes(term.toLowerCase())
  );

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", role: "Bác sĩ", salary: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingId(s.id);
    setFormData({
      name: s.name,
      role: s.role,
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
      setNotificationMsg("Cập nhật hồ sơ thành công!");
    } else {
      // Logic Thêm
      const newItem = {
        id: `NV00${staff.length + 1}`,
        name: formData.name,
        role: formData.role,
        branch: "CN Quận 1",
        salary: formatMoney(formData.salary),
        status: "Active",
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
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Quản trị Nhân sự
          </h1>
          <p className="text-slate-500 text-sm">
            Quản lý hồ sơ nhân viên, lương thưởng
          </p>
        </div>
        <Button
          className="bg-slate-800 hover:bg-slate-700 shadow-lg"
          onClick={handleOpenAdd}
        >
          <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm nhân viên..."
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
              <th className="p-4">Chức vụ</th>
              <th className="p-4">Chi nhánh</th>
              <th className="p-4">Lương</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-right">#</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                      {s.id}
                    </div>
                    <p className="font-bold text-slate-800">{s.name}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" /> {s.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> {s.branch}
                  </span>
                </td>
                <td className="p-4 font-mono font-medium">{s.salary}đ</td>
                <td className="p-4 text-center">
                  <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
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
        title={editingId ? "Cập nhật hồ sơ" : "Thêm nhân sự mới"}
      >
        <div className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chức vụ
            </label>
            <select
              className="w-full h-11 border border-gray-200 rounded-xl px-3 outline-none"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <option>Bác sĩ</option>
              <option>Tiếp tân</option>
              <option>Quản lý</option>
            </select>
          </div>
          <Input
            label="Lương cơ bản"
            type="number"
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: e.target.value })
            }
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Cập nhật" : "Tuyển dụng"}
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
