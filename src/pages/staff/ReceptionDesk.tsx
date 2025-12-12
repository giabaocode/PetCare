import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  UserCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  UserPlus,
  X,
} from "lucide-react";

export const ReceptionDesk: React.FC = () => {
  // State Data
  const [queue, setQueue] = useState<any[]>(() => {
    const saved = localStorage.getItem("pcx_appointments");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [searchTerm, setSearchTerm] = useState("");

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [newGuest, setNewGuest] = useState({
    customer: "",
    pet: "",
    service: "Khám bệnh",
  });

  // Đồng bộ dữ liệu
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("pcx_appointments");
      if (saved) setQueue(JSON.parse(saved));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateLocalStorage = (newData: any[]) => {
    setQueue(newData);
    localStorage.setItem("pcx_appointments", JSON.stringify(newData));
  };

  // Logic Lọc (Search)
  const filteredQueue = queue.filter(
    (item) =>
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ACTIONS ---

  const handleCheckIn = (id: string) => {
    const updated = queue.map((item) =>
      item.id === id ? { ...item, status: "WAITING" } : item
    );
    updateLocalStorage(updated);
    setSuccessMsg("Check-in thành công! Hồ sơ đã chuyển sang Bác sĩ.");
    setShowSuccess(true);
  };

  const handlePayment = (id: string, amount: number = 500000) => {
    if (window.confirm(`Xác nhận thu ${amount.toLocaleString()}đ?`)) {
      const updated = queue.map((item) =>
        item.id === id
          ? { ...item, status: "COMPLETED", paymentStatus: "PAID" }
          : item
      );
      updateLocalStorage(updated);
      setSuccessMsg("Thanh toán thành công! Đã in hóa đơn.");
      setShowSuccess(true);
    }
  };

  const handleAddWalkIn = () => {
    if (!newGuest.customer || !newGuest.pet) {
      alert("Vui lòng nhập tên khách và thú cưng!");
      return;
    }

    const newBooking = {
      id: `WALK-IN-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      patientName: newGuest.customer,
      petName: newGuest.pet,
      type: "Khác",
      service: newGuest.service,
      symptom: "Khách vãng lai (Đăng ký tại quầy)",
      status: "WAITING", // Vào thẳng hàng chờ khám
      paymentStatus: "UNPAID",
    };

    const updatedQueue = [newBooking, ...queue];
    updateLocalStorage(updatedQueue);

    setShowModal(false);
    setNewGuest({ customer: "", pet: "", service: "Khám bệnh" });
    setSuccessMsg("Đã thêm khách vào hàng chờ khám!");
    setShowSuccess(true);
  };

  return (
    <div className="pb-10 relative">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quầy Lễ Tân</h1>
          <p className="text-slate-500 text-sm">Tiếp nhận & Thu ngân</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Khách vãng lai
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Đang chờ khám</p>
            <p className="text-2xl font-bold text-orange-500">
              {queue.filter((q: any) => q.status === "WAITING").length}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Chờ Thanh toán</p>
            <p className="text-2xl font-bold text-blue-500">
              {
                queue.filter(
                  (q: any) =>
                    q.status === "COMPLETED" && q.paymentStatus !== "PAID"
                ).length
              }
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Doanh thu ngày</p>
            <p className="text-2xl font-bold text-green-500">
              {(
                queue.filter((q: any) => q.paymentStatus === "PAID").length *
                500
              ).toLocaleString()}
              k
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm tên khách, thú cưng..."
              className="pl-9 bg-slate-50 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Giờ</th>
                <th className="p-4">Thông tin</th>
                <th className="p-4">Dịch vụ</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono text-slate-600">{item.time}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">
                      {item.petName}{" "}
                      <span className="font-normal text-slate-500">
                        ({item.patientName})
                      </span>
                    </p>
                    {item.id.includes("WALK-IN") && (
                      <span className="text-[10px] bg-gray-100 px-1 rounded text-gray-500">
                        Vãng lai
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">{item.service}</td>
                  <td className="p-4 text-center">
                    {item.status === "PENDING" && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-bold">
                        Chưa đến
                      </span>
                    )}
                    {item.status === "WAITING" && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-bold">
                        Đang chờ khám
                      </span>
                    )}
                    {item.status === "COMPLETED" &&
                      item.paymentStatus !== "PAID" && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-bold">
                          Chờ thanh toán
                        </span>
                      )}
                    {item.paymentStatus === "PAID" && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">
                        Hoàn tất
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {item.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(item.id)}
                        className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Check-in
                      </Button>
                    )}
                    {item.status === "COMPLETED" &&
                      item.paymentStatus !== "PAID" && (
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-800">500k</span>
                          <Button
                            size="sm"
                            onClick={() => handlePayment(item.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CreditCard className="w-4 h-4 mr-2" /> Thu tiền
                          </Button>
                        </div>
                      )}
                    {item.paymentStatus === "PAID" && (
                      <span className="text-green-600 font-bold text-sm">
                        Đã xong
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tiếp nhận khách vãng lai"
      >
        <div className="space-y-4">
          <Input
            label="Tên khách hàng"
            placeholder="VD: Anh Nam"
            value={newGuest.customer}
            onChange={(e) =>
              setNewGuest({ ...newGuest, customer: e.target.value })
            }
          />
          <Input
            label="Tên thú cưng"
            placeholder="VD: Miu"
            value={newGuest.pet}
            onChange={(e) => setNewGuest({ ...newGuest, pet: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dịch vụ
            </label>
            <select
              className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary outline-none"
              value={newGuest.service}
              onChange={(e) =>
                setNewGuest({ ...newGuest, service: e.target.value })
              }
            >
              <option>Khám bệnh</option>
              <option>Tiêm phòng</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddWalkIn}>Lưu & Chuyển bác sĩ</Button>
          </div>
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
