import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { petsApi } from "../api/pets";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowLeft, PawPrint } from "lucide-react";

export const AddPet: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }, // Lấy object errors từ đây
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

  const mutation = useMutation({
    mutationFn: (data: any) => petsApi.create({ ...data, MaKH: profile?.MaKH }),
    onSuccess: () => {
      // Làm mới danh sách pets để khi quay lại Dashboard thấy ngay
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      alert("Thêm hồ sơ thành công!");
      navigate("/dashboard");
    },
    onError: (err) => {
      alert("Có lỗi xảy ra: " + err);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg border border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-primary mb-6 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <PawPrint className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thêm thành viên mới
          </h1>
        </div>
        <p className="text-gray-500 mb-8 ml-14">
          Nhập thông tin để tạo hồ sơ y tế
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Tên Thú Cưng */}
          <Input
            label="Tên thú cưng"
            placeholder="Ví dụ: Mimi, Lu..."
            {...register("TenTC", { required: "Tên thú cưng là bắt buộc" })}
            error={errors.TenTC?.message as string}
          />

          {/* Grid: Loài & Giới tính */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loài
              </label>
              <select
                {...register("Loai")}
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="Chó">Chó</option>
                <option value="Mèo">Mèo</option>
                <option value="Chim">Chim</option>
                <option value="Thỏ">Thỏ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                {...register("GioiTinh")}
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="Đực">Đực</option>
                <option value="Cái">Cái</option>
              </select>
            </div>
          </div>

          {/* Grid: Giống & Ngày sinh */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giống loài"
              placeholder="VD: Corgi"
              {...register("Giong", { required: "Vui lòng nhập giống" })}
              error={errors.Giong?.message as string}
            />

            <Input
              label="Ngày sinh"
              type="date"
              // HTML5 constraint chặn chọn tương lai trên UI
              max={new Date().toISOString().split("T")[0]}
              {...register("NgaySinh", {
                required: "Vui lòng chọn ngày sinh",
                // Validate Logic chặn submit nếu hack HTML
                validate: (value) => {
                  const selected = new Date(value);
                  const today = new Date();
                  // Reset giờ về 0 để so sánh chính xác ngày
                  today.setHours(0, 0, 0, 0);
                  return (
                    selected <= today ||
                    "Ngày sinh không được lớn hơn hiện tại (RBTV-04)"
                  );
                },
              })}
              error={errors.NgaySinh?.message as string}
            />
          </div>

          {/* Tình trạng */}
          <Input
            label="Tình trạng sức khỏe ban đầu"
            placeholder="VD: Khỏe mạnh, dị ứng..."
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
    </div>
  );
};
