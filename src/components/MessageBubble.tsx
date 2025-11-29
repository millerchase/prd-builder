'use client';

import { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  // Strip the "User's product idea:" or "User's response to clarification:" prefix for display
  let displayContent = message.content;
  if (isUser) {
    displayContent = displayContent
      .replace(/^User's product idea:\s*/i, '')
      .replace(/^User's response to clarification:\s*/i, '');
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-neutral-900 text-white'
            : 'bg-neutral-100 text-neutral-900'
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {displayContent}
        </p>
      </div>
    </div>
  );
}
