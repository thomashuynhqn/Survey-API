export interface Campaign {
  id: number; // Primary key
  name: string; // Campaign name
  description?: string; // Optional campaign description
  ownerId: number; // Foreign key to the User table (owner of the campaign)
  createdAt: Date; // Creation timestamp
}
