import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from 'path';


export async function POST(req: Request,  { params }: { params: { id: string } }
) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
 
        const { id:videoId } = await params;


        if (!file) {
            return NextResponse.json({ status: "fail", error: "No file uploaded" });
        }

        const uploadDir = path.join(process.cwd(), 'public', videoId);
        await fs.mkdir(uploadDir, { recursive: true });


        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const filePath = path.join(uploadDir, file.name);
        await fs.writeFile(filePath, buffer);

        revalidatePath("/");

        return NextResponse.json({ status: "success" });
    } catch (e: unknown) {
        console.error(e);
        const error = e instanceof Error ? e.message : 'An unknown error occurred';
        return NextResponse.json({ status: "fail", error });
    }
}