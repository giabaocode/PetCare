import { db } from "../utils/dataProvider";

export const invoicesApi = {
  create: async (invoiceData: any) => {
    return db.addInvoice(invoiceData);
  },

  // FIX: Thêm tham số optional maKH vào đây
  getAll: async (maKH?: string) => {
    const allInvoices = db.getInvoices();

    // Nếu có truyền maKH -> Lọc ra hóa đơn của người đó
    if (maKH) {
      return allInvoices.filter((inv: any) => inv.MaKH === maKH);
    }

    // Nếu không truyền (VD: Admin xem) -> Trả về hết
    return allInvoices;
  },

  getOne: async (id: number | string) => {
    const all = db.getInvoices();
    const invoice = all.find((inv: any) => String(inv.MaHD) === String(id));
    return invoice || null;
  },
};
