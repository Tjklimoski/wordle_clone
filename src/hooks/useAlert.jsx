import { useState } from 'react';
import { nanoid } from "nanoid";

export default function useAlert() {

  const [alerts, setAlerts] = useState([]);

  function sendAlert(message, duration = 1500) {
    const alert = {id: nanoid(), message};
    setAlerts((currentAlerts) => [alert, ...currentAlerts]);
    //remove the alert from alerts state after specified time
    if (duration == null) return;
    setTimeout(() => {
      //remove the oldest alert
      setAlerts((currentAlerts) => [...currentAlerts.slice(0, -1)]);
    }, duration);
  }

  return [alerts, sendAlert];

}
