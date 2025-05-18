-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PROCESSING', 'READY');

-- CreateEnum
CREATE TYPE "LinkVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "videoURL" TEXT NOT NULL DEFAULT '',
    "thumbnailURL" TEXT NOT NULL DEFAULT '',
    "status" "VideoStatus" NOT NULL DEFAULT 'PROCESSING',
    "fileSize" BIGINT NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "mimeType" VARCHAR(100),
    "dimensions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "visibility" "LinkVisibility" NOT NULL,
    "expiresAt" TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkAccess" (
    "id" TEXT NOT NULL,
    "shareLinkId" TEXT NOT NULL,
    "viewerEmail" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WhitelistedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WhitelistedUsers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "LinkAccess_shareLinkId_viewedAt_idx" ON "LinkAccess"("shareLinkId", "viewedAt");

-- CreateIndex
CREATE INDEX "_WhitelistedUsers_B_index" ON "_WhitelistedUsers"("B");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkAccess" ADD CONSTRAINT "LinkAccess_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WhitelistedUsers" ADD CONSTRAINT "_WhitelistedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "ShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WhitelistedUsers" ADD CONSTRAINT "_WhitelistedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
