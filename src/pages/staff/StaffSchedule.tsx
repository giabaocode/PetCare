import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, Clock, Calendar, CheckCircle2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dữ liệu mẫu khởi tạo nếu LocalStorage trống
const INITIAL_DATA = [
  {
    id: "BK-2024-001",
    time: "08:30",
    patientName: "Nguyễn Văn Tester",
    petName: "Mimi",
    type: "Mèo",
    service: "Khám bệnh",
    symptom: "Bỏ ăn, nôn mửa",
    status: "PENDING",
  },
  {
    id: "BK-2024-002",
    time: "09:15",
    patientName: "Trần Thị B",
    petName: "Lu",
    type: "Chó",
    service: "Tiêm phòng",
    symptom: "Vaccine 7 bệnh",
    status: "COMPLETED",
  },
];

export const StaffSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<any[]>(() => {
    const saved = localStorage.getItem("pcx_appointments");
    if (saved) return JSON.parse(saved);
    localStorage.setItem("pcx_appointments", JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("pcx_appointments");
      if (saved) setAppointments(JSON.parse(saved));
    };
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "WAITING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse";
      case "COMPLETED":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chưa đến";
      case "WAITING":
        return "Chờ khám";
      case "COMPLETED":
        return "Hoàn tất";
      default:
        return status;
    }
  };

  // Logic lọc dữ liệu
  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.petName.toLowerCase().includes(searchTerm.toLowerCase());
    // Nếu filterStatus là 'WAITING', ta hiện cả PENDING và WAITING (chưa xong)
    const matchStatus = filterStatus
      ? filterStatus === "ACTIVE"
        ? apt.status === "PENDING" || apt.status === "WAITING"
        : apt.status === filterStatus
      : true;
    return matchSearch && matchStatus;
  });

  const toggleFilter = () => {
    // Logic: Tắt -> Hiện ca đang chờ (Active) -> Hiện ca xong (Completed) -> Tắt
    if (!filterStatus) setFilterStatus("ACTIVE");
    else if (filterStatus === "ACTIVE") setFilterStatus("COMPLETED");
    else setFilterStatus(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Lịch khám hôm nay
          </h1>
          <div className="flex items-center text-slate-500 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm tên khách, thú cưng..."
              className="pl-9 h-11 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className={`bg-white min-w-[140px] ${
              filterStatus ? "border-primary text-primary bg-primary/5" : ""
            }`}
            onClick={toggleFilter}
          >
            {filterStatus === "ACTIVE"
              ? "Đang chờ khám"
              : filterStatus === "COMPLETED"
              ? "Đã hoàn tất"
              : "Tất cả trạng thái"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="p-4 w-24">Giờ hẹn</th>
                <th className="p-4">Bệnh nhân / Thú cưng</th>
                <th className="p-4">Dịch vụ & Triệu chứng</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.map((apt: any) => (
                <tr
                  key={apt.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-center font-mono font-bold text-slate-700 bg-slate-100 w-fit px-3 py-1 rounded-lg">
                      <Clock className="w-3 h-3 mr-1.5" /> {apt.time}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-slate-800">
                        {apt.petName}{" "}
                        <span className="text-xs font-normal text-slate-500">
                          ({apt.type || "Khác"})
                        </span>
                      </p>
                      <p className="text-sm text-slate-500">
                        Chủ: {apt.patientName}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-primary">
                        {apt.service}
                      </span>
                      <span className="text-sm text-slate-500 line-clamp-1">
                        {apt.symptom}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {getStatusText(apt.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {apt.status === "PENDING" || apt.status === "WAITING" ? (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/staff/exam/${apt.id}`)}
                        className="bg-primary hover:bg-primary-600 shadow-sm"
                      >
                        <Play className="w-3 h-3 mr-1.5" /> Tiếp nhận
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-green-600"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Chi tiết
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Không tìm thấy lịch khám nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
