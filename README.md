# PRD Builder

AI-Powered Product Requirements Document Builder - Transform rough product ideas into structured, actionable PRDs through conversational AI.

## Features

- **Conversational Interface**: Describe your product idea in natural language and answer clarifying questions
- **Smart Clarification**: AI asks targeted questions to understand your vision (max 5 rounds)
- **Structured Output**: Generates comprehensive PRDs with all standard sections
- **Multiple Export Options**: Copy to clipboard, download as Markdown, or export as JSON
- **State Persistence**: Conversation and PRD state saved to localStorage - refresh without losing progress
- **Edit & Regenerate**: Refine your original idea and generate a new PRD

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Typography plugin
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Markdown**: react-markdown

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/millerchase/prd-builder.git
   cd prd-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Describe Your Idea**: Enter a brief description of your product idea in the chat interface
2. **Answer Questions**: Respond to AI clarifying questions about target users, features, and scope
3. **Review PRD**: Once generated, review the structured PRD with all sections
4. **Export**: Copy to clipboard or download as Markdown/JSON
5. **Iterate**: Use "Edit & Regenerate" to refine your idea, or "Start New" for a fresh PRD

## PRD Structure

Generated PRDs include:

- **Summary**: One-paragraph product overview
- **Problem Statement**: Pain point being solved
- **Target Users**: User personas and demographics
- **Core Features**: 3-5 key features with descriptions
- **Functional Requirements**: Detailed FR specifications
- **Non-Functional Requirements**: Performance, security, scalability
- **User Stories**: Stories with acceptance criteria
- **Out of Scope**: Explicitly excluded from MVP
- **Technical Considerations**: Architecture and tech suggestions
- **Implementation Roadmap**: Phased delivery plan
- **Assumptions**: Any inferences made during generation

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Claude API endpoint
│   ├── globals.css           # Tailwind imports
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main page with state routing
├── components/
│   ├── ChatInterface.tsx     # Chat UI with input/messages
│   ├── ExportButtons.tsx     # Copy/download actions
│   ├── MessageBubble.tsx     # Individual chat message
│   └── PRDPreview.tsx        # PRD display with markdown
├── hooks/
│   └── useChat.ts            # State machine and API calls
└── lib/
    ├── constants.ts          # Shared constants
    ├── errors.ts             # Error handling utilities
    ├── markdown.ts           # PRD to markdown converter
    ├── prompts.ts            # System prompt and builders
    ├── storage.ts            # localStorage utilities
    └── types.ts              # TypeScript interfaces
```

## State Machine

The app uses a state machine with the following states:

| State | Description |
|-------|-------------|
| `idle` | Initial state, waiting for user input |
| `loading` | API request in progress |
| `clarifying` | AI asked questions, waiting for response |
| `complete` | PRD generated successfully |
| `error` | Error occurred, can retry |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform supporting Node.js:

```bash
npm run build
npm run start
```

## Error Handling

The app handles common errors gracefully:

- **Rate Limiting (429)**: "Too many requests. Wait a moment and try again."
- **Server Errors (5xx)**: "The service had an issue. Please try again shortly."
- **Network Issues**: "Unable to connect. Check your internet and try again."
- **Timeout**: "Request timed out. Please try again."
- **JSON Parse Errors**: Automatic retry with clearer instructions to the AI

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

- Built with [Claude](https://anthropic.com/claude) by Anthropic
- Scaffolded with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
