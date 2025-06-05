import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";


export const dynamic = "force-dynamic";



function getIdFromUrl(req: NextRequest) {
  return req.nextUrl.pathname.split("/").pop() as string;
}

export async function GET(req: NextRequest) {
  const id = getIdFromUrl(req);

  try {
    const whiteboard = await prisma.whiteboard.findUnique({ where: { id } });
    if (!whiteboard) return new NextResponse(null, { status: 200 });
    return NextResponse.json(whiteboard);
  } catch (err) {
    console.error("GET whiteboard error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}


export async function PATCH(req: NextRequest) {
  const id = getIdFromUrl(req);
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { title, content, status } = await req.json();

  const whiteboard = await prisma.whiteboard.update({
    where: { id },
    data: { title, content, status },
  });

  return NextResponse.json({
    id: whiteboard.id,
    title: whiteboard.title,
    content: whiteboard.content,
    publicId: whiteboard.publicId,
    status: whiteboard.status,
  });
}

export async function DELETE(req: NextRequest) {
  const id = getIdFromUrl(req);
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  await prisma.whiteboard.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
