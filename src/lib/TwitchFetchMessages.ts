
import type { Client } from 'tmi.js';
import { chatStore } from '../stores/store';
import { get } from "svelte/store";
import { sevenTVEmotesStore } from '../stores/emotesStore';

/**
 * 
 * @param channelName 
 * @returns Promise<string | null>
 */
async function fetchTwitchUserId(channelName: string): Promise<string | null> {
  const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${channelName}`);
  if (!response.ok) {
    console.error('Failed to fetch Twitch user information');
    return null;
  }
  const data = await response.json();
  return data[0].id;
}

/**
 * 
 * @param twitchUserId 
 * @returns Promise<string | null>
 */
async function fetchSevenTVUserId(twitchUserId: string): Promise<string | null> {
  const response = await fetch(`https://7tv.io/v3/users/twitch/${twitchUserId}`);
  if (!response.ok) {
    console.error('Failed to fetch SevenTV user information');
    return null;
  }
  const data = await response.json();
  return data.user.id;
}

/**
 * 
 * @param channelName 
 * @returns Promise<Record<string, string>>
 */
async function fetch7TVEmotes(channelName: string): Promise<Record<string, string>> {
  try {   
    // get Twitch user id
    // https://api.ivr.fi/v2/twitch/user?login={username} 
    // get 7TV user id 
    // https://7tv.io/v3/users/twitch/{twitchID}

    let twitchUserId: string | null;
    let sevenTVUserId: string | null;

    twitchUserId = await fetchTwitchUserId(channelName);
    if (twitchUserId === null) return {};

    sevenTVUserId = await fetchSevenTVUserId(twitchUserId);

    if (sevenTVUserId === null) return {};

    const response = await fetch(`https://7tv.io/v3/users/${sevenTVUserId}`);
    if (!response.ok) {
      console.error('Failed to fetch 7TV emotes');
      return {};
    }
  
    const data = await response.json();

    const emotes: Record<string, string> = {};

    const plataformEmotes = data.connections.find((c: any) => (c.platform as string).toLowerCase() === 'twitch');
    
    if (plataformEmotes.emote_set?.emotes) {
      plataformEmotes.emote_set.emotes.forEach((emote: { name: string; data: { id: string } }) => {
        emotes[emote.name] = `https://cdn.7tv.app/emote/${emote.data.id}/1x.webp`;
      });
    }

    return emotes;
  } catch (error) {
    console.warn(`Error while fetching 7TV Emotes for channel: ${error}`);
    return {};
  }
}

/**
 * 
 * @param client 
 */
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

    const sevenTVEmotes = get(sevenTVEmotesStore);

    if (sevenTVEmotes.emotes !== null) {
      const words = message.split(' ');
      const emotes7TV = sevenTVEmotes.emotes;

      words.forEach((word) => {
        if (emotes7TV[word]) {
          emoteUrls[word] = emotes7TV[word];
        }
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
  fetchTwitchLiveChatMessages,
  fetch7TVEmotes
}