import { Router, Request, Response } from "express";
import pool from "../db";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHelper";
import { Answer } from "../types"; // Import the Answer interface

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const answers: Answer[] = req.body.answers; // Expecting an array of answers
    console.log("Received answers:", answers);

    if (!answers || !Array.isArray(answers)) {
      return sendErrorResponse(
        res,
        "Invalid payload. 'answers' must be an array.",
        400,
        "Bad Request"
      );
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const query = `
          INSERT INTO Answers (question_id, question_name, value, created_at)
          VALUES (?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE value = VALUES(value), created_at = NOW()
        `;

      for (const answer of answers) {
        let valueToSave = answer.value;

        // Check if the value contains "Other" logic
        if (typeof valueToSave === "object" && "answer" in valueToSave) {
          if (valueToSave.answer === "other" && valueToSave.other) {
            valueToSave = JSON.stringify(valueToSave);
          } else {
            valueToSave = JSON.stringify(valueToSave);
          }
        } else if (typeof valueToSave !== "string") {
          valueToSave = JSON.stringify(valueToSave);
        }

        await connection.query(query, [
          answer.questionId,
          answer.questionName,
          valueToSave,
        ]);
      }

      await connection.commit();
      connection.release();

      sendSuccessResponse(res, {
        message: "Answers saved successfully.",
        count: answers.length,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("Error saving answers (transaction rollback):", error);
      return sendErrorResponse(
        res,
        "Failed to save answers. Please try again.",
        500,
        "Internal Server Error"
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in Save Answers API:", error);
    sendErrorResponse(
      res,
      error.message || "An unexpected error occurred.",
      500,
      "Internal Server Error"
    );
  }
});

export default router;
