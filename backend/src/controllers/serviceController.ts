// /controllers/serviceController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const serviceController = {
  getBranches: async (req: Request, res: Response) => {
    const branches = [
      { MaCN: "CN01", TenCN: "PetCare Quận 1", DiaChi: "123 Nguyễn Huệ" },
      { MaCN: "CN02", TenCN: "PetCare Quận 7", DiaChi: "456 Nguyễn Văn Linh" },
    ];
    res.json({ data: branches });
  },

  createBooking: async (req: Request, res: Response) => {
    const bookingData = req.body;
    const { error } = await supabase.from("bookings").insert({
      MaKH: bookingData.MaKH,
      MaTC: Number(bookingData.maTC),
      MaCN: bookingData.maCN,
      ThoiGianHen: bookingData.dateTime,
      LoaiDichVu: bookingData.serviceType,
      TrieuChung: bookingData.trieuChung,
      MaNVPhuTrach: bookingData.maNVPhuTrach,
      TrangThai: "PENDING",
    });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  },
};
  