<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import tmi from 'tmi.js';
  import { chatStore, youtubeLiveInfoStore } from "../../stores/store";
  import { fetchYoutubeLiveChatMessages } from "$lib/YoutubeFetchMessages";
  import { fetchTwitchLiveChatMessages } from "$lib/TwitchFetchMessages";
  import { eventStore, startEventInterval, stopEventInterval } from "../../stores/eventStore";
  import { eventNames } from "../../shared/constants";
  import { fly } from "svelte/transition";

  $: twitchUser = $page.url.searchParams.get("twitchUser") ?? '';
  $: youtubeUser = $page.url.searchParams.get("youtubeUser") ?? '';

  const ttvIcon =
    "https://api.iconify.design/ant-design:twitch-outlined.svg?color=%236610f2";
  const ytIcon =
    "https://api.iconify.design/ant-design:youtube-filled.svg?color=%23dc3545";

  $: messages = $chatStore;
  $: ytInfoStore = $youtubeLiveInfoStore;

  let messagesContainer: HTMLElement;

  $: if (messages && messagesContainer)
    setTimeout(() => scrollToBottom(messagesContainer), 50);

  const scrollToBottom = async (node: HTMLElement) => {
    node.scroll({ top: node.scrollHeight + 8, behavior: "smooth" }); // + 8 padding
  };

  $: if ($eventStore && ytInfoStore?.isChannelLive !== false) {
      fetchYoutubeLiveChatMessages(youtubeUser);
  }

  onMount(() => {
    let client: tmi.Client;

    if (twitchUser) {
      client = new tmi.Client({
        channels: [twitchUser],
      });
  
      client.connect();
      fetchTwitchLiveChatMessages(client);
    }
    
    if (youtubeUser) {
      startEventInterval(eventNames.youtube)
    }

    return () => {
      chatStore.reset();
      client && client.disconnect();
      stopEventInterval();
    };
  });
</script>

{#if (twitchUser === '' && youtubeUser === '')}
  <div class="dvh-90 d-flex flex-column justify-content-center align-items-center">
    <h1 class="text d-flex justify-content-center mb-4 text-danger">No User Provided</h1>
  </div>
{:else}
  <div id="combined-messages" bind:this={messagesContainer}>
    <ul>
      {#each messages as { username, message, platform, uniqueId, usernameColor } (uniqueId)}
      <li
      class="message"
      id={uniqueId.toString()}
      in:fly={{ x: 200, duration: 250 }}
      out:fly={{ x: -200, duration: 250 }}
          >
          <img
            src={platform === "youtube" ? ytIcon : ttvIcon}
            alt={platform}
            width="16"
            height="16"
            class="align-self-baseline"
          />
          <span class="chat-username ms-1 align-self-baseline text-nowrap fw-medium" style="--userNameColor: {usernameColor}">{username}</span>:&nbsp;
          {@html message}
        </li>
      {/each}
    </ul>
  </div>
{/if}


<style>
  .message {
    text-shadow: 0 0 0.2em black;
  }
  .chat-username {
    color: var(--userNameColor);
    text-shadow: 0 0 0.2em var(--userNameColor);
  }

  #combined-messages {
    display: block;
    height: 98%;
    max-height: 98%;
    overflow-y: auto;
    overflow-x: hidden;
    margin-inline: 10px;
  }

  #combined-messages ul {
    list-style: none;
    margin: 0;
    padding: 0;
    height: 100%;
    display: flex;    
    flex-direction: column;
    justify-content: end;
  }

  #combined-messages ul li {
    padding-block: 0.25rem;
  }

  :global(.emoji) {
    width: 20px;
    height: 20px;
  }
</style>
