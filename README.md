# TCK AI - Next-Generation AI SaaS Platform

A production-ready AI SaaS platform built with Next.js 15, featuring multi-model AI integration, advanced chat capabilities, and a complete subscription system.

## 🚀 Features

### Core AI Features
- **Multi-Model Support**: GLM, Gemini, DeepSeek with custom branding (TCK models)
- **AI Modes**: Chat, Thinking, Search, Study, Coding, Vision, Image Generation
- **Streaming Responses**: Real-time AI responses with typing animations
- **Multi-API Load Balancing**: Smart routing across multiple API keys with failover
- **Shared API Pools**: Efficient resource utilization across all users
- **Sticky Chat Sessions**: Context-aware API selection for consistent conversations

### User Features
- **OTP-Based Authentication**: Secure email verification system
- **Credit Economy**: Daily credit limits with rolling resets
- **Subscription Plans**: Free, Pro, Ultra, Max with different credit allocations
- **VietQR Payment**: Vietnamese QR code payment integration
- **Chat History**: Organized chats with folders, favorites, and pinning
- **File Upload**: Support for images, PDFs, DOCX, and code files
- **Voice AI**: Speech-to-text and text-to-speech capabilities
- **Vector Memory**: Semantic search with pgvector integration

### Admin Features
- **User Management**: Ban users, reset chats, manage subscriptions
- **Payment Management**: Approve/reject payment requests
- **API Management**: Add/remove API keys, monitor health, manage cooldowns
- **Plan Management**: Edit plans, prices, credits, and features
- **Contact Management**: Update social media links and contact info
- **Analytics Dashboard**: Real-time stats and usage tracking

### UI/UX
- **Futuristic Design**: Glassmorphism, animated gradients, floating particles
- **Responsive Layout**: Mobile-optimized with collapsible sidebar
- **Dark Mode**: Beautiful dark theme with purple/blue accents
- **Animations**: Smooth transitions with Framer Motion
- **Markdown Support**: Rich text rendering with syntax highlighting
- **LaTeX Support**: Mathematical formula rendering

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: App Router with React Server Components
- **TypeScript**: Full type safety
- **TailwindCSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **Framer Motion**: Smooth animations
- **Zustand**: Lightweight state management

### Backend
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Primary database with pgvector
- **Redis**: Caching and session management
- **NextAuth**: Authentication with OTP

### AI Integration
- **GLM Models**: 4.5 Flash, 4.7 Flash, 4.6V Flash
- **Gemini Models**: 2.5 Pro, 2.5 Flash Lite, 2.5 Flash Image
- **DeepSeek Models**: V3, R1, R1 Lite, Coder

### Other
- **Recharts**: Data visualization
- **React Markdown**: Markdown rendering
- **PrismJS**: Syntax highlighting
- **Katex**: LaTeX rendering

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+ with pgvector extension
- Redis 7+
- npm, yarn, or pnpm

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tck-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template:

```bash
cp env.example .env
```

Configure the following environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tck_ai?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# GLM API Keys (comma-separated)
GLM_47_FLASH_KEYS="key1,key2,key3"
GLM_45_FLASH_KEYS="key1,key2,key3"
GLM_46V_FLASH_KEYS="key1,key2,key3"

# Gemini API Keys (comma-separated)
GEMINI_PRO_KEYS="key1,key2,key3"
GEMINI_FLASH_LITE_KEYS="key1,key2,key3"
GEMINI_IMAGE_KEYS="key1,key2,key3"

# DeepSeek API Keys (comma-separated)
DEEPSEEK_V3_KEYS="key1,key2,key3"
DEEPSEEK_R1_KEYS="key1,key2,key3"
DEEPSEEK_R1_LITE_KEYS="key1,key2,key3"
DEEPSEEK_CODER_KEYS="key1,key2,key3"

# Admin Account
ADMIN_EMAIL="admin@tckai.com"
ADMIN_PASSWORD="admin123"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@tckai.com"

# Payment (VietQR)
BANK_NAME="Vietcombank"
BANK_ACCOUNT_NAME="Your Name"
BANK_ACCOUNT_NO="1234567890"
```

### 4. Database Setup

Enable pgvector extension in PostgreSQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Run Prisma migrations:

```bash
npx prisma generate
npx prisma db push
```

### 5. Initialize Plans

Run the initialization script to create subscription plans:

```bash
# This will be handled automatically on first run
# or you can manually call the credit service
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- Next.js app on port 3000
- PostgreSQL on port 5432
- Redis on port 6379

### Manual Docker Build

```bash
docker build -t tck-ai .
docker run -p 3000:3000 --env-file .env tck-ai
```

## 📦 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📁 Project Structure

```
tck-ai/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── chat/           # Chat endpoints
│   │   └── payments/       # Payment endpoints
│   └── page.tsx            # Main chat interface
├── components/              # React components
│   ├── chat/              # Chat-related components
│   ├── sidebar/           # Sidebar components
│   ├── admin/             # Admin components
│   └── ui-effects/        # UI effects (particles, etc.)
├── services/               # Business logic services
│   ├── api-router/        # Multi-API load balancing
│   ├── load-balancer/     # Queue management
│   ├── payments/          # Payment processing
│   ├── credits/           # Credit management
│   ├── ai-modes/          # AI mode handlers
│   ├── upload/            # File upload
│   ├── voice/             # Voice AI
│   └── vector-memory/     # Vector search
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── otp.ts            # OTP service
│   └── security.ts       # Security utilities
├── store/                # Zustand stores
│   └── chat-store.ts     # Chat state management
├── types/                # TypeScript types
│   ├── index.ts          # Main type definitions
│   └── next-auth.d.ts    # NextAuth types
├── prisma/               # Prisma schema
│   └── schema.prisma     # Database schema
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose config
└── env.example          # Environment template
```

## 🔧 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/send-otp` - Send OTP code

### Chat
- `POST /api/chat` - Send message and get AI response

### Payments
- `POST /api/payments/create` - Create payment request
- `POST /api/payments/approve` - Approve payment
- `POST /api/payments/reject` - Reject payment

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/payments` - List payment requests
- `GET /api/admin/api-keys` - List API keys
- `POST /api/admin/api-keys` - Add API key

## 💳 Credit System

### Model Credit Costs
- TCK 4.5 Flash: 1 credit
- TCK 4.7 Flash: 2 credits
- TCK Vision Flash: 5 credits
- TCK 2.5 Flash Lite: 2 credits
- TCK 2.5 Pro: 8 credits
- TCK Image Flash: 15 credits
- TCK V3: 3 credits
- TCK R1 Lite: 5 credits
- TCK R1: 10 credits
- TCK Coder: 6 credits

### Daily Credit Allocations
- Free Trial: 100 credits/day
- Free: 300 credits/day
- Pro: 3,000 credits/day
- Ultra: 10,000 credits/day
- Max: 50,000 credits/day

## 🔒 Security Features

- Rate limiting per user
- XSS protection with input sanitization
- CSRF protection with token validation
- SQL injection prevention
- File upload validation
- Encrypted sessions
- Admin route protection
- Abuse detection

## 🎨 Customization

### Branding
Update the branding in `src/types/index.ts`:
- Model names and configurations
- Plan names and pricing
- Contact information

### UI Theme
Modify `src/app/globals.css` for custom colors and styles.

### AI Models
Add new models in `src/types/index.ts` under `MODEL_CONFIGS`.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@tckai.com or join our Discord community.

---

Built with ❤️ using Next.js 15, TypeScript, and modern web technologies.
