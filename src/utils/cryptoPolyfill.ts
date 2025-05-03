
// Полифилл для crypto.getRandomValues в средах, где это API недоступно
if (typeof window !== 'undefined' && window.crypto === undefined) {
  // @ts-ignore
  window.crypto = {};
}

if (typeof window !== 'undefined' && window.crypto.getRandomValues === undefined) {
  // Простая реализация, если стандартная недоступна
  // @ts-ignore
  window.crypto.getRandomValues = function <T extends ArrayBufferView | null>(array: T): T {
    if (array === null) return array;
    
    // Проверяем, есть ли у массива свойство length и byteLength
    const view = array as unknown as {
      length?: number;
      byteLength?: number;
    };
    
    const length = view.length || (view.byteLength ? view.byteLength / Uint8Array.BYTES_PER_ELEMENT : 0);
    
    for (let i = 0; i < length; i++) {
      // @ts-ignore - Обходим проверку типов для записи в произвольный массив
      array[i] = Math.floor(Math.random() * 256);
    }
    
    return array;
  };
}

export {}; // Нужно для TypeScript, чтобы файл был модулем
