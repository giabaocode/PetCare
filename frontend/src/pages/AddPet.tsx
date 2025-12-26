import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { petsApi } from "../api/pets";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowLeft } from "lucide-react";
// Import SuccessModal
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

  // State Modal
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: any) => petsApi.create({ ...data, MaKH: profile?.MaKH }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      // Bật Modal thay vì alert
      setShowSuccess(true);
    },
    onError: (err: any) => {
      alert("Có lỗi xảy ra: " + err.message);
    },
  });

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard")}
        className="mb-4 pl-0"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
      </Button>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Thêm thú cưng mới
        </h1>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-5"
        >
          <Input
            label="Tên thú cưng"
            {...register("TenTC", { required: "Nhập tên bé" })}
            error={errors.TenTC?.message as string}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại</label>
              <select
                {...register("Loai")}
                className="w-full p-2 border border-gray-200 rounded-xl h-11 outline-none"
              >
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Giới tính
              </label>
              <select
                {...register("GioiTinh")}
                className="w-full p-2 border border-gray-200 rounded-xl h-11 outline-none"
              >
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
              </select>
            </div>
          </div>

          <Input
            label="Giống loài"
            {...register("Giong", { required: "Nhập giống" })}
            error={errors.Giong?.message as string}
          />

          <Input
            label="Ngày sinh"
            type="date"
            {...register("NgaySinh", { required: "Chọn ngày sinh" })}
            error={errors.NgaySinh?.message as string}
          />

          <Input
            label="Tình trạng sức khỏe"
            placeholder="VD: Khỏe mạnh"
            {...register("TinhTrang")}
          />

          <Button
            type="submit"
            className="w-full h-12 text-lg mt-6"
            isLoading={mutation.isPending}
          >
            Lưu hồ sơ
          </Button>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/dashboard");
        }}
        title="Tuyệt vời!"
        message="Đã thêm hồ sơ thú cưng thành công."
      />
    </div>
  );
};
