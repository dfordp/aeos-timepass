import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            shareLinkId, 
            viewerEmail,
            videoId 
        } = body;


        if (!shareLinkId) {
            return NextResponse.json({
                success: false,
                error: 'share ID is required'
            }, { status: 400 });
        }

        if (!viewerEmail) {
            return NextResponse.json({
                success: false,
                error: 'viewerEmail is required'
            }, { status: 400 });
        }
         const shareLink = await prismaClient.linkAccess.create({
            data: {
                shareLinkId : shareLinkId,
                viewerEmail : viewerEmail,
                videoId : videoId
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

        
        if (!videoId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Video ID is required' 
            }, { status: 400 });
        }
        

        const links = await prismaClient.linkAccess.findMany({
            where : {
                videoId : videoId
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