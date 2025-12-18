import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const classNames = cn;
