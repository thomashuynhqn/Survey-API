import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Enable cookies and credentials if needed
  })
);

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express with TypeScript and MySQL!");
});

// Routes
app.use("/", router);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
