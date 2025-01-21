import { SurveyQuestionType } from "./SurveyJs";

// User Interface
export interface User {
  id: number; // User ID
  googleId: string; // Google Login ID
  email: string; // User's email
  name: string; // User's name
  profilePictureUrl?: string; // URL for the user's profile picture (optional)
  campaignId?: number; // ID of the associated campaign (optional)
}

// Campaign Interface
export interface Campaign {
  id: number; // Campaign ID
  name: string; // Campaign name
  price: number; // Campaign price
  description: string; // Description of the campaign
  createdAt: string; // Timestamp when the campaign was created
}

// GroupQuestion Interface
export interface GroupQuestion {
  id: number; // GroupQuestion ID
  name: string; // Name of the group (e.g., "Governance Sector")
  campaignId: number; // ID of the associated campaign
  createdAt: string; // Timestamp when the group was created
}

// QuestionType Interface
export interface QuestionType {
  id: number; // QuestionType ID
  name: "text" | "radiogroup" | "checkbox" | "dropdown"; // Type of the question
}

// Question Interface
export interface Question {
  id: number; // Question ID
  name: string; // Unique name identifier (used by SurveyJS)
  title: string; // The question text/title
  isRequired: boolean; // Whether the question is mandatory
  choices?: string[]; // Array of choices (for checkbox, radiogroup, dropdown)
  visibleIf?: string; // Conditional visibility logic
  otherText?: string; // Label for the "Other" option (if applicable)
  groupId: number; // ID of the associated group
  questionTypeId: number; // ID of the associated question type
  createdAt: string; // Timestamp when the question was created
  type: SurveyQuestionType;
}

// Answer Interface
export interface Answer {
  id: number; // Answer ID
  questionId: number; // ID of the associated question
  questionName: string; // ID of the associated question
  value: string | { answer: string; other?: string };
  createdAt: string; // Timestamp when the answer was created
}

// Combined Interfaces for API Responses

// Campaign with GroupQuestions
export interface CampaignWithGroups extends Campaign {
  groups: GroupQuestion[]; // Array of group questions for this campaign
}

// GroupQuestion with Questions
export interface GroupWithQuestions extends GroupQuestion {
  questions: Question[]; // Array of questions for this group
}

// Question with Type
export interface QuestionWithType extends Question {
  questionType: QuestionType; // Associated question type
}

// Complete Campaign Data Structure
export interface CampaignData {
  campaign: Campaign; // Campaign details
  groups: Array<{
    group: GroupQuestion; // Group question details
    questions: Array<QuestionWithType>; // Questions in this group with their types
  }>;
}
