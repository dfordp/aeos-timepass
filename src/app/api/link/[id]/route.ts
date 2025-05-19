import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { LinkVisibility, Prisma } from "@prisma/client";

// Get share link details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const shareLink = await prismaClient.shareLink.findUnique({
      where: { id },
      include: {
        video: {
          select: {
            name: true,
            thumbnailURL: true,
          },
        },
        creator: {
          select: {
            name: true,
            email: true,
          },
        },
        userWhitelist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        accesses: {
          orderBy: {
            viewedAt: 'desc'
          },
          select: {
            id: true,
            viewerEmail: true,
            viewedAt: true,
          },
        },
      },
    });

    if (!shareLink) {
      return NextResponse.json({
        success: false,
        error: 'Share link not found'
      }, { status: 404 });
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
      include: {
        userWhitelist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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