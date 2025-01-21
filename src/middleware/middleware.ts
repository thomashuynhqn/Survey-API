import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { settings } from "../utils/settings";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
    return; // Ensure the function terminates here
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, settings.jwtKey);
    console.log("decoded", decoded);
    (req as any).user = decoded; // Attach decoded token to request object

    next(); // Call the next middleware or route handler
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
