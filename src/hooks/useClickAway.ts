import React, { RefObject, useEffect } from 'react';

export function useClickAway(
  refs: RefObject<HTMLElement>[],
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Check if click was outside all refs
      const isOutside = refs.every(ref => {
        return !ref.current?.contains(target);
      });

      if (isOutside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
}