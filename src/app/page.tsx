import { prisma } from "../../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import LandingPage from "./LandingPage";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Please login first</div>;
  }
  const whiteboards = await prisma.whiteboard.findMany({
    where: {
      user: {
        clerkId: userId,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="container mx-auto">
      <LandingPage whiteboards={whiteboards} />
    </main>
  );
}
