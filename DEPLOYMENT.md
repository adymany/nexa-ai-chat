# 🚀 Deployment Guide - Nexa AI Chat on Vercel

## 📋 Prerequisites

Before deploying, ensure you have:
- Git installed on your computer
- A GitHub account
- A Vercel account (free)
- All your API keys ready

## 🔑 Required API Keys

Make sure you have these API keys:
- **OpenAI API Key** (for GPT-3.5 Turbo)
- **Google Generative AI API Key** (for Gemini 1.5 Flash)
- **Groq API Key** (for Llama models)
- **Cohere API Key** (for Command model)
- **Anthropic API Key** (for Claude - optional)

## 📂 Step 1: Push to GitHub

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nexa AI Chat"
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub.com](https://github.com)
   - Click "New Repository"
   - Name it `nexa-ai-chat`
   - Make it public or private
   - Don't initialize with README (since you already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/nexa-ai-chat.git
   git branch -M main
   git push -u origin main
   ```

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended)

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**:
   - Click "New Project"
   - Select your `nexa-ai-chat` repository
   - Click "Import"

3. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   OPENAI_API_KEY=your_openai_key_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_key_here
   GROQ_API_KEY=your_groq_key_here
   COHERE_API_KEY=your_cohere_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   DEFAULT_MODEL=gemini-1.5-flash
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your settings
   - Add environment variables when prompted

## 🔧 Step 3: Configure Environment Variables

After deployment, add your API keys in the Vercel dashboard:

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable:

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-3.5 | Yes* |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI key for Gemini | Yes |
| `GROQ_API_KEY` | Groq API key for Llama models | Yes |
| `COHERE_API_KEY` | Cohere API key for Command | Yes |
| `ANTHROPIC_API_KEY` | Anthropic key for Claude | Optional |
| `DEFAULT_MODEL` | Default model to use | Optional |

*Note: OpenAI may not work due to quota limits, but other models will work fine.

## ✅ Step 4: Test Your Deployment

1. **Visit Your Site**:
   - Vercel will provide a URL like `https://nexa-ai-chat-xxx.vercel.app`
   - Open it in your browser

2. **Test Features**:
   - Check if all model tabs appear
   - Send a test message to each working model
   - Verify the chat interface works properly

## 🔄 Step 5: Updates and Redeployment

To update your deployed app:

1. **Make Changes Locally**
2. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. **Automatic Deployment**: Vercel will automatically redeploy when you push to GitHub

## 🎯 Custom Domain (Optional)

To use your own domain:

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update your DNS records as instructed
4. Wait for SSL certificate generation

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check if all dependencies are in `package.json`
   - Ensure TypeScript types are correct

2. **API Keys Not Working**:
   - Verify environment variables are set correctly
   - Check API key validity and quotas

3. **Models Not Loading**:
   - Check if API keys are added for all providers
   - Verify the models configuration in `src/config/models.ts`

4. **Streaming Issues**:
   - Make sure your API keys have streaming enabled
   - Check network connectivity

## 🎉 Success!

Your Nexa AI Chat is now live on Vercel! Share your URL with others and enjoy your free multi-model AI chatbot!

## 📝 Notes

- The app uses only free-tier models to keep costs at zero
- Vercel's free plan includes plenty of usage for personal projects
- All data is processed securely with HTTPS
- No user data is stored permanently

---

**Need Help?** Check the Vercel documentation or create an issue in your GitHub repository.