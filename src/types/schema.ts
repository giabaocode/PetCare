export type ServiceType = "EXAMINATION" | "VACCINATION";

export interface ChiNhanh {
  MaCN: string;
  TenCN: string;
  DiaChi: string;
  ThoiGianMoCua: string;
  ThoiGianDongCua: string;
}

export interface ThuCung {
  MaTC: number;
  MaKH: string;
  TenTC: string;
  Loai: string;
  Giong: string;
  NgaySinh: string;
  GioiTinh: "Đực" | "Cái";
  TinhTrang?: string;
}

export interface DichVuInput {
  TenDV: string;
  MoTa?: string;
  DonGiaCoBan?: number;
  MaTC: number;
  NhanVienPhuTrach?: string; // UUID MaNV
}

export interface KhamBenhInput {
  MaDV: number;
  NgayKham: string; // ISO Date
  TrieuChung: string;
}

export interface TiemPhongInput {
  MaDV: number;
  MaTC: number;
  NgayTiem: string; // ISO Date
  MaVaccine?: number;
}

export interface GoiTiem {
  MaGoi: number;
  TenGoi: string;
  ThoiHanThang: number;
  PhanTramGiam: number;
}

export interface HoaDon {
  MaHD: number;
  NgayLap: string;
  TongTien: number;
  HinhThucThanhToan: string;
  TrangThai?: string;
}

export interface FeedbackInput {
  MaCN: string;
  MaKH: string;
  DiemChatLuong: number;
  ThaiDoNhanVien: number;
  MucHaiLongTongThe: number;
  BinhLuan: string;
  NgayDanhGia: string;
}
export type userRole = "CUSTOMER" | "DOCTOR" | "RECEPTIONIST" | "ADMIN";

// Type mở rộng cho UI Profile
export interface UserProfile {
  MaND: string;
  HoTen: string;
  SDT?: string;
  Email?: string;
  MaKH?: string;
  TenHang?: string;
  DiemTichLuy?: number;
  Role?: userRole;
}

// ... (Giữ nguyên code cũ)

// Thêm Enum trạng thái Booking
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

// Mở rộng interface Booking (Mock)
export interface BookingAppointment {
  id: string;
  patientName: string;
  petName: string;
  serviceType: "Khám bệnh" | "Tiêm phòng";
  time: string;
  status: BookingStatus;
  doctorName?: string;
  trieuChung?: string; // Sơ bộ ban đầu
}
