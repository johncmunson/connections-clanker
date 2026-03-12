"use client";

import { useState, useCallback, useRef } from "react";
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
  const [debugError, setDebugError] = useState<string | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  const handleResponseStart = useCallback(() => {
    const [message, index] = getRandomComposerPlaceholderText(
      lastIndexRef.current,
    );
    lastIndexRef.current = index;
    setPlaceholder(message);
  }, []);

  const handleError = useCallback((event: { error: Error }) => {
    console.error("[ChatKit Error]", event.error.message, event.error);
    setDebugError(`${event.error.message}\n\n${event.error.stack ?? ""}`);
  }, []);

  const { control } = useChatKit({
    onResponseStart: handleResponseStart,
    onError: handleError,
    api: {
      async getClientSecret(existing) {
        if (existing) return existing;

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

  return (
    <>
      <ChatKit control={control} />
      {debugError && (
        <div
          onClick={() => setDebugError(null)}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(255,0,0,0.9)",
            color: "white",
            padding: "12px",
            fontSize: "11px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            zIndex: 99999,
            maxHeight: "40vh",
            overflow: "auto",
          }}
        >
          <strong>ChatKit Error (tap to dismiss):</strong>
          {"\n"}
          {debugError}
        </div>
      )}
    </>
  );
}
