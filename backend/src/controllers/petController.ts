// /controllers/petController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const petController = {
  getAll: async (req: Request, res: Response) => {
    const { data, error } = await supabase.from("pets").select("*");

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  },

  getOne: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  },

  create: async (req: Request, res: Response) => {
    const { name, type, breed, healthStatus } = req.body;
    const { error } = await supabase
      .from("pets")
      .insert([{ name, type, breed, healthStatus }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, type, breed, healthStatus } = req.body;
    const { error } = await supabase
      .from("pets")
      .update({ name, type, breed, healthStatus })
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from("pets").delete().eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  },
};
