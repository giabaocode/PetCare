import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { ArrowLeft, Save, Pill, Activity, FileText } from "lucide-react";

// IMPORT DB CHUNG
import { db } from "../../utils/dataProvider";

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unit: string;
  instruction: string;
  price: number;
}

export const ExamPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  // State
  const [appointment, setAppointment] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inventoryList, setInventoryList] = useState<any[]>(db.getInventory());
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);

  // Form thêm thuốc
  const [medForm, setMedForm] = useState({
    medicineId: "",
    quantity: 1,
    instruction: "Uống sau ăn",
  });

  // 1. Load dữ liệu Lịch hẹn & Kho khi vào trang
  useEffect(() => {
    const appts = db.getAppointments();
    const found = appts.find((a: any) => String(a.id) === String(id));
    if (found) {
      setAppointment(found);
    } else {
      alert("Không tìm thấy lịch khám!");
      navigate("/staff/schedule");
    }
  }, [id, navigate]);

  // 2. Xử lý thêm thuốc vào toa
  const addMedicine = () => {
    const selectedItem = inventoryList.find((i) => i.id === medForm.medicineId);
    if (!selectedItem) return;

    if (selectedItem.stock < medForm.quantity) {
      alert(`Kho chỉ còn ${selectedItem.stock} ${selectedItem.unit}!`);
      return;
    }

    const newItem: PrescriptionItem = {
      medicineId: selectedItem.id,
      medicineName: selectedItem.name,
      quantity: medForm.quantity,
      unit: selectedItem.unit,
      price: selectedItem.price,
      instruction: medForm.instruction,
    };

    setPrescription([...prescription, newItem]);

    // Reset form nhỏ
    setMedForm({ ...medForm, medicineId: "", quantity: 1 });
  };

  const removeMedicine = (idx: number) => {
    setPrescription(prescription.filter((_, i) => i !== idx));
  };

  // 3. LƯU BỆNH ÁN (Logic quan trọng nhất)
  const onSubmit = (data: any) => {
    if (!appointment) return;

    // A. TRỪ TỒN KHO (Inventory)
    const currentInventory = db.getInventory();
    const updatedInventory = currentInventory.map((item: any) => {
      const usedItem = prescription.find((p) => p.medicineId === item.id);
      if (usedItem) {
        return { ...item, stock: item.stock - usedItem.quantity };
      }
      return item;
    });
    // Lưu kho mới
    db.updateInventory(updatedInventory);

    // B. CẬP NHẬT LỊCH HẸN (Appointments)
    // Chuyển trạng thái sang COMPLETED để Lễ tân thấy
    // Lưu toa thuốc vào result để Lễ tân tính tiền
    db.updateAppointment(appointment.id, {
      status: "COMPLETED",
      paymentStatus: "UNPAID", // Chờ thanh toán
      symptom: data.trieuChung, // Cập nhật triệu chứng thực tế
      result: {
        ChanDoan: data.chanDoan,
        LoiDan: data.loiDan,
        TaiKham: false,
        ToaThuocChiTiet: prescription, // <--- QUAN TRỌNG: Truyền cái này cho Lễ tân
      },
    });

    setShowSuccess(true);
  };

  if (!appointment) return <div>Loading...</div>;

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/staff/schedule")}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Khám bệnh: {appointment.petName} ({appointment.type})
          </h1>
          <p className="text-slate-500 text-sm">
            Chủ nuôi: {appointment.patientName}
          </p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Cột trái: Thông tin khám */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
          <form
            id="exam-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div>
              <h3 className="flex items-center font-bold text-slate-700 mb-4">
                <Activity className="w-5 h-5 mr-2 text-primary" /> Diễn biến
                bệnh
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Triệu chứng lâm sàng
                  </label>
                  <textarea
                    {...register("trieuChung")}
                    defaultValue={appointment.symptom}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Chẩn đoán của bác sĩ
                  </label>
                  <Input
                    {...register("chanDoan")}
                    placeholder="VD: Viêm da dị ứng..."
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="flex items-center font-bold text-slate-700 mb-4">
                <FileText className="w-5 h-5 mr-2 text-primary" /> Lời dặn
              </h3>
              <textarea
                {...register("loiDan")}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                rows={2}
                placeholder="Ghi chú cho chủ nuôi..."
              ></textarea>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full shadow-lg shadow-primary/20"
              >
                <Save className="w-5 h-5 mr-2" /> Lưu kết quả & Chuyển thanh
                toán
              </Button>
            </div>
          </form>
        </div>

        {/* Cột phải: Kê đơn thuốc */}
        <div className="w-[400px] bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-slate-50 rounded-t-2xl">
            <h3 className="font-bold text-slate-700 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-primary" /> Kê đơn thuốc
            </h3>
          </div>

          <div className="p-4 space-y-4 border-b border-gray-100">
            {/* Form chọn thuốc */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Chọn thuốc (Tồn kho)
              </label>
              <select
                className="w-full mt-1 p-2 border border-gray-200 rounded-lg outline-none"
                value={medForm.medicineId}
                onChange={(e) =>
                  setMedForm({ ...medForm, medicineId: e.target.value })
                }
              >
                <option value="">-- Chọn thuốc --</option>
                {inventoryList
                  .filter((i) => i.stock > 0)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Còn: {item.stock})
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Số lượng
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full mt-1 p-2 border border-gray-200 rounded-lg outline-none"
                  value={medForm.quantity}
                  onChange={(e) =>
                    setMedForm({ ...medForm, quantity: Number(e.target.value) })
                  }
                />
              </div>
              <div className="flex-[2]">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Cách dùng
                </label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-200 rounded-lg outline-none"
                  value={medForm.instruction}
                  onChange={(e) =>
                    setMedForm({ ...medForm, instruction: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              size="sm"
              onClick={addMedicine}
              disabled={!medForm.medicineId}
              className="w-full"
            >
              Thêm vào toa
            </Button>
          </div>

          {/* Danh sách thuốc đã kê */}
          <div className="flex-1 overflow-y-auto p-4">
            {prescription.length === 0 ? (
              <div className="text-center text-gray-400 italic mt-10">
                Chưa có thuốc nào
              </div>
            ) : (
              <div className="space-y-3">
                {prescription.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 p-3 rounded-lg flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-700">
                        {item.medicineName}
                      </p>
                      <p className="text-xs text-slate-500">
                        SL: {item.quantity} {item.unit} • {item.instruction}
                      </p>
                    </div>
                    <button
                      onClick={() => removeMedicine(idx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/staff/schedule");
        }}
        message="Đã lưu bệnh án & Trừ kho thành công!"
      />
    </div>
  );
};
