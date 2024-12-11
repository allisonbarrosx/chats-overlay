// "https://corsproxy.io/?",
const proxies = [
  "https://api.codetabs.com/v1/proxy/?quest=",
  "https://api.allorigins.win/get?url=",
];

const eventNames = {
  youtube: 'fetchYoutubeMessages'
}

// Define the response type for live chat messages
interface ChatMessage {
  author: string;
  message: string;
  messageId: string;
}

export {
  proxies,
  eventNames
};

export type { ChatMessage };
