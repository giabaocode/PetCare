import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  ArrowLeft,
  Save,
  Printer,
  Pill,
  Activity,
  FileText,
  Thermometer,
} from "lucide-react";
// IMPORT DATA PROVIDER
import {
  getSharedAppointments,
  getSharedInventory,
} from "../../utils/dataProvider";

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unit: string;
  instruction: string;
  price: number; // Thêm giá để tính tiền sau này
}

export const ExamPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [appointment, setAppointment] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // STATE: Lấy danh sách thuốc TỪ KHO CHUNG (Real-time)
  const [inventoryList, setInventoryList] = useState<any[]>([]);

  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);
  const [selectedMedId, setSelectedMedId] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  // Load dữ liệu khi vào trang
  useEffect(() => {
    // 1. Load hồ sơ bệnh án
    const list = getSharedAppointments();
    const found = list.find((item: any) => item.id === id);
    setAppointment(found);

    // 2. Load danh sách thuốc từ kho
    setInventoryList(getSharedInventory());
  }, [id]);

  const handleAddMedicine = () => {
    // Tìm thuốc trong kho chung
    const med = inventoryList.find((m) => m.id === selectedMedId);
    if (!med) return;

    // Check tồn kho
    if (qty > med.stock) {
      alert(`Kho chỉ còn ${med.stock} ${med.unit}! Không đủ để kê.`);
      return;
    }

    const newItem: PrescriptionItem = {
      medicineId: med.id,
      medicineName: med.name,
      quantity: Number(qty),
      unit: med.unit,
      instruction: note,
      price: Number(med.price),
    };

    setPrescription([...prescription, newItem]);

    // Reset form
    setSelectedMedId("");
    setQty(1);
    setNote("");
  };

  const removeMedicine = (index: number) => {
    const newList = [...prescription];
    newList.splice(index, 1);
    setPrescription(newList);
  };

  const handlePrint = () => {
    window.print();
  };

  const onSubmit = (data: any) => {
    // --- 1. CẬP NHẬT TRẠNG THÁI BỆNH ÁN ---
    const finalData = {
      ...data,
      ToaThuocChiTiet: prescription,
      Status: "COMPLETED",
    };

    const apptList = getSharedAppointments();
    const updatedAppts = apptList.map((item: any) =>
      item.id === id
        ? { ...item, status: "COMPLETED", result: finalData } // Chuyển trạng thái
        : item
    );
    localStorage.setItem("pcx_appointments", JSON.stringify(updatedAppts));

    // --- 2. TRỪ TỒN KHO (LOGIC QUAN TRỌNG) ---
    if (prescription.length > 0) {
      const currentInventory = getSharedInventory();

      const updatedInventory = currentInventory.map((item: any) => {
        // Tìm xem item này có trong đơn thuốc không
        const prescribedItem = prescription.find(
          (p) => p.medicineId === item.id
        );

        if (prescribedItem) {
          const newStock = item.stock - prescribedItem.quantity;
          return {
            ...item,
            stock: newStock,
            // Cập nhật trạng thái kho luôn
            status:
              newStock <= 0
                ? "Out of Stock"
                : newStock <= (item.minStock || 10)
                ? "Low Stock"
                : "In Stock",
          };
        }
        return item;
      });

      // Lưu kho mới
      localStorage.setItem("pcx_inventory", JSON.stringify(updatedInventory));
    }

    // --- 3. BẮN SỰ KIỆN CẬP NHẬT TOÀN HỆ THỐNG ---
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("local-storage-update"));

    setShowSuccess(true);
  };

  if (!appointment)
    return <div className="p-10 text-center">Đang tải hồ sơ...</div>;

  return (
    <div className="pb-10 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
        </button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white text-slate-600 border-slate-200"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" /> In phiếu
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20"
          >
            <Save className="w-4 h-4 mr-2" /> Hoàn tất ca khám
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block">
        {/* Cột trái: Thông tin bệnh nhân (Giữ nguyên UI) */}
        <div className="lg:col-span-1 space-y-6 print:mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6 print:static print:border-none print:shadow-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl print:border print:border-gray-300">
                {appointment.type?.includes("Mèo") ? "🐱" : "🐶"}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-xl">
                  {appointment.petName}
                </h3>
                <span className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-600 print:border print:border-gray-200">
                  {appointment.type || "Thú cưng"}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm border-t border-slate-100 pt-4">
              <div>
                <label className="text-slate-400 block text-xs uppercase font-bold mb-1">
                  Mã hồ sơ
                </label>
                <p className="font-mono font-medium text-slate-700 bg-slate-50 p-2 rounded block print:bg-transparent print:p-0 print:border print:border-gray-200">
                  {id}
                </p>
              </div>
              <div>
                <label className="text-slate-400 block text-xs uppercase font-bold mb-1">
                  Chủ sở hữu
                </label>
                <p className="font-medium text-slate-700 text-base">
                  {appointment.patientName}
                </p>
              </div>
              <div>
                <label className="text-slate-400 block text-xs uppercase font-bold mb-1">
                  Lý do khám
                </label>
                <p className="text-slate-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100 print:bg-transparent print:border-gray-200">
                  {appointment.symptom || "Khám định kỳ"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Form Khám */}
        <div className="lg:col-span-2">
          <form className="space-y-6">
            {/* Sinh hiệu */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center text-lg pb-2 border-b border-slate-50">
                <Activity className="w-5 h-5 mr-2 text-primary" /> Sinh hiệu &
                Lâm sàng
              </h3>
              <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cân nặng (kg)
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="0.0"
                      {...register("canNang")}
                      className="pl-9"
                    />
                    <span className="absolute left-3 top-3 text-slate-400 text-xs">
                      KG
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nhiệt độ (℃)
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="37.5"
                      {...register("nhietDo")}
                      className="pl-9"
                    />
                    <Thermometer className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Chẩn đoán sơ bộ
                  </label>
                  <Input
                    placeholder="VD: Rối loạn tiêu hóa..."
                    {...register("chanDoan")}
                  />
                </div>
              </div>
            </div>

            {/* Chỉ định CLS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center text-lg pb-2 border-b border-slate-50">
                <FileText className="w-5 h-5 mr-2 text-blue-500" /> Chỉ định Cận
                lâm sàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Siêu âm ổ bụng",
                  "X-Quang",
                  "Xét nghiệm máu",
                  "Test Parvo/Care",
                ].map((dv) => (
                  <label
                    key={dv}
                    className="flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded"
                      {...register(`dv_${dv}`)}
                    />
                    <span className="ml-3 text-sm text-slate-700">{dv}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Kê đơn thuốc (DÙNG DỮ LIỆU KHO THẬT) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center text-lg pb-2 border-b border-slate-50">
                <Pill className="w-5 h-5 mr-2 text-green-600" /> Kê đơn thuốc
              </h3>

              <div className="grid grid-cols-12 gap-3 mb-4 bg-gray-50 p-4 rounded-xl items-end">
                <div className="col-span-4">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Tên thuốc
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                  >
                    <option value="">-- Chọn thuốc --</option>
                    {/* Render từ kho Inventory thay vì biến cứng */}
                    {inventoryList.map((m) => (
                      <option key={m.id} value={m.id} disabled={m.stock === 0}>
                        {m.name} (Tồn: {m.stock}) {m.stock === 0 ? "- HẾT" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    SL
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                </div>
                <div className="col-span-4">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Cách dùng
                  </label>
                  <input
                    type="text"
                    placeholder="Sáng/Chiều..."
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    type="button"
                    onClick={handleAddMedicine}
                    size="sm"
                    className="w-full"
                  >
                    Thêm
                  </Button>
                </div>
              </div>

              {prescription.length > 0 ? (
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="p-3">Tên thuốc</th>
                        <th className="p-3">SL</th>
                        <th className="p-3">Đơn vị</th>
                        <th className="p-3">HDSD</th>
                        <th className="p-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="p-3 font-medium">
                            {item.medicineName}
                          </td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3 text-gray-500">{item.unit}</td>
                          <td className="p-3 text-gray-500 italic">
                            {item.instruction}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeMedicine(idx)}
                              className="text-red-500 hover:text-red-700 font-medium text-xs"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4 italic">
                  Chưa có thuốc nào được kê.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/staff/schedule");
        }}
        message="Bệnh án đã lưu & Đã trừ tồn kho!"
      />
    </div>
  );
};
