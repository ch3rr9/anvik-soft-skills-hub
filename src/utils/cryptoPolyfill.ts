
// Полифилл для crypto.getRandomValues в средах, где это API недоступно
if (typeof window !== 'undefined' && window.crypto === undefined) {
  // @ts-ignore
  window.crypto = {};
}

if (typeof window !== 'undefined' && window.crypto.getRandomValues === undefined) {
  // Простая реализация, если стандартная недоступна
  // @ts-ignore
  window.crypto.getRandomValues = function (array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

export {}; // Нужно для TypeScript, чтобы файл был модулем
