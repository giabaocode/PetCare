import { FeedbackInput } from "../types/schema";

const MOCK_EXAMS = [
  {
    MaDV: 801,
    NgayKham: "2024-03-01T09:00:00Z",
    TrieuChung: "Bỏ ăn, nôn mửa",
    ChanDoan: "Rối loạn tiêu hóa nhẹ",
    ToaThuoc: "Men tiêu hóa, Vitamin B",
    DichVu: { TenDV: "Khám Nội Khoa", NhanVienPhuTrach: "BS. Minh" },
  },
  {
    MaDV: 705,
    NgayKham: "2024-01-15T15:30:00Z",
    TrieuChung: "Ngứa tai, hay gãi",
    ChanDoan: "Viêm tai ngoài",
    ToaThuoc: "Thuốc nhỏ tai Dexoryl",
    DichVu: { TenDV: "Khám Da Liễu", NhanVienPhuTrach: "BS. Lan" },
  },
];

const MOCK_VACCINES = [
  {
    MaDV: 602,
    NgayTiem: "2024-02-20T10:00:00Z",
    LieuLuong: "1 liều",
    MaVaccine: 10,
    DichVu: { TenDV: "Tiêm phòng Dại" },
  },
];

export const userDataApi = {
  getKhamBenh: async (maKH: string) => {
    return { data: MOCK_EXAMS };
  },

  getTiemPhong: async (maKH: string) => {
    return { data: MOCK_VACCINES };
  },

  sendFeedback: async (data: FeedbackInput) => {
    console.log("Mock Feedback:", data);
    return { status: 201 };
  },
};
