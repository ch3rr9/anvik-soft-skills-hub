
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет классы Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Анимация появления элемента
 */
export const fadeInAnimation = "animate-[fadeIn_0.5s_ease-in-out]";

/**
 * Анимация исчезновения элемента
 */
export const fadeOutAnimation = "animate-[fadeOut_0.5s_ease-in-out]";

/**
 * Анимация увеличения элемента
 */
export const scaleInAnimation = "animate-[scaleIn_0.3s_ease-in-out]";

/**
 * Анимация слайда вниз
 */
export const slideDownAnimation = "animate-[slideDown_0.3s_ease-in-out]";

/**
 * Анимация слайда вверх
 */
export const slideUpAnimation = "animate-[slideUp_0.3s_ease-in-out]";

/**
 * Анимация слайда справа
 */
export const slideRightAnimation = "animate-[slideRight_0.3s_ease-in-out]";

/**
 * Анимация слайда слева
 */
export const slideLeftAnimation = "animate-[slideLeft_0.3s_ease-in-out]";

/**
 * Анимация "дыхания" (плавное изменение масштаба)
 */
export const pulseAnimation = "animate-pulse";

/**
 * Анимация вращения
 */
export const spinAnimation = "animate-spin";

/**
 * Анимация покачивания
 */
export const bounceAnimation = "animate-bounce";

/**
 * Анимация для страницы (комбинация нескольких анимаций)
 */
export const pageTransitionAnimation = "animate-[fadeIn_0.5s_ease-in-out] motion-reduce:animate-none";

/**
 * Анимация для карточки
 */
export const cardAnimation = "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg";

/**
 * Анимация для кнопки
 */
export const buttonAnimation = "transition-all duration-200 hover:scale-[1.05] active:scale-[0.98]";

/**
 * Анимация для иконок
 */
export const iconAnimation = "transition-all duration-200 hover:scale-[1.15] hover:rotate-[5deg]";
