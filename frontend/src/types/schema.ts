// --- 1. ENUMS & CONSTANTS ---
export type ServiceType = "EXAMINATION" | "VACCINATION";
export type UserRole = "CUSTOMER" | "DOCTOR" | "RECEPTIONIST" | "ADMIN";
export type BookingStatus =
  | "PENDING"
  | "WAITING"
  | "COMPLETED"
  | "CANCELLED"
  | "PAID";

// --- 2. ENTITIES (Khớp với các bảng trong Database) ---

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
  CanNang?: number;
}

// Sản phẩm & Kho (Cập nhật mới cho InventoryPage)
export interface SanPham {
  MaSP: string;
  TenSP: string;
  Loai: "Thuốc" | "Vắc-xin" | "Thức ăn" | "Phụ kiện";
  DonGia: number;
  DonViTinh: string;
  TonKho: number; // Số lượng thực tế
  DinhMucToiThieu: number; // Safety Stock (Mới thêm)
}

export interface NhanVien {
  MaNV: string;
  HoTen: string;
  ChucVu: "Bác sĩ" | "Tiếp tân" | "Quản lý";
  MaCN: string; // Chi nhánh đang làm việc
  LuongCoBan: number;
  TrangThai: "Active" | "Inactive";
  NgayVaoLam: string;
}

// Lịch sử công tác (Mới thêm cho HRManagement)
export interface LichSuCongTac {
  id: number;
  MaNV: string;
  TuNgay: string;
  DenNgay?: string; // null là hiện tại
  ChucVu: string;
  MaCN: string; // Công tác tại chi nhánh nào
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
  // Chi tiết hóa đơn (Optional vì lúc list không cần load hết)
  ChiTietSanPham?: { TenSP: string; SoLuong: number; ThanhTien: number }[];
  ChiTietDichVu?: { TenDV: string; ThanhTien: number }[];
}

// --- 3. DTOs (Data Transfer Objects - Dữ liệu gửi đi/nhận về từ API) ---

// Profile người dùng đăng nhập
export interface UserProfile {
  MaND: string;
  HoTen: string;
  SDT?: string;
  Email?: string;
  MaKH?: string; // Nếu là khách hàng
  MaNV?: string; // Nếu là nhân viên
  TenHang?: string; // Hạng thành viên (Bạc, Vàng...)
  DiemTichLuy?: number;
  Role: UserRole;
  MaCN?: string; // Nếu là nhân viên, cần biết thuộc chi nhánh nào
}

// Payload khi Bác sĩ lưu kết quả khám (Quan trọng nhất để trừ kho)
export interface KetQuaKhamPayload {
  MaLichHen: string; // ID Booking
  ChanDoan: string;
  LoiDanBS: string;
  TaiKham?: boolean;
  NgayTaiKham?: string;
  // Danh sách thuốc kê đơn
  ToaThuoc: {
    MaSP: string;
    SoLuong: number;
    CachDung: string;
  }[];
}

// Form Input cho Đặt lịch
export interface BookingInput {
  MaKH: string;
  MaTC: string | number;
  MaCN: string;
  MaDV?: string; // Nếu chọn dịch vụ cụ thể
  LoaiDichVu: ServiceType;
  NgayHen: string; // YYYY-MM-DD
  GioHen: string; // HH:mm
  TrieuChung?: string;
}

// Dữ liệu hiển thị trên Lịch làm việc (StaffSchedule)
export interface AppointmentView {
  id: string;
  time: string;
  patientName: string;
  petName: string;
  type: string; // Chó/Mèo
  service: string;
  symptom: string;
  status: BookingStatus;
  doctorName?: string; // Bác sĩ được chỉ định
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
