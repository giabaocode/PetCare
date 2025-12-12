import React from "react";
import { useQuery } from "@tanstack/react-query";
import { packagesApi } from "../api/packages";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Shield, Check, Clock, Zap } from "lucide-react";
// FIX: Import thêm Interface GoiTiem
import { GoiTiem } from "../types/schema";

export const Packages: React.FC = () => {
  // FIX: Định nghĩa kiểu dữ liệu trả về cho useQuery là GoiTiem[]
  const { data: packages, isLoading } = useQuery<GoiTiem[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await packagesApi.getAll();
      // Đảm bảo trả về mảng data từ Axios response
      return (res as any).data || res;
    },
  });

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải gói dịch vụ...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gói Tiêm Chủng Tiết Kiệm
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Bảo vệ thú cưng toàn diện với chi phí tối ưu lên đến 15% so với tiêm
            lẻ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* FIX: TypeScript giờ đã hiểu pkg là GoiTiem */}
          {packages?.map((pkg) => {
            // Giả lập highlight gói 12 tháng
            const isPopular = pkg.ThoiHanThang >= 12;
            return (
              <div
                key={pkg.MaGoi}
                className={`relative flex flex-col bg-white rounded-3xl transition-all duration-300 ${
                  isPopular
                    ? "border-2 border-primary shadow-xl scale-105 z-10"
                    : "border border-gray-100 shadow-lg hover:shadow-xl"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-secondary to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md flex items-center">
                    <Zap className="w-3 h-3 mr-1 fill-current" /> Phổ biến nhất
                  </div>
                )}

                <div className="p-8 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                      isPopular
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {pkg.TenGoi}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">
                      -{pkg.PhanTramGiam}%
                    </span>
                    <span className="text-gray-500">ưu đãi</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 text-primary mr-3" />
                      <span>
                        Thời hạn <strong>{pkg.ThoiHanThang} tháng</strong>
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Đầy đủ vaccine cơ bản</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Miễn phí 2 lần khám</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <Link to={`/packages/${pkg.MaGoi}`}>
                    <Button
                      className={`w-full py-6 rounded-xl font-bold text-lg ${
                        isPopular
                          ? "bg-primary hover:bg-primary-600 shadow-lg shadow-primary/30"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                    >
                      Đăng ký ngay
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
