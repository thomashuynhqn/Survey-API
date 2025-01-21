import { Router, Request, Response } from "express";
import pool from "../db";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHelper";

const router = Router();

// Fetch all question groups
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM GroupQuestions");
    // Use the helper to send a success response
    sendSuccessResponse(res, rows);
  } catch (error: any) {
    // Use the helper to send an error response
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

// Fetch one question group by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Destructure rows from the result
    const [rows]: any = await pool.query(
      "SELECT * FROM QuestionGroups WHERE id = ?",
      [id]
    );

    // Check if rows is an array and has data
    if (rows.length === 0) {
      return sendErrorResponse(
        res,
        "No data found",
        404,
        "Not Found",
        `No question group found with ID ${id}`
      );
    }

    // Send success response
    sendSuccessResponse(res, rows[0]); // Assuming you want the first record
  } catch (error: any) {
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

export default router;
