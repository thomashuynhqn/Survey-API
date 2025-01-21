import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import pool from "../db"; // Your database connection pool
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHelper";
import { settings } from "../utils/settings";

const router = Router();

const JWT_EXPIRY = "7d"; // Token expiry duration

// User Row Interface
interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
}

// Endpoint to handle Google login
router.post("/google", async (req: Request, res: Response) => {
  const {
    email,
    name,
    googleId,
    avatarUrl,
  }: { email: string; name: string; googleId: string; avatarUrl?: string } =
    req.body;

  // Validate required fields
  if (!email || !name || !googleId) {
    return sendErrorResponse(
      res,
      "Missing required fields",
      400,
      "Bad Request"
    );
  }

  try {
    // Query to check if the user exists
    const checkQuery = `SELECT id, name, email, avatar_url FROM Users WHERE email = ?`;
    const [existingUser] = await pool.query<UserRow[]>(checkQuery, [email]);

    let userId: number;

    if (existingUser.length > 0) {
      // User exists
      userId = existingUser[0].id;
    } else {
      // User does not exist, insert new user
      const insertQuery = `
        INSERT INTO Users (name, email, google_id, avatar_url)
        VALUES (?, ?, ?, ?)
      `;
      const [result]: any = await pool.query(insertQuery, [
        name,
        email,
        googleId,
        avatarUrl || null,
      ]);
      userId = result.insertId;
    }

    // Generate a JWT token
    const token = jwt.sign({ id: userId, email }, settings.jwtKey, {
      expiresIn: JWT_EXPIRY,
    });

    // Send success response
    sendSuccessResponse(res, {
      id: userId,
      name,
      email,
      avatarUrl,
      token,
      message:
        existingUser.length > 0
          ? "User already exists. Login successful."
          : "New user created successfully. Login successful.",
    });
  } catch (error: any) {
    // Handle errors
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

export default router;
