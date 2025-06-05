import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from "../../../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET /api/pins/[boardId]
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const boardId = url.pathname.split("/").pop()!;

  const pins = await db.pin.findMany({
    where: { boardId },
  });

  return NextResponse.json(pins);
}

// POST /api/pins/[boardId]
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const boardId = url.pathname.split("/").pop()!;

  const { userId } = await auth();
  const body = await req.json();
  const { x, y, text, authorName } = body;

  const newPin = await db.pin.create({
    data: {
      boardId,
      x,
      y,
      text,
      authorId: userId!,
      authorName,
    },
  });

  return NextResponse.json(newPin);
}
