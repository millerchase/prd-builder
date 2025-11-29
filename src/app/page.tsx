"use client";

import { useChat } from "@/hooks/useChat";
import { ChatInterface } from "@/components/ChatInterface";
import { PRDPreview } from "@/components/PRDPreview";

export default function Home() {
  const {
    state,
    messages,
    prd,
    error,
    clarificationRound,
    isInputDisabled,
    originalIdea,
    sendMessage,
    retry,
    startOver,
    editAndRegenerate,
  } = useChat();

  // Show PRD preview when complete
  if (state === "complete" && prd) {
    return (
      <PRDPreview
        prd={prd}
        messages={messages}
        onStartNew={startOver}
        onEditRegenerate={editAndRegenerate}
      />
    );
  }

  // Show chat interface for all other states
  return (
    <ChatInterface
      state={state}
      messages={messages}
      error={error}
      clarificationRound={clarificationRound}
      isInputDisabled={isInputDisabled}
      initialIdea={originalIdea}
      onSendMessage={sendMessage}
      onRetry={retry}
      onStartOver={startOver}
    />
  );
}
