import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, CheckCircle, Clock } from "lucide-react";

// Мок данных аналитики
const analytics = {
  testsCompleted: 2,
  testsAvailable: 3,
  averageScore: 75,
  skillsProgress: [{
    name: "1С:Предприятие 8.3",
    progress: 85
  }, {
    name: "1С:ERP",
    progress: 60
  }, {
    name: "SQL",
    progress: 65
  }],
  upcomingEvents: [{
    id: 1,
    title: "Общее собрание",
    date: "28 апреля, 10:00",
    type: "meeting"
  }, {
    id: 2,
    title: "Тест по 1С:ERP",
    date: "30 апреля, 14:00",
    type: "test"
  }, {
    id: 3,
    title: "Оценка квартальных навыков",
    date: "5 мая, 11:00",
    type: "assessment"
  }],
  recentMessages: [{
    id: 1,
    sender: "Иван Директоров",
    content: "Добрый день всем! Напоминаю, что завтра в 10:00 состоится общее собрание.",
    time: "09:30"
  }, {
    id: 2,
    sender: "Мария Кадрова",
    content: "Добрый день! В повестке дня обсуждение новых тестов навыков для сотрудников.",
    time: "09:35"
  }]
};

// Компонент приветствия
const Welcome = () => {
  const {
    user
  } = useAuth();

  // Определение приветствия в зависимости от времени суток
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Доброе утро";
    } else if (hour >= 12 && hour < 18) {
      return "Добрый день";
    } else {
      return "Добрый вечер";
    }
  };
  return <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">
        {getGreeting()}, {user?.name.split(' ')[0]}!
      </h1>
      <p className="text-muted-foreground">
        Добро пожаловать в Skills Hub Анвик-Софт. Вот ваша персональная панель мониторинга.
      </p>
    </div>;
};

// Виджет прогресса тестов
const TestProgressWidget = () => {
  return <Card>
      <CardHeader className="pb-2">
        <CardTitle>Прогресс тестирования</CardTitle>
        <CardDescription>
          Ваши результаты и доступные тесты
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-2xl font-bold">{analytics.testsCompleted}/{analytics.testsAvailable}</p>
            <p className="text-sm text-muted-foreground">тестов пройдено</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{analytics.averageScore}%</p>
            <p className="text-sm text-muted-foreground">средний балл</p>
          </div>
          <div>
            <Button asChild>
              <Link to="/tests">Пройти тесты</Link>
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {analytics.skillsProgress.map(skill => <div key={skill.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{skill.name}</span>
                <span>{skill.progress}%</span>
              </div>
              <Progress value={skill.progress} className="h-2" />
            </div>)}
        </div>
      </CardContent>
    </Card>;
};

// Виджет предстоящих событий
const UpcomingEventsWidget = () => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "test":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "assessment":
        return <ClipboardCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };
  const getEventColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "test":
        return "bg-green-100 text-green-800 border-green-300";
      case "assessment":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  return <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Предстоящие события
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analytics.upcomingEvents.map(event => <div key={event.id} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${event.type === "meeting" ? "bg-blue-100" : event.type === "test" ? "bg-green-100" : "bg-purple-100"}`}>
                  {event.type === "meeting" ? <Users className="h-4 w-4 text-blue-500" /> : event.type === "test" ? <CheckCircle className="h-4 w-4 text-green-500" /> : <ClipboardCheck className="h-4 w-4 text-purple-500" />}
                </div>
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {event.date}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={getEventColor(event.type)}>
                {event.type === "meeting" ? "Собрание" : event.type === "test" ? "Тест" : "Оценка"}
              </Badge>
            </div>)}
        </div>
        
        <div className="mt-4">
          <Button variant="outline" asChild className="w-full">
            <Link to="/schedule">Просмотр расписания</Link>
          </Button>
        </div>
      </CardContent>
    </Card>;
};

// Виджет последних сообщений
const RecentMessagesWidget = () => {
  return <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Последние сообщения
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analytics.recentMessages.map(message => <div key={message.id} className="p-3 border rounded-md">
              <div className="flex justify-between items-start">
                <p className="font-medium">{message.sender}</p>
                <span className="text-xs text-muted-foreground">{message.time}</span>
              </div>
              <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                {message.content}
              </p>
            </div>)}
        </div>
        
        <div className="mt-4">
          <Button variant="outline" asChild className="w-full">
            <Link to="/chat">Открыть чат</Link>
          </Button>
        </div>
      </CardContent>
    </Card>;
};

// Виджет подсказок для менеджеров
const ManagerTipsWidget = () => {
  const {
    hasPermission
  } = useAuth();

  // Если пользователь не менеджер или директор, не показываем виджет
  if (!hasPermission(["manager", "director"])) {
    return null;
  }
  return <Card className="bg-anvik-primary text-white">
      <CardHeader className="pb-2">
        <CardTitle>Панель управления</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Оценка навыков команды</p>
              <p className="text-sm opacity-80">3 сотрудника ожидают тестирования</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast({
            title: "В разработке",
            description: "Функционал управления тестами в разработке"
          })} className="text-gray-50">
              Управление
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Отчеты по прогрессу</p>
              <p className="text-sm opacity-80">Просмотр статистики за апрель</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast({
            title: "В разработке",
            description: "Формирование отчетов в разработке"
          })} className="text-slate-50">
              Отчеты
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Управление персоналом</p>
              <p className="text-sm opacity-80">Настройка прав доступа</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => toast({
            title: "В разработке",
            description: "Панель управления персоналом в разработке"
          })} className="text-slate-50">
              Настройки
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
};

// Импорт дополнительных компонентов для менеджерских функций
const {
  Users,
  ClipboardCheck
} = {
  Users: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>,
  ClipboardCheck: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
};

// Главная страница
const Home = () => {
  return <div>
      <Welcome />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TestProgressWidget />
        <UpcomingEventsWidget />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <RecentMessagesWidget />
        <ManagerTipsWidget />
      </div>
    </div>;
};
export default Home;