import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Heart,
  User,
  Lock,
  ShieldAlert,
  Stethoscope,
  ConciergeBell,
  ArrowRight,
  MapPin,
} from "lucide-react";

export const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<any>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data: any) => {
    const username = data.identifier.trim();
    try {
      const role = await login(username);
      switch (role) {
        case "ADMIN":
          navigate("/staff/dashboard");
          break;
        case "DOCTOR":
          navigate("/staff/schedule");
          break;
        case "RECEPTIONIST":
          navigate("/staff/reception");
          break;
        default:
          navigate("/dashboard");
          break;
      }
    } catch (e) {
      alert("Đăng nhập thất bại");
    }
  };

  const quickLogin = (type: string) => {
    const mockData: any = {
      admin: { identifier: "admin@petcare.com", password: "123" },
      doctor1: { identifier: "bs.a@petcare.com", password: "123" },
      doctor2: { identifier: "bs.c@petcare.com", password: "123" },
      reception1: { identifier: "letan@petcare.com", password: "123" },
      reception2: { identifier: "letan7@petcare.com", password: "123" },
    };
    if (mockData[type]) onSubmit(mockData[type]);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&w=1400&q=80"
            alt="Pet Care"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>
        <div className="relative z-10 p-12 max-w-lg">
          <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/10">
            <Heart className="w-8 h-8 text-primary fill-current" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Chăm sóc toàn diện cho thú cưng của bạn.
          </h2>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col bg-white h-full relative z-20 shadow-2xl lg:shadow-none">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="min-h-full flex flex-col justify-center p-8 md:p-12 lg:p-16 max-w-xl mx-auto w-full">
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Chào mừng trở lại! 👋
              </h1>
              <p className="text-slate-500">Vui lòng đăng nhập để tiếp tục.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Tài khoản
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                  <Input
                    className="pl-11 h-12 bg-slate-50 border-slate-200"
                    placeholder="Email hoặc Tên đăng nhập"
                    {...register("identifier", { required: true })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                  <Input
                    className="pl-11 h-12 bg-slate-50 border-slate-200"
                    type="password"
                    placeholder="••••••••"
                    {...register("password", { required: true })}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 mt-2"
              >
                Đăng nhập <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Demo Mode (Click nhanh)
              </span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => quickLogin("admin")}
                className="w-full p-3 border rounded-xl hover:bg-red-50 text-xs font-bold text-slate-600 flex items-center justify-center gap-2 border-slate-200 hover:border-red-200"
              >
                <ShieldAlert className="w-4 h-4 text-red-500" /> Quản trị viên
                (Xem tất cả)
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin("reception1")}
                  className="p-3 border rounded-xl hover:bg-orange-50 text-xs font-bold text-slate-600 flex items-center justify-center gap-2 border-slate-200 hover:border-orange-200"
                >
                  <ConciergeBell className="w-4 h-4 text-orange-500" /> Lễ tân
                  (Q1)
                </button>
                <button
                  onClick={() => quickLogin("reception2")}
                  className="p-3 border rounded-xl hover:bg-orange-50 text-xs font-bold text-slate-600 flex items-center justify-center gap-2 border-slate-200 hover:border-orange-200"
                >
                  <ConciergeBell className="w-4 h-4 text-orange-500" /> Lễ tân
                  (Q7)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => quickLogin("doctor1")}
                  className="p-3 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 flex flex-col items-center justify-center gap-1"
                >
                  <div className="flex items-center gap-1 text-blue-700 font-bold text-xs">
                    <Stethoscope className="w-4 h-4" /> Bác sĩ (Q1)
                  </div>
                </button>
                <button
                  onClick={() => quickLogin("doctor2")}
                  className="p-3 border border-purple-200 bg-purple-50 rounded-xl hover:bg-purple-100 flex flex-col items-center justify-center gap-1"
                >
                  <div className="flex items-center gap-1 text-purple-700 font-bold text-xs">
                    <MapPin className="w-4 h-4" /> Bác sĩ (Q7)
                  </div>
                </button>
              </div>
            </div>

            <p className="mt-10 text-center text-sm text-slate-500">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-bold text-primary hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
