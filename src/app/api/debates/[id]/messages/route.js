import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/debates/[id]/messages - Obtener mensajes
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after"); // para polling: solo mensajes nuevos

    const debate = await prisma.debate.findUnique({ where: { id } });
    if (!debate) {
        return NextResponse.json({ error: "Debate no encontrado" }, { status: 404 });
    }

    if (debate.creatorId !== session.user.id && debate.opponentId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const where = { debateId: id };
    if (after) {
        where.createdAt = { gt: new Date(after) };
    }

    const messages = await prisma.message.findMany({
        where,
        include: {
            sender: { select: { id: true, username: true } },
            aiAnalysis: true,
        },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
}

// POST /api/debates/[id]/messages - Enviar mensaje
export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: "El mensaje no puede estar vacío" }, { status: 400 });
    }

    const debate = await prisma.debate.findUnique({ where: { id } });
    if (!debate) {
        return NextResponse.json({ error: "Debate no encontrado" }, { status: 404 });
    }

    if (debate.creatorId !== session.user.id && debate.opponentId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (debate.status === "finished") {
        return NextResponse.json({ error: "Este debate ya ha terminado" }, { status: 400 });
    }

    if (debate.status === "paused") {
        return NextResponse.json({ error: "Este debate está pausado" }, { status: 400 });
    }

    const message = await prisma.message.create({
        data: {
            content: content.trim(),
            senderType: "user",
            debateId: id,
            senderId: session.user.id,
        },
        include: {
            sender: { select: { id: true, username: true } },
        },
    });

    // Activar el debate si está en setup y hay oponente
    if (debate.status === "setup" && debate.opponentId) {
        await prisma.debate.update({
            where: { id },
            data: { status: "active" },
        });
    }

    return NextResponse.json({ message }, { status: 201 });
}
