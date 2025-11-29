import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/prompts';
import { AIResponse, Message } from '@/lib/types';

// Early check for API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatRequestBody {
  messages: Message[];
  systemModifier?: string;
}

export async function POST(request: NextRequest) {
  // Check for API key at request time
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error: API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body: ChatRequestBody = await request.json();
    const { messages, systemModifier } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Build the system prompt with optional modifier (with proper spacing)
    const systemPrompt = systemModifier
      ? `${SYSTEM_PROMPT}\n\n${systemModifier}`
      : SYSTEM_PROMPT;

    // Convert our message format to Anthropic's format
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsed: AIResponse;
    try {
      parsed = JSON.parse(textContent.text) as AIResponse;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', textContent.text);
      // Return raw text so frontend can request retry
      return NextResponse.json(
        { error: 'Invalid JSON response', rawResponse: textContent.text },
        { status: 422 }
      );
    }

    // Validate response structure
    if (parsed.type !== 'clarification' && parsed.type !== 'prd') {
      return NextResponse.json(
        { error: 'Invalid response type', rawResponse: textContent.text },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
