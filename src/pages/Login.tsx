import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Heart, Lock, Phone, Stethoscope } from "lucide-react";

export const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<any>();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Đăng nhập Khách hàng
  const onSubmit = async (d: any) => {
    try {
      await login("customer-token");
      navigate("/dashboard");
    } catch (e) {
      alert("Lỗi đăng nhập");
    }
  };

  // FIX: Đăng nhập nhanh cho Nhân viên
  const handleStaffLogin = async () => {
    // 1. Giả lập đăng nhập (Set token)
    await login("staff-token");
    // 2. Sau khi có token mới chuyển trang
    navigate("/staff/schedule");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Brand Image */}
      <div className="hidden lg:flex w-1/2 bg-teal-50 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
        <img
          src="https://images.unsplash.com/photo-1551730459-92db5a308ef5?auto=format&fit=crop&w=1000&q=80"
          alt="Login"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 p-12 text-white bg-black/30 backdrop-blur-sm rounded-xl m-12">
          <h2 className="text-4xl font-bold mb-4">Chăm sóc toàn diện</h2>
          <p className="text-lg">
            Hệ thống y tế thú cưng hàng đầu với đội ngũ bác sĩ tận tâm.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chào mừng trở lại
            </h1>
            <p className="text-gray-500 mt-2">
              Đăng nhập để quản lý hồ sơ thú cưng
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Tài khoản"
              placeholder="SĐT hoặc Email"
              {...register("identifier")}
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />

            <Button
              type="submit"
              className="w-full h-12 text-lg shadow-lg shadow-primary/30"
            >
              Đăng nhập Khách hàng
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary hover:text-primary-600"
            >
              Đăng ký ngay
            </Link>
          </p>

          {/* FIX: Nút Portal Bác sĩ sử dụng onClick thay vì Link */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 mb-3 uppercase tracking-wider font-bold">
              Dành cho nội bộ
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleStaffLogin} // Gọi hàm login staff
              className="w-full border-slate-200 text-slate-600 hover:bg-slate-800 hover:text-white transition-colors h-12"
            >
              <Stethoscope className="w-4 h-4 mr-2" /> Truy cập Portal Bác sĩ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
