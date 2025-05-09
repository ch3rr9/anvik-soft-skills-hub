import { Test } from "@/types/test-types";

export const PSYCH_TEST: Test = {
  id: 999, // Use a unique ID that won't conflict with DB tests
  title: "Психологический тест на выгорание",
  description: "Тест для оценки вашего психологического состояния и уровня стресса",
  category: "Психология",
  questions: [
    {
      id: 1,
      text: "Как часто вы чувствуете усталость в конце рабочего дня?",
      options: [
        "Почти никогда",
        "Иногда",
        "Часто",
        "Почти всегда"
      ],
      correctAnswer: 0 // В данном случае это базовый ответ
    },
    {
      id: 2,
      text: "Как вы оцениваете качество своего сна в последнее время?",
      options: [
        "Отличное",
        "Хорошее",
        "Удовлетворительное",
        "Плохое"
      ],
      correctAnswer: 0
    },
    {
      id: 3,
      text: "Насколько легко вам сконцентрироваться на работе?",
      options: [
        "Очень легко",
        "Обычно легко",
        "Иногда сложно",
        "Часто сложно"
      ],
      correctAnswer: 0
    },
    {
      id: 4,
      text: "Как часто вы чувствуете раздражительность на работе?",
      options: [
        "Редко",
        "Иногда",
        "Часто",
        "Очень часто"
      ],
      correctAnswer: 0
    },
    {
      id: 5,
      text: "Как вы оцениваете свой уровень мотивации?",
      options: [
        "Высокий",
        "Средний",
        "Низкий",
        "Очень низкий"
      ],
      correctAnswer: 0
    }
  ],
  timeLimit: 10,
  passingScore: 70,
  availableRoles: ["all"],
  createdBy: "system",
  createdAt: "2025-01-01T00:00:00Z"
};

export const analyzePsychTestResults = (answers: number[]): {
  needsVacation: boolean;
  recommendation: string;
} => {
  // Подсчет "тревожных" ответов (2 и выше по индексу)
  const stressLevel = answers.filter(answer => answer >= 2).length;
  
  if (stressLevel >= 4) {
    return {
      needsVacation: true,
      recommendation: "Рекомендуется отпуск в ближайшее время. Наблюдаются признаки профессионального выгорания."
    };
  } else if (stressLevel >= 2) {
    return {
      needsVacation: true,
      recommendation: "Рекомендуется планирование отпуска в текущем квартале. Наблюдаются признаки накопленной усталости."
    };
  }
  
  return {
    needsVacation: false,
    recommendation: "Текущее состояние стабильное. Плановый отпуск можно планировать в обычном порядке."
  };
};
