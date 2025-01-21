import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import pool from "../db"; // Import your database connection pool
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/responseHelper";
import { settings } from "../utils/settings";
import bcrypt from "bcrypt";
const router = Router();

// Secret for signing the JWT

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
    // Check if the user already exists
    const checkQuery = `SELECT id, name, email, picture_url FROM User WHERE email = ?`;
    const [existingUser]: any = await pool.query(checkQuery, [email]);

    let userData;

    if (existingUser.length > 0) {
      // User exists
      userData = {
        id: existingUser[0].id,
        name: existingUser[0].name,
        email: existingUser[0].email,
        avatarUrl: existingUser[0].picture_url,
      };
    } else {
      // User does not exist, create a new user
      const insertQuery = `
        INSERT INTO User (name, email, google_id, picture_url)
        VALUES (?, ?, ?, ?)
      `;
      const insertValues = [name, email, googleId, avatarUrl || null];
      const [result]: any = await pool.query(insertQuery, insertValues);

      userData = {
        id: result.insertId,
        name,
        email,
        avatarUrl,
      };
    }

    // Generate a JWT for the user
    const token = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
      },
      settings.jwtKey,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Return success response with user data and token
    return sendSuccessResponse(res, {
      user: userData,
      token,
      message: "Login successful.",
    });
  } catch (error: any) {
    // Handle errors
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  // Validate required fields
  if (!email || !password) {
    return sendErrorResponse(
      res,
      "Missing email or password",
      400,
      "Bad Request"
    );
  }

  try {
    // Check if the user exists
    const checkQuery = `SELECT id, name, email, password, picture_url,  FROM User WHERE email = ?`;
    const [users]: any = await pool.query(checkQuery, [email]);

    if (users.length === 0) {
      return sendErrorResponse(res, "User not found", 404, "Not Found");
    }

    const user = users[0];

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendErrorResponse(res, "Invalid credentials", 401, "Unauthorized");
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      settings.jwtKey,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    // Return success response with user data and token
    sendSuccessResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.picture_url,
      },
      token,
      message: "Login successful.",
    });
  } catch (error: any) {
    // Handle errors
    sendErrorResponse(res, error.message, 500, "Internal Server Error");
  }
});

export default router;
