# Prisma Postgres Setup Guide for Nexa AI Chat

This guide shows how your AI chatbot is configured with Prisma Postgres for session tracking and chat history.

## ✅ Current Setup Status

Your database is **already configured and working!** Here's what's set up:

### Database Configuration
- **Provider**: Prisma Postgres with Accelerate
- **Performance**: Connection pooling and caching enabled
- **Database URL**: Accelerate-optimized connection
- **Direct URL**: For migrations and direct access

### Environment Variables Set
```bash
# Production (Accelerate for performance)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
# Development and migrations
DIRECT_URL="postgres://66f6551eaa285b3dae1f7f3e00a66a06b07a18f175ef2a7d4735f7a679246891:sk_cVQ8jF8xGW_vIL7CKqkTm@db.prisma.io:5432/postgres?sslmode=require"
```

## ✅ Database Tables Created

Your database already has all the required tables:

```sql
-- Users table
users (
  id: String (Primary Key)
  sessionId: String (Unique)
  createdAt: DateTime
  updatedAt: DateTime
)

-- Chat sessions table
chat_sessions (
  id: String (Primary Key)
  userId: String (Foreign Key)
  model: String
  createdAt: DateTime
  updatedAt: DateTime
)

-- Messages table
messages (
  id: String (Primary Key)
  chatSessionId: String (Foreign Key)
  role: Enum (USER, ASSISTANT, SYSTEM)
  content: Text
  createdAt: DateTime
)
```

## 🚀 Ready to Deploy

Your chatbot is ready for deployment! Just run:

```bash
npm run build  # ✅ Builds successfully
vercel --prod  # Deploy to production
```

## 🎆 Features Enabled

With Prisma Postgres connected, your AI chatbot now supports:

- ✅ **Session Tracking** - Each user gets a unique session ID
- ✅ **Chat History** - All messages are saved to database
- ✅ **Multiple Chat Sessions** - Users can have multiple conversations
- ✅ **Model Tracking** - Track which AI model was used for each response
- ✅ **Data Persistence** - Chat history survives browser refreshes
- ✅ **Performance Optimized** - Prisma Accelerate for fast queries
- ✅ **Analytics Ready** - Database ready for future analytics features

## API Endpoints

- `POST /api/sessions` - Create new chat session
- `GET /api/sessions?sessionId=xxx` - Get user's chat sessions
- `POST /api/chat` - Send message (automatically saves to DB)
- `GET /api/setup-db` - Check database status
- `POST /api/setup-db` - Initialize database tables

## Database Schema

```sql
-- Users table
users (
  id: String (Primary Key)
  sessionId: String (Unique)
  createdAt: DateTime
  updatedAt: DateTime
)

-- Chat sessions table
chat_sessions (
  id: String (Primary Key)
  userId: String (Foreign Key)
  model: String
  createdAt: DateTime
  updatedAt: DateTime
)

-- Messages table
messages (
  id: String (Primary Key)
  chatSessionId: String (Foreign Key)
  role: Enum (USER, ASSISTANT, SYSTEM)
  content: Text
  createdAt: DateTime
)
```

## Troubleshooting

1. **"Database connection failed"**
   - Check if Postgres is properly created in Vercel
   - Verify environment variables are set
   - Try redeploying

2. **"Tables don't exist"**
   - Visit `/api/setup-db` to initialize tables
   - Or run `npx prisma migrate deploy`

3. **Local development issues**
   - Run `vercel env pull .env.local` to get production variables
   - Make sure Prisma client is generated: `npx prisma generate`

## Next Steps

Your AI chatbot is now ready with full database integration! Users will have persistent chat sessions, and you can track usage analytics.

Consider adding:
- Chat session management UI
- Export chat history feature
- User analytics dashboard
- Message search functionality