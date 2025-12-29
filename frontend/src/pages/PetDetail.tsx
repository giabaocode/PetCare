import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Activity,
  Calendar,
  Dna,
  Stethoscope,
  Clock,
  FileText,
  Pill,
} from "lucide-react";

// Import Components
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";

// Import API
import { petsApi } from "../api/pets";
import { servicesApi } from "../api/services";

// Helper: Format ngày giờ chuẩn Việt Nam (dd/mm/yyyy - hh:mm)
const formatDateTime = (isoString: string) => {
  if (!isoString) return "Chưa cập nhật";
  const date = new Date(isoString);
  // Kiểm tra nếu ngày không hợp lệ
  if (isNaN(date.getTime())) return "Thời gian không hợp lệ";

  return (
    date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " - " +
    date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Dùng định dạng 24h
    })
  );
};

export const PetDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State quản lý Modal xem chi tiết bệnh án
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // 1. Lấy thông tin chi tiết thú cưng
  const { data: pet, isLoading } = useQuery({
    queryKey: ["pet", id],
    queryFn: async () => {
      const res = await petsApi.getOne(id as string);
      return (res as any).data || res;
    },
    enabled: !!id && id !== "add",
  });

  // 2. Lấy lịch sử khám bệnh
  const { data: history = [] } = useQuery({
    queryKey: ["pet-history", id],
    queryFn: async () => {
      const res = await servicesApi.getMyAppointments();
      const allAppointments = (res as any).data || res || [];

      // Lọc: Chỉ lấy lịch hẹn của thú cưng này VÀ đã hoàn thành
      // Sắp xếp: Mới nhất lên đầu
      return allAppointments
        .filter((app: any) => app.MaTC === id && app.TrangThai === "COMPLETED")
        .sort(
          (a: any, b: any) =>
            new Date(b.ThoiGianHen).getTime() -
            new Date(a.ThoiGianHen).getTime()
        );
    },
    enabled: !!id,
  });

  if (isLoading || !pet)
    return (
      <div className="flex items-center justify-center min-h-screen text-primary flex-col gap-2">
        <Activity className="w-8 h-8 animate-spin" />
        <span>Đang tải hồ sơ thú cưng...</span>
      </div>
    );

  const isCat = pet.Loai?.toLowerCase().includes("mèo");
  const avatar = isCat
    ? `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80`
    : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80`;

  return (
    <div className="pb-20 bg-gray-50 min-h-screen fade-in">
      {/* --- 1. Banner --- */}
      <div className="h-64 bg-gradient-to-br from-primary via-teal-500 to-emerald-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

        <Link
          to="/pets"
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* --- 2. Profile Card --- */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-24 relative z-10 border border-gray-100">
          <img
            src={avatar}
            alt={pet.TenTC}
            className="w-40 h-40 rounded-3xl object-cover border-4 border-white shadow-lg -mt-20 sm:-mt-0 bg-gray-100"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {pet.TenTC}
            </h1>
            <p className="text-gray-500 font-medium text-lg flex items-center justify-center sm:justify-start gap-2">
              {pet.Loai === "Chó" ? "🐶" : "🐱"} {pet.Loai} • {pet.GioiTinh}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="px-5 py-2.5 bg-green-50 text-green-700 rounded-2xl font-bold text-sm flex items-center border border-green-100">
              <Activity className="w-4 h-4 mr-2" />
              {pet.TinhTrang || "Khỏe mạnh"}
            </span>
          </div>
        </div>

        {/* --- 3. Stats Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center">
              <Dna className="w-4 h-4 mr-1.5" /> Giống
            </div>
            <div className="font-bold text-gray-800 text-lg">{pet.Giong}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1.5" /> Sinh nhật
            </div>
            <div className="font-bold text-gray-800 text-lg">
              {pet.NgaySinh
                ? new Date(pet.NgaySinh).toLocaleDateString("vi-VN")
                : "N/A"}
            </div>
          </div>
        </div>

        {/* --- 4. Medical History List --- */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" /> Hồ sơ bệnh án
          </h2>
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200 text-gray-400">
                <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-20" />
                Chưa có lịch sử khám bệnh nào
              </div>
            ) : (
              history.map((h: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setSelectedRecord(h)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 hover:border-primary/50 hover:shadow-md transition shadow-sm cursor-pointer group relative"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-50 group-hover:bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-gray-900 text-lg">
                          {formatDateTime(h.ThoiGianHen || h.NgayKham)}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                          {h.LoaiDichVu || "Khám bệnh"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Bác sĩ:{" "}
                        <span className="font-medium text-gray-800">
                          {h.TenBacSi || "Không rõ"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Hiển thị tóm tắt chẩn đoán */}
                  <div className="md:w-1/2 bg-gray-50 p-3 rounded-xl text-sm group-hover:bg-blue-50/50 transition-colors border border-gray-100">
                    <p className="line-clamp-2 text-gray-700">
                      <span className="font-bold text-gray-500">Kết luận:</span>{" "}
                      {/* 👇 Ưu tiên hiển thị TrieuChung vì backend đang lưu vào đây */}
                      {h.GhiChu ||
                        h.TrieuChung ||
                        h.ChanDoan ||
                        "Chi tiết trong hồ sơ..."}
                    </p>
                    <p className="text-primary text-xs font-bold mt-2 flex items-center justify-end">
                      Xem chi tiết{" "}
                      <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL CHI TIẾT BỆNH ÁN --- */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Chi tiết Bệnh án"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Thời gian khám
                </p>
                <p className="font-bold text-gray-800 flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-primary" />
                  {formatDateTime(
                    selectedRecord.ThoiGianHen || selectedRecord.NgayKham
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                  Bác sĩ phụ trách
                </p>
                <p className="font-bold text-gray-800 mt-1">
                  {selectedRecord.TenBacSi || "Không rõ"}
                </p>
              </div>
            </div>

            {/* Nội dung khám */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Chẩn đoán & Kết luận
                </h4>
                {/* 👇 QUAN TRỌNG: 
                    1. whitespace-pre-line: Để hiển thị xuống dòng.
                    2. Thứ tự ưu tiên: GhiChu (nếu có) -> TrieuChung (nơi backend đang lưu) -> ChanDoan (legacy).
                */}
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedRecord.GhiChu ||
                    selectedRecord.TrieuChung ||
                    selectedRecord.ChanDoan ||
                    "Chưa có chẩn đoán chi tiết."}
                </p>
              </div>

              {/* Nếu có Lời dặn riêng lẻ (fallback) */}
              {selectedRecord.LoiDan &&
                !selectedRecord.TrieuChung?.includes("Lời dặn") && (
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Lời dặn của bác sĩ
                    </h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedRecord.LoiDan}
                    </p>
                  </div>
                )}

              {/* Đơn thuốc (Nếu Backend trả về mảng DonThuoc) */}
              {selectedRecord.DonThuoc &&
                Array.isArray(selectedRecord.DonThuoc) &&
                selectedRecord.DonThuoc.length > 0 && (
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-green-600" /> Đơn thuốc đã
                      kê
                    </h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-500 font-semibold">
                          <tr>
                            <th className="p-2 pl-3">Tên thuốc</th>
                            <th className="p-2">SL</th>
                            <th className="p-2">HDSD</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedRecord.DonThuoc.map(
                            (med: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2 pl-3 font-medium text-gray-700">
                                  {med.medicineName}
                                </td>
                                <td className="p-2 text-gray-600">
                                  {med.quantity} {med.unit}
                                </td>
                                <td className="p-2 text-gray-500 italic">
                                  {med.instruction}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="ghost" onClick={() => setSelectedRecord(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
