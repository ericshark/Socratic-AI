import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function average(numbers: number[]) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export function variance(numbers: number[]) {
  if (numbers.length <= 1) {
    return 0;
  }
  const avg = average(numbers);
  return average(numbers.map((value) => (value - avg) ** 2));
}
