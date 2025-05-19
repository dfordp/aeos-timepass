import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { LinkVisibility, Prisma } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            creatorId, 
            videoId, 
            visibility, 
            expiresAt, 
            userWhitelist = [] 
        } = body;


        if (!creatorId) {
            return NextResponse.json({
                success: false,
                error: 'Creator ID is required'
            }, { status: 400 });
        }

        if (!videoId) {
            return NextResponse.json({
                success: false,
                error: 'Video ID is required'
            }, { status: 400 });
        }

        if (!visibility || !Object.values(LinkVisibility).includes(visibility)) {
            return NextResponse.json({
                success: false,
                error: 'Valid visibility (PUBLIC or PRIVATE) is required'
            }, { status: 400 });
        }

        const video = await prismaClient.video.findUnique({
            where: { id: videoId }
        });

        if (!video) {
            return NextResponse.json({
                success: false,
                error: 'Video not found'
            }, { status: 404 });
        }

         const shareLink = await prismaClient.shareLink.create({
            data: {
                videoId,
                creatorId,
                visibility,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                ...(visibility === 'PRIVATE' && userWhitelist.length > 0 && {
                    userWhitelist: {
                        connect: userWhitelist.map((userId: string) => ({
                            id: userId
                        }))
                    }
                })
            }
        });

        return NextResponse.json(shareLink);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return new NextResponse(error.message, { status: 400 });
        }
        
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 500 });
        }

        return new NextResponse('Internal Server Error', { status: 500 });
    }
}


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');

        if (videoId) {
            const links = await prismaClient.shareLink.findMany({
                where: {
                    videoId: videoId
                }
            });

            return NextResponse.json({ success: true, links });
        }

        // Fetch all links
        const links = await prismaClient.shareLink.findMany({
            include: {
                userWhitelist: true,
                video: true
            }
        });

        return NextResponse.json({ success: true, links });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({ 
                success: false, 
                error: error.message 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            success: false, 
            error: 'Internal Server Error' 
        }, { status: 500 });
    }
}