import React from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import {
  User,
  Phone,
  Mail,
  Award,
  CreditCard,
  LogOut,
  Edit2,
  Shield,
  Calendar,
  QrCode,
} from "lucide-react";

export const Profile: React.FC = () => {
  const { profile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header & Cover Photo */}
      <div className="relative h-60 bg-gradient-to-r from-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* Pattern trang trí */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[100px] -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary rounded-full blur-[80px] -ml-10 -mb-10"></div>
        </div>
        <div className="absolute top-6 right-6">
          <Button
            onClick={logout}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* 2. Left Column: Avatar & Digital Card */}
          <div className="w-full md:w-1/3 flex flex-col gap-6">
            {/* Avatar */}
            <div className="bg-white p-2 rounded-full w-40 h-40 shadow-xl mx-auto md:mx-0">
              <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-5xl font-bold text-gray-400 border-4 border-white overflow-hidden">
                {/* Nếu có ảnh thì hiện ảnh, không thì hiện chữ cái đầu */}
                <img
                  src={`https://ui-avatars.com/api/?name=${profile?.HoTen}&background=random&size=200`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Digital Member Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Thẻ thành viên
                    </p>
                    <h3 className="text-xl font-bold text-primary">
                      {profile?.TenHang || "Cơ bản"}
                    </h3>
                  </div>
                  <QrCode className="w-10 h-10 text-white/80" />
                </div>
                <div className="mb-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Chủ sở hữu
                  </p>
                  <p className="font-medium text-lg tracking-wide">
                    {profile?.HoTen}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Mã KH
                    </p>
                    <p className="font-mono text-sm text-gray-300">
                      #{profile?.MaKH?.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      Điểm tích lũy
                    </p>
                    <p className="font-bold text-2xl text-secondary">
                      {profile?.DiemTichLuy || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Right Column: Info Details */}
          <div className="w-full md:w-2/3 pt-4 md:pt-24">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Thông tin cá nhân
                </h2>
                <Button
                  variant="ghost"
                  className="text-primary hover:bg-primary/5 h-8 px-3 text-sm"
                >
                  <Edit2 className="w-3 h-3 mr-2" /> Chỉnh sửa
                </Button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Họ và tên
                  </label>
                  <p className="font-medium text-gray-900">{profile?.HoTen}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Số điện thoại
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-900">
                      {profile?.SDT || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-900">
                      {profile?.Email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Ngày tham gia
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-medium text-gray-900">20/12/2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800">Bảo mật</h3>
                <p className="text-xs text-gray-500 mt-1">Đổi mật khẩu & 2FA</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800">Thanh toán</h3>
                <p className="text-xs text-gray-500 mt-1">Quản lý thẻ & ví</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
