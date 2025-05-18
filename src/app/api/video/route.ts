import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {userId, name, fileSize, type: mimeType, duration, resolution} = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!resolution) {
            return NextResponse.json(
                { error: 'Resolution is required' },
                { status: 400 }
            );
        }

        const [width, height] = resolution.split('x').map(Number);

        const document = await prismaClient.video.create({
            data: {
                userId,
                name,
                fileSize,
                mimeType,
                duration,
                dimensions: {
                    width,
                    height,
                },
                status: 'PROCESSING'
            }
        });

        const serializedDocument = JSON.parse(JSON.stringify(
            document,
            (_, value) => typeof value === 'bigint' ? value.toString() : value
        ));

        return NextResponse.json({ 
            success: true,
            data: serializedDocument
        });
    } catch (error) {
        console.error('Video creation error:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({
                success: false,
                error: 'Database error',
                code: error.code,
                message: error.message
            }, { 
                status: 400 
            });
        }

        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { 
            status: 500 
        });
    }
}

export async function GET(request: Request) {
  try {
    // Get userId from URL search params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { 
        status: 400 
      });
    }

    const videos = await prismaClient.video.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Serialize BigInt values
    const serializedVideos = JSON.parse(JSON.stringify(
      videos,
      (_, value) => typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({
      success: true,
      data: serializedVideos
    });

  } catch (error) {
    console.error('Video fetch error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({
        success: false,
        error: 'Database error',
        code: error.code,
        message: error.message
      }, { 
        status: 400 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}