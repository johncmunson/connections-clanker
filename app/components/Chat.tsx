"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useTheme } from "next-themes";

const TRASH_TALK_AND_HELPFUL_COMMANDS = [
  "Shuffle the board...",
  "What are the rules...",
  "Let's start a new game...",
  "Ask for a hint...",
  "Print the current board...",
  "Show me the current game state...",
  "That all you got?",
  "My grandma solves faster...",
  "Still thinking? Wow...",
  "I've seen snails group faster...",
  "Bold strategy. Let's see how it plays out...",
  "You sure about that?",
  "Tick tock, genius...",
  "Even a coin flip would be faster...",
  "I'm not mad, just disappointed...",
  "Try using your brain this time...",
  "Connections won't solve themselves... or will they?",
  "Go ahead, guess again. I dare you...",
  "You call that a guess?",
  "This is painful to watch...",
];

function getRandomComposerPlaceholderText(
  lastIndex: number | null,
): [string, number] {
  let index: number;
  do {
    index = Math.floor(Math.random() * TRASH_TALK_AND_HELPFUL_COMMANDS.length);
  } while (index === lastIndex && TRASH_TALK_AND_HELPFUL_COMMANDS.length > 1);
  return [TRASH_TALK_AND_HELPFUL_COMMANDS[index], index];
}

export default function Chat() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [placeholder, setPlaceholder] = useState("Start connecting...");
  const lastIndexRef = useRef<number | null>(null);

  const handleResponseStart = useCallback(() => {
    const [message, index] = getRandomComposerPlaceholderText(
      lastIndexRef.current,
    );
    lastIndexRef.current = index;
    setPlaceholder(message);
  }, []);

  const { control, fetchUpdates } = useChatKit({
    onResponseStart: handleResponseStart,
    api: {
      async getClientSecret(existing) {
        if (existing) {
          return existing;
        }

        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    theme: {
      colorScheme: isDark ? "dark" : "light",
    },
    composer: {
      attachments: {
        enabled: false,
      },
      dictation: {
        enabled: false,
      },
      placeholder,
    },
    header: {
      enabled: true,
      title: {
        enabled: true,
        text: "Connections Clanker",
      },
      rightAction: {
        icon: isDark ? "dark-mode" : "light-mode",
        onClick: () => setTheme(isDark ? "light" : "dark"),
      },
    },
    history: {
      enabled: false,
    },
    startScreen: {
      greeting: "Make four groups of four!",
    },
  });

  // PROBLEM: Mobile browsers spuriously show an error widget when the
  //          tab or browser is backgrounded and then foregrounded again:
  //          "Error: There was an error while generating the assistant's response."
  //
  // THESIS: Mobile browsers kill streaming connections on visibility change,
  //         and are just in general more unstable with long-lived streaming connections.
  //         ChatKit doesn't handle this well at all.
  //
  // MITIGATION: Attempt to re-sync conversation state when returning from a background
  //             app switch. This is a band-aid for the underlying issue of ChatKit not
  //             properly handling streaming connection interruptions. It is a best-effort
  //             attempt at mitigation. Not guaranteed to work in all cases. Anecdotally
  //             seems to slightly reduce the frequency of the issue, but hard to say for sure.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUpdates();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchUpdates]);

  return <ChatKit control={control} />;
}
