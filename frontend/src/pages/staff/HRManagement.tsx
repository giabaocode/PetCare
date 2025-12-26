import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  UserPlus,
  Briefcase,
  Edit,
  Trash,
  Building2,
} from "lucide-react";

// 1. IMPORT DB CHUNG
import { db } from "../../utils/dataProvider";

export const HRManagement: React.FC = () => {
  // 2. STATE LẤY TỪ DB
  const [staffList, setStaffList] = useState<any[]>([]);
  const [term, setTerm] = useState("");

  // Refresh data helper
  const loadStaff = () => {
    const allUsers = db.getUsers();
    // Lọc ra những ai KHÔNG PHẢI là khách hàng (Tức là Admin, Doctor, Receptionist)
    const staff = allUsers.filter((u: any) => u.Role !== "CUSTOMER");
    setStaffList(staff);
  };

  useEffect(() => {
    loadStaff();
    window.addEventListener("local-storage-update", loadStaff);
    return () => window.removeEventListener("local-storage-update", loadStaff);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "DOCTOR",
    branch: "CN01",
    salary: "15000000",
  });

  // XỬ LÝ LƯU NHÂN VIÊN (ADD / EDIT)
  const handleSave = () => {
    const allUsers = db.getUsers();
    let newUsersList = [...allUsers];

    if (editingId) {
      // Edit
      newUsersList = newUsersList.map((u) =>
        u.MaND === editingId
          ? {
              ...u,
              HoTen: formData.name,
              Email: formData.email,
              Role: formData.role,
              MaCN: formData.branch,
              Luong: formData.salary,
            }
          : u
      );
    } else {
      // Add New
      const newStaff = {
        MaND: `staff-${Date.now()}`,
        MaNV: `NV${Date.now().toString().slice(-4)}`,
        HoTen: formData.name,
        Email: formData.email,
        Role: formData.role, // DOCTOR | RECEPTIONIST | ADMIN
        MaCN: formData.branch,
        Luong: formData.salary, // Trường mở rộng
        Status: "Active",
      };
      newUsersList.push(newStaff);
    }

    // Lưu thẳng vào LocalStorage (Bypass hàm addUser vì hàm đó chỉ tạo Customer)
    localStorage.setItem("pcx_users", JSON.stringify(newUsersList));
    window.dispatchEvent(new Event("local-storage-update"));

    setShowSuccess(true);
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      role: "DOCTOR",
      branch: "CN01",
      salary: "15000000",
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa nhân viên này?")) return;
    const allUsers = db.getUsers();
    const newList = allUsers.filter((u: any) => u.MaND !== id);
    localStorage.setItem("pcx_users", JSON.stringify(newList));
    window.dispatchEvent(new Event("local-storage-update"));
  };

  const openEdit = (staff: any) => {
    setEditingId(staff.MaND);
    setFormData({
      name: staff.HoTen,
      email: staff.Email || "",
      role: staff.Role,
      branch: staff.MaCN || "CN01",
      salary: staff.Luong || "0",
    });
    setIsModalOpen(true);
  };

  // Filter UI
  const filteredStaff = staffList.filter((s) =>
    s.HoTen.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Nhân sự</h1>
          <p className="text-slate-500 text-sm">Danh sách Bác sĩ & Nhân viên</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none"
              placeholder="Tìm nhân viên..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              setEditingId(null);
              setIsModalOpen(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Thêm nhân viên
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Mã NV
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Họ tên & Email
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Vai trò
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Chi nhánh
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.map((staff) => (
                <tr key={staff.MaND} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-slate-400">
                    {staff.MaNV || "N/A"}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{staff.HoTen}</p>
                    <p className="text-xs text-slate-500">{staff.Email}</p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        staff.Role === "DOCTOR"
                          ? "bg-blue-100 text-blue-700"
                          : staff.Role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {staff.Role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {staff.MaCN === "CN01" ? "Quận 1" : "Quận 7"}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(staff)}
                        className="p-2 hover:bg-slate-100 rounded text-slate-500"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.MaND)}
                        className="p-2 hover:bg-red-50 rounded text-red-500"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Cập nhật nhân viên" : "Tuyển dụng mới"}
      >
        <div className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email đăng nhập"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vai trò</label>
              <select
                className="w-full p-2 border rounded-xl"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="DOCTOR">Bác sĩ</option>
                <option value="RECEPTIONIST">Lễ tân</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Chi nhánh
              </label>
              <select
                className="w-full p-2 border rounded-xl"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
              >
                <option value="CN01">PetCare Quận 1</option>
                <option value="CN02">PetCare Quận 7</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu thông tin</Button>
          </div>
        </div>
      </Modal>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Cập nhật nhân sự thành công!"
      />
    </div>
  );
};
