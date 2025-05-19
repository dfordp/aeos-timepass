import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import prismaClient from "@/lib/prismadb";
import fs from "node:fs/promises";
import { handleFileUpload } from "@/helpers/s3";


const SUPPORTED_FORMATS = [
    '.mp4',  // MPEG-4
    '.webm', // WebM
    '.mov',  // QuickTime
    '.avi',  // AVI
    '.mkv',  // Matroska
    '.m4v',  // iTunes Video
    '.wmv',  // Windows Media
];


export async function POST(req: Request,  { params }: { params: { id: string } }
) {
    try {
        const { id:videoId } = await params;
        const videoDir = path.join(process.cwd(), 'public', videoId);
        
        const files = await fs.readdir(videoDir);
        const videoFile = files.find(file => file.toLowerCase().endsWith('.mp4'));

        if (!videoFile) {
            return NextResponse.json({ 
                status: "fail", 
                error: `No supported video file found. Supported formats: ${SUPPORTED_FORMATS.join(', ')}` 
            }, { status: 404 });
        }


        const videoPath = path.join(videoDir, videoFile);
        const thumbnailDir = path.join(process.cwd(), 'public', videoId);

        const thumbnail = await ffmpeg(videoPath).screenshot(
            {
                timestamps : [2],
                filename : `${videoId}-thumb.jpg`,
                folder:     thumbnailDir,
                size: "1280x720"
            }
        )

        const thumbnailPath =  path.join(thumbnailDir, `${videoId}-thumb.jpg`);

        const videoURL = await handleFileUpload({
            filePath : videoPath,
            prefix: "video",
        })
        const thumbnailURL = await handleFileUpload({
            filePath : thumbnailPath,
            prefix: "thumbnail",
        })

        
        
        await prismaClient.video.update({
            where : {
                id : videoId,
            },
            data : {
                videoURL : videoURL.url,
                thumbnailURL : thumbnailURL.url,
                status : "READY"
            }
        })


        if(!thumbnail){
            console.error('Error generating thumbnail');
        }

           try {
            await fs.rm(videoDir, { recursive: true, force: true });
        } catch (cleanupError) {
            console.warn('Failed to clean up temporary files:', cleanupError);
        }
        revalidatePath("/");

        return NextResponse.json({ status: "success" });
    } catch (e: unknown) {
        console.error(e);
        const error = e instanceof Error ? e.message : 'An unknown error occurred';
        return NextResponse.json({ status: "fail", error });
    }
}