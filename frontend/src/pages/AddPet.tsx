import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { petsApi } from "../api/pets";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowLeft } from "lucide-react";
import { SuccessModal } from "../components/ui/SuccessModal";

export const AddPet: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      TenTC: "",
      Loai: "Chó",
      Giong: "",
      GioiTinh: "Đực",
      NgaySinh: "",
      TinhTrang: "",
    },
  });

  const navigate = useNavigate();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const mutation = useMutation({
    mutationFn: (data: any) => petsApi.create({ ...data, MaKH: profile?.MaKH }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setShowSuccess(true);
    },
    onError: (err: any) => {
      alert("Lỗi: " + (err.response?.data?.error || err.message));
    },
  });

  return (
    <div className="p-6 max-w-xl mx-auto pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-4 pl-0 hover:bg-transparent text-gray-500 hover:text-primary"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại Dashboard
      </Button>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thêm bé mới</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Tạo hồ sơ y tế riêng biệt để theo dõi sức khỏe cho thú cưng của bạn.
        </p>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-5"
        >
          <Input
            label="Tên thú cưng"
            placeholder="Ví dụ: Lucky, Milu..."
            {...register("TenTC", { required: "Vui lòng nhập tên bé" })}
            error={errors.TenTC?.message as string}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Loại
              </label>
              <select
                {...register("Loai")}
                className="w-full p-2 border border-gray-200 rounded-xl h-11 outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                {...register("GioiTinh")}
                className="w-full p-2 border border-gray-200 rounded-xl h-11 outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <Input
            label="Giống loài"
            placeholder="Ví dụ: Poodle, Corgi..."
            {...register("Giong", { required: "Vui lòng nhập giống loài" })}
            error={errors.Giong?.message as string}
          />

          <Input
            label="Ngày sinh"
            type="date"
            max={today}
            {...register("NgaySinh", { required: "Vui lòng chọn ngày sinh" })}
            error={errors.NgaySinh?.message as string}
          />

          <Input
            label="Tình trạng sức khỏe hiện tại"
            placeholder="Ví dụ: Khỏe mạnh, đang biếng ăn..."
            {...register("TinhTrang")}
          />

          <Button
            type="submit"
            className="w-full h-12 text-lg mt-6 shadow-lg shadow-primary/20"
            isLoading={mutation.isPending}
          >
            Lưu hồ sơ ngay
          </Button>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/dashboard");
        }}
        title="Thành công!"
        message="Hồ sơ của bé đã được lưu vào hệ thống."
      />
    </div>
  );
};
