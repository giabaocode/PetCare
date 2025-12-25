import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Search,
  Clock,
  Calendar,
  CheckCircle2,
  Play,
  Stethoscope,
  Syringe,
  Scissors,
  Filter,
  RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// IMPORT NGUỒN DỮ LIỆU CHUNG
import { getSharedAppointments } from "../../utils/dataProvider";

export const StaffSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showMyPatientsOnly, setShowMyPatientsOnly] = useState(false);

  // KHỞI TẠO TỪ DATA PROVIDER
  const [appointments, setAppointments] = useState<any[]>(
    getSharedAppointments
  );

  // Hàm làm mới dữ liệu
  const refreshData = () => {
    setAppointments(getSharedAppointments());
  };

  useEffect(() => {
    // Lắng nghe sự kiện thay đổi dữ liệu từ các tab khác
    window.addEventListener("storage", refreshData);
    window.addEventListener("local-storage-update", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("local-storage-update", refreshData);
    };
  }, []);

  // Helper: Icon dịch vụ
  const getServiceIcon = (service: string) => {
    if (service.toLowerCase().includes("tiêm"))
      return <Syringe className="w-4 h-4 text-orange-500" />;
    if (service.toLowerCase().includes("spa"))
      return <Scissors className="w-4 h-4 text-pink-500" />;
    return <Stethoscope className="w-4 h-4 text-blue-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-500 border-gray-200";
      case "WAITING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse font-bold";
      case "COMPLETED":
      case "DONE": // DONE là đã thanh toán
      case "PAID":
        return "bg-green-50 text-green-700 border-green-200 font-medium";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chưa đến";
      case "WAITING":
        return "Đang chờ khám";
      case "COMPLETED":
        return "Chờ thanh toán";
      case "DONE":
      case "PAID":
        return "Hoàn tất";
      default:
        return status;
    }
  };

  // Logic lọc dữ liệu
  const filteredAppointments = appointments.filter((apt) => {
    const matchSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus
      ? filterStatus === "ACTIVE"
        ? apt.status === "PENDING" || apt.status === "WAITING"
        : apt.status === filterStatus
      : true;

    const matchDoctor = showMyPatientsOnly ? apt.doctor === "BS. A" : true;

    return matchSearch && matchStatus && matchDoctor;
  });

  const stats = {
    total: appointments.length,
    waiting: appointments.filter((a) => a.status === "WAITING").length,
    completed: appointments.filter(
      (a) =>
        a.status === "COMPLETED" || a.status === "DONE" || a.status === "PAID"
    ).length,
  };

  return (
    <div className="pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Lịch làm việc hôm nay
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshData}
            title="Làm mới dữ liệu"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button
            variant={showMyPatientsOnly ? "primary" : "outline"}
            onClick={() => setShowMyPatientsOnly(!showMyPatientsOnly)}
            className={
              showMyPatientsOnly ? "shadow-lg shadow-primary/20" : "bg-white"
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            {showMyPatientsOnly ? "Đang lọc: Ca của tôi" : "Tất cả bác sĩ"}
          </Button>
        </div>
      </div>

      {/* QUICK STATS BAR */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">
              Tổng ca hẹn
            </p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-yellow-600 font-bold uppercase">
              Đang chờ khám
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.waiting}
            </p>
          </div>
          <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 animate-pulse">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-green-600 font-bold uppercase">
              Đã hoàn thành
            </p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
          </div>
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Tìm tên khách, thú cưng, mã phiếu..."
            className="pl-9 h-10 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["ALL", "ACTIVE", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status === "ALL" ? null : status)}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                (status === "ALL" && !filterStatus) || filterStatus === status
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {status === "ALL"
                ? "Tất cả"
                : status === "ACTIVE"
                ? "Chưa xong"
                : "Đã xong"}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="p-4 w-28">Giờ hẹn</th>
                <th className="p-4">Bệnh nhân / Thú cưng</th>
                <th className="p-4">Dịch vụ</th>
                <th className="p-4">Bác sĩ</th>
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
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center font-mono font-bold text-slate-700 bg-slate-100 w-fit px-2 py-1 rounded text-sm">
                        <Clock className="w-3 h-3 mr-1.5" /> {apt.time}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {apt.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          apt.type === "Mèo"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {apt.petName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {apt.petName}{" "}
                          <span className="text-slate-400 font-normal text-xs">
                            ({apt.type})
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          Chủ: {apt.patientName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getServiceIcon(apt.service)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">
                          {apt.service}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 italic max-w-[200px]">
                          "{apt.symptom}"
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                      {apt.doctor || "BS. A"}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(
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
                        className={`shadow-sm ${
                          apt.status === "WAITING"
                            ? "bg-primary hover:bg-primary-600 animate-pulse"
                            : "bg-white text-primary border border-primary hover:bg-primary-50"
                        }`}
                      >
                        <Play className="w-3 h-3 mr-1.5" />{" "}
                        {apt.status === "WAITING" ? "Khám ngay" : "Tiếp nhận"}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-green-600 bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Xong
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-400 italic"
                  >
                    <div className="flex flex-col items-center">
                      <Calendar className="w-10 h-10 mb-2 text-slate-200" />
                      <p>Không tìm thấy lịch khám nào phù hợp.</p>
                    </div>
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
