import React, { useState } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { Search, Phone, Mail, FileClock, UserPlus } from "lucide-react";

// Mock Data
const INITIAL_PATIENTS = [
  {
    id: "KH001",
    name: "Nguyễn Văn Tester",
    pet: "Mimi (Mèo)",
    phone: "0909123456",
    email: "test@gmail.com",
    lastVisit: "2024-03-01",
    totalSpent: "5.200.000đ",
    rank: "VIP",
  },
  {
    id: "KH002",
    name: "Trần Thị B",
    pet: "Lu (Chó)",
    phone: "0912345678",
    email: "b@gmail.com",
    lastVisit: "2024-02-15",
    totalSpent: "1.500.000đ",
    rank: "Thân thiết",
  },
];

export const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [term, setTerm] = useState("");

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    pet: "",
    phone: "",
  });

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(term.toLowerCase()) ||
      p.phone.includes(term) ||
      p.pet.toLowerCase().includes(term.toLowerCase())
  );

  const handleAdd = () => {
    if (!newPatient.name) return;
    const newP = {
      id: `KH00${patients.length + 1}`,
      name: newPatient.name,
      pet: newPatient.pet,
      phone: newPatient.phone,
      email: "khachmoi@gmail.com",
      lastVisit: "Chưa khám",
      totalSpent: "0đ",
      rank: "Mới",
    };
    setPatients([...patients, newP]);
    setIsAddOpen(false);
    setShowSuccess(true);
  };

  return (
    <div className="pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Danh sách Bệnh nhân
          </h1>
          <p className="text-slate-500 text-sm">
            Quản lý hồ sơ khách hàng và thú cưng
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20"
          onClick={() => setIsAddOpen(true)}
        >
          + Thêm khách mới
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm theo tên, SĐT, tên thú cưng..."
              className="pl-9 h-10 bg-white"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Thú cưng</th>
                <th className="p-4">Liên lạc</th>
                <th className="p-4">Lần khám cuối</th>
                <th className="p-4">Tổng chi tiêu</th>
                <th className="p-4 text-center">Hạng</th>
                <th className="p-4 text-right">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{p.id}</p>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{p.pet}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <a
                        href={`tel:${p.phone}`}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition"
                        title="Gọi điện"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${p.email}`}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition"
                        title="Gửi Mail"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{p.lastVisit}</td>
                  <td className="p-4 font-bold text-slate-800">
                    {p.totalSpent}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold border ${
                        p.rank === "VIP"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {p.rank}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        alert("Chức năng xem lịch sử chi tiết (Demo)")
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <FileClock className="w-4 h-4" />
                    </Button>
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
        title="Thêm hồ sơ khách hàng"
      >
        <div className="space-y-4">
          <Input
            label="Tên khách hàng"
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
            label="Tên thú cưng (Kèm loại)"
            placeholder="VD: Miu (Mèo)"
            value={newPatient.pet}
            onChange={(e) =>
              setNewPatient({ ...newPatient, pet: e.target.value })
            }
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAdd}>Lưu hồ sơ</Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Đã tạo hồ sơ khách hàng mới!"
      />
    </div>
  );
};
