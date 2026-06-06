import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonSlug, completed } = (await req.json()) as {
    lessonSlug: string;
    completed: boolean;
  };

  if (completed) {
    await db.userProgress.upsert({
      where: { userId_lessonSlug: { userId: session.user.id, lessonSlug } },
      create: { userId: session.user.id, lessonSlug },
      update: {},
    });
  } else {
    await db.userProgress.deleteMany({
      where: { userId: session.user.id, lessonSlug },
    });
  }

  return NextResponse.json({ ok: true });
}
