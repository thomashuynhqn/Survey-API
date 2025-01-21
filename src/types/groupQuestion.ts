export interface GroupQuestion {
  id: number; // Primary key
  name: string; // Name of the group question
  campaignId: number; // Foreign key to Campaign
  surveyJson: any; // JSON object for the survey structure
  data: any; // JSON object for the survey structure
  createdAt: Date; // Creation timestamp
}
