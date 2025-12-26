import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { servicesApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SuccessModal } from "../ui/SuccessModal";
import { Modal } from "../ui/Modal";
import { ErrorModal } from "../ui/ErrorModal"; // Dùng ErrorModal cho đẹp
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react";
import { db } from "../../utils/dataProvider";

export const BookingWizard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // State Modals
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false); // State hiển thị modal lỗi
  const [errorMsg, setErrorMsg] = useState(""); // Nội dung lỗi

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      maCN: "",
      serviceType: "EXAMINATION",
      maTC: "",
      dateTime: "",
      trieuChung: "",
      maNVPhuTrach: "",
      maVaccine: "",
    },
  });

  // Watchers
  const selectedBranch = watch("maCN");
  const selectedService = watch("serviceType");
  const selectedDateTime = watch("dateTime");

  // State dữ liệu động
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [availableVaccines, setAvailableVaccines] = useState<any[]>([]);
  const [myPets, setMyPets] = useState<any[]>([]);

  useEffect(() => {
    const inventory = db.getInventory();
    const vaccines = inventory.filter(
      (i: any) => i.category === "Vaccine" && i.stock > 0
    );
    setAvailableVaccines(vaccines);
  }, []);

  useEffect(() => {
    if (profile?.MaKH) {
      const allPets = db.getPets();
      setMyPets(allPets.filter((p: any) => p.MaKH === profile.MaKH));
    }
  }, [profile]);

  useEffect(() => {
    if (selectedBranch) {
      const allUsers = db.getUsers();
      const doctors = allUsers.filter(
        (u: any) => u.Role === "DOCTOR" && u.MaCN === selectedBranch
      );
      setAvailableDoctors(doctors);
      setValue("maNVPhuTrach", "");
    } else {
      setAvailableDoctors([]);
    }
  }, [selectedBranch, setValue]);

  // --- HÀM CHUYỂN BƯỚC ĐÃ SỬA ---
  const handleNextStep = async () => {
    const isValid = await trigger(["maCN", "maTC", "dateTime"]);

    let isVaccineValid = true;
    if (selectedService === "VACCINATION") {
      isVaccineValid = await trigger("maVaccine");
    }

    if (isValid && isVaccineValid) {
      setStep(2);
    } else {
      // FIX: Thay alert bằng Error Modal
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      setShowError(true);
    }
  };

  const mutation = useMutation({
    mutationFn: async (d: any) => {
      let symptomText = d.trieuChung;
      if (d.serviceType === "VACCINATION" && d.maVaccine) {
        const v = availableVaccines.find((vac) => vac.id === d.maVaccine);
        symptomText = `Tiêm phòng: ${v?.name || d.maVaccine}`;
      }

      await servicesApi.createBookingFull({
        ...d,
        trieuChung: symptomText,
        MaKH: profile?.MaKH,
      });
    },
    onSuccess: () => setShowSuccess(true),
    onError: (err: any) => {
      // Khi API lỗi cũng hiện Modal
      setErrorMsg(err.message || "Có lỗi xảy ra khi đặt lịch");
      setShowError(true);
    },
  });

  const branches = [
    { id: "CN01", name: "PetCare Quận 1 (Chính)" },
    { id: "CN02", name: "PetCare Quận 7" },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100 my-8">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Đặt lịch khám</h2>
        <p className="text-gray-500">
          Bước {step}/2:{" "}
          {step === 1 ? "Thông tin dịch vụ" : "Xác nhận thông tin"}
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <div
            className={`h-2 w-12 rounded-full transition-all ${
              step >= 1 ? "bg-primary" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`h-2 w-12 rounded-full transition-all ${
              step >= 2 ? "bg-primary" : "bg-gray-200"
            }`}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Chọn Chi nhánh */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Chọn Chi nhánh (*)
              </label>
              <select
                {...register("maCN", { required: true })}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Chọn phòng khám --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Ngày Giờ */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Thời gian khám (*)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="datetime-local"
                  {...register("dateTime", { required: true })}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Chọn Bác sĩ */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Bác sĩ phụ trách (Tùy chọn)
              </label>
              <select
                {...register("maNVPhuTrach")}
                disabled={!selectedBranch}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Bác sĩ chỉ định --</option>
                {availableDoctors.map((doc) => (
                  <option key={doc.MaND} value={doc.HoTen}>
                    {doc.HoTen}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Thú cưng */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Chọn Thú cưng (*)
              </label>
              <select
                {...register("maTC", { required: true })}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Chọn bé --</option>
                {myPets.map((p) => (
                  <option key={p.MaTC} value={p.MaTC}>
                    {p.TenTC} ({p.Loai})
                  </option>
                ))}
              </select>
            </div>

            {/* Loại dịch vụ */}
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`p-4 border rounded-xl cursor-pointer text-center transition-all ${
                  selectedService === "EXAMINATION"
                    ? "border-primary bg-primary/5 text-primary font-bold"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  value="EXAMINATION"
                  {...register("serviceType")}
                  className="hidden"
                />{" "}
                Khám bệnh
              </label>
              <label
                className={`p-4 border rounded-xl cursor-pointer text-center transition-all ${
                  selectedService === "VACCINATION"
                    ? "border-primary bg-primary/5 text-primary font-bold"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  value="VACCINATION"
                  {...register("serviceType")}
                  className="hidden"
                />{" "}
                Tiêm phòng
              </label>
            </div>

            {/* Form động */}
            {selectedService === "EXAMINATION" ? (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Triệu chứng / Ghi chú
                </label>
                <textarea
                  {...register("trieuChung")}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary h-24"
                  placeholder="VD: Bé bỏ ăn 2 ngày nay..."
                ></textarea>
              </div>
            ) : (
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Chọn loại Vaccine (Kho) (*)
                </label>
                <select
                  {...register("maVaccine", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Chọn vaccine --</option>
                  {availableVaccines.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Giá: {v.price.toLocaleString()}đ)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button type="button" onClick={handleNextStep}>
                Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <p className="text-green-800 font-medium">
                Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between border-b border-dashed pb-3">
                <span className="text-gray-500">Thời gian khám:</span>
                <span className="font-bold text-primary text-lg">
                  {selectedDateTime
                    ? new Date(selectedDateTime).toLocaleString("vi-VN", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })
                    : "Chưa chọn"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chi nhánh:</span>
                <span className="font-medium text-gray-900">
                  {branches.find((b) => b.id === watch("maCN"))?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bác sĩ:</span>
                <span className="font-medium text-gray-900">
                  {watch("maNVPhuTrach") || "Chỉ định sau"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Thú cưng:</span>
                <span className="font-medium text-gray-900">
                  {
                    myPets.find((p) => String(p.MaTC) === String(watch("maTC")))
                      ?.TenTC
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dịch vụ:</span>
                <span className="font-medium text-gray-900">
                  {watch("serviceType") === "EXAMINATION"
                    ? "Khám bệnh"
                    : "Tiêm phòng"}
                </span>
              </div>
              {watch("serviceType") === "VACCINATION" && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vaccine:</span>
                  <span className="font-medium text-gray-900">
                    {
                      availableVaccines.find((v) => v.id === watch("maVaccine"))
                        ?.name
                    }
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại sửa
              </Button>
              <Button type="submit" className="flex-[2]">
                Xác nhận Đặt lịch
              </Button>
            </div>
          </div>
        )}
      </form>

      {/* Modal Thành Công */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/dashboard");
        }}
        title="Đặt lịch thành công!"
        message="Chúng tôi đã nhận được yêu cầu. Vui lòng đến đúng giờ."
      />

      {/* Modal Báo Lỗi (Thay cho alert) */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Thông tin chưa đủ"
        message={errorMsg || "Vui lòng kiểm tra lại thông tin."}
      />
    </div>
  );
};
