import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../../lib/prisma";


export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const boards = await prisma.whiteboard.findMany({
    where: { user: { clerkId: userId } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { title, content, status } = await req.json();

  // Find or create user
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId },
  });

  const newBoard = await prisma.whiteboard.create({
    data: {
      title,
      content,
      status,
      userId: user.id,
    },
  });

  return NextResponse.json(newBoard);
}
