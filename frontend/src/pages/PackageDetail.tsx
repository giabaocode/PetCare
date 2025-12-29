import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import {
  ArrowLeft,
  CheckCircle2,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { packageApi } from "../api/packagesApi";
import { usersApi } from "../api/userApi";

export const PackageDetail: React.FC = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit } = useForm();

  // 1. Lấy thông tin gói (Đã xử lý lấy data từ response)
  const { data: pkg, isLoading: isLoadingPkg } = useQuery({
    queryKey: ["package", id],
    queryFn: async () => {
      const res = await packageApi.getOne(String(id));
      // Kiểm tra nếu API trả về object có chứa data (axios) thì lấy data, ngược lại lấy nguyên cục res
      return (res as any).data || res;
    },
    enabled: !!id,
  });

  // 2. Lấy danh sách thú cưng
  const { data: pets = [] } = useQuery({
    queryKey: ["pets", profile?.MaKH],
    queryFn: async () => {
      if (!profile?.MaKH) return [];
      const res = await usersApi.getMyPets();
      return (res as any).data || res || [];
    },
    enabled: !!profile?.MaKH,
  });

  // 3. Logic Mua Gói
  const mutation = useMutation({
    mutationFn: async (d: any) => {
      if (!profile?.MaKH) throw new Error("Vui lòng đăng nhập để mua gói!");

      // ✅ Kiểm tra kỹ pkg tồn tại
      if (!pkg)
        throw new Error("Thông tin gói chưa tải xong. Vui lòng thử lại!");

      return await packageApi.buyPackage({
        MaKH: profile.MaKH,
        MaTC: d.maTC,
        Package: {
          // ✅ Dùng dấu ! hoặc ?. để TS không báo lỗi undefined (vì đã check if(!pkg) ở trên)
          id: pkg.MaGoi,
          price: pkg.GiaTien || 0,
        },
        maCN: profile.MaCN || "CN01",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-packages"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      alert("Đăng ký gói thành công! Hóa đơn đã được tạo.");
      navigate("/invoices");
    },
    onError: (err: any) => {
      console.error("Lỗi mua gói:", err);
      alert(
        "Giao dịch thất bại: " + (err.response?.data?.error || err.message)
      );
    },
  });

  if (isLoadingPkg)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );

  if (!pkg)
    return (
      <div className="p-10 text-center text-red-500">
        Không tìm thấy gói dịch vụ!
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 pl-0 hover:bg-transparent"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Cột trái: Thông tin Gói */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {pkg?.TenGoi}
          </h1>
          <p className="text-3xl font-bold text-primary mb-6">
            {Number(pkg?.GiaTien || 0).toLocaleString()} đ
          </p>

          <div className="space-y-4">
            {pkg?.MoTa ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{pkg.MoTa}</span>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-gray-600">
                  Quyền lợi đầy đủ theo chính sách.
                </span>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              <span className="text-gray-600">
                Thời hạn sử dụng: {pkg?.ThoiHanThang || 12} tháng
              </span>
            </div>
          </div>
        </div>

        {/* Cột phải: Form Đăng ký */}
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Đăng ký sử dụng
          </h2>

          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Chọn Thú cưng áp dụng
              </label>
              {pets.length > 0 ? (
                <select
                  {...register("maTC", { required: true })}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                >
                  <option value="">-- Chọn thú cưng --</option>
                  {pets.map((p: any) => (
                    <option key={p.MaTC} value={p.MaTC}>
                      {p.TenTC} ({p.Loai} - {p.Giong})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-orange-50 text-orange-700 rounded-xl flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng trước.
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Gói sẽ được kích hoạt ngay sau khi đăng ký thành công.
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
                disabled={mutation.isPending || pets.length === 0}
                isLoading={mutation.isPending}
              >
                {mutation.isPending ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
              </Button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Bằng việc xác nhận, bạn đồng ý trừ tiền vào tài khoản liên kết.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
