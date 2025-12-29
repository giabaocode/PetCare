import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  ArrowLeft,
  Save,
  Pill,
  Activity,
  FileText,
  Loader2,
} from "lucide-react";

import { productsApi } from "../../api/productApi";
import { servicesApi } from "../../api/services";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showSuccess, setShowSuccess] = useState(false);
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);

  const [medForm, setMedForm] = useState({
    medicineId: "",
    quantity: 1,
    instruction: "Uống sau ăn",
  });

  const { data: productsRes, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["inventory-exam"],
    queryFn: () => productsApi.getAll({ limit: 100 }),
  });

  const inventoryList = Array.isArray(productsRes)
    ? productsRes
    : productsRes?.data || [];

  const addMedicine = () => {
    if (!medForm.medicineId) return;

    const selectedMed = inventoryList.find(
      (p: any) => p.MaSP === medForm.medicineId
    );

    if (selectedMed) {
      if (prescription.some((item) => item.medicineId === selectedMed.MaSP)) {
        alert("Thuốc này đã có trong đơn!");
        return;
      }

      setPrescription([
        ...prescription,
        {
          medicineId: selectedMed.MaSP,
          medicineName: selectedMed.TenSP,
          quantity: Number(medForm.quantity),
          unit: selectedMed.DonViTinh || "Viên",
          instruction: medForm.instruction,
          price: Number(selectedMed.GiaBan),
        },
      ]);

      setMedForm({ ...medForm, medicineId: "", quantity: 1 });
    }
  };

  const removeMedicine = (index: number) => {
    const newPrescription = [...prescription];
    newPrescription.splice(index, 1);
    setPrescription(newPrescription);
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        status: "WAITING_PAYMENT",
        ketQuaKham: {
          ChanDoan: data.ChanDoan,
          LoiDan: data.LoiDan,
          DonThuoc: prescription,
        },
      };

      if (!id) throw new Error("Mã lịch hẹn không hợp lệ");
      return await servicesApi.updateStatus(id, "WAITING_PAYMENT", payload);
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (err: any) => {
      alert("Lỗi lưu bệnh án: " + (err.response?.data?.error || err.message));
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/staff/schedule")}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại lịch
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Khám bệnh & Kê đơn
          </h1>
          <p className="text-slate-500 text-sm">
            Mã lịch hẹn:{" "}
            <span className="font-mono font-bold text-slate-700">{id}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin chẩn đoán */}
        <div className="lg:col-span-2 space-y-6">
          <form
            id="exam-form"
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" /> Kết quả khám lâm
              sàng
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chẩn đoán bệnh <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("ChanDoan", {
                    required: "Vui lòng nhập chẩn đoán bệnh",
                  })}
                  className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[100px] ${
                    errors.ChanDoan ? "border-red-500" : "border-gray-200"
                  }`}
                  placeholder="Ví dụ: Viêm da dị ứng, Rối loạn tiêu hóa..."
                ></textarea>
                {errors.ChanDoan && (
                  <span className="text-xs text-red-500 mt-1">
                    {String(errors.ChanDoan.message)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lời dặn của bác sĩ / Ghi chú
                </label>
                <textarea
                  {...register("LoiDan")}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
                  placeholder="Ví dụ: Kiêng tắm 3 ngày, tái khám sau 1 tuần..."
                ></textarea>
              </div>
            </div>
          </form>

          {/* Nút Submit */}
          <div className="flex justify-end">
            <Button
              onClick={() => {
                const form = document.getElementById(
                  "exam-form"
                ) as HTMLFormElement;
                form.requestSubmit();
              }}
              className="h-12 px-8 text-lg shadow-lg shadow-primary/20"
              isLoading={mutation.isPending}
            >
              <Save className="w-5 h-5 mr-2" /> Lưu & Kết thúc khám
            </Button>
          </div>
        </div>

        {/* Cột phải: Kê đơn thuốc */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-500" /> Kê đơn thuốc
            </h3>

            {/* Form thêm thuốc nhỏ */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Chọn thuốc
                </label>
                {isLoadingProducts ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải
                    thuốc...
                  </div>
                ) : (
                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg outline-none mt-1 bg-white"
                    value={medForm.medicineId}
                    onChange={(e) =>
                      setMedForm({ ...medForm, medicineId: e.target.value })
                    }
                  >
                    <option value="">-- Chọn thuốc từ kho --</option>
                    {inventoryList.map((p: any) => (
                      <option key={p.MaSP} value={p.MaSP}>
                        {p.TenSP} (Tồn: {p.SoLuongTon})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex gap-2">
                <div className="w-1/3">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    S.Lượng
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border border-gray-200 rounded-lg outline-none mt-1"
                    value={medForm.quantity}
                    onChange={(e) =>
                      setMedForm({
                        ...medForm,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Cách dùng
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg outline-none mt-1"
                    value={medForm.instruction}
                    onChange={(e) =>
                      setMedForm({ ...medForm, instruction: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-slate-800 hover:bg-slate-900"
                onClick={addMedicine}
                disabled={!medForm.medicineId}
              >
                Thêm vào đơn
              </Button>
            </div>

            {/* Danh sách thuốc đã kê */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-bold text-sm text-slate-700 mb-3">
                Đơn thuốc hiện tại ({prescription.length})
              </h4>

              {prescription.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  Chưa có thuốc nào.
                </p>
              ) : (
                <div className="space-y-3">
                  {prescription.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between items-start group"
                    >
                      <div>
                        <p className="font-bold text-sm text-gray-800">
                          {item.medicineName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          SL:{" "}
                          <span className="font-bold text-gray-900">
                            {item.quantity} {item.unit}
                          </span>
                          <span className="mx-2">•</span>
                          {item.instruction}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedicine(idx)}
                        className="text-red-400 hover:text-red-600 text-xs px-2 py-1"
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
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/staff/schedule");
        }}
        message="Đã lưu bệnh án & Chuyển sang lễ tân!"
      />
    </div>
  );
};
