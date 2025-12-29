import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { SuccessModal } from "../ui/SuccessModal";
import { ErrorModal } from "../ui/ErrorModal";
import { ArrowRight, ArrowLeft, Calendar } from "lucide-react";

import { servicesApi } from "../../api/services";

import { packageApi } from "../../api/packagesApi";
import { usersApi } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

export const BookingWizard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, watch, trigger } = useForm({
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

  const selectedBranch = watch("maCN");
  const selectedService = watch("serviceType");
  const selectedDateTime = watch("dateTime");

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await servicesApi.getAllBranches();
      return Array.isArray(res) ? res : (res as any).data || [];
    },
  });

  const { data: myPets = [] } = useQuery({
    queryKey: ["my-pets"],
    queryFn: async () => {
      const res = await usersApi.getMyPets();
      return Array.isArray(res) ? res : (res as any).data || res || [];
    },
    enabled: true,
  });

  const { data: availableVaccines = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await packageApi.getAll();

      const data = Array.isArray(res) ? res : (res as any).data || [];

      return data.map((pkg: any) => ({
        id: pkg.MaGoi,
        name: pkg.TenGoi,

        price: pkg.GiaTien || 0,
        stock: 999,
      }));
    },
  });

  const { data: availableDoctors = [] } = useQuery({
    queryKey: ["doctors", selectedBranch],
    queryFn: async () => {
      if (!selectedBranch) return [];
      const res = await usersApi.getDoctorsByBranch(selectedBranch);
      return res || [];
    },
    enabled: !!selectedBranch,
  });

  const handleNextStep = async () => {
    const isValid = await trigger(["maCN", "maTC", "dateTime"]);

    let isVaccineValid = true;
    if (selectedService === "VACCINATION") {
      isVaccineValid = await trigger("maVaccine");
    }

    if (isValid && isVaccineValid) {
      setStep(2);
    } else {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      setShowError(true);
    }
  };

  const mutation = useMutation({
    mutationFn: async (d: any) => {
      const isoDateTime = new Date(d.dateTime).toISOString();

      await servicesApi.createBookingFull({
        ...d,
        dateTime: isoDateTime,

        MaKH: profile?.MaKH,
      });
    },
    onSuccess: () => setShowSuccess(true),
    onError: (err: any) => {
      setErrorMsg(
        err.response?.data?.message || err.message || "Có lỗi xảy ra"
      );
      setShowError(true);
    },
  });

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
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">-- Chọn phòng khám --</option>
                {branches.map((b: any) => (
                  <option key={b.MaCN} value={b.MaCN}>
                    {b.TenCN} ({b.DiaChi})
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
                  min={new Date().toISOString().slice(0, 16)}
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
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
              >
                <option value="">-- Chỉ định tại quầy --</option>
                {availableDoctors.length > 0 ? (
                  availableDoctors.map((doc: any) => (
                    <option key={doc.MaND} value={doc.MaND}>
                      BS. {doc.HoTen}
                    </option>
                  ))
                ) : selectedBranch ? (
                  <option disabled>
                    Không tìm thấy bác sĩ tại chi nhánh này
                  </option>
                ) : null}
              </select>
            </div>

            {/* Chọn Thú cưng */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">
                Chọn Thú cưng (*)
              </label>
              <select
                {...register("maTC", { required: true })}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">-- Chọn bé --</option>
                {myPets.map((p: any) => (
                  <option key={p.MaTC} value={p.MaTC}>
                    {p.TenTC} ({p.Loai} - {p.Giong})
                  </option>
                ))}
              </select>
              {myPets.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Bạn chưa có hồ sơ thú cưng nào. Vui lòng tạo hồ sơ trước.
                </p>
              )}
            </div>

            {/* Chọn Loại Dịch Vụ */}
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

            {/* Hiển thị Dropdown Gói Tiêm */}
            {selectedService === "VACCINATION" && (
              <div className="animate-fade-in">
                <label className="block font-medium text-gray-700 mb-2">
                  Chọn Gói Tiêm / Vaccine (*)
                </label>
                <select
                  {...register("maVaccine", { required: true })}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">-- Chọn gói tiêm --</option>
                  {availableVaccines.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name}{" "}
                      {v.price > 0 ? `(Giá: ${v.price.toLocaleString()}đ)` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Luôn hiển thị ô Ghi chú/Triệu chứng */}
            <div>
              <label className="block font-medium text-gray-700 mb-2 mt-4">
                {selectedService === "VACCINATION"
                  ? "Ghi chú thêm (Tình trạng sức khỏe)"
                  : "Triệu chứng / Lý do khám"}
              </label>
              <textarea
                {...register("trieuChung")}
                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary h-24"
                placeholder={
                  selectedService === "VACCINATION"
                    ? "VD: Bé đang khỏe mạnh, không sốt, ăn uống bình thường..."
                    : "VD: Bé bỏ ăn 2 ngày nay, hay nôn ói..."
                }
              ></textarea>
            </div>

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
              {/* Review Info */}
              <div className="flex justify-between border-b border-dashed pb-3">
                <span className="text-gray-500">Thời gian khám:</span>
                <span className="font-bold text-primary text-lg text-right">
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
                <span className="font-medium text-gray-900 text-right">
                  {branches.find((b: any) => b.MaCN === watch("maCN"))?.TenCN}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Thú cưng:</span>
                <span className="font-medium text-gray-900 text-right">
                  {
                    myPets.find(
                      (p: any) => String(p.MaTC) === String(watch("maTC"))
                    )?.TenTC
                  }
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Dịch vụ:</span>
                <span className="font-medium text-gray-900 text-right">
                  {watch("serviceType") === "EXAMINATION"
                    ? "Khám bệnh"
                    : "Tiêm phòng"}
                </span>
              </div>

              {watch("serviceType") === "VACCINATION" && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Gói Tiêm:</span>
                  <span className="font-medium text-gray-900 text-right">
                    {
                      availableVaccines.find(
                        (v: any) => v.id === watch("maVaccine")
                      )?.name
                    }
                  </span>
                </div>
              )}

              {/* Hiển thị ghi chú nếu có */}
              {watch("trieuChung") && (
                <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-dashed">
                  <span className="text-gray-500 text-sm">
                    Ghi chú/Triệu chứng:
                  </span>
                  <span className="font-medium text-gray-900 italic text-sm">
                    "{watch("trieuChung")}"
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
                disabled={mutation.isPending}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại sửa
              </Button>
              <Button
                type="submit"
                className="flex-[2]"
                isLoading={mutation.isPending}
              >
                Xác nhận Đặt lịch
              </Button>
            </div>
          </div>
        )}
      </form>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/dashboard");
        }}
        title="Đặt lịch thành công!"
        message="Chúng tôi đã nhận được yêu cầu. Vui lòng đến đúng giờ."
      />

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Thông tin chưa đủ"
        message={errorMsg || "Vui lòng kiểm tra lại thông tin."}
      />
    </div>
  );
};
