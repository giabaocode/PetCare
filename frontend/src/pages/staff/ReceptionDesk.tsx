import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { getSharedAppointments, db } from "../../utils/dataProvider"; // Vẫn dùng queue mock
import { useAuth } from "../../context/AuthContext";
// IMPORT API
import { packagesApi } from "../../api/packages";
import { usersApi } from "../../api/userApi";
import { invoicesApi } from "../../api/invoices";

export const ReceptionDesk: React.FC = () => {
  const { profile } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const refreshData = () => {
    const allAppointments = getSharedAppointments();
    const branchQueue = allAppointments.filter((appt: any) => {
      if (profile?.Role === "ADMIN") return true;
      return appt.MaCN === profile?.MaCN;
    });
    branchQueue.sort((a: any, b: any) => {
      if (a.status === "WAITING" && b.status !== "WAITING") return -1;
      if (a.status !== "WAITING" && b.status === "WAITING") return 1;
      return 0;
    });
    setQueue(branchQueue);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("storage", refreshData);
    window.addEventListener("local-storage-update", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("local-storage-update", refreshData);
    };
  }, [profile]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [paymentGuest, setPaymentGuest] = useState<any>(null);
  const [walkInGuest, setWalkInGuest] = useState({
    ownerName: "",
    petName: "",
    petType: "Chó",
    service: "Khám bệnh",
  });

  const handleAddWalkIn = () => {
    if (!walkInGuest.ownerName || !walkInGuest.petName) return;
    db.addAppointment({
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      patientName: walkInGuest.ownerName,
      petName: walkInGuest.petName,
      type: walkInGuest.petType,
      service: walkInGuest.service,
      symptom: "Khách vãng lai",
      status: "WAITING",
      doctor: "BS. Trực",
      MaKH: "GUEST-" + Date.now(),
      MaTC: 0,
      MaCN: profile?.MaCN || "CN01",
    });
    setShowAddModal(false);
    setSuccessMsg("Đã tiếp nhận khách vãng lai!");
    setShowSuccess(true);
    setWalkInGuest({
      ownerName: "",
      petName: "",
      petType: "Chó",
      service: "Khám bệnh",
    });
  };

  const handleOpenPayment = async (guest: any) => {
    const medicineFee =
      guest.result?.ToaThuocChiTiet?.reduce(
        (s: number, i: any) => s + i.price * i.quantity,
        0
      ) || 0;
    let serviceFee = guest.service.includes("Tiêm") ? 150000 : 300000;
    let discount = 0;
    let discountNote = "";

    if (guest.MaTC) {
      // GỌI API CHECK GÓI
      const activePkg = await packagesApi.checkActivePackage(guest.MaTC);
      if (
        activePkg &&
        guest.service === "Khám bệnh" &&
        activePkg.usedCount < activePkg.benefits.freeExamLimit
      ) {
        discount = serviceFee;
        serviceFee = 0;
        discountNote = `Gói ${activePkg.PackageName} (Dùng ${
          activePkg.usedCount + 1
        }/${activePkg.benefits.freeExamLimit})`;
      }
    }

    setPaymentGuest({
      ...guest,
      billDetails: {
        serviceFee,
        medicineFee,
        totalAmount: serviceFee + medicineFee,
        medicines: guest.result?.ToaThuocChiTiet || [],
        discount,
        discountNote,
      },
    });
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!paymentGuest) return;

    // 1. GỌI API TRỪ LƯỢT GÓI
    if (paymentGuest.billDetails.discount > 0) {
      await packagesApi.useBenefit(paymentGuest.MaTC);
    }

    // 2. GỌI API CỘNG ĐIỂM
    if (paymentGuest.MaKH && paymentGuest.billDetails.totalAmount > 0) {
      await usersApi.addPoints(
        paymentGuest.MaKH,
        paymentGuest.billDetails.totalAmount
      );
    }

    // 3. Update Lịch hẹn
    db.updateAppointment(paymentGuest.id, {
      paymentStatus: "PAID",
      status: "COMPLETED",
      actualAmount: paymentGuest.billDetails.totalAmount,
    });

    // 4. GỌI API TẠO HÓA ĐƠN
    await invoicesApi.create({
      MaHD: Math.floor(100000 + Math.random() * 900000),
      NgayLap: new Date().toISOString(),
      TongTien: paymentGuest.billDetails.totalAmount,
      HinhThucThanhToan: "Tiền mặt",
      TrangThai: "Đã thanh toán",
      MaKH: paymentGuest.MaKH || "GUEST",
      MaCN: paymentGuest.MaCN || profile?.MaCN || "CN01",
      GhiChu: paymentGuest.billDetails.discountNote,
      ChiTietHoaDonDichVu: [
        {
          DichVu: { TenDV: paymentGuest.service },
          SoLuong: 1,
          ThanhTien: paymentGuest.billDetails.serviceFee,
        },
      ],
      ChiTietHoaDonSanPham:
        paymentGuest.billDetails.medicines?.map((med: any) => ({
          SanPham: { TenSP: med.medicineName },
          SoLuong: med.quantity,
          ThanhTien: med.price * med.quantity,
        })) || [],
    });

    setShowPaymentModal(false);
    setSuccessMsg(
      `Đã thu ${paymentGuest.billDetails.totalAmount.toLocaleString()}đ thành công!`
    );
    setShowSuccess(true);
    setPaymentGuest(null);
  };

  // ... (Phần render UI giữ nguyên, không thay đổi)
  const filteredQueue = queue.filter((item) =>
    item.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quầy Lễ Tân</h1>
          <p className="text-slate-500 text-sm">
            Khu vực:{" "}
            <span className="font-bold text-primary">
              {profile?.MaCN || "Toàn hệ thống"}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="pl-10 pr-4 py-2 border rounded-xl outline-none w-64"
              placeholder="Tìm tên khách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Tiếp nhận khách
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  STT
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Khách hàng
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Dịch vụ
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Trạng thái
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQueue.map((guest, idx) => (
                <tr key={guest.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-slate-400">#{idx + 1}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">
                      {guest.patientName}
                    </p>
                    <p className="text-xs text-slate-500">{guest.petName}</p>
                  </td>
                  <td className="p-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                      {guest.service}
                    </span>
                  </td>
                  <td className="p-4">
                    {guest.paymentStatus === "PAID" ? (
                      <span className="text-green-600 font-bold text-xs flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đã thanh toán
                      </span>
                    ) : guest.status === "COMPLETED" ? (
                      <span className="text-orange-600 font-bold text-xs flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" /> Chờ thu tiền
                      </span>
                    ) : (
                      <span className="text-slate-500 font-bold text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> Đang phục vụ
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {guest.status === "COMPLETED" &&
                      guest.paymentStatus !== "PAID" && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenPayment(guest)}
                        >
                          Thanh toán
                        </Button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Thanh toán"
      >
        {paymentGuest && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-500">
                Khách hàng:{" "}
                <b className="text-slate-800">{paymentGuest.patientName}</b>
              </p>
              <p className="text-sm text-slate-500">
                Dịch vụ:{" "}
                <b className="text-slate-800">{paymentGuest.service}</b>
              </p>
            </div>
            {paymentGuest.billDetails.medicines?.length > 0 && (
              <div className="text-sm border-b pb-3 border-dashed">
                <p className="font-bold mb-2">Thuốc:</p>
                {paymentGuest.billDetails.medicines.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between text-slate-600">
                    <span>
                      - {m.medicineName} (x{m.quantity})
                    </span>
                    <span>{(m.price * m.quantity).toLocaleString()} đ</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between text-slate-600 text-sm">
              <span>Phí dịch vụ:</span>
              <div className="text-right">
                {paymentGuest.billDetails.discount > 0 ? (
                  <>
                    <span className="line-through text-slate-400 text-xs mr-2">
                      {(
                        paymentGuest.billDetails.serviceFee +
                        paymentGuest.billDetails.discount
                      ).toLocaleString()}{" "}
                      đ
                    </span>
                    <span className="font-bold text-green-600">0 đ</span>
                    <p className="text-[10px] text-green-600 flex items-center justify-end font-bold bg-green-50 px-2 py-0.5 rounded-full mt-1">
                      <ShieldCheck className="w-3 h-3 mr-1" />{" "}
                      {paymentGuest.billDetails.discountNote}
                    </p>
                  </>
                ) : (
                  <span className="font-medium">
                    {paymentGuest.billDetails.serviceFee.toLocaleString()} đ
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-lg border-t pt-3">
              <span>Tổng thanh toán:</span>
              <b className="text-primary text-xl">
                {paymentGuest.billDetails?.totalAmount?.toLocaleString()} đ
              </b>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowPaymentModal(false)}
              >
                Hủy
              </Button>
              <Button onClick={confirmPayment} className="bg-green-600">
                Xác nhận thu tiền
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tiếp nhận khách vãng lai"
      >
        <div className="space-y-4">
          <Input
            label="Tên chủ nuôi"
            value={walkInGuest.ownerName}
            onChange={(e) =>
              setWalkInGuest({ ...walkInGuest, ownerName: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tên thú cưng"
              value={walkInGuest.petName}
              onChange={(e) =>
                setWalkInGuest({ ...walkInGuest, petName: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium mb-1">Loại</label>
              <select
                className="w-full h-11 border rounded-xl px-3"
                value={walkInGuest.petType}
                onChange={(e) =>
                  setWalkInGuest({ ...walkInGuest, petType: e.target.value })
                }
              >
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dịch vụ</label>
            <select
              className="w-full h-11 border rounded-xl px-3"
              value={walkInGuest.service}
              onChange={(e) =>
                setWalkInGuest({ ...walkInGuest, service: e.target.value })
              }
            >
              <option value="Khám bệnh">Khám bệnh</option>
              <option value="Tiêm phòng">Tiêm phòng</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddWalkIn}>Lưu</Button>
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
