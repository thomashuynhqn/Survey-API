import { Router, Request, Response } from "express";
import pool from "../db";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHelper";
import { FieldPacket, RowDataPacket } from "mysql2"; // Import RowDataPacket for TypeScript typing

// Define the Question interface for type safety
interface Question extends RowDataPacket {
  id: number;
  text: string;
  groupId: number;
  type: string;
  createdAt: string;
}

const router = Router();

// Fetch all questions
interface QuestionRow extends RowDataPacket {
  id: number;
  name: string;
  title: string;
  isRequired: number;
  choices: string | null;
  visibleIf: string | null;
  otherText: string | null;
  groupId: number;
  questionTypeId: number;
  type: string;
  createdAt: string;
  answerId: number | null;
  questionName: string | null;
  value: string | null;
  answerCreatedAt: string | null;
  hasOther: number;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    // Fetch all questions and their answers from the database
    const [rows]: [QuestionRow[], FieldPacket[]] = await pool.query<
      QuestionRow[]
    >(
      `
      SELECT
        q.id,
        q.name,
        q.title,
        q.isRequired,
        q.choices,
        q.visibleIf,
        q.otherText,
        q.group_id AS groupId,
        q.hasOther,
        q.question_type_id AS questionTypeId,
        qt.name AS type, -- The type name from QuestionTypes
        q.created_at AS createdAt,
        a.id AS answerId, -- Answer ID (if exists)
        a.question_name AS questionName, -- Name of the question in Answers table
        a.value AS value, -- Answer value
        a.created_at AS answerCreatedAt -- When the answer was created
      FROM
        Questions q
      JOIN
        QuestionTypes qt
      ON
        q.question_type_id = qt.id
      LEFT JOIN
        Answers a
      ON
        q.id = a.question_id
      ORDER BY q.id ASC 
      `
    );

    // Organize the data
    const questions = rows.reduce((acc: any[], row) => {
      // Check if the question already exists in the accumulator
      let question = acc.find((q) => q.id === row.id);

      if (!question) {
        // Create a new question object if it doesn't exist
        question = {
          id: row.id,
          name: row.name,
          title: row.title,
          isRequired: row.isRequired === 1,
          choices: row.choices, // Parse choices if they exist
          visibleIf: row.visibleIf,
          otherText: row.otherText,
          groupId: row.groupId,
          hasOther: row.hasOther === 1,
          questionTypeId: row.questionTypeId,
          type: row.type,
          createdAt: row.createdAt,
          answers: [], // Initialize answers array
        };
        acc.push(question);
      }

      // Add the answer to the question's answers array if it exists
      if (row.answerId) {
        let parsedValue = null;

        // Attempt to parse the answer value
        try {
          parsedValue = row.value ? JSON.parse(row.value) : null;
        } catch (error) {
          console.warn("Failed to parse answer value:", row.value);
        }

        // Check if the value contains "Other" logic
        if (
          parsedValue &&
          typeof parsedValue === "object" &&
          "answer" in parsedValue
        ) {
          question.answers.push({
            id: row.answerId,
            questionName: parsedValue.other
              ? `${row.questionName}-Comment` // Append -Comment if "other" exists
              : row.questionName,
            value: parsedValue.answer, // The main answer value
            other: parsedValue.other || null, // The "Other" value, if present
            createdAt: row.answerCreatedAt,
          });
        } else {
          // For regular answers
          question.answers.push({
            id: row.answerId,
            questionName: row.questionName,
            value: parsedValue || row.value, // Use parsed or raw value
            other: null, // No "Other" value
            createdAt: row.answerCreatedAt,
          });
        }
      }

      return acc;
    }, []);

    // Send a success response
    sendSuccessResponse(res, questions);
  } catch (error: any) {
    console.error("Error fetching questions and answers:", error);
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

// Fetch one question by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Fetch question by ID
    const [rows]: [Question[], any] = await pool.query(
      "SELECT * FROM Questions WHERE id = ?",
      [id]
    );

    // Check if the question exists
    if (rows.length === 0) {
      return sendErrorResponse(
        res,
        "No data found",
        404,
        "Not Found",
        `No question found with ID ${id}`
      );
    }

    // Send success response with the first record (assuming unique IDs)
    sendSuccessResponse(res, rows[0]);
  } catch (error: any) {
    // Handle errors
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

export default router;
