# 🎞️ Lightweight Video Storage Service

A modern video storage platform built with Next.js 14, allowing authenticated users to upload, manage, and securely share videos with customizable sharing options and thumbnail previews.

---

## ✨ Features

### 📤 Upload

* **Drag-and-drop** support using `react-dropzone`
* Handles video files up to 500 MB
* **Client-side validation** for:
  * File size limits
  * MIME type checking
  * Duplicate prevention
* **Progress tracking** with real-time feedback
* Auto-generated thumbnails using FFmpeg
* Processing status: `PROCESSING → READY`

### ☁️ Storage

* Videos stored in **AWS S3**
* Pre-signed URLs for secure access
* FFmpeg-generated thumbnails stored in S3
* Metadata in PostgreSQL via Prisma ORM

### 📊 Dashboard

* **Responsive grid layout** showing:
  * Thumbnail previews
  * Video titles
  * Upload status badges
  * Quick action buttons
* **Sorting options**:
  * Most recent first (default)
  * Name (A-Z)
  * Size
* **Real-time status updates**

### 🎬 Video Details Page

* **Custom video player** with:
  * Thumbnail poster
  * Adaptive quality
  * Full playback controls
* **Detailed metadata**:
  * File name & size
  * Duration
  * Resolution
  * MIME type
  * Upload date
  * Last modified
* **Share management system**

### 🔗 Share Links

* **Multiple sharing options per video**:
  * `PUBLIC` – Universal access
  * `PRIVATE` – Whitelist-only access
* **Security features**:
  * Email-based whitelisting
  * Optional expiration dates
  * Access tracking
* **Management tools**:
  * Create/Edit/Delete links
  * Add/Remove whitelisted users
  * View access history

## 🛠️ Technical Implementation

### Frontend
* **Framework**: Next.js 15 (App Router)
* **UI Components**: `shadcn/ui`
* **Styling**: Tailwind CSS
* **State Management**: React Hooks
* **Form Handling**: React Hook Form
* **Notifications**: Sonner

### Backend
* **API Routes**: Next.js Route Handlers
* **Database**: PostgreSQL with Prisma ORM
* **Storage**: AWS S3 with pre-signed URLs
* **Authentication**: Clerk
* **Email**: Nodemailer

### Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String      @id
  email            String      @unique
  name             String     
  videos           Video[]
  whitelistedLinks ShareLink[] @relation("WhitelistedUsers")
  createdLinks     ShareLink[] @relation("Creator")
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @default(now())
}

enum VideoStatus {
  PROCESSING
  READY
}

model Video {
  id           String      @id @default(uuid())
  user         User        @relation(fields: [userId], references: [id])
  userId       String
  name         String      @db.VarChar(255)
  videoURL     String      @default("")
  thumbnailURL String      @default("")
  status       VideoStatus @default(PROCESSING)
  fileSize     BigInt      @default(0)
  duration     Int?        
  mimeType     String?     @db.VarChar(100)
  dimensions   Json? 
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @default(now())

  shareLinks ShareLink[]
}

enum LinkVisibility {
  PUBLIC
  PRIVATE
}

model ShareLink {
  id            String         @id @default(uuid())
  video         Video          @relation(fields: [videoId], references: [id])
  videoId       String
  creator       User           @relation("Creator", fields: [creatorId], references: [id])
  creatorId     String
  visibility    LinkVisibility
  expiresAt     DateTime?      @db.Timestamp()
  lastViewedAt  DateTime?
  userWhitelist User[]         @relation("WhitelistedUsers")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @default(now())

  accesses LinkAccess[]
}

model LinkAccess {
  id          String    @id @default(uuid())
  shareLink   ShareLink @relation(fields: [shareLinkId], references: [id])
  shareLinkId String
  viewerEmail String?
  viewedAt    DateTime  @default(now())

  @@index([shareLinkId, viewedAt])
}

```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
DATABASE_URL=
REDIS_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/check
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=""
R2_PUBLIC_URL=
RESEND_API_KEY=""
SERVICE_ID=
TEMPLATE_ID=
TEMPLATE_ID=
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## 📝 License

MIT