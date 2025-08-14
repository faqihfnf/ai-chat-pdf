import prisma from "@/lib/prisma";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

export async function POST(req: Request) {
  const secret = process.env.SIGNING_SECRET;
  if (!secret)
    return NextResponse.json("Missing SIGNING_SECRET", { status: 500 });

  const wh = new Webhook(secret);
  const body = await req.text();
  const headerPayload = await headers();

  const event = wh.verify(body, {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  }) as WebhookEvent;

  switch (event.type) {
    case "user.created":
      await prisma.user.create({
        data: {
          clerkId: event.data.id,
          email: event.data.email_addresses[0].email_address,
          name: `${event.data.first_name} ${event.data.last_name}`,
        },
      });
    case "user.updated":
      await prisma.user.update({
        where: {
          clerkId: event.data.id,
        },
        data: {
          email: event.data.email_addresses[0].email_address,
          name: `${event.data.first_name} ${event.data.last_name}`,
        },
      });
      break;
    case "user.deleted":
      await prisma.user.delete({
        where: {
          clerkId: event.data.id,
        },
      });
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json("OK", { status: 200 });
}
