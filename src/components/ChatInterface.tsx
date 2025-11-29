'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { AppState, Message, AppError } from '@/lib/types';
import { MAX_CLARIFICATION_ROUNDS } from '@/lib/constants';
import { MessageBubble } from './MessageBubble';

interface ChatInterfaceProps {
  state: AppState;
  messages: Message[];
  error: AppError | null;
  clarificationRound: number;
  isInputDisabled: boolean;
  initialIdea?: string;
  onSendMessage: (content: string) => void;
  onRetry: () => void;
  onStartOver: () => void;
}

export function ChatInterface({
  state,
  messages,
  error,
  clarificationRound,
  isInputDisabled,
  initialIdea = '',
  onSendMessage,
  onRetry,
  onStartOver,
}: ChatInterfaceProps) {
  const [input, setInput] = useState(initialIdea);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Update input when initialIdea changes (for Edit & Regenerate)
  useEffect(() => {
    if (initialIdea && messages.length === 0) {
      setInput(initialIdea);
    }
  }, [initialIdea, messages.length]);

  const handleSubmit = () => {
    if (!input.trim() || isInputDisabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartOver = () => {
    if (messages.length > 0) {
      setShowConfirmModal(true);
    } else {
      onStartOver();
    }
  };

  const confirmStartOver = () => {
    setShowConfirmModal(false);
    onStartOver();
    setInput('');
  };

  const getStateLabel = (): string => {
    switch (state) {
      case 'loading':
        return 'Generating...';
      case 'clarifying':
        return `Clarifying (${clarificationRound}/${MAX_CLARIFICATION_ROUNDS})`;
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  const stateLabel = getStateLabel();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900">
            PRD Builder
          </h1>
          <div className="flex items-center gap-3">
            {stateLabel && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                {state === 'loading' && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
                )}
                {stateLabel}
              </div>
            )}
            <button
              type="button"
              onClick={handleStartOver}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div
          aria-live="polite"
          className="border-b border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <p className="text-sm text-red-800">{error.message}</p>
            {error.retryable && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        aria-busy={state === 'loading'}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="mx-auto max-w-2xl">
          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-neutral-500">
                Describe your idea in a sentence or short paragraph...
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                messages.length === 0
                  ? 'Describe your product idea...'
                  : 'Type your response...'
              }
              disabled={isInputDisabled}
              rows={3}
              className="flex-1 resize-none rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-50"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!input.trim() || isInputDisabled}
              className="self-end rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-400">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900">
              Start over?
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              This will clear your current conversation.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStartOver}
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
