
import { Test } from "@/types/test-types";

export const COMPUTER_TEST: Test = {
  id: 999, // Временный ID для клиентской части
  title: "Тест на знание ПК",
  description: "Базовые знания работы с компьютером: Windows, файлы, интернет, безопасность",
  category: "computer_literacy",
  timeLimit: 20,
  passingScore: 70,
  availableRoles: ["employee", "manager", "hr"],
  createdBy: "HR Department",
  createdAt: new Date().toISOString(),
  questions: [
    {
      id: 1,
      text: "Какое сочетание клавиш используется для копирования файла?",
      options: ["Ctrl+C", "Ctrl+X", "Ctrl+V", "Ctrl+Z"],
      correctAnswer: 0
    },
    {
      id: 2,
      text: "Где находится корзина в Windows?",
      options: ["В папке Документы", "На рабочем столе", "В меню Пуск", "В панели задач"],
      correctAnswer: 1
    },
    {
      id: 3,
      text: "Какое расширение имеют документы Microsoft Word?",
      options: [".txt", ".pdf", ".docx", ".xlsx"],
      correctAnswer: 2
    },
    {
      id: 4,
      text: "Что такое браузер?",
      options: ["Программа для просмотра видео", "Программа для интернета", "Антивирус", "Текстовый редактор"],
      correctAnswer: 1
    },
    {
      id: 5,
      text: "Как называется главная страница сайта?",
      options: ["Домашняя страница", "Главное меню", "Стартовое окно", "Основной файл"],
      correctAnswer: 0
    },
    {
      id: 6,
      text: "Какую клавишу нужно нажать для выделения всего текста?",
      options: ["Ctrl+S", "Ctrl+A", "Ctrl+D", "Ctrl+F"],
      correctAnswer: 1
    },
    {
      id: 7,
      text: "Что нужно сделать с подозрительными письмами?",
      options: ["Открыть все вложения", "Переслать друзьям", "Удалить не открывая", "Сохранить на компьютер"],
      correctAnswer: 2
    },
    {
      id: 8,
      text: "Как создать новую папку в Windows?",
      options: ["Клик правой кнопкой → Создать → Папку", "Двойной клик мышью", "Нажать Enter", "Перетащить файл"],
      correctAnswer: 0
    },
    {
      id: 9,
      text: "Для чего используется клавиша F5?",
      options: ["Сохранение", "Печать", "Обновление страницы", "Выход"],
      correctAnswer: 2
    },
    {
      id: 10,
      text: "Что означает расширение .exe?",
      options: ["Текстовый файл", "Исполняемый файл программы", "Изображение", "Музыкальный файл"],
      correctAnswer: 1
    }
  ]
};
