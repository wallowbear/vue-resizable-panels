export default function debounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  let timeoutId: number | undefined;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  }) as T;
} 