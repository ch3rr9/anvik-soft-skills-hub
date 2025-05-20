import { supabase } from "@/integrations/supabase/client";

/**
 * Создание тестовых заданий
 */
export const createTestData = async (): Promise<void> => {
  const testsData = [
    {
      title: "Тест по основам JavaScript",
      description: "Проверка знаний основ JavaScript: переменные, типы данных, функции, объекты.",
      category: "programming",
      time_limit: 30,
      passing_score: 70,
      created_by: "HR Department",
      available_roles: ["employee", "manager"],
      questions: [
        {
          question: "Что такое замыкание (closure) в JavaScript?",
          type: "multiple",
          options: [
            "Функция, которая может быть вызвана только один раз", 
            "Функция, имеющая доступ к переменным из внешней функции после завершения её выполнения", 
            "Функция без параметров", 
            "Функция, которая всегда возвращает объект"
          ],
          correct: 1
        },
        {
          question: "Какой результат выполнения кода: console.log(typeof null);",
          type: "single",
          options: ["null", "undefined", "object", "string"],
          correct: 2
        }
      ]
    },
    {
      title: "Психологический тест",
      description: "Оценка личностных качеств и стрессоустойчивости.",
      category: "psychology",
      time_limit: 45,
      passing_score: 60,
      created_by: "HR Department",
      available_roles: ["employee", "manager", "hr", "director"],
      questions: [
        {
          question: "Как вы реагируете на неожиданные изменения в проекте?",
          type: "text",
          options: [],
          answer_type: "emotional_stability"
        },
        {
          question: "Оцените ваш уровень стресса на работе по шкале от 1 до 10:",
          type: "scale",
          options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          answer_type: "stress_level"
        }
      ]
    },
    {
      title: "Тест по React",
      description: "Проверка знаний React: компоненты, хуки, жизненный цикл.",
      category: "programming",
      time_limit: 40,
      passing_score: 75,
      created_by: "Development Lead",
      available_roles: ["employee", "manager"],
      questions: [
        {
          question: "Для чего используется хук useEffect?",
          type: "multiple",
          options: [
            "Только для вызова API", 
            "Для выполнения побочных эффектов в функциональных компонентах", 
            "Для создания новых компонентов", 
            "Для оптимизации рендеринга"
          ],
          correct: 1
        },
        {
          question: "Что такое Virtual DOM в React?",
          type: "single",
          options: [
            "Реальный DOM в браузере", 
            "Виртуальное представление DOM в памяти", 
            "Библиотека для работы с DOM", 
            "Метод оптимизации CSS"
          ],
          correct: 1
        }
      ]
    }
  ];

  // Проверяем, есть ли уже тесты в базе данных
  const { data: existingTests } = await supabase
    .from("tests")
    .select("id")
    .limit(1);

  if (!existingTests || existingTests.length === 0) {
    // Если тестов нет, добавляем
    for (const testData of testsData) {
      await supabase.from("tests").insert(testData);
    }
    console.log("Test data created successfully");
  } else {
    console.log("Tests already exist, skipping creation");
  }
};

/**
 * Создание тестовых результатов
 */
export const createTestResults = async (): Promise<void> => {
  // Получаем существующие тесты
  const { data: tests } = await supabase
    .from("tests")
    .select("id, title, questions");

  if (!tests || tests.length === 0) {
    return;
  }

  // Получаем существующих пользователей
  const { data: users } = await supabase
    .from("users")
    .select("id, email, role");

  if (!users || users.length === 0) {
    return;
  }

  // Проверяем, есть ли уже результаты тестов
  const { data: existingResults } = await supabase
    .from("test_results")
    .select("id")
    .limit(1);

  if (!existingResults || existingResults.length === 0) {
    // Создаем тестовые результаты
    for (const user of users) {
      // Каждый пользователь прошел случайные тесты
      for (const test of tests) {
        // 50% шанс, что пользователь прошел тест
        if (Math.random() > 0.5) {
          const passed = Math.random() > 0.3; // 70% шанс сдать тест
          // Исправлено: Проверяем, является ли test.questions массивом
          const questionCount = Array.isArray(test.questions) ? test.questions.length : 0;
          const maxScore = questionCount * 10;
          const score = passed 
            ? Math.floor(maxScore * (0.7 + Math.random() * 0.3))  // От 70% до 100% для сдавших
            : Math.floor(maxScore * (0.3 + Math.random() * 0.4)); // От 30% до 70% для несдавших
          
          // Исправлено: Проверяем, является ли test.questions массивом, прежде чем вызвать map
          const answers = Array.isArray(test.questions) ? test.questions.map((q: any) => {
            return {
              question_id: q.question,
              answer: q.type === "text" ? "Пример ответа пользователя" : 
                      q.type === "scale" ? Math.floor(1 + Math.random() * 10) : 
                      Math.floor(Math.random() * (Array.isArray(q.options) ? q.options.length : 0)),
              correct: Math.random() > 0.3 // 70% правильных ответов
            };
          }) : [];
          
          // Добавляем результаты
          await supabase.from("test_results").insert({
            user_id: user.id.toString(),
            test_id: test.id,
            passed: passed,
            score: score,
            max_score: maxScore,
            answers: answers,
            needs_vacation: test.title.includes("Психологический") && Math.random() > 0.7,
            recommendation: test.title.includes("Психологический") 
              ? "Рекомендуется повышение квалификации в области коммуникации" 
              : null,
            passed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // За последние 30 дней
          });
        }
      }
    }
    console.log("Test results created successfully");
  } else {
    console.log("Test results already exist, skipping creation");
  }
};

/**
 * Инициализация данных чатов
 */
export const createChatData = async (): Promise<void> => {
  // Получаем существующих пользователей
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email");

  if (!users || users.length === 0) {
    return;
  }

  // Проверяем, есть ли уже чаты
  const { data: existingChats } = await supabase
    .from("chats")
    .select("id")
    .limit(1);

  if (!existingChats || existingChats.length === 0) {
    // Создаем групповой чат
    const { data: groupChat } = await supabase
      .from("chats")
      .insert({
        name: "Общий чат",
        type: "group",
        participants: users.map(u => ({ id: u.id.toString(), name: u.name, email: u.email }))
      })
      .select("id")
      .single();
    
    if (groupChat) {
      // Добавляем несколько сообщений в групповой чат
      const messages = [
        {
          chat_id: groupChat.id.toString(),
          sender_id: users[0].id.toString(),
          sender_name: users[0].name,
          content: "Всем привет! Как дела с текущими проектами?",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          chat_id: groupChat.id.toString(),
          sender_id: users[1].id.toString(),
          sender_name: users[1].name,
          content: "Почти закончили интеграцию платежной системы!",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          chat_id: groupChat.id.toString(),
          sender_id: users[2].id.toString(),
          sender_name: users[2].name,
          content: "Отлично! У нас есть задержка с API, но скоро решим.",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      for (const message of messages) {
        await supabase.from("messages").insert(message);
      }
    }
    
    // Создаем несколько личных чатов
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        if (Math.random() > 0.5) { // 50% шанс создать чат между двумя пользователями
          const { data: directChat } = await supabase
            .from("chats")
            .insert({
              name: "",
              type: "direct",
              participants: [
                { id: users[i].id.toString(), name: users[i].name, email: users[i].email },
                { id: users[j].id.toString(), name: users[j].name, email: users[j].email }
              ]
            })
            .select("id")
            .single();
          
          if (directChat) {
            // Добавляем несколько сообщений в личный чат
            const messages = [
              {
                chat_id: directChat.id.toString(),
                sender_id: users[i].id.toString(),
                sender_name: users[i].name,
                content: `Привет, ${users[j].name}! Как дела?`,
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                chat_id: directChat.id.toString(),
                sender_id: users[j].id.toString(),
                sender_name: users[j].name,
                content: "Привет! Всё хорошо, работаю над новым проектом.",
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                chat_id: directChat.id.toString(),
                sender_id: users[i].id.toString(),
                sender_name: users[i].name,
                content: "Отлично! Нужна помощь с чем-нибудь?",
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
              }
            ];
            
            for (const message of messages) {
              await supabase.from("messages").insert(message);
            }
          }
        }
      }
    }
    
    console.log("Chat data created successfully");
  } else {
    console.log("Chats already exist, skipping creation");
  }
};

/**
 * Инициализация всех данных
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log("Initializing database with test data...");
    await createTestData();
    await createTestResults();
    await createChatData();
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
