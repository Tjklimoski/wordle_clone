import { useCallback, useState } from "react";

export default function useStopProp(eventTypes) {
  //eventTypes is an array of strings

  const [events] = useState(eventTypes);

  function stopProp(e) {
    e.stopPropagation();
  }

  const stopUserInteraction = useCallback(() => {
    events.forEach((event) => {
      document.addEventListener(event, stopProp, { capture: true });
    });
  }, [events]);

  const restoreUserInteraction = useCallback(() => {
    events.forEach((event) => {
      document.removeEventListener(event, stopProp, { capture: true });
    });
  }, [events]);

  return [stopUserInteraction, restoreUserInteraction];
}
