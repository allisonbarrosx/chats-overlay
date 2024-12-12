import { writable } from "svelte/store";

export interface SevenTVEmotes {
  channel: string | null;
  emotes: Record<string, string> | null;
}

const initialValue: SevenTVEmotes = { channel: null, emotes: null };

function createSevenTVEmotesStore() {
  const { subscribe, update, set } = writable<SevenTVEmotes>(initialValue);

  return {
    subscribe,
    setChannelEmotes: (channel: string, emotes: Record<string, string>) => update((state) => ({...state, channel, emotes })),
    reset: () => set(initialValue)
  };
}

export const sevenTVEmotesStore = createSevenTVEmotesStore();