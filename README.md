# Nexa AI Chat

A modern, **FREE** multi-model AI chatbot built with Next.js that supports multiple AI providers - all using **free tier models** so you can chat without worrying about costs!

## Features

- 🆓 **100% Free Models**: All 7 models are available on free tiers
- 🤖 **Multi-Model Support**: Chat with GPT-3.5, Gemini, Llama, Mixtral, Gemma & Cohere
- 🔄 **Dynamic Model Switching**: Switch between models during conversations
- 💬 **Streaming Responses**: Real-time streaming for better user experience
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 🚀 **Vercel Ready**: Optimized for deployment on Vercel
- ⚡ **Super Fast**: Groq models provide lightning-fast responses

## Supported Free Models

### OpenAI (Free Tier)
- GPT-3.5 Turbo - Fast and efficient

### Google AI (Free Tier)
- Gemini 1.5 Flash - Fast multimodal model

### Groq (100% Free - Super Fast!)
- Llama 3.1 70B - Lightning fast inference
- Llama 3.1 8B Instant - Ultra fast responses
- Mixtral 8x7B - Fast and capable
- Gemma 2 9B - Efficient and fast

### Cohere (Free Tier)
- Command - Fast for conversations

## Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd nexa-ai-chat
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
# At least one API key is required
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here

# Optional configuration
DEFAULT_MODEL=gpt-4o
```

### 3. Getting API Keys

#### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key

#### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key

#### Google AI
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign up or log in
3. Create a new API key

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see your chatbot in action!

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/nexa-ai-chat)

### Manual Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts
4. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY` 
   - `GOOGLE_API_KEY`

### Environment Variables on Vercel

In your Vercel dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add the required API keys
4. Redeploy the project

## Usage

1. **Select a Model**: Use the model selector in the header to choose your preferred AI model
2. **Start Chatting**: Type your message and press Enter to send
3. **Switch Models**: Change models anytime during the conversation
4. **Clear Chat**: Use the trash icon to clear the conversation
5. **Retry**: Use the retry button to regenerate the last response

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Main chat API endpoint
│   │   └── models/route.ts    # Available models endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # App layout
│   └── page.tsx               # Home page
├── components/
│   ├── ChatInterface.tsx      # Main chat interface
│   ├── ChatMessage.tsx        # Message component
│   ├── ChatInput.tsx          # Input component
│   └── ModelSelector.tsx      # Model selection dropdown
├── config/
│   └── models.ts              # AI model configurations
├── hooks/
│   └── useChat.ts             # Chat and model hooks
├── lib/
│   └── chat.ts                # Chat utilities and API client
└── types/
    └── chat.ts                # TypeScript type definitions
```

## Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI SDKs**: Vercel AI SDK, OpenAI, Anthropic, Google AI
- **Icons**: Lucide React
- **Deployment**: Vercel

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.