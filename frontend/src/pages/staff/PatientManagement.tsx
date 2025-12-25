import React, { useState } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  Phone,
  Mail,
  FileClock,
  UserPlus,
  FileWarning,
  Filter,
} from "lucide-react";

// 1. DỮ LIỆU MẪU: Cập nhật ngày tháng thực tế để test tính năng lọc
const INITIAL_PATIENTS = [
  {
    id: "KH001",
    name: "Nguyễn Văn Tester",
    pet: "Mimi (Mèo)",
    phone: "0909123456",
    email: "test@gmail.com",
    lastVisit: "2024-03-01", // > 3 tháng -> Sẽ bị lọc là "Rời bỏ"
    totalSpent: "5.200.000đ",
    rank: "VIP",
  },
  {
    id: "KH002",
    name: "Trần Thị B",
    pet: "Lu (Chó)",
    phone: "0912345678",
    email: "b@gmail.com",
    lastVisit: new Date().toISOString().split("T")[0], // Hôm nay -> Khách mới
    totalSpent: "1.500.000đ",
    rank: "Thân thiết",
  },
  {
    id: "KH003",
    name: "Lê Văn C",
    pet: "Kiki (Chó)",
    phone: "0901234567",
    email: "c@gmail.com",
    lastVisit: "2023-11-20", // Rất lâu -> Rời bỏ
    totalSpent: "800.000đ",
    rank: "Mới",
  },
];

export const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [term, setTerm] = useState("");

  // 2. STATE MỚI: Quản lý bộ lọc Churn
  const [filterChurn, setFilterChurn] = useState(false);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    pet: "",
    phone: "",
  });

  // 3. LOGIC LỌC NÂNG CAO
  const filtered = patients.filter((p) => {
    // Lọc theo từ khóa tìm kiếm
    const matchesSearch =
      p.name.toLowerCase().includes(term.toLowerCase()) ||
      p.phone.includes(term) ||
      p.pet.toLowerCase().includes(term.toLowerCase());

    // Lọc theo Churn (Rời bỏ > 90 ngày)
    let matchesChurn = true;
    if (filterChurn) {
      if (p.lastVisit === "Chưa khám") return false;

      const lastDate = new Date(p.lastVisit);
      const today = new Date();
      // Tính khoảng cách ngày
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Chỉ giữ lại khách hàng đã > 90 ngày chưa đến
      matchesChurn = diffDays > 90;
    }

    return matchesSearch && matchesChurn;
  });

  const handleAdd = () => {
    if (!newPatient.name) return;
    const newP = {
      id: `KH00${patients.length + 1}`,
      name: newPatient.name,
      pet: newPatient.pet,
      phone: newPatient.phone,
      email: "khachmoi@gmail.com",
      lastVisit: new Date().toISOString().split("T")[0], // Mặc định là hôm nay
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
            Quản lý hồ sơ và chăm sóc khách hàng
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          {/* Nút Lọc Churn Mới */}
          <Button
            variant={filterChurn ? "danger" : "outline"}
            className={
              filterChurn
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-slate-200 text-slate-600"
            }
            onClick={() => setFilterChurn(!filterChurn)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {filterChurn
              ? "Đang lọc: Nguy cơ rời bỏ"
              : "Lọc khách cũ (>3 tháng)"}
          </Button>

          <Button
            className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20"
            onClick={() => setIsAddOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" /> Thêm khách mới
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-slate-400 italic"
                  >
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
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

                    {/* Cột Lần khám cuối: Có icon cảnh báo nếu > 90 ngày */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-sm">
                          {p.lastVisit}
                        </span>
                        {(() => {
                          if (p.lastVisit === "Chưa khám") return null;
                          const diff = Math.ceil(
                            Math.abs(
                              new Date().getTime() -
                                new Date(p.lastVisit).getTime()
                            ) /
                              (1000 * 60 * 60 * 24)
                          );
                          if (diff > 90)
                            return (
                              <span
                                className="text-red-500 animate-pulse"
                                title={`Đã ${diff} ngày chưa quay lại`}
                              >
                                <FileWarning className="w-4 h-4" />
                              </span>
                            );
                        })()}
                      </div>
                    </td>

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
                          alert(
                            `Chức năng xem lịch sử chi tiết của ${p.name} (Backend integration required)`
                          )
                        }
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <FileClock className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
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
