import { ChatRoom, Message } from "@/types/chat-types";

// Мок пользователей
export const MOCK_USERS = [
  { id: "1", name: "Иван Директоров", role: "director" },
  { id: "2", name: "Мария Кадрова", role: "manager" },
  { id: "3", name: "Алексей Программистов", role: "employee" },
  { id: "4", name: "Елена Тестова", role: "employee" },
  { id: "5", name: "Петр Интеграторов", role: "employee" },
];

// Мок чатов
export const MOCK_CHATS: ChatRoom[] = [
  {
    id: 1,
    name: "Общий чат",
    type: "group",
    participants: ["1", "2", "3", "4", "5"],
    lastMessage: null
  },
  {
    id: 2,
    name: "Отдел разработки",
    type: "group",
    participants: ["1", "3", "5"],
    lastMessage: null
  },
  {
    id: 3,
    name: "Иван Директоров",
    type: "direct",
    participants: ["3", "1"],
    lastMessage: null
  },
  {
    id: 4,
    name: "Мария Кадрова",
    type: "direct",
    participants: ["3", "2"],
    lastMessage: null
  },
];

// Мок сообщений для чатов
export const MOCK_MESSAGES: Record<string, Message[]> = {
  "chat1": [
    {
      id: 1,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Добрый день всем! Напоминаю, что завтра в 10:00 состоится общее собрание.",
      timestamp: "2025-04-27T09:30:00Z",
      read: true,
      chatId: "chat1"
    },
    {
      id: 2,
      senderId: "2",
      senderName: "Мария Кадрова",
      content: "Добрый день! В повестке дня обсуждение новых тестов навыков для сотрудников.",
      timestamp: "2025-04-27T09:35:00Z",
      read: true,
      chatId: "chat1"
    },
    {
      id: 3,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Спасибо за информацию. Буду готов к обсуждению.",
      timestamp: "2025-04-27T09:40:00Z",
      read: true,
      chatId: "chat1"
    },
    {
      id: 4,
      senderId: "5",
      senderName: "Петр Интеграторов",
      content: "У меня есть предложения по новым тестам для разработчиков 1С. Подготовлю материалы к собранию.",
      timestamp: "2025-04-27T09:45:00Z",
      read: false,
      chatId: "chat1"
    },
    {
      id: 5,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Отлично! Ждем ваши предложения, Петр.",
      timestamp: "2025-04-27T09:50:00Z",
      read: false,
      chatId: "chat1"
    },
    {
      id: 6,
      senderId: "4",
      senderName: "Елена Тестова",
      content: "Я тоже подготовлю материалы по тестированию UI компонент.",
      timestamp: "2025-04-27T09:55:00Z",
      read: false,
      chatId: "chat1"
    },
  ],
  "chat2": [
    {
      id: 1,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Коллеги, как продвигается работа над новым модулем?",
      timestamp: "2025-04-26T15:30:00Z",
      read: true,
      chatId: "chat2"
    },
    {
      id: 2,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Модуль почти готов, сегодня закончу основную логику.",
      timestamp: "2025-04-26T15:35:00Z",
      read: true,
      chatId: "chat2"
    },
    {
      id: 3,
      senderId: "5",
      senderName: "Петр Интеграторов",
      content: "Я завершил интеграцию с внешними системами. Осталось провести тестирование.",
      timestamp: "2025-04-26T15:40:00Z",
      read: true,
      chatId: "chat2"
    },
  ],
  "chat3": [
    {
      id: 1,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Алексей, как ваши успехи в изучении новых функций 1С:ERP?",
      timestamp: "2025-04-26T11:30:00Z",
      read: true,
      chatId: "chat3"
    },
    {
      id: 2,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Добрый день, Иван! Изучил документацию, сейчас практикуюсь на тестовых данных.",
      timestamp: "2025-04-26T11:35:00Z",
      read: true,
      chatId: "chat3"
    },
    {
      id: 3,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Отлично! Не забудьте пройти тест по 1С:ERP, который появится на следующей неделе.",
      timestamp: "2025-04-26T11:40:00Z",
      read: false,
      chatId: "chat3"
    },
  ],
  "chat4": [
    {
      id: 1,
      senderId: "2",
      senderName: "Мария Кадрова",
      content: "Здравствуйте, Алексей! Напоминаю, что в пятницу у вас плановая аттестация.",
      timestamp: "2025-04-25T14:30:00Z",
      read: true,
      chatId: "chat4"
    },
    {
      id: 2,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Добрый день, Мария! Спасибо за напоминание, буду готов.",
      timestamp: "2025-04-25T14:35:00Z",
      read: true,
      chatId: "chat4"
    },
    {
      id: 3,
      senderId: "2",
      senderName: "Мария Кадрова",
      content: "Рекомендую заранее пройти пробный тест в системе.",
      timestamp: "2025-04-25T14:40:00Z",
      read: true,
      chatId: "chat4"
    },
  ],
};
