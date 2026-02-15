import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/debates/[id] - Obtener debate
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const debate = await prisma.debate.findUnique({
        where: { id },
        include: {
            creator: { select: { id: true, username: true } },
            opponent: { select: { id: true, username: true } },
            definitions: {
                include: { proposedBy: { select: { id: true, username: true } } },
                orderBy: { createdAt: "asc" },
            },
            intentions: {
                include: { user: { select: { id: true, username: true } } },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!debate) {
        return NextResponse.json({ error: "Debate no encontrado" }, { status: 404 });
    }

    // Verificar que el usuario es participante
    if (debate.creatorId !== session.user.id && debate.opponentId !== session.user.id) {
        return NextResponse.json({ error: "No tienes acceso a este debate" }, { status: 403 });
    }

    return NextResponse.json({ debate });
}

// PATCH /api/debates/[id] - Actualizar estado del debate
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const debate = await prisma.debate.findUnique({ where: { id } });
    if (!debate) {
        return NextResponse.json({ error: "Debate no encontrado" }, { status: 404 });
    }

    if (debate.creatorId !== session.user.id && debate.opponentId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const validTransitions = {
        setup: ["active"],
        active: ["paused", "finished"],
        paused: ["active", "finished"],
        finished: [],
    };

    if (!validTransitions[debate.status]?.includes(status)) {
        return NextResponse.json(
            { error: `No se puede cambiar de '${debate.status}' a '${status}'` },
            { status: 400 }
        );
    }

    const updated = await prisma.debate.update({
        where: { id },
        data: { status },
        include: {
            creator: { select: { id: true, username: true } },
            opponent: { select: { id: true, username: true } },
        },
    });

    return NextResponse.json({ debate: updated });
}
