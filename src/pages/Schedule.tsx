import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { generateYearlySchedule } from "@/data/scheduleData";

// Мок данных для рабочего графика
const WORK_SCHEDULE = [
  { id: 1, date: "2025-04-28", startTime: "09:00", endTime: "18:00", type: "workday" },
  { id: 2, date: "2025-04-29", startTime: "09:00", endTime: "18:00", type: "workday" },
  { id: 3, date: "2025-04-30", startTime: "09:00", endTime: "18:00", type: "workday" },
  { id: 4, date: "2025-05-01", startTime: "", endTime: "", type: "holiday" },
  { id: 5, date: "2025-05-02", startTime: "", endTime: "", type: "holiday" },
  { id: 6, date: "2025-05-03", startTime: "", endTime: "", type: "weekend" },
  { id: 7, date: "2025-05-04", startTime: "", endTime: "", type: "weekend" },
  { id: 8, date: "2025-05-05", startTime: "09:00", endTime: "18:00", type: "workday" },
  { id: 9, date: "2025-05-06", startTime: "09:00", endTime: "18:00", type: "workday" },
  { id: 10, date: "2025-05-07", startTime: "09:00", endTime: "18:00", type: "workday" },
];

// Мок данных для отпусков
const VACATIONS = [
  { id: 1, employee: "Иван Директоров", startDate: "2025-05-15", endDate: "2025-05-30", status: "approved" },
  { id: 2, employee: "Мария Кадрова", startDate: "2025-06-10", endDate: "2025-06-24", status: "approved" },
  { id: 3, employee: "Алексей Программистов", startDate: "2025-07-01", endDate: "2025-07-14", status: "pending" },
];

const WeekScheduleView = () => {
  const { user } = useAuth();
  const [weekSchedule, setWeekSchedule] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      const yearSchedule = generateYearlySchedule(user.role);
      const today = new Date();
      const startOfWeek = new Date(today);
      const diff = today.getDay() === 0 ? 6 : today.getDay() - 1;
      startOfWeek.setDate(today.getDate() - diff);
      
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const scheduleDay = yearSchedule.find(day => 
          day.date.toDateString() === currentDate.toDateString()
        );
        weekDays.push({
          date: currentDate,
          ...scheduleDay
        });
      }
      setWeekSchedule(weekDays);
    }
  }, [user]);

  // Получаем текущую дату и день недели
  const today = new Date();
  const currentDay = today.getDay(); // 0 - воскресенье, 1 - понедельник и т.д.
  
  // Вычисляем начало недели (понедельник)
  const startOfWeek = new Date(today);
  const diff = currentDay === 0 ? 6 : currentDay - 1; // преобразуем, чтобы понедельник был началом
  startOfWeek.setDate(today.getDate() - diff);
  
  // Создаем массив дней недели
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }
  
  // Форматирование даты для отображения
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };
  
  // Проверяем, является ли день текущим
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  // Получаем тип дня (рабочий, выходной, праздник)
  const getDayType = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const scheduleItem = WORK_SCHEDULE.find(item => item.date === dateStr);
    if (scheduleItem) {
      return scheduleItem.type;
    }
    // Если нет в расписании, определяем по дню недели
    const day = date.getDay();
    return day === 0 || day === 6 ? "weekend" : "workday";
  };
  
  // Получаем рабочее время для дня
  const getWorkTime = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const scheduleItem = WORK_SCHEDULE.find(item => item.date === dateStr);
    if (scheduleItem && scheduleItem.type === "workday") {
      return `${scheduleItem.startTime} - ${scheduleItem.endTime}`;
    }
    return "";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">
          Неделя {startOfWeek.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} - 
          {new Date(startOfWeek.setDate(startOfWeek.getDate() + 6)).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </h2>
        
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "В разработке", description: "Переход на предыдущую неделю" })}>
            &lt; Предыдущая
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "В разработке", description: "Переход на следующую неделю" })}>
            Следующая &gt;
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayType = getDayType(day);
          let bgColor = "bg-white";
          let textColor = "text-gray-900";
          
          if (isToday(day)) {
            bgColor = "bg-anvik-primary/10";
            textColor = "text-anvik-primary";
          } else if (dayType === "weekend") {
            bgColor = "bg-gray-100";
            textColor = "text-gray-600";
          } else if (dayType === "holiday") {
            bgColor = "bg-red-100";
            textColor = "text-red-600";
          }
          
          return (
            <div 
              key={index} 
              className={`rounded-lg border p-3 ${bgColor} ${textColor} ${isToday(day) ? 'ring-2 ring-anvik-primary' : ''}`}
            >
              <div className="text-center">
                <div className="font-medium">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index]}
                </div>
                <div className={`text-lg ${isToday(day) ? 'font-bold' : ''}`}>
                  {formatDate(day)}
                </div>
                
                {dayType === "workday" && (
                  <div className="mt-2 text-sm">
                    {getWorkTime(day)}
                  </div>
                )}
                
                {dayType === "weekend" && (
                  <Badge variant="outline" className="mt-2 bg-gray-200">
                    Выходной
                  </Badge>
                )}
                
                {dayType === "holiday" && (
                  <Badge variant="outline" className="mt-2 bg-red-100 text-red-600 border-red-300">
                    Праздник
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MonthScheduleView = () => {
  // Текущий месяц
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Названия месяцев
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  
  // Создаем календарную сетку
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  
  // Определяем день недели для первого дня месяца (0 - воскресенье, 1 - понедельник и т.д.)
  let firstDayOfWeek = firstDay.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // преобразуем в формат 0 - понедельник, 6 - воскресенье
  
  // Создаем массив дней в календаре
  const daysInCalendar = [];
  
  // Добавляем дни предыдущего месяца
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonthDay = new Date(currentYear, currentMonth, -i);
    daysInCalendar.unshift({
      date: prevMonthDay,
      currentMonth: false,
    });
  }
  
  // Добавляем дни текущего месяца
  for (let i = 1; i <= lastDay.getDate(); i++) {
    daysInCalendar.push({
      date: new Date(currentYear, currentMonth, i),
      currentMonth: true,
    });
  }
  
  // Если нужно, добавляем дни следующего месяца, чтобы заполнить сетку
  const remainingDays = 42 - daysInCalendar.length; // 6 недель по 7 дней
  for (let i = 1; i <= remainingDays; i++) {
    daysInCalendar.push({
      date: new Date(currentYear, currentMonth + 1, i),
      currentMonth: false,
    });
  }
  
  // Форматирование даты для отображения
  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };
  
  // Проверяем, является ли день текущим
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  // Получаем тип дня (рабочий, выходной, праздник)
  const getDayType = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const scheduleItem = WORK_SCHEDULE.find(item => item.date === dateStr);
    if (scheduleItem) {
      return scheduleItem.type;
    }
    // Если нет в расписании, определяем по дню недели
    const day = date.getDay();
    return day === 0 || day === 6 ? "weekend" : "workday";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "В разработке", description: "Переход на предыдущий месяц" })}>
            &lt; Предыдущий
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "В разработке", description: "Переход на следующий месяц" })}>
            Следующий &gt;
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
          <div key={day} className="text-center font-medium py-2">
            {day}
          </div>
        ))}
        
        {daysInCalendar.map((dayInfo, index) => {
          const { date, currentMonth } = dayInfo;
          const dayType = getDayType(date);
          
          let bgColor = "bg-white";
          let textColor = currentMonth ? "text-gray-900" : "text-gray-400";
          
          if (isToday(date)) {
            bgColor = "bg-anvik-primary";
            textColor = "text-white";
          } else if (dayType === "weekend") {
            bgColor = currentMonth ? "bg-gray-100" : "bg-white";
          } else if (dayType === "holiday") {
            bgColor = currentMonth ? "bg-red-100" : "bg-white";
            textColor = currentMonth ? "text-red-600" : "text-red-300";
          }
          
          return (
            <div 
              key={index} 
              className={`aspect-square flex items-center justify-center rounded-md ${bgColor} ${textColor} text-sm cursor-pointer hover:bg-gray-100`}
              onClick={() => toast({ title: "В разработке", description: `Просмотр деталей для ${date.toLocaleDateString()}` })}
            >
              {formatDay(date)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const VacationSchedule = () => {
  const [selectedTab, setSelectedTab] = useState("team");
  const [showRequestForm, setShowRequestForm] = useState(false);
  
  const statusColors = {
    approved: "bg-green-100 text-green-800 border-green-300",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  };
  
  const handleRequestVacation = () => {
    setShowRequestForm(!showRequestForm);
  };
  
  const handleSubmitRequest = () => {
    toast({
      title: "Заявка отправлена",
      description: "Ваша заявка на отпуск была успешно отправлена на рассмотрение",
    });
    setShowRequestForm(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">График отпусков</h2>
        
        <Button onClick={handleRequestVacation}>
          {showRequestForm ? "Отменить" : "Запросить отпуск"}
        </Button>
      </div>
      
      {showRequestForm && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Запрос на отпуск</CardTitle>
            <CardDescription>
              Заполните форму для запроса отпуска
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start-date" className="text-sm font-medium">
                  Дата начала
                </label>
                <input
                  id="start-date"
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="end-date" className="text-sm font-medium">
                  Дата окончания
                </label>
                <input
                  id="end-date"
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Причина (необязательно)
              </label>
              <textarea
                id="reason"
                className="w-full border rounded-md px-3 py-2 h-20 resize-none"
                placeholder="Укажите причину запроса отпуска..."
              />
            </div>
            <Button onClick={handleSubmitRequest} className="w-full">
              Отправить заявку
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="team">Команда</TabsTrigger>
          <TabsTrigger value="personal">Мои отпуска</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team">
          <div className="space-y-4">
            {VACATIONS.map((vacation) => (
              <div 
                key={vacation.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="font-medium">{vacation.employee}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(vacation.startDate).toLocaleDateString('ru-RU')} - {new Date(vacation.endDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <Badge variant="outline" className={statusColors[vacation.status as keyof typeof statusColors]}>
                  {vacation.status === "approved" ? "Утвержден" : 
                    vacation.status === "pending" ? "На рассмотрении" : "Отклонен"}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="personal">
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">У вас нет активных запросов на отпуск</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Используйте кнопку "Запросить отпуск", чтобы создать новую заявку
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Schedule = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">График работы</h1>
      
      <Tabs defaultValue="week">
        <TabsList className="mb-6">
          <TabsTrigger value="week">Неделя</TabsTrigger>
          <TabsTrigger value="month">Месяц</TabsTrigger>
          <TabsTrigger value="vacation">Отпуска</TabsTrigger>
        </TabsList>
        
        <TabsContent value="week">
          <Card>
            <CardHeader>
              <CardTitle>Недельное расписание</CardTitle>
              <CardDescription>
                Просмотр рабочего графика на текущую неделю
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeekScheduleView />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="month">
          <Card>
            <CardHeader>
              <CardTitle>Месячное расписание</CardTitle>
              <CardDescription>
                Просмотр рабочего графика на текущий месяц
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthScheduleView />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="vacation">
          <Card>
            <CardHeader>
              <CardTitle>График отпусков</CardTitle>
              <CardDescription>
                Управление и просмотр отпусков команды
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VacationSchedule />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Schedule;
