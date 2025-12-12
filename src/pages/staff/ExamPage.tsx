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
  Stethoscope,
  Pill,
  Thermometer,
  Activity,
  FileText,
} from "lucide-react";

export const ExamPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [appointment, setAppointment] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("pcx_appointments");
    if (saved) {
      const list = JSON.parse(saved);
      const found = list.find((item: any) => item.id === id);
      setAppointment(found);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const onSubmit = (data: any) => {
    console.log("Saving exam result:", data);
    const saved = localStorage.getItem("pcx_appointments");
    if (saved) {
      const list = JSON.parse(saved);
      const updated = list.map((item: any) =>
        item.id === id ? { ...item, status: "COMPLETED" } : item
      );
      localStorage.setItem("pcx_appointments", JSON.stringify(updated));
    }
    setShowSuccess(true);
  };

  if (!appointment)
    return <div className="p-10 text-center">Đang tải hồ sơ...</div>;

  return (
    <div className="pb-10 print:p-0">
      {/* Header - Ẩn khi in */}
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
        {/* Left Column: Patient Info */}
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

        {/* Right Column: Medical Form */}
        <div className="lg:col-span-2">
          <form className="space-y-6">
            {/* 1. Sinh hiệu */}
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

            {/* 2. Dịch vụ */}
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

            {/* 3. Thuốc */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center text-lg pb-2 border-b border-slate-50">
                <Pill className="w-5 h-5 mr-2 text-green-600" /> Phác đồ điều
                trị
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Toa thuốc
                </label>
                <textarea
                  {...register("toaThuoc")}
                  className="w-full p-4 rounded-xl border border-slate-200 min-h-[120px] focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Nhập tên thuốc và hướng dẫn sử dụng..."
                ></textarea>
              </div>
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
        message="Bệnh án đã được lưu thành công!"
      />
    </div>
  );
};
