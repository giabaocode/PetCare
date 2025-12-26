// frontend/src/pages/staff/StaffSchedule.tsx
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, CheckCircle2, Play, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSharedAppointments } from "../../utils/dataProvider";
import { useAuth } from "../../context/AuthContext"; // Import Auth để lấy MaCN

export const StaffSchedule: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth(); // Lấy thông tin Staff đang login

  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState<any[]>([]);

  const refreshData = () => {
    const all = getSharedAppointments();

    // --- LOGIC LỌC CHI NHÁNH ---
    // Chỉ lấy lịch hẹn có MaCN trùng với MaCN của nhân viên
    const branchAppointments = all.filter((appt: any) => {
      // Nếu là ADMIN thì cho xem hết (tùy chọn), còn NV thì bắt buộc lọc
      if (profile?.Role === "ADMIN") return true;
      return appt.MaCN === profile?.MaCN;
    });

    setAppointments(branchAppointments);
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("storage", refreshData);
    window.addEventListener("local-storage-update", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("local-storage-update", refreshData);
    };
  }, [profile]); // Chạy lại khi profile thay đổi

  // Lọc theo từ khóa tìm kiếm
  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.petName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Lịch làm việc</h1>
          <p className="text-slate-500 text-sm">
            Khu vực:{" "}
            <span className="font-bold text-primary">
              {profile?.MaCN === "CN01"
                ? "Chi nhánh Quận 1"
                : profile?.MaCN === "CN02"
                ? "Chi nhánh Quận 7"
                : "Toàn hệ thống"}
            </span>
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none w-64"
            placeholder="Tìm bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Giờ
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Khách hàng
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Dịch vụ
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Bác sĩ
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Trạng thái
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-400 italic"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-10 h-10 text-slate-200" />
                      <span>Chưa có lịch hẹn nào tại chi nhánh này.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-mono text-slate-500">{apt.time}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">
                        {apt.patientName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {apt.petName} ({apt.type})
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {apt.service}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{apt.doctor}</td>
                    <td className="p-4">
                      {apt.status === "WAITING" && (
                        <span className="text-orange-500 font-bold text-xs flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>{" "}
                          Chờ khám
                        </span>
                      )}
                      {apt.status === "COMPLETED" && (
                        <span className="text-green-600 font-bold text-xs">
                          Hoàn thành
                        </span>
                      )}
                      {apt.status === "PENDING" && (
                        <span className="text-gray-400 font-bold text-xs">
                          Chưa đến
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {apt.status !== "COMPLETED" ? (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/staff/exam/${apt.id}`)}
                          className={
                            apt.status === "WAITING"
                              ? "shadow-md shadow-primary/20"
                              : "opacity-50"
                          }
                        >
                          <Play className="w-3 h-3 mr-1" /> Khám
                        </Button>
                      ) : (
                        <span className="text-green-600 flex items-center justify-end text-sm font-bold">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Xong
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
