import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// Fetch all campaigns
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Campaigns");
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch one campaign by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM Campaigns WHERE id = ?", [
      id,
    ]);
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
