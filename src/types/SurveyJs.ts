export interface SurveyJSON {
  title: string;
  description?: string;
  showProgressBar?: "top" | "bottom" | "off";
  pages: Page[];
}

export interface Page {
  elements: Element[];
}

type Element =
  | TextQuestion
  | RadiogroupQuestion
  | CheckboxQuestion
  | OtherQuestion;

export type SurveyQuestionType =
  | "text"
  | "radiogroup"
  | "checkbox"
  | "dropdown";
export interface BaseQuestion {
  type: SurveyQuestionType;
  name: string;
  title: string;
  isRequired?: boolean;
  visibleIf?: string;
  otherText?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
  inputType?: string; // Input type like "text", "password", "email", etc.
  placeHolder?: string;
  maxLength?: number;
}

export interface RadiogroupQuestion extends BaseQuestion {
  type: "radiogroup";
  choices: string[] | Choice[];
}

export interface CheckboxQuestion extends BaseQuestion {
  type: "checkbox";
  choices: string[] | Choice[];
  hasOther?: boolean; // Option to add "Other" as a choice
  colCount?: number; // Number of columns for checkboxes
}

export interface OtherQuestion extends BaseQuestion {
  // Extend this for additional question types if needed
  type: SurveyQuestionType;
}

export interface Choice {
  value: string;
  text?: string;
}
