// --- 1. ENUMS & CONSTANTS ---
export type ServiceType = "EXAMINATION" | "VACCINATION" | "SPA";
export type UserRole =
  | "CUSTOMER"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "ADMIN"
  | "STAFF";
export type BookingStatus =
  | "PENDING"
  | "WAITING"
  | "WAITING_PAYMENT" // Thêm trạng thái chờ thanh toán từ Backend
  | "COMPLETED"
  | "CANCELLED"
  | "PAID";

// --- 2. ENTITIES (Khớp với các bảng trong Database) ---

export interface ChiNhanh {
  MaCN: string;
  TenCN: string;
  DiaChi: string;
  SDT: string;
  ThoiGianMoCua: string;
  ThoiGianDongCua: string;
}

export interface ThuCung {
  MaTC: string;
  MaKH: string;
  TenTC: string;
  Loai: string;
  Giong: string;
  NgaySinh: string;
  GioiTinh: "Đực" | "Cái" | "Khác";
  TinhTrang?: string;
}

export interface SanPham {
  MaSP: string;
  TenSP: string;
  LoaiSP: string;
  GiaBan: number;
  DonViTinh: string;
  SoLuongTon: number;
}

export interface NhanVien {
  MaNV: string;
  HoTen: string;
  ChucVu: string;
  MaCN: string;
  NgayVaoLam: string;
  LuongHienTai?: number;
}

export interface GoiTiem {
  MaGoi: string;
  TenGoi: string;
  ThoiHanThang: number;
  PhanTramGiam: number;
}

export interface HoaDon {
  MaHD: string;
  MaCN: string;
  MaKH?: string;
  MaNV?: string;
  MaLichHen?: string;
  NgayLap: string;
  TongTien: number;
  TrangThai: "UNPAID" | "PAID" | "CANCELLED";
  HinhThucThanhToan: string;
}

export interface UserProfile {
  MaND: string;
  HoTen: string;
  SDT?: string;
  Email?: string;
  MaKH?: string;
  MaNV?: string;
  ChucVu?: string;
  TenCN?: string;
  TenHang?: string;
  DiemTichLuy?: number;
  Role: UserRole;
  MaCN?: string;
}

export interface KetQuaKhamPayload {
  MaLichHen: string;
  ChanDoan: string;
  LoiDan: string;
  DonThuoc: {
    medicineId: string;
    quantity: number;
    instruction: string;
    price: number;
  }[];
}

export interface AppointmentView {
  MaLichHen: string;
  ThoiGianHen: string;
  TenKhachHang: string;
  SDTKhachHang: string;
  TenTC: string;
  Loai: string;
  LoaiDichVu: string;
  TrieuChung: string;
  TrangThai: BookingStatus;
  TenBacSi?: string;
}

export interface FeedbackInput {
  MaKH: string;
  MaCN?: string;
  DiemChatLuong: number;
  ThaiDoNhanVien: number;
  MucHaiLongTongThe: number;
  BinhLuan: string;
}
