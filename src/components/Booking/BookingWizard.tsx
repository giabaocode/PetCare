import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { petsApi } from "../../api/pets";
import { servicesApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Stethoscope,
  Syringe,
  MapPin,
  Cat,
  Dog,
  Plus,
  UserPlus,
  Pill,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { SuccessModal } from "../ui/SuccessModal";

const bookingSchema = z.object({
  maCN: z.string().min(1, "Vui lòng chọn chi nhánh"),
  serviceType: z.enum(["EXAMINATION", "VACCINATION"]),
  maTC: z.string().min(1, "Vui lòng chọn thú cưng"),
  dateTime: z.string().min(1, "Vui lòng chọn thời gian"),
  trieuChung: z.string().optional(),
  maNVPhuTrach: z.string().optional(),
  maVaccine: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

// Mock Data
const MOCK_DOCTORS = [
  { id: "bs-01", name: "BS. Nguyễn Văn A (Nội khoa)" },
  { id: "bs-02", name: "BS. Trần Thị B (Ngoại khoa)" },
  { id: "bs-03", name: "BS. Lê Văn C (Chuyên gia)" },
];

const MOCK_VACCINES = [
  { id: "101", name: "Vaccine 5 bệnh (Chó)" },
  { id: "102", name: "Vaccine 7 bệnh (Chó)" },
  { id: "201", name: "Vaccine 4 bệnh (Mèo)" },
  { id: "301", name: "Vaccine Dại (Chung)" },
];

export const BookingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false); // State cho modal
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // FIX: SỬ DỤNG petsApi THAY VÌ GỌI AXIOS TRỰC TIẾP
  const { data: pets = [] } = useQuery({
    queryKey: ["pets", profile?.MaKH],
    queryFn: async () => {
      if (!profile?.MaKH) return [];
      try {
        // Gọi hàm mock data chuẩn
        const res = await petsApi.getAll(profile.MaKH);
        // Xử lý dữ liệu trả về an toàn
        return (res as any).data || res || [];
      } catch (e) {
        console.error("Lỗi lấy pets:", e);
        return [];
      }
    },
    enabled: !!profile?.MaKH,
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: servicesApi.getBranches,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { serviceType: "EXAMINATION" },
  });

  const formValues = watch();

  const mutation = useMutation({
    mutationFn: async (d: BookingForm) => {
      const dichVu = await servicesApi.createDichVu({
        TenDV: d.serviceType === "EXAMINATION" ? "Khám bệnh" : "Tiêm phòng",
        MaTC: parseInt(d.maTC),
        MoTa: d.trieuChung,
        NhanVienPhuTrach: d.maNVPhuTrach || undefined,
      });

      if (d.serviceType === "EXAMINATION") {
        await servicesApi.createKhamBenh({
          MaDV: dichVu.MaDV,
          NgayKham: new Date(d.dateTime).toISOString(),
          TrieuChung: d.trieuChung || "",
        });
      } else {
        await servicesApi.createTiemPhong({
          MaDV: dichVu.MaDV,
          MaTC: parseInt(d.maTC),
          NgayTiem: new Date(d.dateTime).toISOString(),
          MaVaccine: d.maVaccine ? parseInt(d.maVaccine) : undefined,
        });
      }
    },
    onSuccess: () => {
      // Invalidate để cập nhật lịch sử khám ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });

      setShowSuccess(true); // <-- THÊM DÒNG NÀY      navigate("/dashboard");
    },
    onError: (err: any) => alert("Lỗi: " + err.message),
  });

  const handleNextStep = async () => {
    const valid = await trigger(["serviceType", "maCN"]);
    if (valid) setStep(2);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center w-full max-w-md relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full"></div>
          <div
            className={`absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500 ${
              step === 1 ? "w-0" : "w-full"
            }`}
          ></div>

          <div className="flex justify-between w-full">
            <div className="flex flex-col items-center gap-2">
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4",
                  step >= 1
                    ? "bg-primary text-white border-primary/30"
                    : "bg-white text-gray-400 border-gray-200"
                )}
              >
                1
              </div>
              <span className="text-xs font-bold text-gray-700">Dịch vụ</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4",
                  step >= 2
                    ? "bg-primary text-white border-primary/30"
                    : "bg-white text-gray-400 border-gray-200"
                )}
              >
                2
              </div>
              <span className="text-xs font-bold text-gray-700">Chi tiết</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-heading font-bold text-gray-900">
              {step === 1
                ? "Bước 1: Chọn Dịch vụ"
                : "Bước 2: Hoàn tất thông tin"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Điền đầy đủ thông tin để bác sĩ chuẩn bị tốt nhất
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="p-6 md:p-8"
        >
          {step === 1 && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Service Type Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">
                  Bạn cần dịch vụ gì?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setValue("serviceType", "EXAMINATION")}
                    className={clsx(
                      "cursor-pointer p-6 rounded-2xl border-2 transition-all hover:shadow-lg relative overflow-hidden",
                      formValues.serviceType === "EXAMINATION"
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-primary/30"
                    )}
                  >
                    {formValues.serviceType === "EXAMINATION" && (
                      <div className="absolute top-4 right-4 text-primary">
                        <CheckCircle2 className="w-6 h-6 fill-primary/10" />
                      </div>
                    )}
                    <div
                      className={clsx(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        formValues.serviceType === "EXAMINATION"
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      <Stethoscope className="w-7 h-7" />
                    </div>
                    <div className="font-bold text-lg text-gray-800">
                      Khám bệnh
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Chẩn đoán, kê đơn, điều trị nội trú
                    </div>
                  </div>

                  <div
                    onClick={() => setValue("serviceType", "VACCINATION")}
                    className={clsx(
                      "cursor-pointer p-6 rounded-2xl border-2 transition-all hover:shadow-lg relative overflow-hidden",
                      formValues.serviceType === "VACCINATION"
                        ? "border-secondary bg-secondary/5"
                        : "border-gray-100 hover:border-secondary/30"
                    )}
                  >
                    {formValues.serviceType === "VACCINATION" && (
                      <div className="absolute top-4 right-4 text-secondary">
                        <CheckCircle2 className="w-6 h-6 fill-secondary/10" />
                      </div>
                    )}
                    <div
                      className={clsx(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        formValues.serviceType === "VACCINATION"
                          ? "bg-secondary text-white"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      <Syringe className="w-7 h-7" />
                    </div>
                    <div className="font-bold text-lg text-gray-800">
                      Tiêm phòng
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Vaccine đơn lẻ hoặc theo gói
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Chọn Chi nhánh
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
                  <select
                    {...register("maCN")}
                    className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white transition-all appearance-none"
                  >
                    <option value="">-- Chọn chi nhánh gần bạn --</option>
                    {branches?.data?.map((b: any) => (
                      <option key={b.MaCN} value={b.MaCN}>
                        {b.TenCN} - {b.DiaChi}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.maCN && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.maCN.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  Tiếp tục
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Pet Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Chọn Thú cưng
                </label>
                {!pets || pets.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-red-200 bg-red-50 rounded-xl text-center">
                    <p className="text-red-500 mb-3 font-medium">
                      Bạn chưa có hồ sơ thú cưng nào!
                    </p>
                    {/* Bỏ target="_blank" để tránh lỗi state không cập nhật */}
                    <Link to="/pets/add">
                      <Button
                        variant="outline"
                        className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Thêm hồ sơ ngay
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {pets.map((p: any) => (
                      <div
                        key={p.MaTC}
                        onClick={() => setValue("maTC", String(p.MaTC))}
                        className={clsx(
                          "flex-shrink-0 w-32 p-4 rounded-xl border-2 cursor-pointer transition-all text-center relative",
                          formValues.maTC === String(p.MaTC)
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-100 hover:border-gray-300 bg-white"
                        )}
                      >
                        {formValues.maTC === String(p.MaTC) && (
                          <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
                        )}
                        <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3 text-2xl">
                          {p.Loai?.includes("Mèo") ? "🐱" : "🐶"}
                        </div>
                        <div className="text-sm font-bold truncate text-gray-800">
                          {p.TenTC}
                        </div>
                        <div className="text-xs text-gray-500">{p.Giong}</div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.maTC && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.maTC.message}
                  </p>
                )}
                <input type="hidden" {...register("maTC")} />
              </div>

              {/* Time & Doctor/Vaccine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Thời gian hẹn"
                  type="datetime-local"
                  {...register("dateTime")}
                  error={errors.dateTime?.message}
                />

                {formValues.serviceType === "VACCINATION" ? (
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center text-gray-700">
                      <Pill className="w-4 h-4 mr-1 text-secondary" /> Loại
                      Vaccine
                    </label>
                    <select
                      {...register("maVaccine")}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all"
                    >
                      <option value="">-- Chọn loại vaccine --</option>
                      {MOCK_VACCINES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center text-gray-700">
                      <UserPlus className="w-4 h-4 mr-1 text-primary" /> Bác sĩ
                      (Tùy chọn)
                    </label>
                    <select
                      {...register("maNVPhuTrach")}
                      className="w-full h-11 px-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="">-- Chọn bác sĩ yêu thích --</option>
                      {MOCK_DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formValues.serviceType === "EXAMINATION" && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Triệu chứng bệnh
                  </label>
                  <textarea
                    {...register("trieuChung")}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all h-32 resize-none"
                    placeholder="Mô tả chi tiết tình trạng của bé..."
                  ></textarea>
                  {errors.trieuChung && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.trieuChung.message}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  isLoading={mutation.isPending}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-600 hover:to-primary-700"
                >
                  Xác nhận Đặt lịch
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/dashboard"); // Chuyển trang sau khi đóng modal
        }}
        title="Đặt lịch thành công!"
        message="Hồ sơ đã được gửi đến chi nhánh. Vui lòng đến đúng giờ nhé!"
      />
    </div>
  );
};
