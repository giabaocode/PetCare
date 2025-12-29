import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  User,
  Mail,
  Phone,
  Lock,
  CreditCard,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { authApi } from "../api/authApi";
import { SuccessModal } from "../components/ui/SuccessModal";
import { ErrorModal } from "../components/ui/ErrorModal";

export const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>();
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (d: any) => {
    setIsLoading(true);
    try {
      await authApi.register(d);

      setShowSuccess(true);
    } catch (e: any) {
      const msg = e.response?.data?.message || "Đăng ký thất bại";
      setErrorMsg(msg);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-md w-full py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo tài khoản mới
            </h1>
            <p className="text-gray-500">
              Tham gia cộng đồng PetCareX ngay hôm nay
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  {...register("HoTen", { required: true })}
                  placeholder="Nguyễn Văn A"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    {...register("SDT", { required: true })}
                    placeholder="09xxxx"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CCCD
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    {...register("CCCD", { required: true })}
                    placeholder="12 số"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  {...register("Email", { required: true })}
                  placeholder="email@domain.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    type="date"
                    {...register("NgaySinh", { required: true })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  {...register("GioiTinh")}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-11 bg-white"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  {...register("password", { required: true })}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg shadow-lg shadow-primary/20 mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-600"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Image */}
      <div className="hidden lg:flex w-1/2 bg-orange-50 items-center justify-center relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80"
          alt="Happy Pets"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative z-10 p-12 text-white mt-auto">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">PetCareX Premium</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Đồng hành cùng thú cưng</h2>
          <p className="text-lg text-gray-200">
            Trải nghiệm dịch vụ y tế chuẩn quốc tế ngay hôm nay.
          </p>
        </div>
      </div>

      {/* Modal Lỗi */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Đăng ký thất bại"
        message={errorMsg}
      />

      {/* Modal Thành Công */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/login");
        }}
        title="Đăng ký thành công!"
        message="Tài khoản của bạn đã được tạo. Vui lòng đăng nhập."
      />
    </div>
  );
};
