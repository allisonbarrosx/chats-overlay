import { writable } from "svelte/store";

interface ChatMessage {
  username: string;
  message: string;
  platform: "youtube" | "twitch";
  uniqueId: number | string;
  emotes?: { [key: string]: string }; // Map emote text to image URL
  usernameColor: string | undefined;
}

interface YoutubeLiveInfo {
  liveId: string | null;
  isChannelLive?: boolean;
  isFetching: boolean;
}

const initialValue = { liveId: null, isFetching: false, isChannelLive: false };

function createChatStore() {
  const { subscribe, update, set } = writable<ChatMessage[]>([]);

  return {
    subscribe,
    addMessage: (msg: ChatMessage) => {
      update((messages) => {
        // Prevent duplicates
        const isDuplicate = messages.some(
          (m) =>
            m.username === msg.username &&
            m.message === msg.message &&
            m.uniqueId === msg.uniqueId,
        );

        // if (!isDuplicate && msg.platform === 'youtube') {
        //   const isDuplicateId = messages.some(
        //     (m) => m.uniqueId === msg.uniqueId
        //   );
        //   if (isDuplicateId) {
        //     // Sometimes youtube sends the same element with the same Id but different messages
        //     msg.uniqueId = `${msg.uniqueId}${Date.now()}${Math.floor(Math.random() * 999) + 1}`;
        //   }
        // }

        if (!isDuplicate) {
          return [...messages, msg].slice(-50); // Keep the last 50 messages
        }

        return messages;
      });

      setTimeout(() => {
        update((messages) =>
          messages.filter((m) => m.uniqueId !== msg.uniqueId),
        );
      }, 15000); // 15 seconds of screen time KEKW
    },
    reset: () => set([]),
    set: (value: ChatMessage[]) => set(value),
  };
}

function createYoutubeLiveInfo() {
  const { subscribe, update, set } = writable<YoutubeLiveInfo>(initialValue);

  return {
    subscribe,
    addLiveId: (liveId: string) => {
      update((ytLiveInfo) => ({...ytLiveInfo, liveId}));
    },
    setStatusChannel: (status: boolean) => update((ytLiveInfo) => ({ ...ytLiveInfo, isChannelLive: status })),
    setIsFetchingData: (isFetching: boolean) => update((ytLiveInfo) => ({...ytLiveInfo, isFetching})),
    reset: () => set(initialValue)
  };
}

export const chatStore = createChatStore();
export const youtubeLiveInfoStore = createYoutubeLiveInfo();
