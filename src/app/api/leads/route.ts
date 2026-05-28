import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { leadSchema } from "@/lib/lead-schema";
import { prisma } from "@/lib/prisma";
import { consumeLeadsRateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

function toCouponCode(serial: number): string {
  return serial.toString().padStart(4, "0");
}

function getClientIpAddress(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");

  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function hasAllowedOrigin(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).origin === getSiteUrl();
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    if (!hasAllowedOrigin(request)) {
      return NextResponse.json(
        {
          error: "Origem nao autorizada para este endpoint.",
        },
        { status: 403 },
      );
    }

    const ipAddress = getClientIpAddress(request);
    const rateLimitResult = consumeLeadsRateLimit(ipAddress);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Muitas tentativas. Aguarde antes de tentar novamente.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
          },
        },
      );
    }

    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, phone, consent } = parsed.data;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.couponCounter.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, current: 99 },
      });

      const counter = await tx.couponCounter.update({
        where: { id: 1 },
        data: { current: { increment: 1 } },
      });

      const couponSerial = counter.current;
      const couponCode = toCouponCode(couponSerial);

      const lead = await tx.lead.create({
        data: {
          name,
          phone,
          couponSerial,
          couponCode,
          consentGiven: consent,
          consentAt: new Date(),
        },
      });

      return {
        couponCode,
        leadId: lead.id,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Lead creation failed", error);

    return NextResponse.json(
      {
        error: "Não foi possível concluir o cadastro agora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
