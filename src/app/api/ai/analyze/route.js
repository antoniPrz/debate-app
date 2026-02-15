import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeAndSave } from "@/lib/ai-engine";

// POST /api/ai/analyze - Analizar un mensaje
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { messageId, debateId } = await request.json();

    if (!messageId || !debateId) {
        return NextResponse.json(
            { error: "messageId y debateId son requeridos" },
            { status: 400 }
        );
    }

    // Verificar que existe y el usuario es participante
    const debate = await prisma.debate.findUnique({
        where: { id: debateId },
    });

    if (!debate) {
        return NextResponse.json({ error: "Debate no encontrado" }, { status: 404 });
    }

    if (debate.creatorId !== session.user.id && debate.opponentId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const message = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!message) {
        return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    }

    // No analizar si ya tiene análisis
    const existing = await prisma.aiAnalysis.findUnique({
        where: { messageId },
    });

    if (existing) {
        return NextResponse.json({ analysis: existing });
    }

    // Obtener definiciones del debate
    const definitions = await prisma.definition.findMany({
        where: { debateId },
    });

    const analysis = await analyzeAndSave(messageId, message.content, debate, definitions);

    return NextResponse.json({ analysis });
}
