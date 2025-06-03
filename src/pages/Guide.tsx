
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, MessageSquare, ClipboardCheck, Shield, User } from "lucide-react";
import { useSimpleAuth } from "@/contexts/SimpleAuthContext";

const Guide = () => {
  const { user } = useSimpleAuth();

  const roleDescriptions = {
    director: {
      title: "Директор",
      color: "bg-red-500",
      icon: Shield,
      permissions: [
        "Полный доступ ко всем функциям системы",
        "Просмотр результатов тестов всех сотрудников",
        "Управление пользователями и ролями",
        "Создание и редактирование тестов",
        "Доступ к аналитике и отчетам"
      ]
    },
    hr: {
      title: "HR-специалист",
      color: "bg-blue-500",
      icon: Users,
      permissions: [
        "Управление сотрудниками",
        "Просмотр результатов тестов",
        "Создание и назначение тестов",
        "Работа с графиком работы",
        "Доступ к HR-аналитике"
      ]
    },
    manager: {
      title: "Менеджер",
      color: "bg-green-500", 
      icon: User,
      permissions: [
        "Просмотр результатов тестов своей команды",
        "Создание тестов для подчиненных",
        "Участие во всех чатах",
        "Просмотр графика работы команды",
        "Базовая аналитика по команде"
      ]
    },
    employee: {
      title: "Сотрудник",
      color: "bg-gray-500",
      icon: User,
      permissions: [
        "Прохождение назначенных тестов",
        "Просмотр своих результатов",
        "Участие в чатах",
        "Просмотр своего графика работы",
        "Доступ к личному кабинету"
      ]
    }
  };

  const getCurrentUserRole = () => {
    if (!user?.role) return null;
    return roleDescriptions[user.role as keyof typeof roleDescriptions];
  };

  const currentRole = getCurrentUserRole();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Руководство пользователя</h1>
        <p className="text-muted-foreground">
          Добро пожаловать в систему Skills Hub! Здесь вы найдете инструкции по использованию всех функций системы.
        </p>
      </div>

      {/* Информация о текущей роли */}
      {currentRole && (
        <Card className="mb-8 border-l-4" style={{ borderLeftColor: currentRole.color.replace('bg-', '#') }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <currentRole.icon className="h-5 w-5" />
              <span>Ваша роль: {currentRole.title}</span>
            </CardTitle>
            <CardDescription>
              Ваши права доступа в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentRole.permissions.map((permission, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-anvik-primary rounded-full"></div>
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Роли в системе */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Роли в системе</span>
          </CardTitle>
          <CardDescription>
            Описание всех ролей и их полномочий
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(roleDescriptions).map(([key, role]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className={`${role.color} text-white`}>
                  {role.title}
                </Badge>
              </div>
              <ul className="ml-4 space-y-1 text-sm">
                {role.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
              {key !== 'employee' && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Инструкции по чатам */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Работа с чатами</span>
          </CardTitle>
          <CardDescription>
            Как использовать систему чатов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Общий чат</h4>
            <p className="text-sm text-muted-foreground">
              Все сотрудники автоматически добавляются в "Общий чат" для общения по рабочим вопросам.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Создание новых чатов</h4>
            <p className="text-sm text-muted-foreground">
              Нажмите на иконку "+" в разделе чатов, выберите участников и создайте групповой или личный чат.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Отправка сообщений</h4>
            <p className="text-sm text-muted-foreground">
              Выберите чат, введите сообщение в поле внизу и нажмите Enter или кнопку отправки.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Инструкции по тестам */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardCheck className="h-5 w-5" />
            <span>Прохождение тестов</span>
          </CardTitle>
          <CardDescription>
            Как проходить тесты и просматривать результаты
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Доступные тесты</h4>
            <p className="text-sm text-muted-foreground">
              В разделе "Тесты" отображаются все доступные вам тесты. Зеленые - пройденные, серые - непройденные.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Прохождение теста</h4>
            <p className="text-sm text-muted-foreground">
              Нажмите "Начать тест", внимательно читайте вопросы и выбирайте ответы. Время ограничено!
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Результаты</h4>
            <p className="text-sm text-muted-foreground">
              После завершения теста вы увидите результат. Руководители могут просматривать результаты своих подчиненных.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Часто задаваемые вопросы</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Как изменить свой профиль?</h4>
            <p className="text-sm text-muted-foreground">
              Перейдите в "Личный кабинет" через навигационное меню или нажав на свой аватар.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Что делать, если забыл пароль?</h4>
            <p className="text-sm text-muted-foreground">
              Обратитесь к администратору системы или HR-специалисту для сброса пароля.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Как просмотреть график работы?</h4>
            <p className="text-sm text-muted-foreground">
              Откройте раздел "График работы" в главном меню для просмотра расписания смен.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Не работает отправка сообщений в чате</h4>
            <p className="text-sm text-muted-foreground">
              Проверьте подключение к интернету и попробуйте обновить страницу. Если проблема не решается, обратитесь к технической поддержке.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Guide;
