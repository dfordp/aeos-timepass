import prismaClient from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { LinkVisibility, Prisma } from "@prisma/client";


export async function GET(
    request: NextRequest,
) {
  try {
  const id = request.url.split('/').pop();

    const shareLink = await prismaClient.shareLink.findUnique({
      where: { id : id }
    });

    if (!shareLink) {
      return NextResponse.json({
        success: false,
        error: 'Share link not found'
      }, { status: 404 });
    }

     if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Share link has expired'
      }, { status: 410 });
    }

    return NextResponse.json({
      success: true,
      data: shareLink
    });

  } catch (error) {
    console.error('Share link fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch share link'
    }, { status: 500 });
  }
}

// Update share link
export async function PATCH(
  request: Request,
) {
  try {
  const id = request.url.split('/').pop();
    const body = await request.json();
    const { visibility, expiresAt, userWhitelist } = body;

    // Validate visibility if provided
    if (visibility && !Object.values(LinkVisibility).includes(visibility)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid visibility value'
      }, { status: 400 });
    }

    const shareLink = await prismaClient.shareLink.update({
      where: { id },
      data: {
        ...(visibility && { visibility }),
        ...(expiresAt !== undefined && { 
          expiresAt: expiresAt ? new Date(expiresAt) : null 
        }),
        ...(userWhitelist && visibility === 'PRIVATE' && {
          userWhitelist: {
            set: userWhitelist.map((userId: string) => ({ id: userId }))
          }
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: shareLink
    });

  } catch (error) {
    console.error('Share link update error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Share link not found'
        }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to update share link'
    }, { status: 500 });
  }
}

// Delete share link
export async function DELETE(
  request: Request,
) {
  try {
    const id = request.url.split('/').pop();

    await prismaClient.shareLink.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Share link deleted successfully'
    });

  } catch (error) {
    console.error('Share link deletion error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({
          success: false,
          error: 'Share link not found'
        }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to delete share link'
    }, { status: 500 });
  }
}