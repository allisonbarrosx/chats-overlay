
import type { Client } from 'tmi.js';
import { chatStore } from '../stores/store';

async function fetchTwitchLiveChatMessages(client: Client) {
  // client.connect();
  client.on('message', (_channel, tags, message) => {
    const emotes = tags.emotes || {}; // Twitch emotes from tags
    const emoteUrls: any = {};

    // Parse emotes into a mapping of text -> image URL
    for (const [id, positions] of Object.entries(emotes)) {
      positions.forEach((pos: string) => {
        const [start, end] = pos.split('-').map(Number);
        const emoteText = message.slice(start, end + 1);
        emoteUrls[emoteText] = `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0`;
      });
    }
    
    chatStore.addMessage({
      username: tags['display-name'] || 'Unknown',
      message,
      platform: 'twitch',
      uniqueId: `${Date.now()}${Math.floor(Math.random() * 999) + 1}`,
      emotes: emoteUrls,
      usernameColor: tags.color
    });
  });
  // client.disconnect();
}

export {
  fetchTwitchLiveChatMessages
}