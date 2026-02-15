import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET /api/debates - Lista debates del usuario
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const debates = await prisma.debate.findMany({
        where: {
            OR: [
                { creatorId: session.user.id },
                { opponentId: session.user.id },
            ],
        },
        include: {
            creator: { select: { id: true, username: true } },
            opponent: { select: { id: true, username: true } },
            _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ debates });
}

// POST /api/debates - Crear debate
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { title, topic, description } = await request.json();

    if (!title || !topic) {
        return NextResponse.json(
            { error: "Título y tema son requeridos" },
            { status: 400 }
        );
    }

    const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const debate = await prisma.debate.create({
        data: {
            title,
            topic,
            description: description || null,
            inviteCode,
            creatorId: session.user.id,
        },
        include: {
            creator: { select: { id: true, username: true } },
        },
    });

    return NextResponse.json({ debate }, { status: 201 });
}
