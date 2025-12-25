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
  ArrowRight,
  DollarSign,
  Stethoscope,
  Receipt,
} from "lucide-react";
// IMPORT DATA PROVIDER
import { getSharedAppointments } from "../../utils/dataProvider";

export const ReceptionDesk: React.FC = () => {
  // --- STATE DATA (LẤY TỪ NGUỒN CHUNG) ---
  const [queue, setQueue] = useState<any[]>(getSharedAppointments);
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE MODAL ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [paymentGuest, setPaymentGuest] = useState<any>(null);

  const [newGuest, setNewGuest] = useState({
    customer: "",
    pet: "",
    service: "Khám bệnh",
  });

  // --- EFFECT: Đồng bộ dữ liệu ---
  const refreshData = () => {
    setQueue(getSharedAppointments());
  };

  useEffect(() => {
    window.addEventListener("storage", refreshData);
    window.addEventListener("local-storage-update", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("local-storage-update", refreshData);
    };
  }, []);

  const updateLocalStorage = (newData: any[]) => {
    setQueue(newData);
    localStorage.setItem("pcx_appointments", JSON.stringify(newData));
    // Dispatch event để các tab khác cập nhật
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("local-storage-update"));
  };

  // --- ACTIONS ---

  const handleCheckIn = (guest: any) => {
    const updated = queue.map((item) =>
      item.id === guest.id ? { ...item, status: "WAITING" } : item
    );
    updateLocalStorage(updated);
    setSuccessMsg(
      `Đã check-in cho bé ${guest.petName}. Hồ sơ đã chuyển sang Bác sĩ.`
    );
    setShowSuccess(true);
  };

  const openPaymentModal = (guest: any) => {
    const serviceFee = 200000;
    const medicineFee = guest.result?.ToaThuocChiTiet
      ? guest.result.ToaThuocChiTiet.length * 150000
      : 0;
    const totalAmount = serviceFee + medicineFee;

    setPaymentGuest({
      ...guest,
      billDetails: {
        serviceFee,
        medicineFee,
        totalAmount,
      },
    });
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!paymentGuest) return;

    const updated = queue.map((item) =>
      item.id === paymentGuest.id
        ? {
            ...item,
            paymentStatus: "PAID",
            status: "DONE",
            actualAmount: paymentGuest.billDetails.totalAmount,
            paymentTime: new Date().toISOString(),
          }
        : item
    );
    updateLocalStorage(updated);

    setShowPaymentModal(false);
    setSuccessMsg(
      `Thanh toán thành công ${paymentGuest.billDetails.totalAmount.toLocaleString()}đ!`
    );
    setShowSuccess(true);
    setPaymentGuest(null);
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
      status: "WAITING",
      paymentStatus: "UNPAID",
    };

    const updatedQueue = [newBooking, ...queue];
    updateLocalStorage(updatedQueue);

    setShowAddModal(false);
    setNewGuest({ customer: "", pet: "", service: "Khám bệnh" });
    setSuccessMsg("Đã thêm khách vào hàng chờ khám!");
    setShowSuccess(true);
  };

  // --- FILTERS ---
  const searchResults = queue.filter(
    (item) =>
      item.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.petName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const waitingList = searchResults.filter(
    (q) => q.status === "PENDING" || q.status === "WAITING"
  );

  const paymentList = searchResults.filter(
    (q) => q.status === "COMPLETED" && q.paymentStatus !== "PAID"
  );

  const revenue = queue
    .filter((q) => q.paymentStatus === "PAID")
    .reduce((sum, item) => sum + (item.actualAmount || 0), 0);

  return (
    <div className="pb-10 p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <CreditCard className="w-6 h-6 mr-2 text-primary" /> Quầy Lễ Tân
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tiếp nhận bệnh nhân & Thu ngân
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <input
              placeholder="Tìm nhanh..."
              className="pl-9 h-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Khách vãng lai
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Khách chờ khám</p>
            <p className="text-3xl font-bold text-slate-800">
              {waitingList.length}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Cần thanh toán</p>
            <p className="text-3xl font-bold text-orange-500 animate-pulse">
              {paymentList.length}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Doanh thu ngày</p>
            <p className="text-3xl font-bold text-green-600">
              {revenue.toLocaleString()}{" "}
              <span className="text-sm font-normal text-gray-400">VNĐ</span>
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CỘT 1: CHECK-IN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" /> Hàng chờ khám
              bệnh
            </h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
              {waitingList.length}
            </span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {waitingList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">
                Hiện không có khách nào đang chờ.
              </div>
            ) : (
              waitingList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {item.petName}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({item.patientName})
                      </span>
                      {item.id.includes("WALK-IN") && (
                        <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">
                          Vãng lai
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center">
                      <Stethoscope className="w-3 h-3 mr-1" /> {item.service}
                      <span className="mx-2">•</span>
                      <Clock className="w-3 h-3 mr-1" /> {item.time}
                    </div>
                  </div>
                  {item.status === "PENDING" ? (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(item)}
                      className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 shadow-none"
                    >
                      Check-in <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Đợi bác sĩ
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* CỘT 2: THANH TOÁN */}
        <div className="bg-white rounded-2xl border border-green-200 shadow-md overflow-hidden h-fit relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <div className="p-4 border-b border-green-100 bg-green-50/50 flex justify-between items-center">
            <h3 className="font-bold text-green-800 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" /> Chờ thanh toán
            </h3>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
              {paymentList.length}
            </span>
          </div>
          <div className="divide-y divide-green-50 max-h-[500px] overflow-y-auto">
            {paymentList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">
                Chưa có phiếu khám nào hoàn thành.
              </div>
            ) : (
              paymentList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-green-50/10 hover:bg-green-50/30 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-slate-800">
                        {item.petName}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Chủ: {item.patientName}
                    </div>
                    {item.result?.ToaThuocChiTiet?.length > 0 && (
                      <div className="text-xs text-slate-400 mt-1 italic">
                        + {item.result.ToaThuocChiTiet.length} loại thuốc
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => openPaymentModal(item)}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                  >
                    Thu tiền
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL THÊM KHÁCH */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
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
              Dịch vụ đăng ký
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
              <option>Spa - Cắt tỉa</option>
              <option>Cấp cứu</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddWalkIn}>Lưu & Check-in ngay</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL THANH TOÁN */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Xác nhận thanh toán"
      >
        {paymentGuest && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">
                  {paymentGuest.patientName}
                </p>
                <p className="text-sm text-slate-500">
                  Thú cưng: <strong>{paymentGuest.petName}</strong>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Dịch vụ: {paymentGuest.service}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Phí dịch vụ:</span>
                <span className="font-medium">
                  {paymentGuest.billDetails.serviceFee.toLocaleString()} đ
                </span>
              </div>
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Tiền thuốc:</span>
                <span className="font-medium">
                  {paymentGuest.billDetails.medicineFee.toLocaleString()} đ
                </span>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-800">
                  Tổng thanh toán:
                </span>
                <span className="font-bold text-2xl text-primary">
                  {paymentGuest.billDetails.totalAmount.toLocaleString()} đ
                </span>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowPaymentModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={confirmPayment}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Xác nhận thu tiền
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
      />
    </div>
  );
};
