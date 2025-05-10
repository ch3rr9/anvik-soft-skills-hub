
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  timeLimit: number; // в минутах
  passingScore: number; // процент правильных ответов для успешного прохождения
  availableRoles: string[]; // роли, которым доступен тест
  createdBy: string;
  createdAt: string;
}

export interface TestResult {
  id: number;
  testId: number;
  userId: string;
  score: number;
  maxScore: number;
  passedAt: string;
  passed: boolean;
  answers: number[]; // индексы выбранных ответов
  recommendation?: string;
  needsVacation?: boolean;
}

export interface PsychTestResult extends TestResult {
  recommendation: string;
  needsVacation: boolean;
}
