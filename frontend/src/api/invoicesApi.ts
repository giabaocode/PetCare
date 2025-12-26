import { db } from "../utils/dataProvider";

export const invoicesApi = {
  // Tạo hóa đơn
  create: async (invoiceData: any) => {
    return db.addInvoice(invoiceData);
  },

  // Lấy danh sách (Có hỗ trợ lọc theo Khách hàng)
  getAll: async (maKH?: string) => {
    // Giả lập delay mạng nhẹ
    await new Promise((r) => setTimeout(r, 200));

    const allInvoices = db.getInvoices();
    if (maKH) {
      return allInvoices.filter((inv: any) => inv.MaKH === maKH);
    }
    return allInvoices;
  },

  // Lấy chi tiết 1 hóa đơn
  getOne: async (id: number | string) => {
    const all = db.getInvoices();
    // Chuyển về String để so sánh chính xác "123" với 123
    const invoice = all.find((inv: any) => String(inv.MaHD) === String(id));
    return invoice || null;
  },
};
