import prismaClient from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {userId,name,fileSize,type:mimeType,duration,resolution} = body;

        if (!userId) {
            return new NextResponse('ID is required', { status: 400 });
        }

        const [width, height] = resolution.split('x').map(Number);


        const document = await prismaClient.video.create({
            data: {
              userId: userId,
              name:name,
              fileSize:fileSize,
              mimeType:mimeType,
              duration:duration,
              dimensions : {
                width : width,
                height: height,
              }
            }
          });

          return NextResponse.json(document);

    } catch (error) {
        if (error instanceof Error) {
            return new NextResponse(error.message, { status: 500 });
        }

        return new NextResponse('Internal Server Error', { status: 500 });
    }
}