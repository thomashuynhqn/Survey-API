export interface User {
  id: number; // Primary key
  googleId: string; // Google ID retrieved from OAuth
  name: string; // User's name
  email: string; // User's email
  pictureUrl?: string; // Optional profile picture URL
  campaignId?: number | null; // Foreign key to Campaign (nullable)
  createdAt: Date; // Creation timestamp
}
