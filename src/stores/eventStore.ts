import { writable } from 'svelte/store';

// Writable store for events
export const eventStore = writable<{ type: string; detail: any } | null>(null);

// Function to start the interval
let intervalId: NodeJS.Timeout | null = null;


function startEventInterval(eventName: string) {
  if (intervalId) return; // Avoid multiple intervals
  
  intervalId = setInterval(() => {
    eventStore.set({ type: eventName, detail: { } });
    // Reset the store to avoid duplicate handling
    setTimeout(() => eventStore.set(null), 0);
  }, 5000);
}

// Function to stop the interval
function stopEventInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export {
  startEventInterval,
  stopEventInterval
}