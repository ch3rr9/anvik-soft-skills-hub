
interface WorkSchedule {
  role: string;
  pattern: string;
  startTime: string;
  endTime: string;
  description: string;
}

export const WORK_SCHEDULES: WorkSchedule[] = [
  {
    role: "director",
    pattern: "7/7",
    startTime: "10:00",
    endTime: "17:00",
    description: "График директора: неделя через неделю",
  },
  {
    role: "manager",
    pattern: "5/2",
    startTime: "10:00",
    endTime: "17:00",
    description: "График HR-менеджера: пятидневная рабочая неделя",
  },
  {
    role: "employee",
    pattern: "5/2",
    startTime: "08:00",
    endTime: "18:00",
    description: "График сотрудников: пятидневная рабочая неделя",
  },
];

export const generateYearlySchedule = (role: string) => {
  const schedule = [];
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1); // January 1st
  const endDate = new Date(currentYear, 11, 31); // December 31st
  
  const roleSchedule = WORK_SCHEDULES.find(s => s.role === role);
  if (!roleSchedule) return schedule;

  let currentDate = new Date(startDate);
  let workDayCount = 0;
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const isWorkday = roleSchedule.pattern === "7/7" 
      ? workDayCount < 7
      : dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday for 5/2

    schedule.push({
      date: new Date(currentDate),
      isWorkday,
      startTime: isWorkday ? roleSchedule.startTime : null,
      endTime: isWorkday ? roleSchedule.endTime : null,
    });

    if (roleSchedule.pattern === "7/7") {
      workDayCount++;
      if (workDayCount === 14) workDayCount = 0; // Reset after full cycle
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
};
