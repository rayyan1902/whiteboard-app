import { NextResponse } from "next/server";
import { prisma as db } from "../../../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: Request,
  { params }: { params: { boardId: string } }
) {
  const pins = await db.pin.findMany({
    where: { boardId: params.boardId },
  });

  return NextResponse.json(pins);
}

// POST /api/pins/[boardId]
export async function POST(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  const { userId } = await auth();
  const body = await req.json();
  const { x, y, text, authorName } = body;

  const newPin = await db.pin.create({
    data: {
      boardId: params.boardId,
      x,
      y,
      text,
      authorId: userId!,
      authorName,
    },
  });

  return NextResponse.json(newPin);
}
