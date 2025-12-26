import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  UserPlus,
  Filter,
  Phone,
  Mail,
  MoreHorizontal,
} from "lucide-react";
// IMPORT DB CHUNG
import { db } from "../../utils/dataProvider";

export const PatientManagement: React.FC = () => {
  // LOAD KHÁCH HÀNG TỪ DB
  const [patients, setPatients] = useState<any[]>([]);
  const [term, setTerm] = useState("");

  const loadPatients = () => {
    const allUsers = db.getUsers();
    // Lọc Role = CUSTOMER
    setPatients(allUsers.filter((u: any) => u.Role === "CUSTOMER"));
  };

  useEffect(() => {
    loadPatients();
    window.addEventListener("local-storage-update", loadPatients);
    return () =>
      window.removeEventListener("local-storage-update", loadPatients);
  }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // THÊM KHÁCH HÀNG MỚI (Tương đương Đăng Ký)
  const handleAdd = () => {
    try {
      db.addUser({
        HoTen: newPatient.name,
        SDT: newPatient.phone,
        Email: newPatient.email,
        MatKhau: "123456", // Mật khẩu mặc định cho khách được add bởi Staff
      });
      setShowSuccess(true);
      setIsAddOpen(false);
      setNewPatient({ name: "", phone: "", email: "" });
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.HoTen.toLowerCase().includes(term.toLowerCase()) ||
      p.SDT?.includes(term)
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hồ sơ Khách hàng
          </h1>
          <p className="text-slate-500 text-sm">Quản lý thông tin chủ nuôi</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="pl-10 pr-4 py-2 border rounded-xl"
              placeholder="Tìm tên, SĐT..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Thêm hồ sơ
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Mã KH
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Họ tên chủ nuôi
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Liên hệ
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Hạng
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  #
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.MaND} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-slate-400">
                    {p.MaKH}
                  </td>
                  <td className="p-4 font-bold text-slate-800">{p.HoTen}</td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />{" "}
                        {p.SDT || "---"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />{" "}
                        {p.Email || "---"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-bold border border-yellow-100">
                      {p.TenHang || "Thành viên"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-primary">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Thêm khách hàng mới"
      >
        <div className="space-y-4">
          <Input
            label="Họ tên"
            value={newPatient.name}
            onChange={(e) =>
              setNewPatient({ ...newPatient, name: e.target.value })
            }
          />
          <Input
            label="Số điện thoại"
            value={newPatient.phone}
            onChange={(e) =>
              setNewPatient({ ...newPatient, phone: e.target.value })
            }
          />
          <Input
            label="Email (Tùy chọn)"
            value={newPatient.email}
            onChange={(e) =>
              setNewPatient({ ...newPatient, email: e.target.value })
            }
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAdd}>Tạo hồ sơ</Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Đã tạo hồ sơ khách hàng!"
      />
    </div>
  );
};
