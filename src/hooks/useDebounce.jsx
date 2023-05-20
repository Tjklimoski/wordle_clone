import { useRef } from 'react'

export default function useDebounce() {

  const timeout = useRef(null);

  function debounce(cb, delay = 225) {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      cb?.();
    }, delay);
  }

  return debounce;
}
