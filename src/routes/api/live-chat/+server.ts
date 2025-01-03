import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';
import { API_KEY } from '$env/static/private';
import type { YoutubeChatResponse } from '../../../shared/constants.js';

// Cache to store the IDs of the last retrieved messages
let lastMessageIds = new Set();
let nextPageToken: string | null = null;

export async function GET({ url }) {
	// Extract `videoId` from query parameters
	const videoId = url.searchParams.get('videoId');
	if (!videoId) {
		return json({ error: 'Missing videoId' }, { status: 400 });
	}

	// Step 1: Get Live Chat ID
	const videoResponse = await fetch(
		`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=liveStreamingDetails&key=${API_KEY}`
	);
	const videoData: any = await videoResponse.json();
	const liveChatId = videoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

	if (!liveChatId) {
		return json({ error: 'No live chat found for this video' }, { status: 404 });
	}

  const apiUrl = new URL('https://www.googleapis.com/youtube/v3/liveChat/messages');
  apiUrl.searchParams.append('liveChatId', liveChatId);
  apiUrl.searchParams.append('part', 'id,snippet,authorDetails');
  apiUrl.searchParams.append('key', API_KEY);
  apiUrl.searchParams.append('maxResults', '50');
  if (nextPageToken) {
    apiUrl.searchParams.append('pageToken', nextPageToken);
  }

	// Step 2: Fetch Live Chat Messages
  const chatResponse = await fetch(apiUrl.toString());
	const chatData: any = await chatResponse.json();

	// Extract new messages by filtering out ones we've already seen
	let newMessages = [];
  if (lastMessageIds.values.length == 0) {
    newMessages = chatData.items;
  } else {
    newMessages = chatData.items.filter((message: YoutubeChatResponse) => !lastMessageIds.has(message.id))
  }

	// Update the cache with the new message IDs
	newMessages?.forEach((message: YoutubeChatResponse) => lastMessageIds.add(message.id));

	// Limit cache size to prevent memory bloat (e.g., keep only the latest 50 IDs)
	if (lastMessageIds.size > 50) {
		const excess = lastMessageIds.size - 50;
		const iterator = lastMessageIds.values();
		for (let i = 0; i < excess; i++) {
			lastMessageIds.delete(iterator.next().value);
		}
	}

  // Update the nextPageToken for subsequent requests
  nextPageToken = chatData.nextPageToken || null;

	return json(newMessages);
}
