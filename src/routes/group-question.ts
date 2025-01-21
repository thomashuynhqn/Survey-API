import { Router, Request, Response } from "express";
import pool from "../db"; // Import your database connection pool
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHelper"; // Helper functions for responses
import { GroupQuestion } from "../types/groupQuestion";

const router = Router();

// Fetch all GroupQuestions
router.get("/", async (req: Request, res: Response) => {
  try {
    // Query to fetch all group questions without `surveyJson` and `data`
    const [rows]: any = await pool.query(
      "SELECT id, name, campaign_id, created_at FROM GroupQuestion"
    );

    // Transform to camelCase properties
    const transformedRows = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      campaignId: row.campaign_id,
      createdAt: row.created_at,
    }));

    // Send a success response with transformed data
    sendSuccessResponse(res, transformedRows);
  } catch (error: any) {
    // Handle errors
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate the ID
  if (!id) {
    return sendErrorResponse(res, "Missing ID parameter", 400, "Bad Request");
  }

  try {
    // Query to fetch a specific group question by ID
    const [rows]: any = await pool.query(
      "SELECT id, name, campaign_id, survey_json, created_at, data FROM GroupQuestion WHERE id = ?",
      [id]
    );

    // Check if the record exists
    if (rows.length === 0) {
      return sendErrorResponse(
        res,
        `GroupQuestion with ID ${id} not found`,
        404,
        "Not Found"
      );
    }

    // Transform to camelCase properties
    const transformedRow = {
      id: rows[0].id,
      name: rows[0].name,
      campaignId: rows[0].campaign_id,
      surveyJson: rows[0].survey_json,
      createdAt: rows[0].created_at,
      data: rows[0].data,
    };

    // Send a success response with the detailed data
    sendSuccessResponse(res, transformedRow);
  } catch (error: any) {
    // Handle errors
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    // Extract data from the request body
    const { name, campaignId, surveyJson, data, id }: Partial<GroupQuestion> =
      req.body;

    // Validate the required fields
    if (!name || !campaignId || !surveyJson) {
      return sendErrorResponse(
        res,
        "Missing required fields",
        400,
        "Bad Request"
      );
    }

    if (id) {
      // Check if the ID exists in the database
      const checkQuery = `SELECT id FROM GroupQuestion WHERE id = ?`;
      const [existing]: any = await pool.query(checkQuery, [id]);

      if (existing.length > 0) {
        // If the ID exists, update the record
        const updateQuery = `
          UPDATE GroupQuestion
          SET name = ?, campaign_id = ?, survey_json = ?, data = ?
          WHERE id = ?
        `;
        const updateValues = [
          name,
          campaignId,
          JSON.stringify(surveyJson),
          JSON.stringify(data),
          id,
        ];

        await pool.query(updateQuery, updateValues);

        // Send success response for update
        return sendSuccessResponse(res, {
          id,
          name,
          campaignId,
          surveyJson,
          data,
          message: "GroupQuestion updated successfully",
        });
      }
    }

    // If the ID does not exist or is not provided, create a new record
    const insertQuery = `
      INSERT INTO GroupQuestion (name, campaign_id, survey_json, data)
      VALUES (?, ?, ?, ?)
    `;
    const insertValues = [
      name,
      campaignId,
      JSON.stringify(surveyJson),
      JSON.stringify(data),
    ];

    const [result]: any = await pool.query(insertQuery, insertValues);

    // Send success response for creation
    sendSuccessResponse(res, {
      id: result.insertId,
      name,
      campaignId,
      surveyJson,
      data,
      message: "GroupQuestion created successfully",
    });
  } catch (error: any) {
    // Handle errors
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});
export default router;
