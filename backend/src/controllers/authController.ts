// /controllers/authController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const authController = {
  login: async (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`Email.eq.${identifier},SDT.eq.${identifier},MaND.eq.${identifier}`)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ message: "User not found" });

      if (data.MatKhau !== password) {
        return res.status(401).json({ message: "Wrong password" });
      }

      return res.json(data); // Trả về user profile
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
