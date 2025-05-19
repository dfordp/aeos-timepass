import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import prismaClient from "@/lib/prismadb";
import fs from "node:fs/promises";
import { handleFileUpload } from "@/helpers/s3";

export async function POST(req: NextRequest) {
    const videoDir = '';
    try {
        // 1. Extract and validate video ID
        const urlSegments = req.url.split('/');
        const videoId = urlSegments[urlSegments.length - 2];
        
        if (!videoId) {
            return NextResponse.json({ 
                success: false, 
                error: "Video ID is required" 
            }, { status: 400 });
        }

        // 2. Check if video exists in database
        const video = await prismaClient.video.findUnique({
            where: { id: videoId }
        });

        if (!video) {
            return NextResponse.json({ 
                success: false, 
                error: "Video not found in database" 
            }, { status: 404 });
        }

        // 3. Setup paths and verify directory exists
        const videoDir = path.join(process.cwd(), 'public', videoId);
        
        try {
            await fs.access(videoDir);
        } catch {
            return NextResponse.json({ 
                success: false, 
                error: "Video directory not found" 
            }, { status: 404 });
        }

        // 4. Find video file
        const files = await fs.readdir(videoDir);
        const videoFile = files.find(file => file.toLowerCase().endsWith('.mp4'));

        if (!videoFile) {
            return NextResponse.json({ 
                success: false, 
                error: 'No MP4 video file found in directory'
            }, { status: 404 });
        }

        // 5. Generate thumbnail
        const videoPath = path.join(videoDir, videoFile);
        const thumbnailPath = path.join(videoDir, `${videoId}-thumb.jpg`);

        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshot({
                    timestamps: [2],
                    filename: `${videoId}-thumb.jpg`,
                    folder: videoDir,
                    size: "1280x720"
                })
                .on('error', reject)
                .on('end', resolve);
        });

        // 6. Verify thumbnail was created
        try {
            await fs.access(thumbnailPath);
        } catch {
            throw new Error('Thumbnail generation failed');
        }

        // 7. Upload files to R2
        const [videoURL, thumbnailURL] = await Promise.all([
            handleFileUpload({
                filePath: videoPath,
                prefix: "video",
                contentType: 'video/mp4'
            }),
            handleFileUpload({
                filePath: thumbnailPath,
                prefix: "thumbnail",
                contentType: 'image/jpeg'
            })
        ]);

        // 8. Update database
        await prismaClient.video.update({
            where: { id: videoId },
            data: {
                videoURL: videoURL.url,
                thumbnailURL: thumbnailURL.url,
                status: "READY"
            }
        });

        // 9. Cleanup
        await fs.rm(videoDir, { recursive: true, force: true })
            .catch(error => console.warn('Cleanup warning:', error));

        revalidatePath("/");

        return NextResponse.json({ 
            success: true, 
            data: { videoURL: videoURL.url, thumbnailURL: thumbnailURL.url } 
        });

    } catch (error) {
        // Log the full error for debugging
        console.error('Thumbnail generation error:', error);

        // Cleanup on error if directory exists
        if (videoDir) {
            try {
                await fs.rm(videoDir, { recursive: true, force: true });
            } catch {
                // Ignore cleanup errors
            }
        }

        // Return appropriate error response
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}