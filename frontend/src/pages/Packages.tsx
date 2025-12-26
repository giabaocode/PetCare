// frontend/src/pages/Packages.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { SuccessModal } from "../components/ui/SuccessModal";
import { Shield, Check, Star, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// FIX 1: Import đúng đường dẫn file API vừa tạo
import { packagesApi } from "../api/packages";
import { usersApi } from "../api/userApi";
import { invoicesApi } from "../api/invoices";

export const Packages: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // FIX 2: Thay db.getPets() bằng State + API Call
  const [myPets, setMyPets] = useState<any[]>([]);

  useEffect(() => {
    const fetchPets = async () => {
      if (profile?.MaKH) {
        const pets = await usersApi.getMyPets(profile.MaKH);
        setMyPets(pets);
      }
    };
    fetchPets();
  }, [profile]);

  const PACKAGES = [
    {
      id: "PKG01",
      name: "Gói Cơ Bản (Mèo)",
      discount: "-5%",
      price: 500000,
      duration: "6 tháng",
      durationMonth: 6,
      features: ["Đầy đủ vaccine cơ bản", "Miễn phí 2 lần khám"],
      icon: <Shield className="w-6 h-6" />,
      color: "bg-gray-100 text-gray-600",
      benefits: { freeExamLimit: 2 },
    },
    {
      id: "PKG02",
      name: "Gói Toàn Diện (Chó)",
      discount: "-15%",
      price: 1200000,
      duration: "12 tháng",
      durationMonth: 12,
      features: [
        "Đầy đủ vaccine cơ bản",
        "Miễn phí 2 lần khám",
        "Giảm 10% Spa",
      ],
      icon: <Shield className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
      isPopular: true,
      benefits: { freeExamLimit: 2 },
    },
    {
      id: "PKG03",
      name: "Gói Sơ Sinh (Baby)",
      discount: "-10%",
      price: 800000,
      duration: "3 tháng",
      durationMonth: 3,
      features: [
        "Đầy đủ vaccine cơ bản",
        "Miễn phí 2 lần khám",
        "Tặng sữa tắm",
      ],
      icon: <Shield className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
      benefits: { freeExamLimit: 2 },
    },
  ];

  const handleRegister = async () => {
    if (!selectedPetId) {
      alert("Vui lòng chọn thú cưng để áp dụng!");
      return;
    }

    // --- FIX LỖI TYPE Ở ĐÂY ---
    // Kiểm tra kỹ: Nếu chưa có thông tin KH thì không cho chạy tiếp
    if (!profile?.MaKH) {
      alert("Vui lòng đăng nhập lại để thực hiện chức năng này!");
      return;
    }

    // 1. GỌI API MUA GÓI
    await packagesApi.buyPackage({
      MaTC: selectedPetId,
      MaKH: profile.MaKH, // Lúc này TS đã biết chắc chắn MaKH là string (không bị undefined nữa)
      Package: selectedPkg,
    });

    // 2. GỌI API CỘNG ĐIỂM
    await usersApi.addPoints(profile.MaKH, selectedPkg.price);

    // 3. GỌI API TẠO HÓA ĐƠN
    await invoicesApi.create({
      MaHD: Math.floor(200000 + Math.random() * 800000),
      NgayLap: new Date().toISOString(),
      TongTien: selectedPkg.price,
      HinhThucThanhToan: "Ví điện tử",
      TrangThai: "Đã thanh toán",
      MaKH: profile.MaKH,
      MaCN: "CN01",
      ChiTietHoaDonDichVu: [
        {
          DichVu: { TenDV: `Đăng ký: ${selectedPkg.name}` },
          SoLuong: 1,
          ThanhTien: selectedPkg.price,
        },
      ],
      ChiTietHoaDonSanPham: [],
    });

    setSelectedPkg(null);
    setShowSuccess(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Gói Tiêm Chủng Tiết Kiệm
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Bảo vệ thú cưng toàn diện với chi phí tối ưu.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-white rounded-3xl p-8 border-2 transition-all hover:shadow-xl flex flex-col ${
              pkg.isPopular
                ? "border-primary shadow-lg scale-105 z-10"
                : "border-gray-100"
            }`}
          >
            {pkg.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center shadow-lg shadow-orange-500/30">
                <Star className="w-3 h-3 mr-1 fill-white" /> Phổ biến nhất
              </div>
            )}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${pkg.color}`}
            >
              {pkg.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {pkg.name}
            </h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-slate-900">
                {pkg.discount}
              </span>
              <span className="text-slate-400 font-medium">ưu đãi</span>
            </div>
            <div className="space-y-4 mb-8 flex-1">
              <div className="flex items-center text-sm text-slate-600">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                Thời hạn <span className="font-bold ml-1">{pkg.duration}</span>
              </div>
              {pkg.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center text-sm text-slate-600"
                >
                  <Check className="w-4 h-4 mr-2 text-green-500" /> {feat}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-right text-lg font-bold text-primary mb-4">
                {pkg.price.toLocaleString()} đ
              </p>
              <Button
                className={`w-full ${
                  pkg.isPopular ? "shadow-lg shadow-primary/30" : ""
                }`}
                onClick={() => setSelectedPkg(pkg)}
              >
                Đăng ký ngay
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
        title="Đăng ký sử dụng"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Bạn đang chọn:</p>
            <h3 className="font-bold text-lg text-slate-800">
              {selectedPkg?.name}
            </h3>
            <p className="text-primary font-bold text-xl mt-2">
              {selectedPkg?.price.toLocaleString()} đ
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Chọn Thú cưng áp dụng
            </label>
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
        message="Gói dịch vụ đã kích hoạt."
      />
    </div>
  );
};
