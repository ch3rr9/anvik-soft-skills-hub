
export interface ScheduledTest {
  id: number;
  testId: number;
  testTitle: string;
  assignedBy: string;
  assignedTo: string[];
  scheduledDate: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
}

export interface TestAssignment {
  testId: number;
  userIds: string[];
  scheduledDate: string;
  dueDate: string;
  assignedBy: string;
}

export interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'test' | 'meeting' | 'deadline';
  status?: 'pending' | 'completed' | 'overdue';
}
