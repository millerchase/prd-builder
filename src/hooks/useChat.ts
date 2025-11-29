'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  Message,
  PRDDocument,
  AIResponse,
  AppError,
  PersistedState,
} from '@/lib/types';
import { loadState, saveState, clearState } from '@/lib/storage';
import {
  buildUserMessage,
  buildClarificationCapMessage,
  buildForceGenerateMessage,
  buildJsonRetryMessage,
} from '@/lib/prompts';
import {
  getErrorFromStatus,
  getTimeoutError,
  getNetworkError,
  getParseError,
  getConsecutiveFailureMessage,
} from '@/lib/errors';
import { MAX_CLARIFICATION_ROUNDS } from '@/lib/constants';

const REQUEST_TIMEOUT_MS = 45000;

interface UseChatReturn {
  state: AppState;
  messages: Message[];
  prd: PRDDocument | null;
  error: AppError | null;
  clarificationRound: number;
  consecutiveFailures: number;
  isInputDisabled: boolean;
  originalIdea: string;
  sendMessage: (content: string) => Promise<void>;
  retry: () => Promise<void>;
  startOver: () => void;
  editAndRegenerate: () => void;
}

export function useChat(): UseChatReturn {
  const [state, setState] = useState<AppState>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [prd, setPrd] = useState<PRDDocument | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [clarificationRound, setClarificationRound] = useState(0);
  const [originalIdea, setOriginalIdea] = useState('');
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [jsonRetryAttempted, setJsonRetryAttempted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const persisted = loadState();
    setState(persisted.state === 'loading' ? 'idle' : persisted.state);
    setMessages(persisted.messages);
    setPrd(persisted.prd);
    setClarificationRound(persisted.clarificationRound);
    setOriginalIdea(persisted.originalIdea);
    setIsHydrated(true);
  }, []);

  // Persist state on changes
  useEffect(() => {
    if (!isHydrated) return;

    const persisted: PersistedState = {
      state: state === 'loading' ? 'idle' : state,
      messages,
      prd,
      clarificationRound,
      originalIdea,
    };
    saveState(persisted);
  }, [state, messages, prd, clarificationRound, originalIdea, isHydrated]);

  const callApi = useCallback(
    async (
      apiMessages: Message[],
      systemModifier?: string
    ): Promise<AIResponse> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages, systemModifier }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 422) {
            // JSON parse error from API
            throw { type: 'parse_error' };
          }
          throw { type: 'http_error', status: response.status };
        }

        return (await response.json()) as AIResponse;
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof Error && err.name === 'AbortError') {
          throw { type: 'timeout' };
        }

        if (err instanceof TypeError) {
          throw { type: 'network' };
        }

        throw err;
      }
    },
    []
  );

  const processResponse = useCallback(
    (response: AIResponse, newMessages: Message[]) => {
      if (response.type === 'clarification') {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.questions.join('\n\n'),
          timestamp: Date.now(),
        };
        setMessages([...newMessages, assistantMessage]);
        setState('clarifying');
        setClarificationRound((prev) => prev + 1);
      } else if (response.type === 'prd') {
        setPrd(response.prd);
        setState('complete');
      }
      setConsecutiveFailures(0);
      setJsonRetryAttempted(false);
    },
    []
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || state === 'loading') return;

      setError(null);
      setState('loading');

      const isInitialIdea = messages.length === 0;
      if (isInitialIdea) {
        setOriginalIdea(content);
      }

      const userMessage: Message = {
        role: 'user',
        content: buildUserMessage(content, isInitialIdea),
        timestamp: Date.now(),
      };

      setLastUserMessage(content);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Determine system modifier based on clarification round
      let systemModifier: string | undefined;
      const nextRound = clarificationRound + 1;
      if (nextRound >= MAX_CLARIFICATION_ROUNDS) {
        systemModifier = buildForceGenerateMessage();
      } else if (nextRound >= MAX_CLARIFICATION_ROUNDS - 1) {
        systemModifier = buildClarificationCapMessage(nextRound);
      }

      try {
        const response = await callApi(newMessages, systemModifier);
        processResponse(response, newMessages);
      } catch (err: unknown) {
        const failures = consecutiveFailures + 1;
        setConsecutiveFailures(failures);

        let appError: AppError;
        const errorObj = err as { type?: string; status?: number };

        if (errorObj.type === 'timeout') {
          appError = getTimeoutError();
        } else if (errorObj.type === 'network') {
          appError = getNetworkError();
        } else if (errorObj.type === 'parse_error') {
          appError = getParseError();
        } else if (errorObj.type === 'http_error' && errorObj.status) {
          appError = getErrorFromStatus(errorObj.status);
        } else {
          appError = getErrorFromStatus(500);
        }

        const failureMessage = getConsecutiveFailureMessage(failures);
        if (failureMessage) {
          appError.message = failureMessage;
        }

        setError(appError);
        setState('error');
      }
    },
    [
      state,
      messages,
      clarificationRound,
      consecutiveFailures,
      callApi,
      processResponse,
    ]
  );

  const retry = useCallback(async () => {
    if (!lastUserMessage) return;

    setError(null);
    setState('loading');

    // If this is a JSON retry and we haven't tried yet
    if (!jsonRetryAttempted && error?.type === 'parse_error') {
      setJsonRetryAttempted(true);

      // Add retry instruction to messages
      const retryMessages: Message[] = [
        ...messages,
        {
          role: 'user',
          content: buildJsonRetryMessage(),
          timestamp: Date.now(),
        },
      ];

      try {
        const response = await callApi(retryMessages);
        processResponse(response, messages);
      } catch {
        setError(getParseError());
        setState('error');
      }
    } else {
      // Regular retry - resend the same message
      await sendMessage(lastUserMessage);
    }
  }, [
    lastUserMessage,
    jsonRetryAttempted,
    error,
    messages,
    callApi,
    processResponse,
    sendMessage,
  ]);

  const startOver = useCallback(() => {
    clearState();
    setState('idle');
    setMessages([]);
    setPrd(null);
    setError(null);
    setClarificationRound(0);
    setOriginalIdea('');
    setConsecutiveFailures(0);
    setLastUserMessage('');
    setJsonRetryAttempted(false);
  }, []);

  const editAndRegenerate = useCallback(() => {
    setState('idle');
    setMessages([]);
    setPrd(null);
    setError(null);
    setClarificationRound(0);
    setConsecutiveFailures(0);
    // Keep originalIdea so it can be pre-filled
  }, []);

  return {
    state,
    messages,
    prd,
    error,
    clarificationRound,
    consecutiveFailures,
    isInputDisabled: state === 'loading',
    originalIdea,
    sendMessage,
    retry,
    startOver,
    editAndRegenerate,
  };
}
