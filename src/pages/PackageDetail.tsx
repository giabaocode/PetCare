import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { packagesApi } from "../api/packages";
import api from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { ArrowLeft, CheckCircle2, Shield } from "lucide-react";
// Import type GoiTiem để dùng cho useQuery
import { GoiTiem } from "../types/schema";

export const PackageDetail: React.FC = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  // FIX: Định nghĩa kiểu dữ liệu trả về là GoiTiem
  const { data: pkg } = useQuery<GoiTiem>({
    queryKey: ["package", id],
    queryFn: () => packagesApi.getOne(Number(id)),
  });

  const { data: pets } = useQuery({
    queryKey: ["pets", profile?.MaKH],
    queryFn: () =>
      api.get(`/pets?MaKH=eq.${profile?.MaKH}`).then((r) => r.data),
    enabled: !!profile?.MaKH,
  });

  const mutation = useMutation({
    mutationFn: (d: any) =>
      packagesApi.register({
        MaGoi: pkg?.MaGoi!,
        // FIX: Thêm dấu ! để khẳng định MaKH không undefined (vì đã login)
        MaKH: profile?.MaKH!,
        MaTC: Number(d.maTC),
      }),
    onSuccess: () => {
      alert("Đăng ký thành công!");
      navigate("/dashboard");
    },
    onError: (err: any) => alert("Lỗi: " + err.message),
  });

  if (!pkg) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
        {/* Left: Info */}
        <div className="bg-slate-900 text-white p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10 h-full flex flex-col">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white mb-8 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
            </button>
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{pkg.TenGoi}</h1>
            <p className="text-gray-300 text-lg mb-8">
              Gói chăm sóc sức khỏe toàn diện với chi phí tối ưu nhất.
            </p>

            <div className="space-y-4 mt-auto">
              <div className="flex items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6 text-primary mr-3" />
                <div>
                  <p className="font-bold">Ưu đãi {pkg.PhanTramGiam}%</p>
                  <p className="text-sm text-gray-400">So với giá niêm yết</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6 text-primary mr-3" />
                <div>
                  <p className="font-bold">Thời hạn {pkg.ThoiHanThang} tháng</p>
                  <p className="text-sm text-gray-400">Kể từ ngày đăng ký</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="p-10 flex flex-col justify-center">
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
              <select
                {...register("maTC", { required: true })}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50"
              >
                {pets?.map((p: any) => (
                  <option key={p.MaTC} value={p.MaTC}>
                    {p.TenTC} ({p.Loai})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Gói sẽ được kích hoạt ngay sau khi đăng ký.
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Đang xử lý..."
                  : "Xác nhận & Thanh toán sau"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
