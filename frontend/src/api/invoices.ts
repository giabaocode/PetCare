import { HoaDon } from "../types/schema";

const MOCK_INVOICES: HoaDon[] = [
  {
    MaHD: 5001,
    NgayLap: "2024-03-10T10:30:00Z",
    TongTien: 1500000,
    HinhThucThanhToan: "Chuyển khoản",
    TrangThai: "Đã thanh toán",
  },
  {
    MaHD: 4092,
    NgayLap: "2024-02-15T14:20:00Z",
    TongTien: 350000,
    HinhThucThanhToan: "Tiền mặt",
    TrangThai: "Đã thanh toán",
  },
];

// Chi tiết giả cho Hóa đơn 5001
const MOCK_DETAIL_5001 = {
  ...MOCK_INVOICES[0],
  ChiTietHoaDonSanPham: [
    {
      SanPham: { TenSP: "Thức ăn hạt Royal Canin" },
      SoLuong: 2,
      ThanhTien: 500000,
    },
    { SanPham: { TenSP: "Pate Whiskas" }, SoLuong: 5, ThanhTien: 100000 },
  ],
  ChiTietHoaDonDichVu: [
    { DichVu: { TenDV: "Combo Tắm & Cắt tỉa" }, SoLuong: 1, ThanhTien: 900000 },
  ],
};

export const invoicesApi = {
  getAll: async (maKH: string) => {
    return { data: MOCK_INVOICES };
  },

  getOne: async (id: number) => {
    // Luôn trả về chi tiết giả dù bấm vào hóa đơn nào (để test UI)
    return { data: [MOCK_DETAIL_5001] };
  },
};
