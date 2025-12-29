import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { SuccessModal } from "../components/ui/SuccessModal";
import { Shield, Check, Star, Clock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Import API
import { packageApi } from "../api/packagesApi";
import { usersApi } from "../api/userApi";

export const Packages: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [myPets, setMyPets] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (profile?.MaKH) {
          const petsRes = await usersApi.getMyPets();
          const petsData = Array.isArray(petsRes)
            ? petsRes
            : (petsRes as any).data || [];
          setMyPets(petsData);
        }

        const pkgsRes = await packageApi.getAll();
        // ✅ Xử lý an toàn: Lấy data nếu là axios response, hoặc lấy mảng nếu trả về trực tiếp
        const pkgsData = Array.isArray(pkgsRes)
          ? pkgsRes
          : (pkgsRes as any).data || [];

        setPackagesList(pkgsData);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  // 2. HANDLE REGISTER
  const handleRegister = async () => {
    if (!selectedPkg || !selectedPetId || !profile?.MaKH) return;

    try {
      await packageApi.buyPackage({
        MaTC: selectedPetId,
        MaKH: profile.MaKH,
        Package: {
          // ✅ Map dữ liệu chuẩn cho API (Backend trả về MaGoi, API cần id/price)
          id: selectedPkg.MaGoi,
          price: selectedPkg.GiaTien || 0,
        },
        maCN: profile.MaCN || "CN01",
      });

      setShowSuccess(true);
      setSelectedPkg(null);
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20 fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Gói Tiêm Chủng Tiết Kiệm
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Bảo vệ thú cưng toàn diện với chi phí tối ưu.
        </p>
      </div>

      {/* Render Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packagesList.length > 0 ? (
          packagesList.map((pkg) => (
            <div
              key={pkg.MaGoi} // ✅ Dùng MaGoi
              className="relative bg-white rounded-3xl p-8 border-2 border-gray-100 transition-all hover:shadow-xl flex flex-col"
            >
              {pkg.TenGoi?.toLowerCase().includes("trọn gói") && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg shadow-orange-500/30">
                  <Star className="w-3 h-3 mr-1 fill-white" /> Phổ biến nhất
                </div>
              )}

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-blue-50 text-blue-600">
                <Shield className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {pkg.TenGoi} {/* ✅ Dùng TenGoi */}
              </h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  {pkg.PhanTramGiam || 0}%
                </span>
                <span className="text-slate-400 font-medium">ưu đãi</span>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  Thời hạn{" "}
                  <span className="font-bold ml-1">
                    {pkg.ThoiHanThang || 12} tháng
                  </span>
                </div>

                {pkg.MoTa && (
                  <div className="flex items-start text-sm text-slate-600 mt-2">
                    <Check className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>{pkg.MoTa}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-right text-lg font-bold text-primary mb-4">
                  {Number(pkg.GiaTien || 0).toLocaleString()} đ
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!profile) {
                      navigate("/login");
                    } else {
                      setSelectedPkg(pkg);
                    }
                  }}
                >
                  Đăng ký ngay
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            <p>Chưa có gói dịch vụ nào.</p>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
        title="Đăng ký sử dụng"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Bạn đang chọn:</p>
            <h3 className="font-bold text-lg text-slate-800">
              {selectedPkg?.TenGoi}
            </h3>
            <p className="text-primary font-bold text-xl mt-2">
              {Number(selectedPkg?.GiaTien || 0).toLocaleString()} đ
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Chọn Thú cưng áp dụng
            </label>
            {myPets.length > 0 ? (
              <select
                className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                <option value="">-- Chọn bé --</option>
                {myPets.map((p: any) => (
                  <option key={p.MaTC} value={p.MaTC}>
                    {p.TenTC} ({p.Loai})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Bạn chưa có thú cưng. Vui lòng thêm thú cưng trước.
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setSelectedPkg(null)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleRegister} disabled={!selectedPetId}>
              Xác nhận & Thanh toán
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/invoices");
        }}
        title="Đăng ký thành công!"
        message="Gói dịch vụ đã kích hoạt. Vui lòng kiểm tra hóa đơn."
      />
    </div>
  );
};
