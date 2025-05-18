import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id,email,name } = body;

        if (!id) {
            return new NextResponse('ID is required', { status: 400 });
        }

        const document = await prismaClient.user.create({
            data: {
              id: id,
              email:email,
              name:name
            }
          });

          return NextResponse.json(document);

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