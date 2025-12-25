import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  ShieldCheck,
  Calendar,
  Heart,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-2xl font-heading font-bold text-primary flex items-center gap-2">
            <Heart className="fill-primary w-6 h-6" /> PetCareX
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button
                variant="ghost"
                className="font-semibold text-gray-600 hover:text-primary"
              >
                Đăng nhập
              </Button>
            </Link>
            <Link to="/register">
              <Button className="shadow-lg shadow-primary/30">
                Đăng ký ngay
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-primary-50 to-white pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="z-10 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 bg-white rounded-full text-primary font-semibold text-sm shadow-sm mb-6 border border-primary/20">
              👋 Hệ thống chăm sóc thú cưng số 1
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-slate-900">
              Chăm sóc toàn diện cho{" "}
              <span className="text-primary">Người bạn nhỏ</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
              Đặt lịch khám bệnh, tiêm phòng và theo dõi sức khỏe thú cưng dễ
              dàng với mạng lưới 10 chi nhánh PetCareX trên toàn quốc.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="px-8 py-4 text-lg h-auto rounded-xl shadow-xl shadow-primary/20">
                  Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5 inline" />
                </Button>
              </Link>
              <Link to="/packages">
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg h-auto rounded-xl bg-white hover:bg-gray-50"
                >
                  Xem gói dịch vụ
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-8 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> 10 Chi
                nhánh
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div> Bác sĩ
                chuyên môn cao
              </div>
            </div>
          </div>

          <div className="relative z-10 hidden md:block">
            {/* Ảnh minh họa dùng Unsplash source */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
                alt="Happy Dog"
                className="rounded-[2rem] shadow-2xl w-full object-cover transform rotate-2 hover:rotate-0 transition duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl animate-bounce">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Đã tiêm phòng</p>
                    <p className="font-bold text-slate-800">An toàn 100%</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Dịch vụ chất lượng cao</h2>
            <p className="text-slate-500">
              Chúng tôi cung cấp giải pháp toàn diện để thú cưng của bạn luôn
              khỏe mạnh và hạnh phúc.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition border border-transparent hover:border-primary/20 group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Khám bệnh & Điều trị</h3>
              <p className="text-slate-500 leading-relaxed">
                Đội ngũ bác sĩ thú y giàu kinh nghiệm với trang thiết bị hiện
                đại, chẩn đoán chính xác.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition border border-transparent hover:border-primary/20 group">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tiêm phòng Vaccine</h3>
              <p className="text-slate-500 leading-relaxed">
                Đầy đủ các loại vaccine nhập khẩu chính hãng. Gói tiêm chủng
                tiết kiệm chi phí.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition border border-transparent hover:border-primary/20 group">
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Đặt lịch Online</h3>
              <p className="text-slate-500 leading-relaxed">
                Chủ động thời gian, chọn bác sĩ và chi nhánh yêu thích chỉ với
                vài cú click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center gap-2 mb-6 text-white font-heading font-bold text-2xl">
            <Heart className="fill-primary text-primary" /> PetCareX
          </div>
          <p className="text-sm opacity-60">
            © 2025 PetCareX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
