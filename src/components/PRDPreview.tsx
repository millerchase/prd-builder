'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { PRDDocument, Message } from '@/lib/types';
import { generateMarkdown } from '@/lib/markdown';
import { ExportButtons } from './ExportButtons';
import { MessageBubble } from './MessageBubble';

interface PRDPreviewProps {
  prd: PRDDocument;
  messages: Message[];
  onStartNew: () => void;
  onEditRegenerate: () => void;
}

export function PRDPreview({
  prd,
  messages,
  onStartNew,
  onEditRegenerate,
}: PRDPreviewProps) {
  const [showHistory, setShowHistory] = useState(false);
  const markdown = generateMarkdown(prd);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-4xl">
          <ExportButtons
            prd={prd}
            onStartNew={onStartNew}
            onEditRegenerate={onEditRegenerate}
          />
        </div>
      </div>

      {/* PRD content */}
      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Assumptions banner */}
          {prd.assumptions.length > 0 && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800">
                Some information was assumed during generation. Please verify
                the assumptions section below.
              </p>
            </div>
          )}

          {/* Rendered markdown */}
          <article className="prose prose-neutral max-w-none">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>

          {/* Conversation history */}
          <div className="mt-12 border-t border-neutral-200 pt-6">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              <span
                className={`transform transition-transform ${
                  showHistory ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>
              View conversation history
            </button>
            {showHistory && (
              <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                {messages.length > 0 ? (
                  messages.map((message, index) => (
                    <MessageBubble key={index} message={message} />
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">No conversation history.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
