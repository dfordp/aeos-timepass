import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;  

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required'
      }, { 
        status: 400 
      });
    }

    const video = await prismaClient.video.findUnique({
      where: {
        id: id
      }
    });

    if (!video) {
      return NextResponse.json({
        success: false,
        error: 'Video not found'
      }, { 
        status: 404 
      });
    }

    // Serialize BigInt values
    const serializedVideo = JSON.parse(JSON.stringify(
      video,
      (_, value) => typeof value === 'bigint' ? value.toString() : value
    ));

    return NextResponse.json({
      success: true,
      data: serializedVideo
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