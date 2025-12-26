// frontend/src/api/services.ts
import { db } from "../utils/dataProvider";

export const servicesApi = {
  getBranches: async () => {
    return {
      data: [
        { MaCN: "CN01", TenCN: "PetCare Quận 1", DiaChi: "123 Nguyễn Huệ" },
        {
          MaCN: "CN02",
          TenCN: "PetCare Quận 7",
          DiaChi: "456 Nguyễn Văn Linh",
        },
      ],
    };
  },

  // Mock API cũ (Giữ lại để tương thích code cũ nếu có)
  createDichVu: async (data: any) => ({ MaDV: 999 }),
  createKhamBenh: async (data: any) => ({ success: true }),
  createTiemPhong: async (data: any) => ({ success: true }),

  // --- HÀM TẠO LỊCH HẸN (QUAN TRỌNG) ---
  createBookingFull: async (bookingData: any) => {
    console.log("API: Creating Booking...", bookingData);

    const pets = db.getPets();
    // Ép kiểu String để so sánh an toàn
    const selectedPet = pets.find(
      (p: any) => String(p.MaTC) === String(bookingData.maTC)
    );

    // Tìm chủ nuôi để lưu tên hiển thị
    const ownerId = bookingData.MaKH || selectedPet?.MaKH;
    const users = db.getUsers();
    const owner = users.find((u: any) => u.MaKH === ownerId);

    const newAppt = db.addAppointment({
      time: new Date(bookingData.dateTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      patientName: owner ? owner.HoTen : "Khách hàng Online",
      petName: selectedPet ? selectedPet.TenTC : `Pet #${bookingData.maTC}`,
      type: selectedPet ? selectedPet.Loai : "Thú cưng",

      service:
        bookingData.serviceType === "EXAMINATION" ? "Khám bệnh" : "Tiêm phòng",
      symptom: bookingData.trieuChung || "Đặt lịch qua App",

      status: "WAITING",
      paymentStatus: "UNPAID",
      doctor: bookingData.maNVPhuTrach || "Bác sĩ chỉ định",

      MaKH: ownerId,
      MaTC: bookingData.maTC,

      // --- PHÂN LUỒNG CHI NHÁNH ---
      MaCN: bookingData.maCN, // Lưu mã chi nhánh (CN01/CN02) khách đã chọn
    });

    return newAppt;
  },
};
