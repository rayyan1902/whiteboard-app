import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const publicId = url.pathname.split("/").pop() as string;
  
    const whiteboard = await prisma.whiteboard.findUnique({
      where: { publicId },
    });
  
    if (!whiteboard || whiteboard.status !== "published") {
      return new NextResponse("Not found", { status: 404 });
    }
  
    return NextResponse.json({
      content: whiteboard.content,
      title: whiteboard.title,
    });
  }