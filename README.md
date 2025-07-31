# Debatica - AI-Powered Debate Tools

Revolutionize your debate game with AI-powered tools to streamline prep, improve speeches and optimize round strategy. Join thousands of debaters already winning with intelligent preparation.

## Features

- **AI Rebuttal Generator**: Generate strategic rebuttals based on round analysis
- **Smart Card Cutter**: Automatically extract and format evidence from sources
- **Case Library**: Organize and strategize with intelligent case management
- **Extemp Prep**: Real-time research and speech preparation assistance
- **Word Choice for Lay**: Enhance clarity and persuasion for lay judges
- **Speech Critique**: Evaluate efficiency, pacing, and effectiveness
- **Flow Optimizer**: Strategic round analysis and optimization

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Framer Motion
- **Authentication**: NextAuth.js (Google OAuth + Credentials)
- **Database**: Supabase PostgreSQL with Prisma ORM
- **AI Models**: Google Gemini 2.5 Flash, OpenAI GPT-4o, GPT-4o-mini
- **Storage**: Supabase Storage
- **State Management**: Zustand

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Google Cloud Console account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd debatica
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Fill in your environment variables (see Configuration section below)

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_gemini_api_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/callback/google
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and API keys from the Settings > API section

### 2. Database Setup

1. **Run Prisma migrations**:
   ```bash
   pnpm db:migrate
   ```

2. **Or manually run the SQL** (if you prefer):
   - Go to your Supabase project SQL Editor
   - Run the generated migration SQL from `prisma/migrations/`

### 3. Storage Buckets

1. **Create storage buckets**:
   - Go to Storage in your Supabase dashboard
   - Create bucket: `uploads` (for user file uploads)
   - Create bucket: `exports` (for exported files)

2. **Set up RLS policies**:
   ```sql
   -- Enable RLS
   ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

   -- Policy for uploads bucket
   CREATE POLICY "Users can upload their own files" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

   CREATE POLICY "Users can view their own files" ON storage.objects
   FOR SELECT USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### 4. Authentication

1. **Configure NextAuth** (already set up in the app)
2. **Keep Supabase Auth disabled** (we're using NextAuth for Google OAuth)

## Google OAuth Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in app information
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.readonly`
   - `https://www.googleapis.com/auth/documents.readonly`
   - `https://www.googleapis.com/auth/spreadsheets.readonly`

### 3. OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Create "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to your `.env.local`

### 4. API Keys

1. Go to "APIs & Services" > "Credentials"
2. Create "API Key" for Gemini API
3. Copy the API key to your `.env.local`

## AI Model Configuration

The app supports three AI modes:

- **Light**: Google Gemini 2.5 Flash (`gemini-2.0-flash-exp`)
- **Medium**: OpenAI GPT-4o (`gpt-4o`)
- **Hard**: OpenAI GPT-4o-mini (`gpt-4o-mini`)

Each mode has different characteristics:
- **Light**: Fast, cost-effective, good for basic tasks
- **Medium**: Balanced performance and cost
- **Hard**: Highest quality, most expensive

## Database Schema

The application uses the following main models:

- **User**: User accounts and authentication
- **Project**: Debate projects and organization
- **Case**: Individual debate cases
- **FeatureNote**: AI-generated content for each feature
- **Conversation**: Chat history with AI
- **Card**: Evidence cards from research
- **GoogleCredential**: Stored Google API credentials

## API Routes

- `POST /api/llm`: Main AI processing endpoint with streaming
- `POST /api/scrape`: Web scraping for card cutting
- `POST /api/google/doc`: Google Docs integration
- `POST /api/google/sheet`: Google Sheets integration
- `POST /api/upload/sign`: File upload signing
- `GET /api/history`: Conversation history

## Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed database with test data
pnpm db:studio    # Open Prisma Studio
```

### Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── app/            # Protected app pages
│   ├── auth/           # Authentication pages
│   └── globals.css     # Global styles
├── components/         # React components
│   └── ui/            # shadcn/ui components
├── lib/               # Utility libraries
├── prompts/           # AI prompt files
├── prisma/            # Database schema and migrations
└── hooks/             # Custom React hooks
```

## Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

Make sure to set all environment variables in your production environment:

- `NEXTAUTH_URL`: Your production domain
- `NEXTAUTH_SECRET`: Strong random secret
- `DATABASE_URL`: Production database connection
- All API keys and OAuth credentials

### Database Migration

For production database setup:

```bash
# Generate production migration
pnpm db:migrate

# Or run manually in Supabase SQL Editor
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Roadmap

- [ ] Advanced Google Drive integration
- [ ] Team collaboration features
- [ ] Tournament management
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API for third-party integrations 