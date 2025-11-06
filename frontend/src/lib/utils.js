import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return 'Never';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateAccuracy(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function getMasteryLabel(mastery) {
  if (mastery >= 0.8) return { label: 'Master', color: 'text-green-400' };
  if (mastery >= 0.6) return { label: 'Proficient', color: 'text-blue-400' };
  if (mastery >= 0.4) return { label: 'Learning', color: 'text-yellow-400' };
  return { label: 'Beginner', color: 'text-red-400' };
}

export function getMasteryColor(mastery) {
  if (mastery >= 0.8) return 'from-green-500 to-emerald-600';
  if (mastery >= 0.6) return 'from-blue-500 to-cyan-600';
  if (mastery >= 0.4) return 'from-yellow-500 to-orange-600';
  return 'from-red-500 to-pink-600';
}

export function truncate(str, length = 50) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
