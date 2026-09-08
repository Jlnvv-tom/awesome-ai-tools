import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 合并 Tailwind 类名，后写入的类名覆盖前者 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
