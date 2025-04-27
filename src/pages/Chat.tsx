
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Search, Send, User, Users } from "lucide-react";

// Определение типов сообщений и чатов
interface Message {
  id: number;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: "direct" | "group";
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

// Мок пользователей
const MOCK_USERS = [
  { id: "1", name: "Иван Директоров", role: "director" },
  { id: "2", name: "Мария Кадрова", role: "manager" },
  { id: "3", name: "Алексей Программистов", role: "employee" },
  { id: "4", name: "Елена Тестова", role: "employee" },
  { id: "5", name: "Петр Интеграторов", role: "employee" },
];

// Мок чатов
const MOCK_CHATS: ChatRoom[] = [
  {
    id: "chat1",
    name: "Общий чат",
    type: "group",
    participants: ["1", "2", "3", "4", "5"],
    unreadCount: 3,
  },
  {
    id: "chat2",
    name: "Отдел разработки",
    type: "group",
    participants: ["1", "3", "5"],
    unreadCount: 0,
  },
  {
    id: "chat3",
    name: "Иван Директоров",
    type: "direct",
    participants: ["3", "1"],
    unreadCount: 1,
  },
  {
    id: "chat4",
    name: "Мария Кадрова",
    type: "direct",
    participants: ["3", "2"],
    unreadCount: 0,
  },
];

// Мок сообщений для общего чата
const MOCK_MESSAGES: Record<string, Message[]> = {
  "chat1": [
    {
      id: 1,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Добрый день всем! Напоминаю, что завтра в 10:00 состоится общее собрание.",
      timestamp: "2025-04-27T09:30:00Z",
      read: true,
    },
    {
      id: 2,
      senderId: "2",
      senderName: "Мария Кадрова",
      content: "Добрый день! В повестке дня обсуждение новых тестов навыков для сотрудников.",
      timestamp: "2025-04-27T09:35:00Z",
      read: true,
    },
    {
      id: 3,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Спасибо за информацию. Буду готов к обсуждению.",
      timestamp: "2025-04-27T09:40:00Z",
      read: true,
    },
    {
      id: 4,
      senderId: "5",
      senderName: "Петр Интеграторов",
      content: "У меня есть предложения по новым тестам для разработчиков 1С. Подготовлю материалы к собранию.",
      timestamp: "2025-04-27T09:45:00Z",
      read: false,
    },
    {
      id: 5,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Отлично! Ждем ваши предложения, Петр.",
      timestamp: "2025-04-27T09:50:00Z",
      read: false,
    },
    {
      id: 6,
      senderId: "4",
      senderName: "Елена Тестова",
      content: "Я тоже подготовлю материалы по тестированию UI компонент.",
      timestamp: "2025-04-27T09:55:00Z",
      read: false,
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
    },
    {
      id: 2,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Модуль почти готов, сегодня закончу основную логику.",
      timestamp: "2025-04-26T15:35:00Z",
      read: true,
    },
    {
      id: 3,
      senderId: "5",
      senderName: "Петр Интеграторов",
      content: "Я завершил интеграцию с внешними системами. Осталось провести тестирование.",
      timestamp: "2025-04-26T15:40:00Z",
      read: true,
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
    },
    {
      id: 2,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Добрый день, Иван! Изучил документацию, сейчас практикуюсь на тестовых данных.",
      timestamp: "2025-04-26T11:35:00Z",
      read: true,
    },
    {
      id: 3,
      senderId: "1",
      senderName: "Иван Директоров",
      content: "Отлично! Не забудьте пройти тест по 1С:ERP, который появится на следующей неделе.",
      timestamp: "2025-04-26T11:40:00Z",
      read: false,
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
    },
    {
      id: 2,
      senderId: "3",
      senderName: "Алексей Программистов",
      content: "Добрый день, Мария! Спасибо за напоминание, буду готов.",
      timestamp: "2025-04-25T14:35:00Z",
      read: true,
    },
    {
      id: 3,
      senderId: "2",
      senderName: "Мария Кадрова",
      content: "Рекомендую заранее пройти пробный тест в системе.",
      timestamp: "2025-04-25T14:40:00Z",
      read: true,
    },
  ],
};

// Компонент чата
const Chat = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(MOCK_CHATS);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Загрузка сообщений при выборе чата
  useEffect(() => {
    if (selectedChat) {
      const chatMessages = MOCK_MESSAGES[selectedChat.id] || [];
      setMessages(chatMessages);
      
      // Обновляем счетчик непрочитанных
      setChatRooms(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
        )
      );
      
      // Прокрутка к последнему сообщению
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedChat]);
  
  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Отправка сообщения
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedChat || !user) return;
    
    // Создаем новое сообщение
    const newMessage: Message = {
      id: messages.length + 1,
      senderId: user.id,
      senderName: user.name,
      content: messageInput,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    // Добавляем сообщение в текущий чат
    setMessages([...messages, newMessage]);
    
    // Очищаем поле ввода
    setMessageInput("");
    
    // Прокручиваем к новому сообщению
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };
  
  // Фильтрация чатов по поисковому запросу
  const filteredChatRooms = chatRooms.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Форматирование времени сообщения
  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Форматирование даты сообщения
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Сегодня";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера";
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
    }
  };
  
  // Группировка сообщений по дате
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    
    messages.forEach(message => {
      const messageDate = formatMessageDate(message.timestamp);
      const existingGroup = groups.find(group => group.date === messageDate);
      
      if (existingGroup) {
        existingGroup.messages.push(message);
      } else {
        groups.push({ date: messageDate, messages: [message] });
      }
    });
    
    return groups;
  };
  
  // Группированные сообщения
  const groupedMessages = groupMessagesByDate(messages);
  
  // Создание нового чата
  const createNewChat = () => {
    toast({
      title: "В разработке",
      description: "Функционал создания новых чатов находится в разработке",
    });
  };
  
  return (
    <div className="flex h-[calc(100vh-12rem)]">
      {/* Левая панель с чатами */}
      <div className="w-full max-w-xs border-r">
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Чаты</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={createNewChat}>
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Создать новый чат</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск чатов..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-1 pr-4">
              {filteredChatRooms.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer ${
                    selectedChat?.id === chat.id
                      ? "bg-anvik-primary text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="relative">
                    <Avatar className={`h-10 w-10 ${selectedChat?.id === chat.id ? "border-2 border-white" : ""}`}>
                      <AvatarFallback className={`${
                        selectedChat?.id === chat.id ? "bg-white text-anvik-primary" : "bg-anvik-primary/10 text-anvik-primary"
                      }`}>
                        {chat.type === "direct" ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    {chat.unreadCount > 0 && (
                      <Badge 
                        className={`absolute -top-1 -right-1 ${
                          selectedChat?.id === chat.id ? "bg-white text-anvik-primary" : "bg-anvik-primary text-white"
                        }`}
                        variant="outline"
                      >
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      selectedChat?.id === chat.id ? "text-white" : ""
                    }`}>
                      {chat.name}
                    </p>
                    {chat.lastMessage && (
                      <p className={`text-xs truncate ${
                        selectedChat?.id === chat.id ? "text-white/80" : "text-muted-foreground"
                      }`}>
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Правая панель с сообщениями */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Заголовок чата */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-anvik-primary/10 text-anvik-primary">
                    {selectedChat.type === "direct" ? <User className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.type === "group"
                      ? `${selectedChat.participants.length} участников`
                      : "Личное сообщение"}
                  </p>
                </div>
              </div>
              
              <div>
                <Button variant="ghost" size="icon" onClick={() => toast({ title: "В разработке", description: "Настройки чата в разработке" })}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </Button>
              </div>
            </div>
            
            {/* Сообщения */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {groupedMessages.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-background">
                        {group.date}
                      </Badge>
                    </div>
                    
                    {group.messages.map((message) => {
                      const isMine = message.senderId === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] ${isMine ? "order-1" : "order-2"}`}>
                            {!isMine && (
                              <p className="text-xs text-muted-foreground mb-1 ml-1">
                                {message.senderName}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isMine
                                  ? "bg-anvik-primary text-white rounded-tr-none"
                                  : "bg-muted rounded-tl-none"
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`text-xs text-right mt-1 ${
                                isMine ? "text-white/80" : "text-muted-foreground"
                              }`}>
                                {formatMessageTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                          
                          {!isMine && (
                            <Avatar className="h-8 w-8 mr-2 order-1">
                              <AvatarFallback className="bg-anvik-primary/10 text-anvik-primary">
                                {message.senderName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Форма отправки сообщения */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex space-x-2"
              >
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">Выберите чат</h3>
            <p className="text-muted-foreground">
              Выберите существующий чат или создайте новый, чтобы начать общение
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
