import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
) {
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return new NextResponse('ID is required', { status: 400 });
    }

    const user = await prismaClient.user.findUnique({
      where: {
        id: id
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
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