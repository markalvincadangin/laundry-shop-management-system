import { useState, useEffect } from "react";

/**
 * useDebounce: Custom hook for debouncing a value.
 * Implements HCI principle for reducing interaction cost and preventing system lag
 * by delaying expensive operations (like API calls) until the user finishes typing.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
